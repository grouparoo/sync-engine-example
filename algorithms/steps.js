import { User, getWatermark, setWatermark, batchSize } from "../lib/database";
import { Sequelize } from "sequelize";
const Op = Sequelize.Op;

// generally implements batch processing,
// but works around offset by risking memory for large single timestamps
export default async function sync(processRow) {
  // using node and sequelize
  const watermark = await getWatermark();
  const sqlOptions = {
    limit: batchSize,
    order: [["updatedAt", "ASC"]],
  };

  if (watermark) {
    sqlOptions.where = {
      updatedAt: {
        [Op.gte]: watermark, // WHERE updatedAt >= {watermark}
      },
    };
  }

  let rows = await User.findAll(sqlOptions);
  if (!rows) {
    return true;
  } else {
    let done = rows.length < batchSize; // is there more to be done?
    let lastTime = rows[rows.length - 1].updatedAt.getTime();
    let bigBatch = false;

    if (!done && watermark === lastTime) {
      // uh-oh, there are more to deal with here. Get all of those at once.
      bigBatch = true;
      rows = await User.findAll({
        where: {
          updatedAt: {
            [Op.eq]: lastTime,
          },
        },
      });
    }

    for (const row of rows) {
      await processRow(row);
    }

    if (bigBatch) {
      // ok, so we just handled that extra big batch
      // we have to know if more were added after that. The only way to know is if there is a later timestamp.
      const oneMoreMs = lastTime + 1;
      const left = await User.count({
        where: {
          updatedAt: {
            [Op.gte]: oneMoreMs,
          },
        },
      });
      if (left > 0) {
        // there are more after it, so we can move it forward
        // otherwise, there still might be more later at this time, so leave it.
        lastTime = oneMoreMs;
        done = false; // keep going
      } else {
        done = true; // we are done for now, then.
        // it will reprocess later unfortunately, but we don't want to miss any
      }
    }

    await setWatermark(lastTime);
    return done;
  }
}

import { User, getWatermark, setWatermark, batchSize } from "../lib/database";
import { Sequelize } from "sequelize";
const Op = Sequelize.Op;

// implements batch processing
export default async function sync(processRow) {
  // using node and sequelize
  const saved = await getWatermark();
  const watermark = saved ? saved.watermark : null;
  const oldOffset = saved ? saved.offset || 0 : null;
  const sqlOptions = {
    limit: batchSize,
    offset: oldOffset,
    order: [["updatedAt", "ASC"]],
  };

  if (watermark) {
    sqlOptions.where = {
      updatedAt: {
        [Op.gte]: watermark, // WHERE updatedAt >= {watermark}
      },
    };
  }

  const rows = await User.findAll(sqlOptions);
  if (!rows || rows.length === 0) {
    return true;
  } else {
    for (const row of rows) {
      await processRow(row);
    }

    const done = rows.length < batchSize; // is there more to be done?
    const lastTime = rows[rows.length - 1].updatedAt.getTime();
    let newOffset = 0;
    if (!done && watermark === lastTime) {
      // the last one was the same as the first, need to use offset
      newOffset = oldOffset + batchSize;
    }

    await setWatermark({ watermark: lastTime, offset: newOffset });
    return done;
  }
}

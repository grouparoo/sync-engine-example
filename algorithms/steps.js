import { User, getWatermark, setWatermark, batchSize } from "../lib/database";
import { Sequelize } from "sequelize";
const Op = Sequelize.Op;

// generally implements batch processing,
// but works around offset by risking memory for large single timestamps
export default async function sync(processRow) {
  // using node and sequelize
  const saved = await getWatermark();
  const watermark = saved ? saved.watermark : null;
  const oldLarge = saved ? saved.large : null;

  const sqlOptions = {
    order: [["updatedAt", "ASC"]],
  };
  let allInOne = false;

  if (!watermark) {
    sqlOptions.limit = batchSize;
  } else if (oldLarge) {
    // this is a large single value with a watermark, so get it all at once
    sqlOptions.where = {
      updatedAt: {
        [Op.eq]: watermark,
      },
    };
    allInOne = true;
  } else {
    sqlOptions.limit = batchSize;
    sqlOptions.where = {
      updatedAt: {
        [Op.gte]: watermark, // WHERE updatedAt >= {watermark}
      },
    };
  }

  let rows = await User.findAll(sqlOptions);
  let newWatermark = watermark;
  let done = false;
  if (!rows || rows.length === 0) {
    done = true;
  } else {
    done = rows.length < batchSize; // is there more to be done?

    newWatermark = rows[rows.length - 1].updatedAt.getTime();
    if (!allInOne && !done && watermark === newWatermark) {
      // try it all in one
      await setWatermark({ watermark: newWatermark, large: true });
      return false;
    }

    for (const row of rows) {
      await processRow(row);
    }
  }

  if (allInOne) {
    // we just did one big batch, advance to the next thing
    newWatermark = watermark + 1;
    done = false;
  }
  await setWatermark({ watermark: newWatermark, large: false });
  return done;
}

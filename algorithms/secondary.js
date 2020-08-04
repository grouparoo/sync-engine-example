import { User, getWatermark, setWatermark, batchSize } from "../lib/database";
import { Sequelize } from "sequelize";
const Op = Sequelize.Op;

// implements batch processing if you also know about an unchanging auto-ascending primary key
// by using it as a secondary sort
export default async function sync(processRow) {
  // using node and sequelize
  const saved = await getWatermark();
  const watermark = saved ? saved.watermark : null;
  const oldId = saved ? saved.id : null;
  const sqlOptions = {
    limit: batchSize,
    order: [
      ["updatedAt", "ASC"],
      ["id", "ASC"],
    ],
  };

  if (watermark) {
    sqlOptions.where = {
      updatedAt: {
        [Op.gte]: watermark, // WHERE updatedAt >= {watermark}
      },
    };
    if (oldId) {
      sqlOptions.where["id"] = {
        [Op.gt]: oldId, // WHERE id > {oldId}
      };
    }
  }

  const rows = await User.findAll(sqlOptions);
  let done = false;
  let newId = null;
  let newWatermark = watermark;
  if (!rows || rows.length === 0) {
    done = true;
  } else {
    for (const row of rows) {
      await processRow(row);
    }

    done = rows.length < batchSize; // is there more to be done?
    const lastRow = rows[rows.length - 1];
    newWatermark = lastRow.updatedAt.getTime();
    if (!done && watermark === newWatermark) {
      // the last one was the same as the first, need to use secondary sort
      newId = lastRow.id;
    }
  }

  if (done && oldId) {
    // it might just have come up short because of the id filtering
    // advanced the watermark and try again
    newWatermark = watermark + 1;
    newId = null;
  }

  await setWatermark({ watermark: newWatermark, id: newId });
  return done;
}

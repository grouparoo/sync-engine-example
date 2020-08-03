import { User, getWatermark, setWatermark } from "../lib/database";
import { Sequelize } from "sequelize";
const Op = Sequelize.Op;

// updates simple algorithm to use the times from the db instead of "now"
export default async function sync(processRow) {
  // using node and sequelize
  let watermark = await getWatermark();
  let rows;
  if (!watermark) {
    // first time we've ever sync'd - get all rows
    rows = await User.findAll();
  } else {
    rows = await User.findAll({
      // otherwise, use watermark
      where: {
        updatedAt: {
          [Op.gte]: watermark, // WHERE updatedAt >= {watermark}
        },
      },
      order: [["updatedAt", "ASC"]],
    });
  }

  if (rows) {
    for (const row of rows) {
      await processRow(row);
    }

    const newWatermark = rows[rows.length - 1].updatedAt;
    await setWatermark(newWatermark); // for next time
  }
}

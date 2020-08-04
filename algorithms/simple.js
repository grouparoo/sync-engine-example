import { User, getWatermark, setWatermark } from "../lib/database";
import { Sequelize } from "sequelize";
const Op = Sequelize.Op;

// simple sync algorithm
export default async function sync(processRow) {
  // using node and sequelize
  const watermark = await getWatermark();
  let rows;
  if (!watermark) {
    // first time we've ever sync'd - get all rows
    rows = await User.findAll();
  } else {
    rows = await User.findAll({
      // otherwise, use watermark
      where: {
        updatedAt: {
          [Op.gt]: watermark, // WHERE updatedAt > {watermark}
        },
      },
      order: [["updatedAt", "ASC"]],
    });
  }

  if (rows && rows.length > 0) {
    for (const row of rows) {
      await processRow(row);
    }

    const newWatermark = new Date(); // set to now
    await setWatermark(newWatermark); // for next time
  }
  return true; // done!
}

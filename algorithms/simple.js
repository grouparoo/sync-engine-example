import { User, getWatermark, setWatermark } from "../lib/database";

export default async function sync(processRow) {
  // using node and sequelize
  let watermark = await getWatermark();
  let rows;
  if (!watermark) {
    // first time we've ever sync'd - get all rows
    rows = await User.findAll();
  } else {
    const rows = await User.findAll({
      // otherwise, use watermark
      where: {
        updatedAt: {
          $gt: watermark, // WHERE updatedAt > {watermark}
        },
      },
      order: ["updatedAt", "ASC"],
    });
  }

  for (const row of rows) {
    await processRow(row);
  }

  const newWatermark = new Date(); // set to now
  await setWatermark(newWatermark); // for next time
}

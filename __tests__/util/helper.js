import { sequelize, setWatermark } from "../../lib/database";

export async function before() {
  await sequelize.drop();
  await setWatermark(null);
  await sequelize.sync({ force: true });
  return;
}
export async function after() {
  await sequelize.drop();
  await setWatermark(null);
  return;
}

export async function expectSync(sync, array) {
  let synced = [];
  const processRow = async (row) => {
    synced.push(row.id);
  };
  await sync(processRow);
  expect(synced).toEqual(expect.arrayContaining(array));
}

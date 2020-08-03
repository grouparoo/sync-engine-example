import { sequelize, setWatermark } from "../../lib/database";
import MockDate from "mockdate";

export const BASETIME = 1596000000 * 1000; // Wednesday, July 29, 2020 5:20:00 AM
export async function before() {
  await sequelize.drop();
  await setWatermark(null);
  await sequelize.sync({ force: true });
  MockDate.set(new Date(BASETIME));
  return;
}
export async function after() {
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

let timeStep = 0;
export function getTime(timeNum) {
  if (!timeNum) {
    timeNum = timeStep;
  }
  const newTime = BASETIME + timeNum * 1000;
  return new Date(newTime);
}
export function stepTime() {
  timeStep++;
  const newTime = getTime();
  console.log("stepTime", newTime.getTime());
  MockDate.set(newTime);
}

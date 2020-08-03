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

async function runSync(syncMethod, synced, options) {
  const processRow = async function (row) {
    synced.push(row.id);
    if (options.process) {
      await options.process(row);
    }
  };
  return await syncMethod(processRow);
}

export async function expectSync(syncMethod, array, options) {
  options = options || {};
  let synced = [];

  while (!(await runSync(syncMethod, synced, options))) {
    if (options.batch) {
      await options.batch();
    }
  }
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
  // console.log("stepTime", newTime.getTime());
  MockDate.set(newTime);
}

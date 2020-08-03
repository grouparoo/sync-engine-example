import { User } from "../../lib/database";

export const BASETIME = 1596000000 * 1000; // Wednesday, July 29, 2020 5:20:00 AM

export async function create({ id, name, time }) {
  const updatedAt = new Date(BASETIME + time * 1000);

  return await User.create({
    id,
    name,
    version: 1,
    updatedAt,
  });
}

export async function update({ id, name, time }) {
  const updatedAt = new Date(BASETIME + time * 1000);

  const row = await find(id);
  row.name = name;
  row.version = row.version + 1;
  row.updatedAt = updatedAt;

  return await row.save();
}

export async function find(id) {
  const row = await User.findOne({
    where: { id: id },
  });
  if (!row) {
    throw `User ${id} does not exist`;
  }
  return row;
}

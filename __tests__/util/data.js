import { User } from "../../lib/database";
import { getTime } from "./helper";

export async function create(id, options = {}) {
  const updatedAt = getTime(options.time);

  return await User.create({
    id,
    version: 1,
    updatedAt,
  });
}

export async function update(id, options = {}) {
  const updatedAt = getTime(options.time);

  const row = await find(id);
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

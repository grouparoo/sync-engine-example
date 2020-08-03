import { sequelize } from "../../lib/database";

export async function before() {
  await sequelize.drop();
  await sequelize.sync({ force: true });
  return;
}
export async function after() {
  await sequelize.drop();
  return;
}

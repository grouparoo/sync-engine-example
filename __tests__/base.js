import { before, after } from "./util/helper";
import { create, update, find } from "./util/data";

describe("Tests", () => {
  beforeAll(before);
  afterAll(after);

  test("add users", async () => {
    await create({ id: 1, name: "Brian", time: 1 });
    await create({ id: 2, name: "Ethan", time: 2 });
    await create({ id: 3, name: "Sally", time: 3 });

    const row = await find(1);
    expect(row.name).toBe("Brian");
    expect(row.version).toBe(1);
    expect(row.updatedAt.getTime()).toBe(1596000001 * 1000);
  });

  test("update user", async () => {
    await update({ id: 1, name: "Craig", time: 4 });
    const row = await find(1);
    expect(row.name).toBe("Craig");
    expect(row.version).toBe(2);
    expect(row.updatedAt.getTime()).toBe(1596000004 * 1000);
  });
});

import { before, after, expectSync, stepTime } from "./helper";
import { create, update, find } from "./data";

export default function runSuite(name, syncMethodUnderTest) {
  describe(`${name} Tests`, () => {
    beforeAll(before);
    afterAll(after);

    test("add users", async () => {
      await create(1);
      await create(2);
      await create(3);

      const row = await find(1);
      expect(row.version).toBe(1);
      expect(row.updatedAt.getTime()).toBe(1596000000 * 1000);
    });

    test("update user", async () => {
      stepTime();
      await update(1);
      const row = await find(1);
      expect(row.version).toBe(2);
      expect(row.updatedAt.getTime()).toBe(1596000001 * 1000);
    });

    test("sync first users", async () => {
      stepTime();
      await expectSync(syncMethodUnderTest, [1, 2, 3]);
    });

    test("find updated user", async () => {
      stepTime();
      await update(2);
      await expectSync(syncMethodUnderTest, [2]);
    });
  });
}

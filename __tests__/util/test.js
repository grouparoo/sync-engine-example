import { before, after, expectSync, stepTime } from "./helper";
import { create, update, find } from "./data";
import { dumpDb } from "../../lib/database";

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

    test("row added at the same time just after", async () => {
      // do not step
      await create(4);
      await expectSync(syncMethodUnderTest, [4]);
    });

    test("row added while processing", async () => {
      let created = false;
      stepTime();
      await update(3);
      await expectSync(syncMethodUnderTest, [3], {
        process: async function () {
          stepTime(); // takes a bit to process
          if (!created) {
            created = true;
            await create(5); // row comes in while processing
          }
          stepTime();
        },
      });

      await expectSync(syncMethodUnderTest, [5], {
        process: async function () {
          stepTime(); // takes a bit to process
          stepTime();
        },
      });
    });
  });
}

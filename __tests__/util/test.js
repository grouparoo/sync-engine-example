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

    test("larger set of users added", async () => {
      stepTime();
      await create(6);
      await create(7);
      await create(8);
      await create(9);
      await create(10);
      await create(11);
      await create(12);
      await expectSync(syncMethodUnderTest, [6, 7, 8, 9, 10, 11, 12]);
    });

    test("larger set of users added and row changed", async () => {
      let updated = 0;
      stepTime();
      await create(20);
      await expectSync(syncMethodUnderTest, [20]); // this normalizes watermark
      await create(21);
      await create(22);
      await create(23);
      await create(24);
      await create(25); // this one will be missed if 21 changes while updating and it changes
      await create(26);
      await expectSync(syncMethodUnderTest, [21, 22, 23, 24, 25, 26], {
        batch: async function () {},
        process: async function (row) {
          stepTime(); // takes a bit to process
          if (!updated) {
            updated = true;
            await update(21); // row updates while processing
          }
          stepTime();
        },
      });

      await create(27);
      await update(23);
      await expectSync(syncMethodUnderTest, [23, 27]);
    });
  });
}

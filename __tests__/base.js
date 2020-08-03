import { before, after } from "./util/helper";

describe("Tests", () => {
  beforeAll(before);

  afterAll(after);

  test("sum", () => {
    expect(1 + 2).toEqual(3);
  });
});

import { describe, expect, it } from "vitest";
import { encode, parse, toDecimalString } from "../src/index.js";

describe("@orbit-id/typescript", () => {
  it("re-exports core encode/parse", () => {
    const id = encode({ timestamp: 0n, type: 1, node: 7, sequence: 42 });
    expect(toDecimalString(id)).toBe("138282");
    expect(parse(id)).toEqual({ timestamp: 0n, type: 1, node: 7, sequence: 42 });
  });
});

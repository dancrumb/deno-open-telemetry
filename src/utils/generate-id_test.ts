import { generateId } from "./generate-id.ts";
import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";

Deno.test("generates a one byte ID", () => {
  const id = generateId(1);
  assertEquals(id.length, 1);
});

Deno.test("generates an 8 byte ID", () => {
  const id = generateId(8);
  assertEquals(id.length, 8);
});

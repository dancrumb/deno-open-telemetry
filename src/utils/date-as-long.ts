import { Long } from "../../deps.ts";

export type DateTime = Pick<Date, "toISOString" | "getTime">;

export const dateAsLong = (date: DateTime | undefined) => {
  if (date === undefined) {
    return Long.ZERO;
  }
  const epoch = date.getTime();
  return Long.fromNumber(epoch);
};

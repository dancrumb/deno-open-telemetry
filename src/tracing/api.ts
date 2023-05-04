import { Context, createKey, getValue, setValue } from "../context/context.ts";
import { Span } from "./span.ts";

const spanContextKey = createKey("span");

export const getSpan = (context: Context | null): Span | null =>
  context === null ? null : getValue(context, spanContextKey);

export const addSpan = (context: Context, span: Span): Context =>
  setValue(context, spanContextKey, span);

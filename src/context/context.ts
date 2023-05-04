import { crypto } from "https://deno.land/std@0.181.0/crypto/mod.ts";

type ContextKey = string;
export type Context = { readonly [key: ContextKey]: unknown };

export function createKey(_: string): ContextKey {
  return crypto.randomUUID();
}

export function getValue<ValueType = unknown>(
  context: Context,
  key: ContextKey,
): ValueType {
  return context[key] as ValueType;
}

export function setValue<ValueType>(
  context: Context,
  key: ContextKey,
  value: ValueType,
): Context {
  return { ...context, [key]: value };
}

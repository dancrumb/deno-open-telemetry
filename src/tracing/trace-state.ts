import { createKey } from "../context/context.ts";

export type TraceState = ReadonlyMap<string, string>;

const TRACE_KEY_REGEX =
  /^(([a-z]([_a-z0-9]|\-|\*|\/){0,255})|([a-z0-9]([_a-z0-9]|\-|\*|\/){0,240})@([a-z]([_a-z0-9]|\-|\*|\/){0,13}))$/;
const TRACE_VALUE_REGEX = /^(( |[\!-\+\--\<\>-~])){0,255}[\!-\+\--\<\>-~]$/;

export const getEmptyTraceState = (): ReadonlyMap<string, string> =>
  new Map<string, string>();

export const getTraceStateValue = (state: TraceState, key: string) => {
  const validKey = TRACE_KEY_REGEX.test(key) ? key : createKey(key);
  state.get(validKey);
};

export const addTraceStateValue = (
  state: TraceState,
  key: string,
  value: string,
): TraceState => {
  const validKey = TRACE_KEY_REGEX.test(key) ? key : createKey(key);
  const validValue = TRACE_VALUE_REGEX.test(value) ? value : "";

  if (state.has(validKey)) {
    console.warn(
      `Tried to add ${validKey} to TraceState, but it is already present`,
    );
  }
  return new Map(state).set(validKey, validValue);
};

export const updateTraceStateValue = (
  state: TraceState,
  key: string,
  value: string,
): TraceState => {
  const validKey = TRACE_KEY_REGEX.test(key) ? key : createKey(key);
  const validValue = TRACE_VALUE_REGEX.test(value) ? value : "";

  if (state.has(validKey)) {
    console.warn(
      `Tried to update ${validKey} in TraceState, but it not present`,
    );
  }

  return new Map(state).set(validKey, validValue);
};

export const deleteTraceStateValue = (
  state: TraceState,
  key: string,
): TraceState => {
  const validKey = TRACE_KEY_REGEX.test(key) ? key : createKey(key);

  const newState = new Map(state);
  newState.delete(validKey);
  return newState;
};

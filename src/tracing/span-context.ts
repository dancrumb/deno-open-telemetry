import { getHexstring } from "../utils/hex.ts";
import { Span } from "./span.ts";
import { TraceState } from "./trace-state.ts";

export enum TraceFlags {
  None = 0b00000000,
  Sampled = 0b00000001,
}

export function getTraceId(context: SpanContext, format: "hex"): string;
export function getTraceId(context: SpanContext, format: "bin"): Uint8Array;
export function getTraceId(context: SpanContext): string;
export function getTraceId(
  context: SpanContext,
  format: "hex" | "bin" = "hex",
): Uint8Array | string {
  const { traceId } = context;

  return format === "bin" ? new Uint8Array(traceId) : getHexstring(traceId);
}

export function getSpanId(context: SpanContext, format: "hex"): string;
export function getSpanId(context: SpanContext, format: "bin"): Uint8Array;
export function getSpanId(context: SpanContext): string;
export function getSpanId(
  context: SpanContext,
  format: "hex" | "bin" = "hex",
): Uint8Array | string {
  const { spanId } = context;

  return format === "bin" ? new Uint8Array(spanId) : getHexstring(spanId);
}

export function isValid(context: SpanContext) {
  const traceId = getTraceId(context, "bin");
  const spanId = getSpanId(context, "bin");
  return (
    spanId.length === 8 &&
    spanId.some((byte) => byte !== 0) &&
    traceId.length === 16 &&
    traceId.some((byte) => byte !== 0)
  );
}

const isSpan = (s: Span | SpanContext): s is Span => "isRecording" in s;
export function getSpanContext(spanOrContext: SpanContext | Span): SpanContext {
  if (isSpan(spanOrContext)) {
    return spanOrContext.getContext();
  }
  return spanOrContext;
}

export interface SpanContext {
  readonly traceId: Uint8Array;
  readonly spanId: Uint8Array;
  readonly traceFlags: TraceFlags;
  readonly traceState: TraceState;
  readonly isRemote: boolean;
}

// class SpanContext implements SpanContext {
//   constructor(
//     private traceId: Uint8Array,
//     private _spanId: Uint8Array,
//     private _traceFlags: TraceFlags,
//     private _traceState: TraceState,
//     private _isRemote: boolean
//   ) {
//     Object.freeze(this.traceId);
//     Object.freeze(this._spanId);
//     this._traceState = { ...this._traceState };
//   }

//   get traceFlags() {
//     return this._traceFlags;
//   }

//   get traceState() {
//     return { ...this._traceState };
//   }

//   get isRemote() {
//     return this._isRemote;
//   }

//   getTraceId(format: "hex"): string;
//   getTraceId(format: "bin"): Uint8Array;
//   getTraceId(): string;
//   getTraceId(format: "hex" | "bin" = "hex"): Uint8Array | string {
//     const { traceId } = this;

//     return format === "bin" ? new Uint8Array(traceId) : getHexstring(traceId);
//   }

//   getSpanId(format: "hex"): string;
//   getSpanId(format: "bin"): Uint8Array;
//   getSpanId(): string;
//   getSpanId(format: "hex" | "bin" = "hex"): Uint8Array | string {
//     const { _spanId } = this;

//     return format === "bin" ? new Uint8Array(_spanId) : getHexstring(_spanId);
//   }

//   isValid() {
//     const { traceId, _spanId } = this;
//     if (traceId.length !== 16 || _spanId.length !== 8) {
//       return false;
//     }

//     return traceId.some((b) => b !== 0) && _spanId.some((b) => b !== 0);
//   }
// }

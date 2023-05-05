import { Span } from "../opentelemetry/proto/trace/v1/trace.ts";
import { getHexstring } from "../utils/hex.ts";
import { isRemote } from "./span.ts";

export enum TraceFlags {
  None = 0b00000000,
  Sampled = 0b00000001,
}

export function getTraceId(context: SpanContext, format: "hex"): string;
export function getTraceId(context: SpanContext, format: "bin"): Uint8Array;
export function getTraceId(context: SpanContext): string;
export function getTraceId(
  context: SpanContext,
  format: "hex" | "bin" = "hex"
): Uint8Array | string {
  const { traceId } = context;

  return format === "bin" ? new Uint8Array(traceId) : getHexstring(traceId);
}

export function getSpanId(context: SpanContext, format: "hex"): string;
export function getSpanId(context: SpanContext, format: "bin"): Uint8Array;
export function getSpanId(context: SpanContext): string;
export function getSpanId(
  context: SpanContext,
  format: "hex" | "bin" = "hex"
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
    return getContext(spanOrContext);
  }
  return spanOrContext;
}

export interface SpanContext {
  readonly traceId: Span["traceId"];
  readonly spanId: Span["spanId"];
  readonly traceFlags: TraceFlags;
  readonly traceState: Span["traceState"];
  readonly isRemote: boolean;
}

const getContext = (span: Span | SpanContext): SpanContext => {
  const { traceId, spanId, traceState } = span;

  return {
    traceId,
    spanId,
    traceFlags: TraceFlags.Sampled,
    traceState,
    isRemote: isRemote(span),
  }; // TODO
};

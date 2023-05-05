import { Attributes } from "../basics.ts";
import { Context } from "../context/context.ts";
import {
  Span,
  Span_Link,
  Span_SpanKind,
} from "../opentelemetry/proto/trace/v1/trace.ts";
import { RecordingSpan } from "./span.ts";

interface SpanCreationParams {
  kind?: Span_SpanKind;
  attributes?: Attributes;
  links?: Span_Link[];
  startTime?: Date;
}

export class Tracer {
  constructor(public readonly name: string, public readonly version = "") {}

  createSpan(
    spanName: string,
    parentContext: Context | null,
    params: SpanCreationParams = {}
  ): Span {
    const {
      kind = Span_SpanKind.SPAN_KIND_INTERNAL,
      attributes = [],
      links = [],
      startTime = new Date(),
    } = params;

    const newSpan = new RecordingSpan(spanName, parentContext, {
      kind,
      attributes,
      links,
      startTime,
    });

    return newSpan;
  }
}

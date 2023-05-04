import { Attributes } from "../basics.ts";
import { Context } from "../context/context.ts";
import { Link, RecordingSpan, Span, SpanKind } from "./span.ts";

interface SpanCreationParams {
  kind?: SpanKind;
  attributes?: Attributes;
  links?: Link[];
  startTime?: Date;
}

export class Tracer {
  constructor(public readonly name: string, public readonly version = "") {}

  createSpan(
    spanName: string,
    parentContext: Context | null,
    params: SpanCreationParams = {},
  ): Span {
    const {
      kind = SpanKind.INTERNAL,
      attributes = {},
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

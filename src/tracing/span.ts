import { TelemetryBag } from "../basics.ts";
import { Context } from "../context/context.ts";
import {
  Span,
  Span_Event,
  Span_Link,
  Span_SpanKind,
  Status,
  Status_StatusCode,
} from "../opentelemetry/proto/trace/v1/trace.ts";
import { generateId } from "../utils/generate-id.ts";
import { getHexstring } from "../utils/hex.ts";
import { getSpan } from "./api.ts";
import {
  getSpanContext,
  getTraceId,
  SpanContext,
  TraceFlags,
} from "./span-context.ts";
import { TraceState } from "./trace-state.ts";

export enum SpanStatusCode {
  "OK",
  "Error",
  "Unset",
}

// export enum SpanKind {
//   "CLIENT", // synchronous remote outgoing
//   "SERVER", // synchronous remote incoming
//   "PRODUCER", // asynchronous; maybe remote outgoing
//   "CONSUMER", // asynchronous; maybe remote incoming
//   "INTERNAL",
// }

type SpanStatus =
  | {
    statusCode: SpanStatusCode.Error;
    description?: string;
  }
  | { statusCode: Exclude<SpanStatusCode, SpanStatusCode.Error> };

export interface SpanMethods {
  // readonly startTime: DateTime;
  // readonly kind: SpanKind;
  // readonly isRecording: boolean;
  // readonly attributes: TelemetryBag;
  // readonly events: TelemetryEvent[];
  // readonly links: Link[];

  // get status(): SpanStatus;
  // get name(): string;
  // get endTime(): DateTime | undefined;
  getContext(): SpanContext;

  setStatus(code: Status_StatusCode, description?: string): void;
  updateName(newName: string): void;
  end(time?: Date): void;
  addEvent(event: Span_Event | string, timestamp?: Date): void;
  addException(exception: Error): void;
}

export const isRemoteSpanContext = (context: SpanContext) => context.isRemote;

type LinkParam = Link | [SpanContext] | [SpanContext, TelemetryBag];

interface SpanOptionalParams {
  kind?: Span_SpanKind;
  attributes?: TelemetryBag;
  startTime?: Date;
  links?: Span_Link[];
  isRecording?: boolean;
}

export interface Link {
  spanContext: SpanContext;
  attributes: TelemetryBag;
}

type DateTime = Pick<Date, "toISOString">;

export class RecordingSpan implements Span, SpanMethods {
  public readonly isRecording: boolean;
  public readonly kind: Span_SpanKind;
  public readonly startTime: DateTime;

  // SpanContext
  private _traceId: Uint8Array;
  private _spanId: Uint8Array;
  private _traceFlags: TraceFlags;
  private _traceState: TraceState;
  private _isRemote: boolean;

  private _name: string;
  private _endTime: DateTime | undefined;
  private parentSpan: Span | SpanContext | null;

  private _status: Status = {
    message: "Unset",
    code: Status_StatusCode.STATUS_CODE_UNSET,
  };
  attributes: TelemetryBag;
  events: Span_Event[];
  links: Span_Link[] = [];

  constructor(
    name: string,
    parent: Context | null,
    params: SpanOptionalParams = {},
  ) {
    this._name = name;
    this.kind = params.kind || Span_SpanKind.SPAN_KIND_INTERNAL;
    this.attributes = params.attributes ?? [];
    this.startTime = params.startTime ?? new Date();
    this.parentSpan = getSpan(parent);
    this.events = [];
    this.isRecording = params?.isRecording ?? true;

    if (params?.links !== undefined) {
      this.links = params.links.map<Span_Link>((param) => {
        if (Array.isArray(param)) {
          return {
            spanContext: param[0],
            attributes: param[1] ?? {},
          };
        }
        return param as Link;
      });
    }

    this._traceId = this.parentSpan !== null
      ? getTraceId(getSpanContext(this.parentSpan), "bin")
      : generateId(16);
    this._spanId = generateId(8);
  }

  get status() {
    return this._status;
  }

  get name() {
    return this._name;
  }

  get endTime() {
    return this._endTime;
  }

  getContext(): Readonly<SpanContext> {
    return Object.freeze({
      traceId: this._traceId,
      spanId: this._spanId,
      traceFlags: this._traceFlags,
      traceState: this._traceState,
      isRemote: this._isRemote,
    });
  }

  get isRootSpan() {
    return this.parentSpan !== null;
  }

  get isRemote() {
    return this._isRemote;
  }

  getTraceId(format: "hex"): string;
  getTraceId(format: "bin"): Uint8Array;
  getTraceId(): string;
  getTraceId(format: "hex" | "bin" = "hex"): Uint8Array | string {
    const { _traceId } = this;

    return format === "bin" ? new Uint8Array(_traceId) : getHexstring(_traceId);
  }

  getSpanId(format: "hex"): string;
  getSpanId(format: "bin"): Uint8Array;
  getSpanId(): string;
  getSpanId(format: "hex" | "bin" = "hex"): Uint8Array | string {
    const { _spanId } = this;

    return format === "bin" ? new Uint8Array(_spanId) : getHexstring(_spanId);
  }

  setStatus(code: Status_StatusCode, description?: string) {
    // Per spec, attempts to set the status code to Unset are ignore
    if (code === Status_StatusCode.STATUS_CODE_UNSET) {
      return;
    }
    // Per spec, if a span already has status 'OK', ignore attempt to change it
    if (this._status.code === Status_StatusCode.STATUS_CODE_OK) {
      return;
    }
    const newStatus: Status = {
      code,
      message: code === Status_StatusCode.STATUS_CODE_ERROR
        ? description ?? ""
        : "",
    };

    this._status = newStatus;
  }

  updateName(newName: string) {
    this._name = newName;
  }

  end(time = new Date()) {
    if (this._endTime !== undefined) {
      return;
    }

    this._endTime = time ?? new Date();
  }

  addEvent(name: string, attributes?: TelemetryBag, timestamp?: Date): void;
  addEvent(event: Span_Event): void;
  addEvent(event: Span_Event | string, attributes = [], timestamp?: Date) {
    let eventObject: Span_Event;
    if (typeof event === "string") {
      eventObject = {
        name: event,
        eventTime: timestamp ?? new Date(),
        attributes,
      };
    } else {
      eventObject = event;
    }
    this.events.push(eventObject);
  }

  addException(exception: Error, attributes: TelemetryBag = []) {
    const defaultAttributes: TelemetryBag = {
      "exception.message": exception.message,
      "exception.type": exception.name,
    };
    const { stack } = exception;
    if (stack !== undefined) {
      defaultAttributes["exception.stacktrace"] = stack;
    }

    this.addEvent("exception", {
      ...defaultAttributes,
      ...attributes,
    });
  }
}

export class NonRecordingSpan implements Span {
  private context: SpanContext;

  private constructor(spanContext: SpanContext) {
    this.context = spanContext;
  }

  static fromSpanContext(spanContext: SpanContext) {
    return new NonRecordingSpan(spanContext);
  }

  get spanContext(): SpanContext {
    return this.context;
  }

  get startTime() {
    return new Date(0);
  }

  get kind() {
    return Span_SpanKind.SPAN_KIND_INTERNAL;
  }
  get isRecording() {
    return false;
  }
  get attributes() {
    return [];
  }
  get events() {
    return [];
  }
  get links() {
    return [];
  }

  get status() {
    return { code: Status_StatusCode.STATUS_CODE_UNSET, message: "" };
  }
  get name() {
    return "";
  }
  get endTime() {
    return undefined;
  }

  setStatus(): void {}
  updateName(): void {}
  end(): void {}
  addEvent(): void {}
  addException(): void {}
}

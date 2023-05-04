import { Attributes } from "../basics.ts";
import { Tracer } from "./tracer.ts";

export interface TracerOptions {
  version?: string;
  schema_url?: string;
  attributes?: Attributes;
}

export class TracerProvider {
  getTracer(name: string, options: TracerOptions = {}): Tracer {
    return new Tracer(name, version);
  }
}

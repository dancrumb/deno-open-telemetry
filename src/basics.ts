import { KeyValue } from "./opentelemetry/proto/common/v1/common.ts";

export type TelemetryValue = string | boolean | number;
export type TelemetryBag = KeyValue[];

export type Attributes = TelemetryBag;

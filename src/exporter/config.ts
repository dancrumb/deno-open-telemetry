export const otlpProtocol = Deno.env.get("OTEL_EXPORTER_OTLP_PROTOCOL") ??
  "http/protobuf";

export const otlpEndpoint =
  Deno.env.get("OTEL_EXPORTER_OTLP_ENDPOINT") ?? otlpProtocol === "grpc"
    ? "http://localhost:4317"
    : "http://localhost:4318";

export const otlpTracesEndpoint =
  Deno.env.get("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT") ?? otlpProtocol === "grpc"
    ? otlpEndpoint
    : `${otlpEndpoint}/vi/traces`;

export const otlpMetricsEndpoint =
  Deno.env.get("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT") ?? otlpProtocol === "grpc"
    ? otlpEndpoint
    : `${otlpEndpoint}/vi/metrics`;

export const otlpLogsEndpoint =
  Deno.env.get("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT") ?? otlpProtocol === "grpc"
    ? otlpEndpoint
    : `${otlpEndpoint}/vi/logs`;

export const tracesSampler = Deno.env.get("OTEL_TRACES_SAMPLER") ??
  "parentbased_always_on";

export const tracesSamplerArg = Deno.env.get("OTEL_TRACES_SAMPLER_ARG");

export const propagators = Deno.env.get("OTEL_PROPAGATORS") ??
  "tracecontext,baggage";

export const tracesExporter = Deno.env.get("OTEL_TRACES_EXPORTER") ?? "otlp";

export const metricsExporter = Deno.env.get("OTEL_METRICS_EXPORTER") ?? "otlp";

export const logsExporter = Deno.env.get("OTEL_LOGS_EXPORTER") ?? "otlp";

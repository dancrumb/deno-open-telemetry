export const serviceName = Deno.env.get("OTEL_SERVICE_NAME") ??
  "unknown_service";

export const resourceAttributes = Deno.env.get("OTEL_RESOURCE_ATTRIBUTES");

export const tracesSampler = Deno.env.get("OTEL_TRACES_SAMPLER") ??
  "parentbased_always_on";

export const tracesSamplerArg = Deno.env.get("OTEL_TRACES_SAMPLER_ARG");

export const propagators = Deno.env.get("OTEL_PROPAGATORS") ??
  "tracecontext,baggage";

export const tracesExporter = Deno.env.get("OTEL_TRACES_EXPORTER") ?? "otlp";

export const metricsExporter = Deno.env.get("OTEL_METRICS_EXPORTER") ?? "otlp";

export const logsExporter = Deno.env.get("OTEL_LOGS_EXPORTER") ?? "otlp";

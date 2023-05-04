// @ts-nocheck
import {
  MethodDescriptor,
  RpcClientImpl,
  RpcReturnType,
} from "../../../../../../runtime/rpc.ts";
import {
  decodeBinary,
  encodeBinary,
  encodeJson,
  Type as ExportTraceServiceRequest,
} from "../../../../../../messages/opentelemetry/proto/collector/trace/v1/ExportTraceServiceRequest.ts";
import {
  decodeBinary as decodeBinary_1,
  encodeBinary as encodeBinary_1,
  encodeJson as encodeJson_1,
  Type as ExportTraceServiceResponse,
} from "../../../../../../messages/opentelemetry/proto/collector/trace/v1/ExportTraceServiceResponse.ts";
import {
  first,
  fromSingle,
} from "../../../../../../runtime/async/async-generator.ts";
import {
  getDevtoolsConfig,
  wrapRpcClientImpl,
} from "../../../../../../runtime/client-devtools.ts";

export interface Service<
  TReqArgs extends any[] = [],
  TResArgs extends any[] = [],
> {
  export(
    request: ExportTraceServiceRequest,
    ...args: TReqArgs
  ): RpcReturnType<Promise<ExportTraceServiceResponse>, TResArgs>;
}

export type MethodDescriptors = typeof methodDescriptors;

export const methodDescriptors = {
  export: {
    methodName: "Export",
    service: {
      serviceName: "opentelemetry.proto.collector.trace.v1.TraceService",
    },
    requestStream: false,
    responseStream: false,
    requestType: {
      serializeBinary: encodeBinary,
      deserializeBinary: decodeBinary,
      serializeJson: (value: ExportTraceServiceRequest) =>
        JSON.stringify(encodeJson(value)),
    },
    responseType: {
      serializeBinary: encodeBinary_1,
      deserializeBinary: decodeBinary_1,
      serializeJson: (value: ExportTraceServiceResponse) =>
        JSON.stringify(encodeJson_1(value)),
    },
  },
} as const;

export class RpcError<TTrailer = any> extends Error {
  trailer: TTrailer;
  constructor(trailer: TTrailer) {
    super();
    this.trailer = trailer;
  }
}

export interface CreateServiceClientConfig {
  responseOnly?: boolean;
  devtools?: true | { tags: string[] };
}

export function createServiceClient<TMetadata, THeader, TTrailer>(
  rpcClientImpl: RpcClientImpl<TMetadata, THeader, TTrailer>,
  config?: undefined,
): Service<[] | [TMetadata], []>;

export function createServiceClient<TMetadata, THeader, TTrailer>(
  rpcClientImpl: RpcClientImpl<TMetadata, THeader, TTrailer>,
  config: CreateServiceClientConfig & { responseOnly: false },
): Service<[] | [TMetadata], [THeader, Promise<TTrailer>]>;

export function createServiceClient<TMetadata, THeader, TTrailer>(
  rpcClientImpl: RpcClientImpl<TMetadata, THeader, TTrailer>,
  config: CreateServiceClientConfig & { responseOnly?: true },
): Service<[] | [TMetadata], []>;

export function createServiceClient<TMetadata, THeader, TTrailer>(
  rpcClientImpl: RpcClientImpl<TMetadata, THeader, TTrailer>,
  config?: CreateServiceClientConfig,
): Service<[] | [TMetadata], [] | [THeader, Promise<TTrailer>]> {
  let _rpcClientImpl = rpcClientImpl;
  const responseOnly = config?.responseOnly ?? true;
  const devtools = config?.devtools ?? false;
  if (devtools) {
    const tags = devtools === true ? [] : devtools.tags;
    const devtoolsConfig = getDevtoolsConfig();
    _rpcClientImpl = wrapRpcClientImpl({ rpcClientImpl, devtoolsConfig, tags });
  }
  return Object.fromEntries(
    Object.entries(methodDescriptors).map(
      ([camelRpcName, methodDescriptor]) => {
        const { requestStream, responseStream } = methodDescriptor;
        const rpcMethodImpl = _rpcClientImpl(
          methodDescriptor as MethodDescriptor<any, any>,
        );
        const rpcMethodHandler = async (request: any, metadata?: any) => {
          const reqAsyncGenerator = requestStream
            ? request
            : fromSingle(request);
          const rpcMethodResult = rpcMethodImpl(reqAsyncGenerator, metadata);
          const resAsyncGenerator = rpcMethodResult[0];
          const headerPromise = rpcMethodResult[1];
          const trailerPromise = rpcMethodResult[2];
          const [header, response] = await Promise.all([
            getHeaderBeforeTrailer(headerPromise, trailerPromise),
            responseStream ? resAsyncGenerator : first(resAsyncGenerator),
          ]);
          return responseOnly ? response : [response, header, trailerPromise];
        };
        return [camelRpcName, rpcMethodHandler];
      },
    ),
  ) as unknown as Service;
}

function getHeaderBeforeTrailer<THeader, TTrailer>(
  headerPromise: Promise<THeader>,
  trailerPromise: Promise<TTrailer>,
): Promise<THeader> {
  return Promise.race([
    headerPromise,
    trailerPromise.then((trailer) => {
      throw new RpcError(trailer);
    }),
  ]);
}

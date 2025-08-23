import { FastifyRequest } from "fastify";

export const getRequestPayload = <PayloadType>(request: FastifyRequest, validator?: (payload: PayloadType) => void) => {
  const payload = request.body as PayloadType;
  if (validator) {
    validator(payload);
  }

  return payload;
};

export const getRequestQuery = <QueryType>(request: FastifyRequest, validator?: (query: QueryType) => void) => {
  const query = request.query as QueryType;
  if (validator) {
    validator(query);
  }

  return query;
};

export const getRequestParams = <ParamsType>(request: FastifyRequest, validator?: (params: ParamsType) => void) => {
  const params = request.params as ParamsType;
  if (validator) {
    validator(params);
  }

  return params;
};

export const getRequestUserId = (request: FastifyRequest): string => {
  return request.headers["phoenix-user-id"] as string;
};

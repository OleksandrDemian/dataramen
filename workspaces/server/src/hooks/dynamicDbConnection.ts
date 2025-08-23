import {onResponseHookHandler} from "fastify";

export const responseCloseDynamicConnections: onResponseHookHandler = (request, res) => {
  if (request.__connections) {
    request.__connections.forEach((connection) => {
      connection.close();
    });
  }
};
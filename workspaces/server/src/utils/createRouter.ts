import {FastifyInstance} from "fastify";

export const createRouter = (fn: (instance: FastifyInstance) => void) => {
  return (instance: FastifyInstance, _: any, next: any) => {
    fn(instance);
    next();
  };
};

export type TRouter = ReturnType<typeof createRouter>;

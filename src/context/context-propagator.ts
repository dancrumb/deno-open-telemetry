import { Context } from "./context.ts";

export interface ContextPropagator {
  inject<Carrier>(context: Context, carrier: Carrier): void;
  extract<Carrier>(context: Context, carrier: Carrier): Context;
}

import { Context, setValue } from "./context.ts";
import { ContextPropagator } from "./context-propagator.ts";

type ObjectCarrier = Record<string, string>;
const isObjectCarrier = (carrier: unknown): carrier is ObjectCarrier =>
  typeof carrier === "object" && carrier !== null;

export interface Setter<Carrier = unknown> {
  set(carrier: Carrier, key: string, value: string): void;
}
export interface Getter<Carrier = unknown> {
  keys: (carrier: Carrier) => string[];
  get: (carrier: Carrier, key: string) => string;
}

const objectSetter: Setter = {
  set(carrier, key: string, value: string) {
    if (isObjectCarrier(carrier)) {
      carrier[key] = value;
    }
  },
};

const objectGetter: Getter = {
  keys(carrier) {
    if (isObjectCarrier(carrier)) {
      return Object.keys(carrier);
    }
    return [];
  },

  get(carrier, key) {
    if (isObjectCarrier(carrier)) {
      return carrier[key];
    }
    throw new Error("");
  },
};

export class TextMapPropagator implements ContextPropagator {
  inject<Carrier extends unknown>(
    context: Context,
    carrier: Carrier,
    setter: Setter<Carrier> = objectSetter,
  ): void {
    const field = this.fields[0];
    const payload = new URLSearchParams();
    Object.entries(context).forEach(([key, value]) => {
      payload.set(key, JSON.stringify(value));
    });
    setter.set(carrier, field, payload.toString());
  }

  extract<Carrier extends unknown>(
    context: Context,
    carrier: Carrier,
    getter: Getter<Carrier> = objectGetter,
  ): Context {
    const carrierKeys = getter.keys(carrier);
    let newContext = context;

    this.fields.forEach((field) => {
      if (carrierKeys.includes(field)) {
        const carrierValue = getter.get(carrier, field);
        const kvPairs = new URLSearchParams(carrierValue);
        for (const [key, value] of kvPairs.entries()) {
          newContext = setValue(newContext, key, value);
        }
      }
    });

    return newContext;
  }
  readonly fields: string[] = [];
}

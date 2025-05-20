type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCase<U>}`
  : S;

type SnakifyObject<T, S = false> = {
  [K in keyof T as SnakeCase<string & K>]: T[K] extends Date
    ? T[K]
    : T[K] extends RegExp
      ? T[K]
      : T[K] extends Array<infer U>
        ? U extends object | undefined
          ? Array<SnakifyObject<U>>
          : T[K]
        : T[K] extends object | undefined
          ? S extends true
            ? T[K]
            : SnakifyObject<T[K]>
          : T[K];
};

export type Snakify<T, S = false> =
  T extends Array<infer U> ? Array<SnakifyObject<U, S>> : SnakifyObject<T, S>;

function snakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function walk<T>(obj: T, shallow = false): T {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date || obj instanceof RegExp) return obj;
  if (Array.isArray(obj))
    return obj.map((v) => {
      if (!shallow) {
        return walk(v);
      }
      if (typeof v === "object") return walk(v, shallow);
      return v;
    }) as T;

  return Object.keys(obj).reduce(
    (res, key) => {
      const objectTyped = obj as Record<string, unknown>;
      const snake = snakeCase(key);
      const uncapitalized = snake.charAt(0).toLowerCase() + snake.slice(1);
      res[uncapitalized] = shallow ? objectTyped[key] : walk(objectTyped[key]);
      return res;
    },
    {} as Record<string, unknown>
  ) as T;
}

export function snakify<T, S extends boolean = false>(
  /**
   * Value to be snakified
   */
  obj: T,

  /**
   * If true, only the top level keys of the obj will be camel cased
   */
  shallow?: S
): T extends string ? string : Snakify<T, S> {
  return (
    typeof obj === "string" ? snakeCase(obj) : walk(obj, shallow)
  ) as T extends string ? string : Snakify<T, S>;
}

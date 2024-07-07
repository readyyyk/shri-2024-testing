const str =
  () =>
  (v: unknown): v is string =>
    typeof v === "string";
const num =
  () =>
  (v: unknown): v is number =>
    typeof v === "number";

type CheckStr = () => (x: unknown) => x is string;
type CheckNum = () => (v: unknown) => v is number;
type Checker = CheckStr | CheckNum;

type Response =
  | { success: false; error: string }
  | { success: true; data: Record<string, ReturnType<ReturnType<Checker>>> };
const object = (
  v: Record<string, ReturnType<Checker>>,
): ((x: unknown) => Response) => {
  function ret(x: unknown): Response {
    if (typeof x !== "object" || x === null) {
      return {
        success: false,
        error: `Not an object`,
      };
    }

    const xKeys = new Set(Object.keys(x));
    const vKeys = new Set(Object.keys(v));
    // A.symmetricDifference(B)
    xKeys.forEach((key) => vKeys.delete(key) && xKeys.delete(key));
    if (vKeys.size > 0) {
      return {
        success: false,
        error: `Object has missing keys: [${Array.from(vKeys)}]`,
      };
    }
    if (xKeys.size > 0) {
      return {
        success: false,
        error: `Object has extra keys: [${Array.from(vKeys)}]`,
      };
    }

    for (const [key, checker] of Object.entries(v)) {
      if (checker((x as Record<string, unknown>)[key]) === false) {
        return {
          success: false,
          error: `Object has invalid key type: ${key}`,
        };
      }
    }

    return {
      success: true,
      data: x as Record<string, ReturnType<ReturnType<Checker>>>,
    };
  }

  return ret;
};

export const r = {
  object,
  str,
  num,
};

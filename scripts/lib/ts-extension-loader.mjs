import { extname } from "node:path";

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
    const isExtensionless = extname(specifier) === "";

    if (
      !(error instanceof Error) ||
      error.code !== "ERR_MODULE_NOT_FOUND" ||
      !isRelative ||
      !isExtensionless
    ) {
      throw error;
    }

    return nextResolve(`${specifier}.ts`, context);
  }
}

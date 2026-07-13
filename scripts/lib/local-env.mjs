import { existsSync, readFileSync } from "node:fs";

function unquote(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function loadLocalEnv({ cwd = process.cwd(), fileNames = [".env.local"] } = {}) {
  const loaded = [];

  for (const fileName of fileNames) {
    const path = `${cwd}/${fileName}`;

    if (!existsSync(path)) {
      continue;
    }

    const contents = readFileSync(path, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmed.indexOf("=");

      if (equalsIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = unquote(trimmed.slice(equalsIndex + 1));

      if (/^[A-Z0-9_]+$/.test(key) && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    loaded.push(fileName);
  }

  return loaded;
}

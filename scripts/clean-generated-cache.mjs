import { rm } from "node:fs/promises";

await rm(".next", { force: true, recursive: true });
console.log("Cleared disposable Next.js build output.");

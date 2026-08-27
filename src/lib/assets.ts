import fs from "fs";
import path from "path";

// Server-only helper: checks whether a file exists under /public, so pages
// can render a real asset when it's been added and a graceful placeholder
// when it hasn't, without erroring on a missing image.
export function publicFileExists(relativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", relativePath));
  } catch {
    return false;
  }
}

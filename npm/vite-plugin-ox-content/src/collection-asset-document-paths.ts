import * as path from "node:path";

export function normalizePublicPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\0")) {
    throw new Error(
      `Collection asset public path ${JSON.stringify(value)} must be an absolute URL path.`,
    );
  }
  const segments = value.slice(1).split("/");
  if (segments.length === 0 || segments.some((segment) => !segment)) {
    throw new Error(
      `Collection asset public path ${JSON.stringify(value)} must not contain empty segments.`,
    );
  }
  return `/${segments.map((segment) => encodePublicSegment(segment, value)).join("/")}`;
}

export function isWithinOrEqual(root: string, file: string): boolean {
  const relative = path.relative(root, file);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

function encodePublicSegment(segment: string, publicPath: string): string {
  const decoded = decodeURIComponent(segment);
  if (
    !decoded ||
    decoded === "." ||
    decoded === ".." ||
    decoded.includes("/") ||
    decoded.includes("\\") ||
    hasControlCharacter(decoded)
  ) {
    throw new Error(`Collection asset public path ${JSON.stringify(publicPath)} is unsafe.`);
  }
  return encodeURIComponent(decoded);
}

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

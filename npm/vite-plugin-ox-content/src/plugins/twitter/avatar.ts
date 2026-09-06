import { escapeAttribute } from "./html";
import type { TweetProfileImageShape } from "./types";

type AvatarShapeClass = "circle" | "square";

export function renderAvatar(
  src: string | undefined,
  size: number,
  shape: TweetProfileImageShape | undefined,
): string {
  if (!src) return "";
  const className = `ox-tweet__avatar ox-tweet__avatar--${avatarShapeClass(shape)}`;
  return `<img class="${className}" src="${escapeAttribute(src)}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">`;
}

function avatarShapeClass(shape: TweetProfileImageShape | undefined): AvatarShapeClass {
  return shape === "Square" ? "square" : "circle";
}

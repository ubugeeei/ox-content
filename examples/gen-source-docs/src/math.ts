/**
 * Mathematical utility functions.
 * @module math
 */

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value
 *
 * @example
 * ```ts
 * clamp(5, 0, 10) // => 5
 * clamp(-5, 0, 10) // => 0
 * clamp(15, 0, 10) // => 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two values.
 *
 * @param start - The start value
 * @param end - The end value
 * @param t - The interpolation factor (0 to 1)
 * @returns The interpolated value
 *
 * @example
 * ```ts
 * lerp(0, 100, 0.5) // => 50
 * lerp(0, 100, 0.25) // => 25
 * ```
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Rounds a number to a specified number of decimal places.
 *
 * @param value - The value to round
 * @param decimals - The number of decimal places
 * @returns The rounded value
 *
 * @example
 * ```ts
 * round(3.14159, 2) // => 3.14
 * round(3.14159, 4) // => 3.1416
 * ```
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

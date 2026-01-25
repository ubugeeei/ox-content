/**
 * A collection of utility functions for string manipulation.
 * @module utils
 */

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The input string to capitalize
 * @returns The string with the first letter capitalized
 *
 * @example
 * ```ts
 * capitalize('hello') // => 'Hello'
 * capitalize('WORLD') // => 'WORLD'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncates a string to a specified length.
 *
 * @param str - The input string to truncate
 * @param maxLength - Maximum length of the output string
 * @param suffix - Suffix to append when truncated (default: '...')
 * @returns The truncated string
 *
 * @example
 * ```ts
 * truncate('Hello World', 5) // => 'Hello...'
 * truncate('Hi', 10) // => 'Hi'
 * ```
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + suffix
}

/**
 * Converts a string to kebab-case.
 *
 * @param str - The input string to convert
 * @returns The kebab-cased string
 *
 * @example
 * ```ts
 * toKebabCase('helloWorld') // => 'hello-world'
 * toKebabCase('HelloWorld') // => 'hello-world'
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase()
}

# utils.ts

## Table of Contents

- [capitalize](#capitalize)
- [truncate](#truncate)
- [toKebabCase](#tokebabcase)

---

## capitalize

`function`

Capitalizes the first letter of a string.

```typescript
export function capitalize(str: string): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `str` | `string` | The input string to capitalize |

### Returns

`string` - The string with the first letter capitalized

### Examples

```ts
capitalize('hello') // => 'Hello'
capitalize('WORLD') // => 'WORLD'
```

---

## truncate

`function`

Truncates a string to a specified length.

```typescript
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = '...'
  ): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `str` | `string` | The input string to truncate |
| `maxLength` | `number` | Maximum length of the output string |
| `suffix` | `string` | Suffix to append when truncated (default: '...') |

### Returns

`string` - The truncated string

### Examples

```ts
truncate('Hello World', 5) // => 'Hello...'
truncate('Hi', 10) // => 'Hi'
```

---

## toKebabCase

`function`

Converts a string to kebab-case.

```typescript
export function toKebabCase(str: string): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `str` | `string` | The input string to convert |

### Returns

`string` - The kebab-cased string

### Examples

```ts
toKebabCase('helloWorld') // => 'hello-world'
toKebabCase('HelloWorld') // => 'hello-world'
```

---


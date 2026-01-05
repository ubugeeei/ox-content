# utils.ts

## Table of Contents

- [capitalize](#capitalize)
- [truncate](#truncate)
- [toKebabCase](#tokebabcase)

---

## capitalize

`function`

Capitalizes the first letter of a string.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `str` | `unknown` | The input string to capitalize |

### Returns

`unknown` - The string with the first letter capitalized

### Examples

```ts
capitalize('hello') // => 'Hello'
capitalize('WORLD') // => 'WORLD'
```

---

## truncate

`function`

Truncates a string to a specified length.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `str` | `unknown` | The input string to truncate |
| `maxLength` | `unknown` | Maximum length of the output string |
| `suffix` | `unknown` | Suffix to append when truncated (default: '...') |

### Returns

`unknown` - The truncated string

### Examples

```ts
truncate('Hello World', 5) // => 'Hello...'
truncate('Hi', 10) // => 'Hi'
```

---

## toKebabCase

`function`

Converts a string to kebab-case.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `str` | `unknown` | The input string to convert |

### Returns

`unknown` - The kebab-cased string

### Examples

```ts
toKebabCase('helloWorld') // => 'hello-world'
toKebabCase('HelloWorld') // => 'hello-world'
```

---


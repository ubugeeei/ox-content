# math.ts

## Table of Contents

- [clamp](#clamp)
- [lerp](#lerp)
- [round](#round)

---

## clamp

`function`

Clamps a number between a minimum and maximum value.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `value` | `unknown` | The value to clamp |
| `min` | `unknown` | The minimum allowed value |
| `max` | `unknown` | The maximum allowed value |

### Returns

`unknown` - The clamped value

### Examples

```ts
clamp(5, 0, 10) // => 5
clamp(-5, 0, 10) // => 0
clamp(15, 0, 10) // => 10
```

---

## lerp

`function`

Linearly interpolates between two values.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `start` | `unknown` | The start value |
| `end` | `unknown` | The end value |
| `t` | `unknown` | The interpolation factor (0 to 1) |

### Returns

`unknown` - The interpolated value

### Examples

```ts
lerp(0, 100, 0.5) // => 50
lerp(0, 100, 0.25) // => 25
```

---

## round

`function`

Rounds a number to a specified number of decimal places.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `value` | `unknown` | The value to round |
| `decimals` | `unknown` | The number of decimal places |

### Returns

`unknown` - The rounded value

### Examples

```ts
round(3.14159, 2) // => 3.14
round(3.14159, 4) // => 3.1416
```

---


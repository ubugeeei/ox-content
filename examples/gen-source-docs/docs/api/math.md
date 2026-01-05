# math.ts

## Table of Contents

- [clamp](#clamp)
- [lerp](#lerp)
- [round](#round)

---

## clamp

`function`

Clamps a number between a minimum and maximum value.

```typescript
export function clamp(value: number, min: number, max: number): number
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `value` | `number` | The value to clamp |
| `min` | `number` | The minimum allowed value |
| `max` | `number` | The maximum allowed value |

### Returns

`number` - The clamped value

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

```typescript
export function lerp(start: number, end: number, t: number): number
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `start` | `number` | The start value |
| `end` | `number` | The end value |
| `t` | `number` | The interpolation factor (0 to 1) |

### Returns

`number` - The interpolated value

### Examples

```ts
lerp(0, 100, 0.5) // => 50
lerp(0, 100, 0.25) // => 25
```

---

## round

`function`

Rounds a number to a specified number of decimal places.

```typescript
export function round(value: number, decimals: number): number
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `value` | `number` | The value to round |
| `decimals` | `number` | The number of decimal places |

### Returns

`number` - The rounded value

### Examples

```ts
round(3.14159, 2) // => 3.14
round(3.14159, 4) // => 3.1416
```

---


/**
 * Flattens a React Native `style` prop (which may be a nested array of style
 * objects/falsy values, as produced by conditional `[styles.x, cond && {...}]`
 * patterns) and checks whether any entry sets `key` to `value`.
 */
export function hasStyleValue(style: unknown, key: string, value: unknown): boolean {
  return [style]
    .flat(Infinity)
    .some((entry) => (entry as Record<string, unknown> | null | undefined)?.[key] === value);
}

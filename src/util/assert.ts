export function assertDefined<T>(
  value: T,
  message = "Unexpected undefined/null."
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}

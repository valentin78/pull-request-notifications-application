export function isBlank(value: any) {
  return value === null || typeof value === 'undefined' || (typeof value === 'number' && isNaN(value));
}

export function isPresent(value: any) {
  return !isBlank(value);
}

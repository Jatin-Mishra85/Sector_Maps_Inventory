export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

export function isPositiveNumber(value) {
  const num = Number(value);
  return !Number.isNaN(num) && num > 0;
}
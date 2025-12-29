/**
 * Formats a number as Vietnamese Dong (VND) currency.
 * @param amount The number to format.
 * @returns A string representing the formatted currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
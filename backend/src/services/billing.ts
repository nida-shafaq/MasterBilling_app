// Tariff Slabs: (0-100 units = Rate 1, 101-300 = Rate 2, >300 = Rate 3)
const RATE_1 = 1.5; // per unit for 0-100
const RATE_2 = 2.0; // per unit for 101-300
const RATE_3 = 3.0; // per unit for >300

const FIXED_MAINTENANCE = 50.0;
const TAX_PERCENTAGE = 0.05; // 5%

export function calculateBilling(unitsConsumed: number) {
  let baseBill = 0;

  if (unitsConsumed <= 100) {
    baseBill = unitsConsumed * RATE_1;
  } else if (unitsConsumed <= 300) {
    baseBill = (100 * RATE_1) + ((unitsConsumed - 100) * RATE_2);
  } else {
    baseBill = (100 * RATE_1) + (200 * RATE_2) + ((unitsConsumed - 300) * RATE_3);
  }

  const subtotal = baseBill + FIXED_MAINTENANCE;
  const taxAmount = subtotal * TAX_PERCENTAGE;
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    totalAmount
  };
}

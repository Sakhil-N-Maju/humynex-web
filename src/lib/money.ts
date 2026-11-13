// All amounts are integer paise. ₹1 = 100 paise.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(paise: number, exact = false) {
  const rupees = paise / 100;
  if (exact || !Number.isInteger(rupees)) return inrExact.format(rupees);
  return inr.format(rupees);
}

export const rupees = (r: number) => Math.round(r * 100);
export const toRupees = (paise: number) => paise / 100;

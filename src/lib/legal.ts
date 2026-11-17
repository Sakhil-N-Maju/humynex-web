// Business details used by the policy pages (Razorpay and Indian e-commerce
// rules ask for them). Have the finished policies reviewed by a lawyer.
export const LEGAL = {
  brand: "Humynex Robotics",
  legalName: "HUMYNEX ROBOTICS PRIVATE LIMITED",
  gstin: "32AAICH6196H1ZD",
  // Consumer Protection (E-Commerce) Rules 2020 and the DPDP Act 2023 need a named contact
  grievanceOfficer: "Pranav S Pillai",
  jurisdiction: "Ernakulam, Kerala",
  lastUpdated: "17 November 2026",
};

export const POLICIES = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/refund-policy", label: "Refunds & cancellations" },
  { href: "/shipping-policy", label: "Shipping & delivery" },
];

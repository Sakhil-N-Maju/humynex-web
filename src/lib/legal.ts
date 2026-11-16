// Business details used by the policy pages. Everything in [brackets] must be
// filled in by the company before launch (Razorpay and Indian e-commerce rules
// ask for them). Have the finished policies reviewed by a lawyer.
export const LEGAL = {
  brand: "Humynex Robotics",
  legalName: "[Registered company name]",
  gstin: "[GSTIN]",
  // Consumer Protection (E-Commerce) Rules 2020 and the DPDP Act 2023 need a named contact
  grievanceOfficer: "[Grievance officer's name]",
  jurisdiction: "Ernakulam, Kerala",
  lastUpdated: "16 November 2026",
};

export const POLICIES = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/refund-policy", label: "Refunds & cancellations" },
  { href: "/shipping-policy", label: "Shipping & delivery" },
];

// Shared 3D print estimator. The same function runs client-side for the live
// quote and server-side when the job is saved, so the price can't be tampered with.

export type PrintConfig = {
  setupFee: number;
  machineRate: number;
  minOrder: number;
  bed: { x: number; y: number; z: number };
  qualities: Record<string, { label: string; layer: number; gramsPerHour: number; note: string }>;
};

export type MaterialRate = { code: string; name: string; density: number; pricePerG: number };

export type PrintInput = {
  volumeMm3: number;
  size: { x: number; y: number; z: number }; // mm
  material: MaterialRate;
  infill: number; // 0-100
  quality: string;
  quantity: number;
};

export type PrintQuote = {
  grams: number; // per part
  hours: number; // per part
  materialCost: number;
  machineCost: number;
  setupFee: number;
  subtotal: number;
  total: number; // paise
  minApplied: boolean;
  fitsBed: boolean;
};

// Walls, top and bottom layers are solid no matter the infill. For typical parts
// they account for roughly a quarter of the volume.
const SHELL_SHARE = 0.25;

export function estimatePrint(input: PrintInput, cfg: PrintConfig): PrintQuote {
  const cm3 = input.volumeMm3 / 1000;
  const infill = Math.min(100, Math.max(5, input.infill)) / 100;
  const fill = SHELL_SHARE + (1 - SHELL_SHARE) * infill;
  const grams = cm3 * input.material.density * fill;
  const q = cfg.qualities[input.quality] ?? Object.values(cfg.qualities)[0];
  const hours = grams / q.gramsPerHour + 0.15; // + heat-up and first layer
  const qty = Math.max(1, Math.floor(input.quantity));

  const materialCost = Math.round(grams * input.material.pricePerG) * qty;
  const machineCost = Math.round(hours * cfg.machineRate) * qty;
  const subtotal = materialCost + machineCost + cfg.setupFee;
  const total = Math.max(subtotal, cfg.minOrder);

  const dims = [input.size.x, input.size.y, input.size.z].sort((a, b) => b - a);
  const bed = [cfg.bed.x, cfg.bed.y, cfg.bed.z].sort((a, b) => b - a);
  const fitsBed = dims.every((d, i) => d <= bed[i]);

  return {
    grams: Math.round(grams * 10) / 10,
    hours: Math.round(hours * 10) / 10,
    materialCost,
    machineCost,
    setupFee: cfg.setupFee,
    subtotal,
    total,
    minApplied: total > subtotal,
    fitsBed,
  };
}

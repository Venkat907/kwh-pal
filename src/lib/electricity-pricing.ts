/**
 * Electricity Pricing Module
 * 
 * Implements slab-based pricing with state-wise tariff configuration.
 * Each state has its own set of consumption slabs with different per-unit rates.
 * Bills are calculated cumulatively (not flat rate for entire consumption).
 */

// --- Slab definition ---
export interface PricingSlab {
  /** Upper limit of this slab in kWh (use Infinity for the last slab) */
  upTo: number;
  /** Cost per unit (₹/kWh) for this slab */
  rate: number;
  /** Human-readable label */
  label: string;
}

export interface StatePricing {
  name: string;
  slabs: PricingSlab[];
}

/**
 * State-wise electricity pricing configuration.
 * Add or modify states here to support new regions.
 */
export const STATE_PRICING: Record<string, StatePricing> = {
  'Andhra Pradesh': {
    name: 'Andhra Pradesh',
    slabs: [
      { upTo: 100, rate: 1.90, label: '0–100 units' },
      { upTo: 200, rate: 3.18, label: '101–200 units' },
      { upTo: 300, rate: 4.47, label: '201–300 units' },
      { upTo: Infinity, rate: 6.88, label: '301+ units' },
    ],
  },
  'Telangana': {
    name: 'Telangana',
    slabs: [
      { upTo: 100, rate: 1.95, label: '0–100 units' },
      { upTo: 200, rate: 3.55, label: '101–200 units' },
      { upTo: 300, rate: 5.20, label: '201–300 units' },
      { upTo: Infinity, rate: 7.80, label: '301+ units' },
    ],
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    slabs: [
      { upTo: 100, rate: 0, label: '0–100 units (Free)' },
      { upTo: 200, rate: 2.25, label: '101–200 units' },
      { upTo: 300, rate: 4.50, label: '201–300 units' },
      { upTo: Infinity, rate: 6.60, label: '301+ units' },
    ],
  },
  'Karnataka': {
    name: 'Karnataka',
    slabs: [
      { upTo: 50, rate: 3.85, label: '0–50 units' },
      { upTo: 100, rate: 4.95, label: '51–100 units' },
      { upTo: 200, rate: 6.20, label: '101–200 units' },
      { upTo: Infinity, rate: 7.30, label: '201+ units' },
    ],
  },
  'Maharashtra': {
    name: 'Maharashtra',
    slabs: [
      { upTo: 100, rate: 3.79, label: '0–100 units' },
      { upTo: 300, rate: 7.37, label: '101–300 units' },
      { upTo: 500, rate: 10.08, label: '301–500 units' },
      { upTo: Infinity, rate: 12.54, label: '501+ units' },
    ],
  },
  'Kerala': {
    name: 'Kerala',
    slabs: [
      { upTo: 50, rate: 1.50, label: '0–50 units' },
      { upTo: 100, rate: 2.00, label: '51–100 units' },
      { upTo: 200, rate: 3.00, label: '101–200 units' },
      { upTo: 300, rate: 4.50, label: '201–300 units' },
      { upTo: Infinity, rate: 6.40, label: '301+ units' },
    ],
  },
  'Delhi': {
    name: 'Delhi',
    slabs: [
      { upTo: 200, rate: 3.00, label: '0–200 units' },
      { upTo: 400, rate: 4.50, label: '201–400 units' },
      { upTo: 800, rate: 6.50, label: '401–800 units' },
      { upTo: Infinity, rate: 7.75, label: '801+ units' },
    ],
  },
  'Gujarat': {
    name: 'Gujarat',
    slabs: [
      { upTo: 50, rate: 3.05, label: '0–50 units' },
      { upTo: 100, rate: 3.50, label: '51–100 units' },
      { upTo: 200, rate: 4.15, label: '101–200 units' },
      { upTo: Infinity, rate: 5.00, label: '201+ units' },
    ],
  },
  'Rajasthan': {
    name: 'Rajasthan',
    slabs: [
      { upTo: 50, rate: 3.85, label: '0–50 units' },
      { upTo: 150, rate: 5.45, label: '51–150 units' },
      { upTo: 300, rate: 6.40, label: '151–300 units' },
      { upTo: Infinity, rate: 7.00, label: '301+ units' },
    ],
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    slabs: [
      { upTo: 100, rate: 3.50, label: '0–100 units' },
      { upTo: 200, rate: 4.50, label: '101–200 units' },
      { upTo: 300, rate: 5.50, label: '201–300 units' },
      { upTo: Infinity, rate: 6.50, label: '301+ units' },
    ],
  },
  'West Bengal': {
    name: 'West Bengal',
    slabs: [
      { upTo: 25, rate: 3.09, label: '0–25 units' },
      { upTo: 60, rate: 4.72, label: '26–60 units' },
      { upTo: 100, rate: 5.28, label: '61–100 units' },
      { upTo: 200, rate: 6.25, label: '101–200 units' },
      { upTo: Infinity, rate: 7.12, label: '201+ units' },
    ],
  },
  'Punjab': {
    name: 'Punjab',
    slabs: [
      { upTo: 100, rate: 3.06, label: '0–100 units' },
      { upTo: 300, rate: 5.36, label: '101–300 units' },
      { upTo: Infinity, rate: 6.91, label: '301+ units' },
    ],
  },
  'Custom': {
    name: 'Custom (Flat Rate)',
    slabs: [
      { upTo: 100, rate: 3, label: '0–100 units' },
      { upTo: 200, rate: 5, label: '101–200 units' },
      { upTo: Infinity, rate: 8, label: '201+ units' },
    ],
  },
};

/** Sorted list of available state names */
export const AVAILABLE_STATES = Object.keys(STATE_PRICING).sort();

/**
 * Slab breakdown item for display purposes
 */
export interface SlabBreakdownItem {
  label: string;
  units: number;
  rate: number;
  cost: number;
}

/**
 * Result of a slab-based bill calculation
 */
export interface BillCalculation {
  totalUnits: number;
  totalCost: number;
  breakdown: SlabBreakdownItem[];
  effectiveRate: number; // average ₹/kWh
}

/**
 * Calculate electricity bill using cumulative slab-based pricing.
 * 
 * Example: 150 units in a state with slabs [0-100 @ ₹3, 101-200 @ ₹5]
 *   First 100 units → 100 × 3 = ₹300
 *   Next 50 units  → 50 × 5  = ₹250
 *   Total = ₹550
 * 
 * @param units - Total units consumed (kWh). Clamped to 0 for negative values.
 * @param stateName - Name of the state for pricing lookup.
 * @returns BillCalculation with breakdown per slab.
 */
export function calculateSlabBill(units: number, stateName: string): BillCalculation {
  // Edge case: invalid or zero units
  const safeUnits = Math.max(0, Number(units) || 0);

  const pricing = STATE_PRICING[stateName] || STATE_PRICING['Custom'];
  const breakdown: SlabBreakdownItem[] = [];

  let remainingUnits = safeUnits;
  let totalCost = 0;
  let previousLimit = 0;

  for (const slab of pricing.slabs) {
    if (remainingUnits <= 0) break;

    // How many units fall in this slab
    const slabCapacity = slab.upTo === Infinity ? remainingUnits : slab.upTo - previousLimit;
    const unitsInSlab = Math.min(remainingUnits, slabCapacity);
    const slabCost = Number((unitsInSlab * slab.rate).toFixed(2));

    breakdown.push({
      label: slab.label,
      units: unitsInSlab,
      rate: slab.rate,
      cost: slabCost,
    });

    totalCost += slabCost;
    remainingUnits -= unitsInSlab;
    previousLimit = slab.upTo === Infinity ? previousLimit : slab.upTo;
  }

  return {
    totalUnits: safeUnits,
    totalCost: Number(totalCost.toFixed(2)),
    breakdown,
    effectiveRate: safeUnits > 0 ? Number((totalCost / safeUnits).toFixed(2)) : 0,
  };
}

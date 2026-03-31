/**
 * Electricity Pricing Module
 * 
 * Implements slab-based pricing with state-wise tariff configuration.
 * Each state has its own set of consumption slabs with different per-unit rates.
 * Bills are calculated cumulatively (not flat rate for entire consumption).
 * 
 * Tariff rates are based on 2024-25 domestic/residential tariffs from
 * respective State Electricity Regulatory Commissions (SERCs).
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
 * State-wise electricity pricing configuration (Domestic/Residential).
 * Rates sourced from respective SERC tariff orders for FY 2024-25.
 * These are approximate and may vary by distribution company within the state.
 */
export const STATE_PRICING: Record<string, StatePricing> = {
  'Andhra Pradesh': {
    name: 'Andhra Pradesh (APSPDCL/APEPDCL)',
    slabs: [
      { upTo: 30, rate: 1.90, label: '0–30 units' },
      { upTo: 75, rate: 3.02, label: '31–75 units' },
      { upTo: 125, rate: 4.27, label: '76–125 units' },
      { upTo: 225, rate: 6.09, label: '126–225 units' },
      { upTo: 400, rate: 8.75, label: '226–400 units' },
      { upTo: Infinity, rate: 9.95, label: '401+ units' },
    ],
  },
  'Telangana': {
    name: 'Telangana (TSSPDCL/TSNPDCL)',
    slabs: [
      { upTo: 50, rate: 1.95, label: '0–50 units' },
      { upTo: 100, rate: 3.20, label: '51–100 units' },
      { upTo: 200, rate: 5.05, label: '101–200 units' },
      { upTo: 300, rate: 7.40, label: '201–300 units' },
      { upTo: 400, rate: 8.80, label: '301–400 units' },
      { upTo: Infinity, rate: 9.50, label: '401+ units' },
    ],
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu (TANGEDCO)',
    slabs: [
      { upTo: 100, rate: 0, label: '0–100 units (Free)' },
      { upTo: 200, rate: 2.25, label: '101–200 units' },
      { upTo: 300, rate: 4.50, label: '201–300 units' },
      { upTo: 400, rate: 6.00, label: '301–400 units' },
      { upTo: 500, rate: 8.00, label: '401–500 units' },
      { upTo: Infinity, rate: 9.00, label: '501+ units' },
    ],
  },
  'Karnataka': {
    name: 'Karnataka (BESCOM/MESCOM)',
    slabs: [
      { upTo: 50, rate: 4.10, label: '0–50 units' },
      { upTo: 100, rate: 5.55, label: '51–100 units' },
      { upTo: 200, rate: 7.10, label: '101–200 units' },
      { upTo: 300, rate: 7.95, label: '201–300 units' },
      { upTo: Infinity, rate: 8.95, label: '301+ units' },
    ],
  },
  'Maharashtra': {
    name: 'Maharashtra (MSEDCL)',
    slabs: [
      { upTo: 100, rate: 4.71, label: '0–100 units' },
      { upTo: 300, rate: 7.88, label: '101–300 units' },
      { upTo: 500, rate: 10.29, label: '301–500 units' },
      { upTo: Infinity, rate: 12.54, label: '501+ units' },
    ],
  },
  'Kerala': {
    name: 'Kerala (KSEB)',
    slabs: [
      { upTo: 40, rate: 1.50, label: '0–40 units' },
      { upTo: 80, rate: 2.00, label: '41–80 units' },
      { upTo: 120, rate: 3.00, label: '81–120 units' },
      { upTo: 200, rate: 4.60, label: '121–200 units' },
      { upTo: 300, rate: 6.40, label: '201–300 units' },
      { upTo: 400, rate: 7.60, label: '301–400 units' },
      { upTo: 500, rate: 7.90, label: '401–500 units' },
      { upTo: Infinity, rate: 8.80, label: '501+ units' },
    ],
  },
  'Delhi': {
    name: 'Delhi (BSES/TPDDL)',
    slabs: [
      { upTo: 200, rate: 3.00, label: '0–200 units' },
      { upTo: 400, rate: 4.50, label: '201–400 units' },
      { upTo: 800, rate: 6.50, label: '401–800 units' },
      { upTo: 1200, rate: 7.00, label: '801–1200 units' },
      { upTo: Infinity, rate: 8.00, label: '1201+ units' },
    ],
  },
  'Gujarat': {
    name: 'Gujarat (PGVCL/DGVCL/MGVCL/UGVCL)',
    slabs: [
      { upTo: 50, rate: 3.05, label: '0–50 units' },
      { upTo: 100, rate: 3.50, label: '51–100 units' },
      { upTo: 200, rate: 4.15, label: '101–200 units' },
      { upTo: 300, rate: 4.60, label: '201–300 units' },
      { upTo: Infinity, rate: 5.00, label: '301+ units' },
    ],
  },
  'Rajasthan': {
    name: 'Rajasthan (JVVNL/AVVNL/JdVVNL)',
    slabs: [
      { upTo: 50, rate: 3.85, label: '0–50 units' },
      { upTo: 150, rate: 5.45, label: '51–150 units' },
      { upTo: 300, rate: 6.40, label: '151–300 units' },
      { upTo: 500, rate: 6.90, label: '301–500 units' },
      { upTo: Infinity, rate: 7.55, label: '501+ units' },
    ],
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh (UPPCL)',
    slabs: [
      { upTo: 100, rate: 3.50, label: '0–100 units' },
      { upTo: 150, rate: 4.00, label: '101–150 units' },
      { upTo: 200, rate: 4.50, label: '151–200 units' },
      { upTo: 300, rate: 5.50, label: '201–300 units' },
      { upTo: Infinity, rate: 6.50, label: '301+ units' },
    ],
  },
  'West Bengal': {
    name: 'West Bengal (WBSEDCL)',
    slabs: [
      { upTo: 25, rate: 3.09, label: '0–25 units' },
      { upTo: 60, rate: 4.72, label: '26–60 units' },
      { upTo: 100, rate: 5.28, label: '61–100 units' },
      { upTo: 200, rate: 6.25, label: '101–200 units' },
      { upTo: 300, rate: 6.93, label: '201–300 units' },
      { upTo: Infinity, rate: 7.75, label: '301+ units' },
    ],
  },
  'Punjab': {
    name: 'Punjab (PSPCL)',
    slabs: [
      { upTo: 100, rate: 3.06, label: '0–100 units' },
      { upTo: 300, rate: 5.36, label: '101–300 units' },
      { upTo: 500, rate: 6.38, label: '301–500 units' },
      { upTo: Infinity, rate: 7.08, label: '501+ units' },
    ],
  },
  'Madhya Pradesh': {
    name: 'Madhya Pradesh (MPPKVVCL)',
    slabs: [
      { upTo: 50, rate: 3.70, label: '0–50 units' },
      { upTo: 150, rate: 5.40, label: '51–150 units' },
      { upTo: 300, rate: 6.20, label: '151–300 units' },
      { upTo: Infinity, rate: 7.20, label: '301+ units' },
    ],
  },
  'Bihar': {
    name: 'Bihar (SBPDCL/NBPDCL)',
    slabs: [
      { upTo: 50, rate: 3.95, label: '0–50 units' },
      { upTo: 100, rate: 5.30, label: '51–100 units' },
      { upTo: 200, rate: 5.80, label: '101–200 units' },
      { upTo: 300, rate: 6.50, label: '201–300 units' },
      { upTo: Infinity, rate: 7.50, label: '301+ units' },
    ],
  },
  'Odisha': {
    name: 'Odisha (TPCODL/TPSODL)',
    slabs: [
      { upTo: 50, rate: 3.00, label: '0–50 units' },
      { upTo: 200, rate: 4.80, label: '51–200 units' },
      { upTo: 400, rate: 5.80, label: '201–400 units' },
      { upTo: Infinity, rate: 6.20, label: '401+ units' },
    ],
  },
  'Haryana': {
    name: 'Haryana (UHBVN/DHBVN)',
    slabs: [
      { upTo: 50, rate: 2.00, label: '0–50 units' },
      { upTo: 100, rate: 3.80, label: '51–100 units' },
      { upTo: 300, rate: 5.65, label: '101–300 units' },
      { upTo: 500, rate: 6.80, label: '301–500 units' },
      { upTo: Infinity, rate: 7.10, label: '501+ units' },
    ],
  },
  'Jharkhand': {
    name: 'Jharkhand (JBVNL)',
    slabs: [
      { upTo: 100, rate: 3.20, label: '0–100 units' },
      { upTo: 200, rate: 4.50, label: '101–200 units' },
      { upTo: 300, rate: 5.80, label: '201–300 units' },
      { upTo: Infinity, rate: 6.90, label: '301+ units' },
    ],
  },
  'Assam': {
    name: 'Assam (APDCL)',
    slabs: [
      { upTo: 30, rate: 2.75, label: '0–30 units' },
      { upTo: 120, rate: 4.35, label: '31–120 units' },
      { upTo: 240, rate: 5.60, label: '121–240 units' },
      { upTo: Infinity, rate: 6.85, label: '241+ units' },
    ],
  },
  'Chhattisgarh': {
    name: 'Chhattisgarh (CSPDCL)',
    slabs: [
      { upTo: 40, rate: 2.35, label: '0–40 units' },
      { upTo: 100, rate: 3.50, label: '41–100 units' },
      { upTo: 200, rate: 4.55, label: '101–200 units' },
      { upTo: Infinity, rate: 5.65, label: '201+ units' },
    ],
  },
  'Goa': {
    name: 'Goa (Electricity Dept)',
    slabs: [
      { upTo: 100, rate: 1.50, label: '0–100 units' },
      { upTo: 200, rate: 2.25, label: '101–200 units' },
      { upTo: 300, rate: 3.00, label: '201–300 units' },
      { upTo: 400, rate: 3.90, label: '301–400 units' },
      { upTo: Infinity, rate: 4.50, label: '401+ units' },
    ],
  },
  'Uttarakhand': {
    name: 'Uttarakhand (UPCL)',
    slabs: [
      { upTo: 100, rate: 3.20, label: '0–100 units' },
      { upTo: 200, rate: 3.85, label: '101–200 units' },
      { upTo: 400, rate: 5.00, label: '201–400 units' },
      { upTo: Infinity, rate: 5.75, label: '401+ units' },
    ],
  },
  'Himachal Pradesh': {
    name: 'Himachal Pradesh (HPSEB)',
    slabs: [
      { upTo: 60, rate: 2.00, label: '0–60 units' },
      { upTo: 125, rate: 3.35, label: '61–125 units' },
      { upTo: 300, rate: 4.05, label: '126–300 units' },
      { upTo: Infinity, rate: 4.65, label: '301+ units' },
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

  const pricing = STATE_PRICING[stateName];
  if (!pricing) {
    // Fallback: use Andhra Pradesh if state not found
    return calculateSlabBill(units, 'Andhra Pradesh');
  }

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

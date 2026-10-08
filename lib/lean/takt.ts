export interface Station {
  name: string;
  cycleTime: number; // seconds
}

export interface StationAnalysis extends Station {
  utilization: number; // cycleTime / taktTime
  overTakt: boolean;
}

export interface LineAnalysis {
  totalCycleTime: number;
  minOperators: number;
  bottleneck: Station | null;
  stations: StationAnalysis[];
}

export function calcTaktTime(availableTime: number, demand: number): number {
  if (availableTime <= 0) throw new RangeError("availableTime must be > 0");
  if (demand <= 0) throw new RangeError("demand must be > 0");
  return availableTime / demand;
}

export function analyzeLine(taktTime: number, stations: Station[]): LineAnalysis {
  if (taktTime <= 0) throw new RangeError("taktTime must be > 0");

  const totalCycleTime = stations.reduce((sum, s) => sum + s.cycleTime, 0);
  // toFixed guards against floating point noise like 2.0000000001
  const minOperators = Math.ceil(+(totalCycleTime / taktTime).toFixed(6));

  const analyzed = stations.map((s) => ({
    ...s,
    utilization: s.cycleTime / taktTime,
    overTakt: s.cycleTime > taktTime,
  }));

  const bottleneck = stations.length
    ? stations.reduce((max, s) => (s.cycleTime > max.cycleTime ? s : max))
    : null;

  return { totalCycleTime, minOperators, bottleneck, stations: analyzed };
}

export function availableSeconds(
  shiftHours: number,
  breakMinutes: number,
  shifts: number,
): number {
  return (shiftHours * 60 - breakMinutes) * 60 * shifts;
}
export interface OeeInput {
  plannedTime: number; // minutes
  breakdownTime: number; // minutes
  setupTime: number; // minutes
  idealCycleTime: number; // seconds per unit
  totalCount: number;
  goodCount: number;
}

export interface OeeResult {
  runTime: number; // minutes
  availability: number; // 0..1
  performance: number; // 0..1 (can exceed 1 if the inputs are inconsistent)
  quality: number; // 0..1
  oee: number; // 0..1
  fullyProductiveTime: number; // minutes
  losses: {
    breakdowns: number; // minutes
    setup: number;
    speed: number; // reduced speed + small stops
    defects: number; // time spent making rejects
  };
  warnings: string[];
}

export function calcOee(input: OeeInput): OeeResult {
  const { plannedTime, breakdownTime, setupTime, idealCycleTime, totalCount, goodCount } = input;

  if (plannedTime <= 0) throw new RangeError("Planned time must be greater than 0");
  if (idealCycleTime <= 0) throw new RangeError("Ideal cycle time must be greater than 0");
  if (breakdownTime < 0 || setupTime < 0 || totalCount < 0 || goodCount < 0)
    throw new RangeError("Values can't be negative");
  if (goodCount > totalCount) throw new RangeError("Good count can't exceed total count");

  const runTime = plannedTime - breakdownTime - setupTime;
  if (runTime < 0) throw new RangeError("Downtime can't exceed planned time");

  const idealTime = (idealCycleTime * totalCount) / 60; // minutes
  const fullyProductiveTime = (idealCycleTime * goodCount) / 60;

  const availability = runTime / plannedTime;
  const performance = runTime > 0 ? idealTime / runTime : 0;
  const quality = totalCount > 0 ? goodCount / totalCount : 0;

  const warnings: string[] = [];
  if (performance > 1)
    warnings.push("Performance is above 100%. Check the ideal cycle time or the counts.");

  return {
    runTime,
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
    fullyProductiveTime,
    losses: {
      breakdowns: breakdownTime,
      setup: setupTime,
      speed: runTime - idealTime,
      defects: idealTime - fullyProductiveTime,
    },
    warnings,
  };
}
export const MAX_SCORE = 4;

export type Rating = "Excellent" | "Good" | "Needs improvement" | "Poor";

export interface FiveSQuestion {
  id: string;
  text: string;
}

export interface FiveSPillar {
  id: string;
  name: string;
  japanese: string;
  tip: string;
  questions: FiveSQuestion[];
}

export const PILLARS: FiveSPillar[] = [
  {
    id: "sort",
    name: "Sort",
    japanese: "Seiri",
    tip: "Run a red-tag event: tag everything you're unsure about and remove what isn't used after a set time.",
    questions: [
      { id: "sort-1", text: "Only items needed for the current work are in the area" },
      { id: "sort-2", text: "Unneeded items are tagged and removed (red-tag process)" },
      { id: "sort-3", text: "No broken, obsolete or excess tools, materials or paperwork" },
    ],
  },
  {
    id: "set-in-order",
    name: "Set in order",
    japanese: "Seiton",
    tip: "Give every item a labeled home (shadow boards, floor markings) and keep the most-used items closest.",
    questions: [
      { id: "set-in-order-1", text: "Every item has a defined, labeled place" },
      { id: "set-in-order-2", text: "Frequently used items are within easy reach" },
      { id: "set-in-order-3", text: "Floors, aisles and storage areas are clearly marked" },
    ],
  },
  {
    id: "shine",
    name: "Shine",
    japanese: "Seiso",
    tip: "Treat cleaning as inspection: use it to find leaks and wear, then remove the sources of dirt.",
    questions: [
      { id: "shine-1", text: "Floors, machines and workstations are clean" },
      { id: "shine-2", text: "Cleaning tools and supplies are available and in good condition" },
      { id: "shine-3", text: "Sources of dirt, leaks and spills are identified and addressed" },
    ],
  },
  {
    id: "standardize",
    name: "Standardize",
    japanese: "Seiketsu",
    tip: "Turn the first three S into visual standards, then assign owners and a schedule.",
    questions: [
      { id: "standardize-1", text: "Visual standards (labels, color codes, photos) show the expected state" },
      { id: "standardize-2", text: "Cleaning and organizing responsibilities are assigned" },
      { id: "standardize-3", text: "The first three S are checked on a regular schedule" },
    ],
  },
  {
    id: "sustain",
    name: "Sustain",
    japanese: "Shitsuke",
    tip: "Make audits routine, post the results where the team sees them, and track fixes to closure.",
    questions: [
      { id: "sustain-1", text: "Team members follow the standards without being reminded" },
      { id: "sustain-2", text: "Audits happen regularly and the results are visible" },
      { id: "sustain-3", text: "Problems found in audits are fixed and tracked" },
    ],
  },
];

export type AuditAnswers = Record<string, number | null | undefined>;

export interface PillarScore {
  id: string;
  name: string;
  answered: number;
  total: number;
  percent: number | null; // 0..1, null when nothing is answered yet
}

export interface AuditResult {
  pillars: PillarScore[];
  answered: number;
  total: number;
  percent: number | null;
  rating: Rating | null;
  weakest: PillarScore | null;
  complete: boolean;
}

/** Common rule of thumb; adjust the bands to your company's grading. */
export function ratingFor(percent: number): Rating {
  const p = percent + 1e-9; // guards against floating point noise at the boundaries
  if (p >= 0.9) return "Excellent";
  if (p >= 0.75) return "Good";
  if (p >= 0.5) return "Needs improvement";
  return "Poor";
}

export function scoreAudit(answers: AuditAnswers, pillars: FiveSPillar[] = PILLARS): AuditResult {
  let totalPoints = 0;
  let totalAnswered = 0;
  let totalQuestions = 0;

  const scored: PillarScore[] = pillars.map((pillar) => {
    let points = 0;
    let answered = 0;

    for (const q of pillar.questions) {
      const value = answers[q.id];
      if (value === null || value === undefined) continue; // unanswered: excluded
      if (!Number.isInteger(value) || value < 0 || value > MAX_SCORE) {
        throw new RangeError(`Score must be a whole number from 0 to ${MAX_SCORE}`);
      }
      points += value;
      answered += 1;
    }

    totalPoints += points;
    totalAnswered += answered;
    totalQuestions += pillar.questions.length;

    return {
      id: pillar.id,
      name: pillar.name,
      answered,
      total: pillar.questions.length,
      percent: answered > 0 ? points / (answered * MAX_SCORE) : null,
    };
  });

  const withScores = scored.filter(
    (p): p is PillarScore & { percent: number } => p.percent !== null,
  );
  const weakest = withScores.reduce<(PillarScore & { percent: number }) | null>(
    (min, p) => (min === null || p.percent < min.percent ? p : min),
    null,
  );

  const percent = totalAnswered > 0 ? totalPoints / (totalAnswered * MAX_SCORE) : null;

  return {
    pillars: scored,
    answered: totalAnswered,
    total: totalQuestions,
    percent,
    rating: percent === null ? null : ratingFor(percent),
    weakest,
    complete: totalAnswered === totalQuestions,
  };
}
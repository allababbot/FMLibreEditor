// The current ability that a player's attributes, feet and positions fit: what FM's own editors call the recommended
// current ability. The game keeps its ability apart from his attributes and, as time goes by, moves the attributes
// towards it: raise them and leave the ability where it was, and the game takes them back down.
//
// The game's sum is not read from the game. Its form and its numbers were worked out from the game's own players by
// `tools/ability/fit.mjs`, which writes `abilityModel.ts` (see tools/ability/README.md). For each position he plays
// rated 12 or more, his attributes are summed with the weights of the role the position is played as (a left back and
// a right back are both full backs), his weaker foot counted like an attribute; a position rated below 17 asks for a
// little less. The position that asks the most sets the ability, and each other position rated 15 or more adds to it.
//
// No imports but the numbers, so that the tool runs this very code in Node.

import { ABILITY_MODEL } from "./abilityModel.ts";

/** The role each position is played as, by the key of the position's rating ("gk", "dl", ...). The sweeper is none. */
export const POSITION_ROLES: Readonly<Record<string, string>> = {
  gk: "gk",
  dl: "fb",
  dc: "dc",
  dr: "fb",
  wbl: "wb",
  wbr: "wb",
  dm: "dm",
  ml: "wm",
  mc: "mc",
  mr: "wm",
  aml: "w",
  amc: "amc",
  amr: "w",
  st: "st",
};

/** The key of the weaker foot among the weights: the lower of `left_foot` and `right_foot`. */
export const WEAK_FOOT = "weak_foot";

/** The numbers of the sum (see `abilityModel.ts`). */
export interface AbilityModel {
  /** The game and the players they were worked out from, and how close they came there. */
  readonly source: string;
  /**
   * For each role: what its sum starts from, and what each point of an attribute adds, on the scale the game shows
   * (1–20, the stored value divided by five). An attribute the role does not count is not there.
   */
  readonly sums: Readonly<Record<string, { readonly base: number; readonly weights: Readonly<Record<string, number>> }>>;
  /** For a position rated 0–20 (the index), the share of its sum it asks for; 0 for one that does not count. */
  readonly fade: readonly number[];
  /** The least rating at which another position adds to the ability. */
  readonly extraFrom: number;
  /** What the other positions rated `extraFrom` or more add, by how many there are; the last for that many or more. */
  readonly extra: readonly number[];
}

/** The weights of the model the app ships. */
export const MODEL: AbilityModel = ABILITY_MODEL;

/** The attributes the sum reads, as stored, the two feet included (for the weaker one). */
export function abilityAttributes(model: AbilityModel = MODEL): string[] {
  const keys = new Set<string>(["left_foot", "right_foot"]);
  for (const { weights } of Object.values(model.sums)) {
    for (const key of Object.keys(weights)) {
      if (key !== WEAK_FOOT) {
        keys.add(key);
      }
    }
  }
  return [...keys];
}

/** The sum of a role for `attributes` (stored, 0–100): unfaded, so the ability one natural position asks for. */
export function roleSum(role: string, attributes: Readonly<Record<string, number>>, model: AbilityModel = MODEL): number {
  const sum = model.sums[role];
  if (sum === undefined) {
    return 0;
  }
  let total = sum.base;
  for (const [key, weight] of Object.entries(sum.weights)) {
    const stored =
      key === WEAK_FOOT ? Math.min(attributes.left_foot ?? 0, attributes.right_foot ?? 0) : (attributes[key] ?? 0);
    total += weight * (stored / 5);
  }
  return total;
}

/**
 * The current ability that `attributes` (as stored, 0–100, by key: "finishing", "left_foot"...) and `positions` (the
 * ratings 1–20 by key: "gk", "dl"...) fit, not rounded and not kept within 1–200; null when no position counts.
 */
export function abilityFit(
  attributes: Readonly<Record<string, number>>,
  positions: Readonly<Record<string, number>>,
  model: AbilityModel = MODEL,
): number | null {
  const sums = new Map<string, number>();
  let most = -Infinity;
  let top: string | null = null;
  for (const [key, role] of Object.entries(POSITION_ROLES)) {
    const share = model.fade[Math.round(positions[key] ?? 0)] ?? 0;
    if (share <= 0) {
      continue;
    }
    let sum = sums.get(role);
    if (sum === undefined) {
      sum = roleSum(role, attributes, model);
      sums.set(role, sum);
    }
    if (sum * share > most) {
      most = sum * share;
      top = key;
    }
  }
  if (top === null) {
    return null;
  }
  const others = Object.keys(POSITION_ROLES).filter(
    (key) => key !== top && Math.round(positions[key] ?? 0) >= model.extraFrom,
  ).length;
  return most + model.extra[Math.min(others, model.extra.length - 1)];
}

/**
 * How far from the fit a player's ability may be and still be taken as the game's own: about one player in 150 of the
 * game's is further (see tools/ability/README.md). Further than that, his ability or his attributes were mostly set
 * by hand, and the fit itself is what suits him.
 */
export const OWN_DISTANCE = 6;

/** The ability the game holds for a player, the most it holds, and the least. */
export const ABILITY_RANGE = { min: 1, max: 200 } as const;

/** A player as the sum reads him: attributes as stored (0–100) and position ratings (1–20). */
export interface AbilityParts {
  attributes: Readonly<Record<string, number>>;
  positions: Readonly<Record<string, number>>;
}

/** What `suggestAbility` finds. */
export interface AbilitySuggestion {
  /** The ability to suggest: whole, within 1–200. */
  suggested: number;
  /** The same before it is kept within 1–200: above 200, the attributes are worth more than the game holds. */
  fitted: number;
}

/**
 * The current ability that suits a player whose attributes, feet and positions are now `after`, when the game held
 * `ability` for `before`; null when no position of his counts. The game's ability is seldom exactly the fit: it is
 * moved by what the change is worth, so a player nothing was changed on is suggested the ability he has. An ability
 * further from the fit than `OWN_DISTANCE` was not the game's own, and the fit itself is suggested.
 */
export function suggestAbility(
  ability: number,
  before: AbilityParts,
  after: AbilityParts,
  model: AbilityModel = MODEL,
): AbilitySuggestion | null {
  const was = abilityFit(before.attributes, before.positions, model);
  const now = abilityFit(after.attributes, after.positions, model);
  if (was === null || now === null) {
    return null;
  }
  const own = ability - was;
  const fitted = Math.abs(own) <= OWN_DISTANCE ? now + own : now;
  const suggested = Math.min(ABILITY_RANGE.max, Math.max(ABILITY_RANGE.min, Math.round(fitted)));
  return { suggested, fitted };
}

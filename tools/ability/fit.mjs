// Works out the sum behind the recommended current ability (app/src/abilityFit.ts) from the game's own players, and
// writes its numbers to app/src/abilityModel.ts. See README.md beside this file.
//
//   node tools/ability/fit.mjs players.json            fit, and say how close it comes on players it was not fitted on
//   node tools/ability/fit.mjs players.json --write    the same, then write app/src/abilityModel.ts
//   node tools/ability/fit.mjs players.json --check    only say how close the model the app has comes on this save
//
// players.json is an export of every player with the attributes as stored:
//   fmlibre-probe players --limit 1 --export players.json --stored

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { abilityFit, OWN_DISTANCE, POSITION_ROLES, WEAK_FOOT } from "../../app/src/abilityFit.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const MODEL_FILE = path.join(here, "..", "..", "app", "src", "abilityModel.ts");

/** The goalkeeping attributes of a profile: only a goalkeeper's sum counts them. */
const GOALKEEPING = new Set([
  "aerial_reach", "command_of_area", "communication", "eccentricity", "handling", "kicking", "one_on_ones", "punching",
  "reflexes", "rushing_out", "throwing",
]);
/**
 * The hidden attributes of a profile, which no sum counts: each comes out at nothing for every role, but for
 * versatility where it stands in for the positions a versatile player has.
 */
const HIDDEN = new Set(["consistency", "dirtiness", "important_matches", "injury_proneness", "versatility"]);
/** A position rated lower than this did not change what the game's players have: it does not count. */
const LEAST_RATING = 12;
/** From this rating on, another position adds to the ability. */
const EXTRA_FROM = 15;
/** A weight smaller than this, after the first rounds, is taken for none: the role does not count the attribute. */
const LEAST_WEIGHT = 0.1;
/** Players fitted on: those of this ability or more (below it, attributes at their lowest no longer follow it)... */
const LEAST_ABILITY = 30;
/** ...and, after the first round, within this distance of the fit (the others were edited, or are on the move). */
const FIT_DISTANCE = 8;
const ROUNDS = 6;

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error("usage: node tools/ability/fit.mjs players.json [--write | --check]");
  process.exit(2);
}
const exported = JSON.parse(fs.readFileSync(file, "utf8"));
if (exported.attributeScale !== "0-100") {
  console.error(`${file} has the attributes as shown (${exported.attributeScale}): export them with --stored.`);
  process.exit(2);
}

/** A player as the fit reads him. */
const players = exported.players
  .filter((p) => p.currentAbility > 0 && p.attributes && p.positionRatings)
  .map((p) => ({
    uid: p.uid,
    ability: p.currentAbility,
    attributes: p.attributes,
    positions: Object.fromEntries(Object.entries(p.positionRatings).map(([key, rating]) => [key.toLowerCase(), rating])),
  }));
console.log(`${exported.game}, ${exported.gameDate}: ${players.length} players`);

/** How close `predict` comes to the game's abilities of `list`. */
function accuracy(list, predict) {
  const errors = list.map((p) => predict(p) - p.ability).filter((e) => Number.isFinite(e));
  const within = (d) => (100 * errors.filter((e) => Math.abs(e) <= d).length) / errors.length;
  return {
    count: errors.length,
    rms: Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length),
    within: Object.fromEntries([1, 2, 4, 6, 8].map((d) => [d, within(d)])),
    beyondOwn: 100 - within(OWN_DISTANCE),
  };
}
const describe = ({ count, rms, within }) =>
  `${count} players: RMS ${rms.toFixed(2)}; within 1 ${within[1].toFixed(1)}%, 2 ${within[2].toFixed(1)}%, ` +
  `4 ${within[4].toFixed(1)}%, 6 ${within[6].toFixed(1)}%, 8 ${within[8].toFixed(1)}%`;

if (flags.includes("--check")) {
  const { MODEL } = await import("../../app/src/abilityFit.ts");
  console.log(`the app's model (${MODEL.source}):`);
  console.log(`  every player:           ${describe(accuracy(players, (p) => abilityFit(p.attributes, p.positions)))}`);
  const able = players.filter((p) => p.ability >= LEAST_ABILITY);
  console.log(`  ability ${LEAST_ABILITY} or more:     ${describe(accuracy(able, (p) => abilityFit(p.attributes, p.positions)))}`);
  process.exit(0);
}

// ---- The fit ----

const ROLES = [...new Set(Object.values(POSITION_ROLES))];
const ATTRIBUTES = Object.keys(players[0].attributes).filter((key) => key !== "left_foot" && key !== "right_foot");
const FEATURES = [...ATTRIBUTES, WEAK_FOOT];
const POSITIONS = Object.keys(POSITION_ROLES);

/** A player's attributes on the scale the game shows, as one row: the constant first, the weaker foot last. */
function features(p) {
  const a = p.attributes;
  return Float64Array.from([
    1,
    ...ATTRIBUTES.map((key) => (a[key] ?? 0) / 5),
    Math.min(a.left_foot ?? 0, a.right_foot ?? 0) / 5,
  ]);
}

/** Least squares with a touch of ridge, by Gaussian elimination: `columns` says which features take part. */
function solve(rows, targets, columns) {
  const m = columns.length;
  const A = Array.from({ length: m }, () => new Float64Array(m));
  const b = new Float64Array(m);
  for (let n = 0; n < rows.length; n++) {
    const x = rows[n];
    for (let i = 0; i < m; i++) {
      const xi = x[columns[i]];
      if (xi === 0) continue;
      b[i] += xi * targets[n];
      for (let j = 0; j < m; j++) A[i][j] += xi * x[columns[j]];
    }
  }
  for (let i = 1; i < m; i++) A[i][i] += 1e-4 * rows.length;
  for (let c = 0; c < m; c++) {
    let pivot = c;
    for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[pivot][c])) pivot = r;
    [A[c], A[pivot]] = [A[pivot], A[c]];
    [b[c], b[pivot]] = [b[pivot], b[c]];
    for (let r = c + 1; r < m; r++) {
      const f = A[r][c] / A[c][c];
      if (f === 0) continue;
      for (let k = c; k < m; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const solved = new Float64Array(m);
  for (let r = m - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < m; k++) s -= A[r][k] * solved[k];
    solved[r] = s / A[r][r];
  }
  const weights = new Float64Array(FEATURES.length + 1);
  columns.forEach((column, i) => (weights[column] = solved[i]));
  return weights;
}

/**
 * Fits the model on `list`: role weights first from the specialists (one role at 20, no other role above 14), then
 * a few rounds of fitting each role on the players whose ability it sets, the shares of lower ratings and the extra
 * for other positions in between.
 */
function fit(list) {
  const rows = list.map((p, index) => ({
    index,
    p,
    x: features(p),
    positions: POSITIONS.map((key) => [Math.round(p.positions[key] ?? 0), ROLES.indexOf(POSITION_ROLES[key])]),
  }));
  const allColumns = FEATURES.map((_, i) => i + 1).filter((c) => !HIDDEN.has(FEATURES[c - 1]));
  // Every role counts the constant; only a goalkeeper counts the goalkeeping attributes.
  let columns = ROLES.map((role) => [0, ...allColumns.filter((c) => role === "gk" || !GOALKEEPING.has(FEATURES[c - 1]))]);
  const fade = Array(21).fill(0);
  for (let r = LEAST_RATING; r <= 20; r++) fade[r] = r >= 17 ? 1 : 1 - (17 - r) * 0.02;
  let extra = [0];

  let weights = ROLES.map((role, ri) => {
    const specialists = rows.filter(({ positions }) => {
      const natural = new Set(positions.filter(([r]) => r === 20).map(([, role]) => role));
      return natural.size === 1 && natural.has(ri) && !positions.some(([r, role]) => role !== ri && r > 14);
    });
    return solve(specialists.map((row) => row.x), specialists.map((row) => row.p.ability), columns[ri]);
  });

  const dot = (x, w) => {
    let s = 0;
    for (let i = 0; i < x.length; i++) s += x[i] * w[i];
    return s;
  };
  // What the model makes of a row, given each role's sum.
  const evaluate = (row, sums) => {
    let most = -Infinity;
    let at = -1;
    row.positions.forEach(([r, role], i) => {
      if (fade[r] > 0 && sums[role] * fade[r] > most) {
        most = sums[role] * fade[r];
        at = i;
      }
    });
    const others = row.positions.filter(([r], i) => i !== at && r >= EXTRA_FROM).length;
    return { value: most + extra[Math.min(others, extra.length - 1)], most, at, others };
  };

  let fitted = rows.filter((row) => row.p.ability >= LEAST_ABILITY);
  for (let round = 1; round <= ROUNDS; round++) {
    let sums = rows.map((row) => weights.map((w) => dot(row.x, w)));
    // Each role on the players whose ability it sets, as they would be at 20 and with no other position.
    const groups = ROLES.map(() => ({ xs: [], ys: [] }));
    for (const row of fitted) {
      const { at, others } = evaluate(row, sums[row.index]);
      if (at < 0) continue;
      const [r, role] = row.positions[at];
      groups[role].xs.push(row.x);
      groups[role].ys.push((row.p.ability - extra[Math.min(others, extra.length - 1)]) / fade[r]);
    }
    weights = groups.map((group, ri) => {
      if (group.xs.length <= 100) {
        return weights[ri];
      }
      let solved = solve(group.xs, group.ys, columns[ri]);
      // From the second round on, a role counts only the attributes it is seen to weigh: the smallest weight is let
      // go until every one left is worth LEAST_WEIGHT.
      while (round >= 2) {
        const small = columns[ri].filter((c) => c !== 0 && Math.abs(solved[c]) < LEAST_WEIGHT);
        if (small.length === 0) break;
        const least = small.reduce((a, b) => (Math.abs(solved[a]) <= Math.abs(solved[b]) ? a : b));
        columns[ri] = columns[ri].filter((c) => c !== least);
        solved = solve(group.xs, group.ys, columns[ri]);
      }
      return solved;
    });
    sums = rows.map((row) => weights.map((w) => dot(row.x, w)));

    // The extra by how many other positions are rated EXTRA_FROM or more: what the highest sum leaves, on average,
    // never less than for fewer positions; a count too rare to tell takes the one before.
    const left = new Map();
    for (const row of fitted) {
      const { most, others } = evaluate(row, sums[row.index]);
      const list = left.get(others) ?? left.set(others, []).get(others);
      list.push(row.p.ability - most);
    }
    const mean = (list) => list.reduce((s, v) => s + v, 0) / list.length;
    const none = mean(left.get(0) ?? [0]);
    extra = [0];
    for (let n = 1; (left.get(n)?.length ?? 0) >= 50; n++) {
      extra.push(Math.max(extra[n - 1], mean(left.get(n)) - none));
    }

    // The share of its sum a position rated LEAST_RATING-19 asks for, one rating at a time.
    for (let r = 19; r >= LEAST_RATING; r--) {
      const touched = fitted.filter((row) => row.positions.some(([rating]) => rating === r));
      let best = fade[r];
      let bestError = Infinity;
      for (let share = 0.8; share <= 1.00001; share += 0.002) {
        fade[r] = share;
        let error = 0;
        for (const row of touched) error += (evaluate(row, sums[row.index]).value - row.p.ability) ** 2;
        if (error < bestError) {
          bestError = error;
          best = share;
        }
      }
      fade[r] = Math.min(1, best);
    }
    // Leave out the players the model does not explain: edited by hand, or with an ability the game is still moving.
    fitted = rows.filter(
      (row) =>
        row.p.ability >= LEAST_ABILITY &&
        Math.abs(evaluate(row, sums[row.index]).value - row.p.ability) <= FIT_DISTANCE,
    );
  }
  return toModel(weights, fade, extra);
}

/** The model as `abilityFit` reads it, rounded as it is written. */
function toModel(weights, fade, extra, source = "") {
  const round = (value, places) => Number(value.toFixed(places));
  const sums = Object.fromEntries(
    ROLES.map((role, ri) => [
      role,
      {
        base: round(weights[ri][0], 2),
        weights: Object.fromEntries(
          FEATURES.map((key, i) => [key, round(weights[ri][i + 1], 3)]).filter(([, weight]) => weight !== 0),
        ),
      },
    ]),
  );
  return {
    source,
    sums,
    fade: fade.map((share) => round(share, 3)),
    extraFrom: EXTRA_FROM,
    extra: extra.map((value) => round(value, 2)),
  };
}

// Fitted on half the players and checked on the other half, then fitted on all of them for the app.
const half = players.filter((p) => p.uid % 2 === 0);
const rest = players.filter((p) => p.uid % 2 === 1);
const trial = fit(half);
const held = accuracy(rest, (p) => abilityFit(p.attributes, p.positions, trial));
const heldAble = accuracy(rest.filter((p) => p.ability >= LEAST_ABILITY), (p) =>
  abilityFit(p.attributes, p.positions, trial),
);
console.log(`fitted on ${half.length}, checked on the other ${rest.length}:`);
console.log(`  every player:           ${describe(held)}`);
console.log(`  ability ${LEAST_ABILITY} or more:     ${describe(heldAble)}`);
console.log(`  further than ${OWN_DISTANCE} (OWN_DISTANCE): ${held.beyondOwn.toFixed(2)}%`);

const model = fit(players);
const date = exported.gameDate ?? "an unknown day";
model.source =
  `${exported.game}, ${players.length} players on ${date}: on the half it was not fitted on, within 2 of the game's ` +
  `ability for ${held.within[2].toFixed(0)}% and within 4 for ${held.within[4].toFixed(0)}%`;
console.log(`\nfitted on all ${players.length}: ${describe(accuracy(players, (p) => abilityFit(p.attributes, p.positions, model)))}`);
console.log(`shares of ratings ${LEAST_RATING}-20: ${model.fade.slice(LEAST_RATING).join(" ")}`);
console.log(`extra for other positions rated ${EXTRA_FROM}+, by count: ${model.extra.join(" ")}`);
const free = FEATURES.filter((key) => ROLES.every((role) => model.sums[role].weights[key] === undefined));
console.log(`counted by no role: ${free.join(", ")}`);

if (flags.includes("--write")) {
  fs.writeFileSync(MODEL_FILE, modelSource(model));
  console.log(`\nwritten to ${path.relative(process.cwd(), MODEL_FILE)}`);
}

/** The text of abilityModel.ts for `model`. */
function modelSource(model) {
  const lines = [
    "// Written by tools/ability/fit.mjs (see tools/ability/README.md); run it again rather than editing these numbers.",
    "",
    'import type { AbilityModel } from "./abilityFit.ts";',
    "",
    "export const ABILITY_MODEL: AbilityModel = {",
    `  source: ${JSON.stringify(model.source)},`,
    "  sums: {",
  ];
  for (const [role, { base, weights }] of Object.entries(model.sums)) {
    lines.push(`    ${role}: {`, `      base: ${base},`, "      weights: {");
    for (const [key, weight] of Object.entries(weights)) lines.push(`        ${key}: ${weight},`);
    lines.push("      },", "    },");
  }
  lines.push(
    "  },",
    `  fade: [${model.fade.join(", ")}],`,
    `  extraFrom: ${model.extraFrom},`,
    `  extra: [${model.extra.join(", ")}],`,
    "};",
    "",
  );
  return lines.join("\n");
}

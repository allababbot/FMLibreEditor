import { abilityAttributes, ABILITY_RANGE, POSITION_ROLES, suggestAbility, type AbilityParts } from "./abilityFit";
import { profileText } from "./labels";
import { useEditSession, type EditSession } from "./useProfileEditing";

/** The attributes the sum reads. */
const ATTRIBUTES = abilityAttributes();

/** The attributes and position ratings of the player edited, as the game had them, and as Apply would leave them. */
function playerParts(session: EditSession): { before: AbilityParts; after: AbilityParts } | null {
  const before = { attributes: {} as Record<string, number>, positions: {} as Record<string, number> };
  const after = { attributes: {} as Record<string, number>, positions: {} as Record<string, number> };
  const read = (key: string, into: "attributes" | "positions", name: string): boolean => {
    const input = session.input(key);
    if (input === null) {
      return false;
    }
    before[into][name] = input.stored;
    // What cannot be written yet counts as it was.
    after[into][name] = input.next ?? input.stored;
    return true;
  };
  const complete =
    ATTRIBUTES.every((key) => read(`attribute.${key}`, "attributes", key)) &&
    Object.keys(POSITION_ROLES).every((key) => read(`position.${key}`, "positions", key));
  return complete ? { before, after } : null;
}

/**
 * Under the abilities while a player is edited: the current ability that his attributes, feet and positions fit as
 * they are typed, which FM's own editors call the recommended one, as a button that puts it in. The game moves his
 * attributes towards his current ability, so raised attributes stay only with an ability that fits them. Shown only
 * while it differs from what the input holds, so a player nothing was changed on has none. Beside it: that the
 * attributes are worth more than the most the game holds, and that the ability typed is above the potential.
 */
export function RecommendedAbility() {
  const session = useEditSession();
  if (session === null || session.entity !== "player") {
    return null;
  }
  const ability = session.input("current_ability");
  const parts = playerParts(session);
  if (ability === null || parts === null) {
    return null;
  }
  const fit = suggestAbility(ability.stored, parts.before, parts.after);
  const suggested = fit?.suggested ?? null;
  const fitted = fit === null ? null : Math.round(fit.fitted);
  const typed = Number(ability.text.trim());
  const potential = Number(session.input("potential_ability")?.text.trim());
  // A potential set as a range is stored as a negative number: there is no one value to be above.
  const above = Number.isInteger(typed) && potential > 0 && typed > potential;
  const over = fitted !== null && fitted > ABILITY_RANGE.max;
  if ((suggested === null || suggested === typed) && !over && !above) {
    return null;
  }
  return (
    <div className="ability-fit">
      {suggested !== null && suggested !== typed && (
        <button
          type="button"
          className="ability-fit-button"
          disabled={session.busy}
          data-tip={profileText.recommendedAbilityTip}
          onClick={() => session.type("current_ability", String(suggested))}
        >
          {profileText.recommendedAbility} <span className="ability-fit-figure">{suggested}</span>
        </button>
      )}
      {over && (
        <span className="ability-fit-note" role="status" data-tip={profileText.abilityOverMostTip(ABILITY_RANGE.max)}>
          {profileText.abilityOverMost(fitted)}
        </span>
      )}
      {above && (
        <span className="ability-fit-note" role="status">
          {profileText.abilityAbovePotential}
        </span>
      )}
    </div>
  );
}

// The recommended current ability while a player is edited (app/src/RecommendedAbility.tsx): raised attributes bring
// a button with an ability above his, a click puts it in the Current ability input and the button goes, and Discard
// throws it all away. Writes nothing.
import { SHOWN, VIS, sleep } from "../lib/app.mjs";
import { clubPlayers, topClubs } from "../lib/witness.mjs";

export const name = "ability";
export const writes = false;

/** Attributes every outfield role weighs: raised by three, they move the ability that fits up by several points. */
const RAISED = ["attribute.decisions", "attribute.acceleration", "attribute.agility"];

export async function run({ app, report }) {
  // A player of a well-known club with room to rise in those three, and his ability below the most.
  const [club] = await topClubs(app, 1);
  let witness = null;
  for (const player of await clubPlayers(app, club, 15)) {
    const values = await app.must("read_values", { entity: "player", uid: player.uid });
    if (RAISED.every((field) => values[field] <= 80) && values.current_ability <= 190) {
      witness = player;
      break;
    }
  }
  if (!witness) {
    report.skip("a recommended ability above his", `no player of ${club.name} has room to rise`);
    return;
  }
  report.note(`witness: ${witness.name} (${witness.uid}) of ${club.name}`);
  const logLength = async () => (await app.must("change_log")).length;
  const logBefore = await logLength();

  await app.openTab("Players");
  await app.setInput(`${VIS}(".search input")`, String(witness.uid));
  const rows = `[...document.querySelectorAll("table.grid tbody tr")].filter(${SHOWN})`;
  await app.waitFor(`${rows}.length === 1 && ${rows}[0].textContent.includes(${JSON.stringify(witness.name)})`, "his row");
  await app.click(`${rows}[0]`, "his row");
  const profile = `${VIS}(".profile:not(.popup)")`;
  await app.waitFor(`${profile} && ${profile}.getAttribute("aria-busy") === "false"`, "his profile", 30000);
  await app.click(`${profile}.querySelector("button.edit-toggle")`, "Edit");
  const input = (field) => `${profile}.querySelector('.edit-input[data-field="${field}"]')`;
  await app.waitFor(input("current_ability"), "the Current ability input");
  const button = `${profile}.querySelector(".ability-fit-button")`;
  const ability = Number(await app.js(`${input("current_ability")}.value`));
  if (await app.js(`!!${button}`)) {
    // His ability is further from his attributes than the game's own are: one set by hand.
    report.note(`a recommendation before anything was typed: ${await app.js(`${button}.textContent`)} (CA ${ability})`);
  }

  for (const field of RAISED) {
    const shown = Number(await app.js(`${input(field)}.value`));
    await app.setInput(input(field), shown + 3);
  }
  await app.waitFor(`${button}`, "the recommended ability");
  const offered = Number(await app.js(`${button}.querySelector(".ability-fit-figure").textContent`));
  report.check("raised attributes recommend a higher ability", offered > ability, `CA ${ability} → ${offered}`);
  await app.shot("ability-recommended");

  await app.click(button, "the recommended ability");
  await sleep(300);
  const typed = Number(await app.js(`${input("current_ability")}.value`));
  report.check("a click puts it in the Current ability input", typed === offered, `the input holds ${typed}`);
  report.check("and the button goes", !(await app.js(`!!${button}`)));

  await app.press("Escape");
  await sleep(300);
  await app.click(`${profile}.querySelector(".edit-footer button.danger")`, "Discard");
  await app.waitFor(`!${profile}.classList.contains("editing")`, "the edits to be thrown away", 5000);
  report.check("Discard writes nothing", (await logLength()) === logBefore);
}

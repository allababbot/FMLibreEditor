# Recommended current ability

A player's profile, while he is edited, shows the current ability (CA) his attributes, feet and positions fit, as
FM's own editors recommend one. The game moves a player's attributes towards his CA as the days go by: raise the
attributes and leave the CA where it was, and the game takes them back down. The app works the number out itself
(`app/src/abilityFit.ts`); nothing is read from or called in the game for it.

The sum behind it was worked out from the game's own players. `fit.mjs` does that again from an export of every
player, and writes the numbers the app uses to `app/src/abilityModel.ts`.

## How the game's players add up

What the fit found on FM27 (Game Pass 0.9.2562.0, 50,313 players, a career in its second season):

- Each position is played as a role, a left and a right position as the same one: goalkeeper, centre back, full
  back, wing back, defensive midfielder, centre midfielder, wide midfielder, winger, attacking midfielder, striker.
- For each role, the attributes on the 1–20 scale (the stored 0–100 divided by five) are summed with weights, from a
  base of about −115 to −120. The weaker foot counts like an attribute; the stronger one does not.
- A point higher up the scale counts for more: from 14 on, each point counts about 16% more than one below 12.
- Aggression, determination, flair, natural fitness, the hidden attributes and the goalkeeping tendencies
  (eccentricity, punching, rushing out) count for no role. The goalkeeping attributes count only for a goalkeeper.
- The ability is the largest of the sums of the positions he plays: in full for a position rated 18 or more, a little
  less down to 12 (88% at 12), not at all below 12.
- The other positions rated 15 or more (the other side's included) add a little on top once there are two of them:
  about 1 for two, 3 for three, 5 for four, 7 for five or more.

On the half of the players the numbers were not fitted on, the sum lands within 2 of the game's ability for 77% of
them and within 4 for 97% (from an ability of 30). A player whose ability is further from his sum than that was
mostly edited by hand, or is one whose ability the game is still moving his attributes towards.

The app suggests an ability from the change: what the game held, moved by what the edit is worth. A raise gets a
tenth of its worth on top, up to 2, and the result is rounded up (see below). A player nothing was changed on is then
suggested the ability he has. For a player whose ability is more than 6 away from his sum (about one in 150 of the
game's), the sum itself is suggested.

## What the game does with attributes worth more than the ability

Tried on the Game Pass save above, a month of play after the edit. Two centre backs of about the same ability got the
same three attributes three points higher (Decisions, Marking, Positioning):

- The one whose CA was left where it was lost about a point (six stored steps) on nearly every attribute that counts
  within the month, not only on the three raised: what he had been given was taken from all of them, and the CA
  stayed. The attributes that count for no role stayed as they were.
- The one given the CA a straight sum suggested (183) lost a stored step or two on most of them: the sum was a few
  points short. Points near the top of the scale are worth more than lower down, which is the curve above: with it
  the three raises are worth 17 to 19 points rather than 15 to 16.

A second month, both put back as they were and given the same raises with the CA the curved sum suggested, rounded
up (186 and 189): the second lost nothing (five attributes went a stored step up), the first lost exactly one stored
step on every attribute that counts. So the game takes whole steps, from every counted attribute at once, as soon as
they are worth even a little more than the ability, while an ability a little over theirs cost nothing seen. The
suggestion is therefore rounded up, and a raise gets a little to spare: with it, the first would have been given 188.

## Fitting it again

On a save that has been played a while (so that it holds the game's own players, not only the database's), with
FM27 running:

```powershell
cargo build --release -p fmlibre-probe
target\release\fmlibre-probe.exe players --limit 1 --export players.json --stored
node tools/ability/fit.mjs players.json            # fit, and say how close it comes
node tools/ability/fit.mjs players.json --write    # the same, then write app/src/abilityModel.ts
node tools/ability/fit.mjs players.json --check    # only check the numbers the app has against this save
```

`--stored` writes the attributes as the game stores them (0–100), which the fit needs: the steps between two shown
values count. Node.js 22.18 or later runs `fit.mjs` as it is: it reads the app's TypeScript (`abilityFit.ts`), so the
fit and the app add up the same way.

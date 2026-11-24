# FM27: the rules a competition's squads are registered under

Notes behind the probe's `rules`. Everything here was read on the Windows Game Pass build 0.9.2524.0, on a save of 19
October 2026, with the probe and a few scripts around it; the Süper Lig's limit on foreign players was then changed in
the running game and looked at on the game's own screens (see [What the game makes of a change](#what-the-game-makes-of-a-change)).
Nothing was read on Steam or on a Mac.

## In short

The rules are data, not code. The game reads each nation's rule files into records and keeps them with the nation;
from those it makes, whenever it loads a save, the lists it counts a squad against: one for this season and one for
the next. A rule is a kind (`all_foreign_players_in_squad`), which way it limits, and a value.

```text
db::NATION +0x108 ─> the container of its men's teams (db::NATIONAL_TEAM_CONTAINER)
    container +0x570   the record its rule files make together      ─┐ a save keeps these;
    container +0x588   the list of the records of the files themselves ─┘ the lists are made from them

sicomps::ACTUAL_COMP   a competition as it is played, found by its class
    +0x120 ─> its db::COMP (which points back from +0xB0)
    +0x38     its own rules, a record: `fxri` names one of its nation's sets of fixture rules
    +0x370 ─> its rule group
rule group +0x1E0 ─> its nation's rules as played ─ +0x60 ─> pointers to the sets of fixture rules
fixture rules +0x70 ─> this season's list of squad rules: pointers to rules of 0x20 bytes
              +0x68 ─> next season's fixture rules, with a list of their own
```

## Records

A record is a list `(begin, end, capacity)` of 16-byte entries: a `u32` key of four characters ('sqsr', the first
character in the highest byte), four spare bytes, and a pointer to a typed value. A typed value is 16 bytes too: a
pointer to an object that says what type it is, and 8 bytes of value. There is one such object per type, told apart
by its class:

| Class | The value |
| --- | --- |
| `sicore::RAW_TYPED_TRAITS<int>`, `<unsigned>`, `<bool>` | in the low bytes; the rest of the 8 keep what was there before |
| `sicore::RAW_TYPED_TRAITS<__int64>` | a competition as a pair of numbers, the UID in each half |
| `sicore::INTERNAL_OBJECT_TYPED_TRAITS<sicore::RECORD>` | a pointer to another record's `(begin, end, capacity)` |
| `sicore::INTERNAL_OBJECT_TYPED_TRAITS<sicore::TYPED_LIST>` | a pointer to a list's `(begin, end, capacity)` of pointers to typed values |
| `sicore::STRING_TYPED_TRAITS` | a pointer to an FM string |
| `sicore::NULL_TYPED_TRAITS` | nothing |

The rule files name their keys in words, and the game registers each word with its four characters in one long
function (`lea rdx, name; lea rcx, …; mov r8d, 'symb'; xor r9d, r9d; call`): 2,183 of them on this build. Those used
here:

| Key | Name | Key | Name |
| --- | --- | --- | --- |
| `fxrl` | fixture_rules | `fxri` | fixture_rules_index |
| `sqsr` | squad_selection_rules | `levl` | level |
| `type` | type | `valu` | value |
| `cmty` | compare_type | `info` | (a rule's conditions) |
| `styr` | start_year | `enyr` | end_year |
| `tfrd` | teams_from_division | `comp`, `DBID` | competition, its UID |
| `nati`, `Nnat` | nation, its UID | `updy` | season_update_day |
| `dyom`, `mont` | day_of_month, month | `trwi` | transfer_windows |

## A nation's rules

The container of a nation's men's teams (see the [national teams notes](fm27-national-teams.md)) holds them. At
`+0x570` is one record of all its rule files together, 35 keys for Türkiye: the files and their version, the nation,
the division levels with the competition of each, the teams it needs, its
competitions, its reserve leagues, and then the rules proper: `transfer_windows`, `transfer_rules`, `loan_rules`,
`work_permit_rules`, `contract_rules`, `fixture_rules`, `discipline_rules`, `season_update_day` (20 June),
`season_windows`, `start_date_rules`, `fixture_times` and helpers. Right after it, at `+0x588`, is a list of the
records of the files themselves, three for Türkiye: the structure (division levels, teams, competitions), the reserve
leagues, and the rules (27 keys, from `transfer_windows` on). So the rules are there twice.

The files do not all name their nation alike: `nati` is the UID as a number in Spain's (796), a record that holds it
under `Nnat` as a number in Türkiye's (799), and the same record with the UID as text in Brazil's ("1651"). The
container of a nation's women's teams has records of its own, at the same places, for the women's competitions.

`fixture_rules` is a list of sets, 10 for Türkiye: one for each division's league (the levels it is for in `hidl` and
`lwdl`), then the cups' and the youth competitions'. A set holds `squad_selection_rules`, a list of records:

| Key | What it holds |
| --- | --- |
| `type` | the kind of rule, a number (see [Kinds](#kinds-of-rule)) |
| `cmty` | which way it limits: -1 at most, 1 at least |
| `valu` | the value |
| `styr`, `enyr` | the years it is good for, either or both missing |
| `info` | a list of conditions, each a record whose `type` is a key: `1yol` (players of last season may be a year older), `Tk24` (players of Turkic nations who joined in 2023/24 count as domestic) |
| `tfrd` | in a cup's rules: the division whose teams the rule is for, a record holding its competition |

The Süper Lig's (set 0), as the files give them:

| Kind | Limit | Good for |
| --- | --- | --- |
| 21 `all_foreign_players_in_squad` | at most 14 | every season |
| 368 `foreign_over_24_players_in_squad` | at most 10 | 2026 and 2027, with `1yol` |
| 368 | at most 10 | from 2028 |
| 209 `under_23_national_players_in_squad` | at least 4 | from 2026, with `Tk24` |
| 87 `goalkeepers_in_squad` | at most 3 | every season |
| 230 `domestic_goalkeepers_in_squad` | at least 2 | every season |
| 9 `max_squad_size` | at most 28 | every season |

The 1. Lig allows 8 foreign players (9 in a match squad, 6 on the pitch), the 2. Lig none. The cup's set gives a
limit on the foreign players in a match squad for the teams of each division (14 for the Süper Lig's).

## The lists the game plays by

A competition as it is played is a `sicomps::ACTUAL_COMP`, 0x810 bytes. 987 of them were in memory; the probe takes
550 for played, those whose `db::COMP` points back at them (`+0xB0`) and whose record names a set of fixture rules
their nation has. Its own rules are a record at `+0x38` (the Süper
Lig's has 49 keys: its stages, its fixture dates with the transfer and registration windows among them, its
discipline, its money) and the same record again at `+0x80`. `fxri` in it names the nation's set of fixture rules it
is played under: 0 for the Süper Lig, 1 for the 1. Lig, 5 for the cup.

Its rule group (`+0x370`, 0x240 bytes, with the pointers to its competitions at `+0x00`) points at the nation's rules
as the game plays by them (`+0x1E0`, 0xB0 bytes), which hold the pointers to the sets of fixture rules at `+0x60`, in
the order of the files' `fixture_rules`. A set of fixture rules is 0x138 bytes:

| Offset | What it holds |
| --- | --- |
| `+0x68` | pointer to next season's fixture rules; every one of Türkiye's 10 has one |
| `+0x70` | pointer to its list of squad rules, `(begin, end, capacity, flags)` of pointers; null for a set with none |

A rule in the list is 0x20 bytes:

| Offset | Field |
| --- | --- |
| `+0x00` | `u32` key of its condition (`1yol`, `Tk24`, `tfrd`), 0 for none |
| `+0x04` | `u32` UID of the competition a `tfrd` condition names |
| `+0x18` | `i32` value |
| `+0x1C` | `u16` kind |
| `+0x1E` | `i8`: -1 at most, 1 at least |

A list holds the rules that are good in its season, in the files' order: the Süper Lig's has six, without the rule
from 2028. It can hold one more than the files' list gives: the 2. Lig's ends with a squad size of at most 25, which
its files give with the dates squad numbers are handed out by (`snms`), not as a rule.

The game also copies a list for the pages that show it: such copies were in memory with the values the list had when
the page was built.

## Kinds of rule

The game names 465 kinds, in a table of 16-byte entries in the plugin's read-only data (a pointer to the name, then
the number; at `game_plugin.dll+0x4C2D6C0` on this build): 451 different numbers. The probe finds the table by the
entry that points at `all_foreign_players_in_squad` and reads it both ways. Among them:

| Number | Name |
| --- | --- |
| 2, 4, 21 | `all_foreign_players_in_11`, `…_in_match_squad`, `…_in_squad` |
| 9, 165 | `max_squad_size`, `min_squad_size` |
| 87, 230 | `goalkeepers_in_squad`, `domestic_goalkeepers_in_squad` |
| 209, 502 | `under_23_national_players_in_squad`, `under_24_national_players_in_squad` |
| 368 | `foreign_over_24_players_in_squad` |

Most are counts of players. Some are money (`yearly_wage`, a salary cap), which the same lists hold as large values.
Who counts as foreign is not a rule but code (the binary names `is_foreign_for_squad_selection_rule`).

## What the game makes of a change

The Süper Lig's limit of 14 foreign players was given a different number in each place that holds it, in the running
game, and the game's screens were read afterwards:

- **Competition Stages, Next Season** showed the number written to next season's list, at once.
- **Competition Stages, Current Season** went on showing 14, from a page built before the change, and showed the
  number written to this season's list once a day had passed (Continue).
- **A club's Registration screen** (Beşiktaş, taken over by a second manager) showed "13/22 Max." with a tick for the
  22 then in this season's list; with 5 written there, "13/5" after a day. So the count is held against this season's
  list. The registration window was closed, so no squad was confirmed against a changed limit.
- **A save and a load.** The game was saved under another name with a different number in each place and loaded
  again. Both records came back as written; the lists did not: the game made them again, this season's from the
  record the files make together, next season's from the rule file's own record.

So a change lasts when it is written to the records, and takes effect in the running game when it is written to the
lists. For this season that is the list and the record together; for next season the other list and the rule file's
record.

Each Süper Lig club also holds a rule of its own for the limit, with the condition `dtcm`
(`include_player_domestic_to_competition_nation`): 18 structs, saved with the save. The Registration screen does not
count against them, and what they are for is not known; the editor leaves them alone.

Not known yet:
- what the game does at the turn of a season: whether next season's list becomes this season's, and which record the
  new lists are made from;
- whether the game lets a squad be confirmed against a changed limit while the window is open;
- whether an update of the game puts its own rules over a save's records;
- what the clubs' own structs are for;
- how any of this is laid out on Steam and on the Mac.

## The probe's `rules`

`fmlibre-probe rules` lists the competitions being played that have squad rules; with words of a name or a UID, the
rules of each season, numbered, with what the nation's records hold for each. `--current N VALUE` and `--next N VALUE`
change rule N of a season: in the list, and in the record that list is made from, so that the change is in the next
save. `--restore` puts the values back, after `--hold` seconds if given.

A rule is changed only where it is a count (0 to 255) and the record holds it for the season: the rule of the same
kind, limit and condition that is good in the season's year, looked for in the files' order. A season begins in the
year the nation's `season_update_day` last passed. Before writing, the list must still point at the rule and the rule
be of the kind it was.

```text
Trendyol Süper Lig (UID 130286) · Türkiye · level 0 · the nation's fixture rules 0
  This season (2026)
     1  at most    14  all_foreign_players_in_squad  · saved
     2  at most    10  foreign_over_24_players_in_squad  [1yol]  · saved, 2026 to 2027
     3  at least    4  under_23_national_players_in_squad  [Tk24]  · saved, from 2026
     4  at most     3  goalkeepers_in_squad  · saved
     5  at least    2  domestic_goalkeepers_in_squad  · saved
     6  at most    28  max_squad_size  · saved
```

The records are those of the nation the competition's `db::COMP` names: its men's container's, or its women's for a
competition those list (`cmps`) and the men's do not.

Checked on the save above: 550 competitions read in about five seconds, 426 with squad rules; the Süper Lig's
goalkeepers changed in both seasons and put back with `--restore`; its foreign players set in both seasons and read
back from the lists and from both records; and the refusals: a rule the list does not have, a value over 255, the
2. Lig's squad size (not in the records as a rule), and a name that many competitions match.

Of those 426, every rule has its rule in the records at 345, some at 45 and none at 36. Of the 36, 23 belong to no
nation (the continents' competitions, whose records were not looked for); the others are women's leagues (the
Women's Super League, the NWSL), Major League Soccer and a few cups; why theirs do not match was not looked into. Of
the 2,498 rules in the lists of both seasons, 2,070 have theirs in the records. A quarter of the 428 without are squad
sizes (105), which the files give with the squad numbers; the others are of many kinds.

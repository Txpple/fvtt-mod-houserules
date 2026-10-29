# Open Roll 5e: House Rules

One table's house rules as a Foundry module: small, always-on overrides that make Foundry behave
the way this table expects, so nobody digs through menus. Each rule is a setting only a GM sees or
changes, on by default, and every player's client applies it for itself the moment it loads. It is
written for one table and shared because it might suit yours; it is not in the Open Roll 5e
catalogue.

## The rules

- **Arrow keys move tokens.** Foundry 14 moves tokens on W A S D and pans the map on the arrow
  keys. Here the arrow keys move the selected token, W A S D does nothing, and the numpad
  (8 4 2 6) pans. Every client gets it at load, again when the GM flips the setting, and again if
  a player changes it in Configure Controls or presses Reset Defaults; nothing for a player to set.
  Off puts every client back to Foundry's defaults (a key a player bound to something else
  meanwhile is left alone).
- **Going down costs a level of Exhaustion.** Each time a creature's Hit Points go from above 0
  to 0 it gains one level of Exhaustion, at the drop (not when it is healed), the sixth being
  death under the 2024 rules. The rule reads the Hit Point write itself, so every way down counts
  the same: damage applied from a card, a drop save failed after a hold at 1, a hold declined, a
  GM's edit on the sheet. A creature held at 1 (Death Ward, Relentless Endurance, a save that
  wins) never reaches 0 and pays nothing. The level is written in the same update as the Hit
  Points, on the client making it, so with [By the Books](https://github.com/Txpple/fvtt-mod-bythebooks)
  the damage receipt shows "Exhaustion 0 → 1" and its Revert takes the level back with the Hit
  Points; without it there is no receipt and the GM edits the level by hand. A write that already
  sets Exhaustion (a Revert restoring a receipt's recorded state) is left alone, so no drop is
  charged twice. Off: nothing happens at 0.
- **Players see only the sidebar tabs they use.** A player's sidebar loses Placeables, Items,
  Rollable Tables, Cards and Macros; Chat, Combat, Actors, Journal, Playlists, Compendium Packs,
  Settings and any tab a module adds (Dice So Nice's d20) stay, in Foundry's order. A GM keeps
  every tab. The tabs are taken away before the sidebar is built, the way Foundry hides Scenes
  from players, so there is no way in: no button on the strip, open or collapsed, nothing to
  right-click to pop out, and a switch to one (`changeTab`, `ui.items.activate()`, a module's
  key) is refused; a hidden tab's popout opened from a macro closes as it opens. Turned on during
  play, a player on a hidden tab goes back to Chat and the buttons go at once; turned off,
  Foundry offers the GM a reload for everyone, which brings the tabs back. Open Server's jump
  from the Players list works as before.

## Installation

Paste the manifest URL into Foundry's _Install Module_ dialog:

```
https://github.com/Txpple/fvtt-mod-houserules/releases/latest/download/module.json
```

Each rule has its own switch, a world setting on by default (below), so a table takes the rules
it wants.

Requires Foundry VTT v13 or v14 and the dnd5e system 5.x or 6.x. No other dependencies.

## Settings

_Game Settings → Configure Settings → Open Roll 5e: House Rules._ World settings: a GM sees and
sets them, a player neither.

| Setting                                 | Default | What it does                                                                                                                                  |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow keys move tokens                  | on      | The arrows move the selected token, W A S D is unbound, the numpad pans. Off returns every client to Foundry's defaults.                      |
| Going down costs a level of Exhaustion  | on      | A creature whose Hit Points go from above 0 to 0 gains one level of Exhaustion in that same write, capped at 6. Off: nothing happens at 0.     |
| Players see only the sidebar tabs they use | on   | Players lose Placeables, Items, Rollable Tables, Cards and Macros; GMs keep every tab. Off brings them back on reload.                          |

## Repository layout

```
module.json                    the Foundry manifest
scripts/
  houserules.js                the entry point: each rule's setting, and the write on every client
  rules/arrow-keys.js          the arrow-keys rule, pure: what the keybindings should be
  rules/going-down.js          the going-down rule, pure: what a drop to 0 costs
  rules/sidebar-tabs.js        the sidebar-tabs rule, pure: which tabs a player loses
  kit/                         the Open Roll 5e kit (log.js and the rest), the same bytes in every
                               module that holds it (the suite keeps them)
lang/en.json                   every word a player reads
tests/                         the unit tests (Vitest); tests/kit/ is the kit's own
```

## Development

There is no build step: the module is plain ES modules loaded straight from `scripts/`. Run
`npm install` once; `npm run verify` is the gate: Biome and the unit tests. `scripts/kit/` and
`tests/kit/` are copies the suite's `tools/kit-sync.mjs` writes: change the kit there, never here.

Releases: bump `version` and the `download` URL in `module.json` together and commit, then push an
annotated tag on `main` whose subject is the release title and whose body is the notes
(`git tag -a vX.Y.Z`). The release workflow checks the tag, runs the gate, builds the zip and
publishes it with a bare `module.json`. Run the workflow by hand for a dry run.

<!-- openroll5e:family -->
<!-- /openroll5e:family -->

## License

MIT. See [LICENSE](LICENSE).

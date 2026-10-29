# fvtt-mod-houserules — working notes for sessions in this repo

**What this is.** Open Roll 5e: House Rules, a Foundry VTT module: one table's always-on overrides,
each a world setting only a GM sees or changes, on by default, applied on every client by the
client itself. Part of Open Roll 5e (the suite repo is `..`, its CLAUDE.md has the family's
conventions; the module is public but kept out of the catalogue, so `repos.json` gives it no
blurb). Plain ES modules, no build step, no patching, no libWrapper, MIT. Built from suite issue #9.

**State (2026-10-29).** 1.1.0 released (the going-down rule, moved here from By the Books, issue
#1) and on prod through the installer, byte-identical. On `main`, unreleased: the sidebar-tabs
rule (issue #2), the sandbox carrying it (walked as a player); it waits on the user's word as
1.2.0. By the Books 3.4.18 drops its own copy of the going-down rule and its setting; until it is
installed beside this, its write sets Exhaustion first and this rule steps back, so a drop is
charged once either way.

## The rules

- **Arrow keys move tokens** (`scripts/rules/arrow-keys.js`, setting `arrowKeys`). Foundry 14 binds
  `core.move*` to W A S D and `core.pan*` to the arrows and numpad. The rule stores arrows on
  `move*`, numpad only on `pan*`, W A S D nowhere; `plan(current, on)` is the one write, null when
  nothing differs. Off removes the rule's entries (Foundry's defaults return) and leaves an action
  a player has since bound elsewhere.
- **Going down costs a level of Exhaustion** (`scripts/rules/going-down.js`, setting `goingDown`).
  `levelAtDrop({ before, after, exhaustion, exhaustionSet })` is the whole rule: Hit Points from
  above 0 to 0 or below cost one level, capped at 6, null for a hold at 1, a heal, an actor type
  without Exhaustion, or an update that already sets Exhaustion. `houserules.js` runs it in
  `preUpdateActor` and writes the level into `changes`, so it rides the Hit Point write on the
  client making it. It reads the write, not the damage behind it: a failed drop save, a declined
  hold and a GM's sheet edit count like a damage card (the user's ruling: anything that goes to 0
  pays; By the Books' old copy missed the first two). dnd5e's `applyDamage` hands
  its update no mark saying it was damage, which is why the rule cannot and does not try to tell
  damage from an edit. By the Books' damage receipt snapshots `_source` Exhaustion either side of
  its `applyDamage` and its `revertPlan` restores the recorded prior level with the Hit Points, so
  Revert is never charged; an older receipt without a recorded level reverts Hit Points alone.
- **Players see only the sidebar tabs they use** (`scripts/rules/sidebar-tabs.js`, setting
  `sidebarTabs`, issue #2). The user's list: players lose `placeables`, `items`, `tables`, `cards`,
  `macros` (HIDDEN); everything else, a module's tab included (Dice So Nice's), stays. `mark`
  sets `gmOnly` on those `CONFIG.ui.sidebar.TABS` descriptors at `setup` on a player's client
  (after every module's init, before the UI is built), Foundry's own way of hiding Scenes: no
  button, and `changeTab` to the tab throws. A live flip on falls back to Chat, closes the popout
  and removes the buttons; off unmarks only what the rule marked, the buttons back on reload
  (`requiresReload`). Hooks back it up: `changeSidebarTab` to a hidden tab bounces to Chat (a
  tick later, as Foundry sets the content class after the hook) and `renderAbstractSidebarTab`
  closes a hidden tab's popout.

## How the code is laid out

- `scripts/rules/<rule>.js`: a rule's pure half, no Foundry, every function tested in `tests/`.
- `scripts/houserules.js`: a world setting per rule (`config: true`, default on; only a GM sees a
  world setting), and each rule's write. The arrow-keys write runs on each client at `ready`, on
  the setting's `onChange` (a world setting's onChange runs on every client) and on
  `clientSettingChanged` for `core.keybindings` (a player's edit in Configure Controls, or Reset
  Defaults, is put back); `applying` guards the module's own write, and a second pass finds
  nothing to change. The going-down write runs in `preUpdateActor`, on the updating client alone,
  the setting read at each call.
- **Keybindings are a client setting** (`core.keybindings`, scope client, an object of
  `<namespace>.<action>` to editable bindings; an action absent is at Foundry's default). Its
  `onChange` is `game.keybindings.initialize()`, so one `game.settings.set` of the whole map is
  enough and the new keys work at once.

## Conventions this repo keeps

- The template's Biome and Vitest; `npm run verify` is the gate, its exit code the verdict.
- The kit copies (`scripts/kit/`, `tests/kit/`) are the suite's; never edit them here.
- **Versions (the user's rule for this module, not the family's patch default):** a new house rule
  is a minor (1.1.0, 1.2.0); a fix to an existing rule is a patch (1.1.1). Releases through the
  reusable workflow from an annotated tag, only on the user's word.
- Issues welcome, pull requests not accepted (`.github/PULL_REQUEST_TEMPLATE.md`).
- A new rule: its file under `scripts/rules/`, its tests, its setting in `houserules.js`, its
  strings in `lang/en.json`, its row in the README.

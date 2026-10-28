# fvtt-mod-houserules — working notes for sessions in this repo

**What this is.** Open Roll 5e: House Rules, a Foundry VTT module: one table's always-on overrides,
each a world setting only a GM sees or changes, on by default, applied on every client by the
client itself. Part of Open Roll 5e (the suite repo is `..`, its CLAUDE.md has the family's
conventions; the module is public but kept out of the catalogue, so `repos.json` gives it no
blurb). Plain ES modules, no build step, no patching, no libWrapper, MIT. Built from suite issue #9.

**State (2026-10-28).** 1.0.0 released (the arrow-keys rule) and on prod through the installer;
the sandbox carries the same code (its manifest still read 0.1.0 when deployed). A 0.1.0 release
was cut first and deleted minutes later, before any install read it, when the user set 1.0.

## The rules

- **Arrow keys move tokens** (`scripts/rules/arrow-keys.js`, setting `arrowKeys`). Foundry 14 binds
  `core.move*` to W A S D and `core.pan*` to the arrows and numpad. The rule stores arrows on
  `move*`, numpad only on `pan*`, W A S D nowhere; `plan(current, on)` is the one write, null when
  nothing differs. Off removes the rule's entries (Foundry's defaults return) and leaves an action
  a player has since bound elsewhere.

## How the code is laid out

- `scripts/rules/<rule>.js`: a rule's pure half, no Foundry, every function tested in `tests/`.
- `scripts/houserules.js`: a world setting per rule (`config: true`, default on; only a GM sees a
  world setting), and the write on each client at `ready`, on the setting's `onChange` (a world
  setting's onChange runs on every client) and on `clientSettingChanged` for `core.keybindings`
  (a player's edit in Configure Controls, or Reset Defaults, is put back). `applying` guards the
  module's own write; a second pass finds nothing to change.
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

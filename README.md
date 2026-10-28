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

## Installation

Paste the manifest URL into Foundry's _Install Module_ dialog:

```
https://github.com/Txpple/fvtt-mod-houserules/releases/latest/download/module.json
```

Requires Foundry VTT v13 or v14 and the dnd5e system 5.x or 6.x. No other dependencies.

## Settings

_Game Settings → Configure Settings → Open Roll 5e: House Rules._ World settings: a GM sees and
sets them, a player neither.

| Setting                | Default | What it does                                                                                                             |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| Arrow keys move tokens | on      | The arrows move the selected token, W A S D is unbound, the numpad pans. Off returns every client to Foundry's defaults. |

## Repository layout

```
module.json                    the Foundry manifest
scripts/
  houserules.js                the entry point: each rule's setting, and the write on every client
  rules/arrow-keys.js          the arrow-keys rule, pure: what the keybindings should be
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

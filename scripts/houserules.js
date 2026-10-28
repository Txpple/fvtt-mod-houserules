/**
 * Open Roll 5e: House Rules — the entry point (module.json's `esmodules`).
 *
 * One table's always-on overrides, each a world setting only a GM sees or changes, on by default,
 * and applied on every client by the client itself: at ready, when the GM flips the setting, and
 * again whenever the client's own keybindings drift from it. A player never opens a menu.
 *
 * Each rule is a file under scripts/rules/ holding its pure half (what the client should look
 * like, and the write that gets it there); this file registers the rule's setting and runs the
 * write. Words a player reads come from lang/en.json through `game.i18n`.
 */

import { createLogger } from "./kit/log.js";
import * as arrowKeys from "./rules/arrow-keys.js";

export const MODULE_ID = "fvtt-mod-houserules";

/** Every line opens with the module's title; debug lines need CONFIG.debug["fvtt-mod-houserules"]. */
export const log = createLogger(MODULE_ID);

/** A string from lang/en.json, under this module's key. */
export const t = (key, data) => game.i18n.format(`${MODULE_ID}.${key}`, data);

/** The client keybindings setting the arrow-keys rule writes. */
const KEYBINDINGS = "core.keybindings";

let applying = false;

/**
 * Bring this client's keybindings in line with the arrow-keys setting. One write of the whole
 * map, whose onChange has Foundry rebuild its key table; a second pass finds nothing to change.
 */
async function applyArrowKeys(why) {
  if (applying || !game.ready) return;
  const on = game.settings.get(MODULE_ID, arrowKeys.ID);
  const step = arrowKeys.plan(game.settings.get("core", "keybindings"), on);
  if (!step) return;
  applying = true;
  try {
    await game.settings.set("core", "keybindings", step.mapping);
    log.info(t(on ? "arrowKeys.applied" : "arrowKeys.restored", { why, n: step.changed.length }));
  } catch (err) {
    log.error(t("arrowKeys.failed"), err);
  } finally {
    applying = false;
  }
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, arrowKeys.ID, {
    name: `${MODULE_ID}.settings.arrowKeys.name`,
    hint: `${MODULE_ID}.settings.arrowKeys.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    // A world setting's onChange runs on every client, so a GM's flip reaches each player at once.
    onChange: () => void applyArrowKeys("setting")
  });
});

Hooks.once("ready", () => void applyArrowKeys("ready"));

// A player's own edit in Configure Controls (or its Reset Defaults) lands here; the rule puts its
// keys back. The module's own write matches the plan already, so it changes nothing more.
Hooks.on("clientSettingChanged", key => {
  if (key === KEYBINDINGS) void applyArrowKeys("drift");
});

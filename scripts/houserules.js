/**
 * Open Roll 5e: House Rules — the entry point (module.json's `esmodules`).
 *
 * One table's always-on overrides, each a world setting only a GM sees or changes, on by default,
 * and applied by the client the rule concerns, with no server-side part and no elected client:
 * the arrow-keys rule on every client for itself (at ready, when the GM flips the setting, and
 * whenever the client's own keybindings drift from it), the going-down rule on whichever client
 * writes the Hit Points, inside that very write, the sidebar-tabs rules on each client before
 * (a player's) or as (a GM's) its sidebar is drawn. A player never opens a menu.
 *
 * Each rule is a file under scripts/rules/ holding its pure half (what should be so, and the one
 * write that gets there); this file registers the rule's setting and runs the write. Words a
 * player reads come from lang/en.json through `game.i18n`.
 */

import { createLogger } from "./kit/log.js";
import * as arrowKeys from "./rules/arrow-keys.js";
import * as goingDown from "./rules/going-down.js";
import * as sidebarTabs from "./rules/sidebar-tabs.js";

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

/** The tabs this client's sidebar-tabs rule marked GM-only, so turning it off unmarks only those. */
const markedTabs = new Set();

/** This client's view of the sidebar-tabs rules: both settings and whether the user is a GM. */
function sidebarUser() {
  return {
    on: game.settings.get(MODULE_ID, sidebarTabs.ID),
    gmOn: game.settings.get(MODULE_ID, sidebarTabs.GM_ID),
    isGM: Boolean(game.user?.isGM)
  };
}

/**
 * Take this user's hidden tabs off a sidebar already drawn: leave a hidden tab for Chat first,
 * close its popout, and remove its button, after which `changeTab` refuses it.
 */
function removeHiddenTabs(ids, user) {
  const sidebar = ui.sidebar;
  if (!ids.length || !sidebar?.rendered) return;
  try {
    const to = sidebarTabs.fallback(sidebar.tabGroups?.primary, user);
    if (to) sidebar.changeTab(to, "primary");
    for (const id of ids) {
      sidebar.popouts?.[id]?.close();
      sidebar.element?.querySelector(`nav.tabs [data-tab="${id}"]`)?.closest("li")?.remove();
    }
  } catch (err) {
    log.error(t("sidebarTabs.failed"), err);
  }
}

/**
 * Bring the sidebar's tab table in line with the sidebar-tabs setting on a player's client. Before
 * the sidebar is built (setup) that is all it takes: a GM-only tab gets no button. On a live flip
 * to on, the sidebar is already drawn, so the player first leaves a tab being taken away (back to
 * Chat), its popout closes, and its button goes; with no button `changeTab` refuses it. A flip to
 * off unmarks the table, and the buttons return when the client reloads (the setting asks for it).
 */
function applySidebarTabs(why) {
  const user = sidebarUser();
  if (user.isGM) return;
  const changed = sidebarTabs.mark(CONFIG.ui.sidebar?.TABS, user.on, markedTabs);
  if (!changed.length) return;
  log.info(t(user.on ? "sidebarTabs.applied" : "sidebarTabs.restored", { why, n: changed.length }));
  if (user.on) removeHiddenTabs(changed, user);
}

/**
 * The GM rule on a GM's client: `gmOnly` does not hide a tab from a GM, so the buttons come off
 * the strip as the sidebar draws it (renderSidebar) and at once on a flip to on. Off: the buttons
 * return when the client reloads (the setting asks for it).
 */
function applyGmSidebarTabs() {
  const user = sidebarUser();
  if (!user.isGM) return;
  removeHiddenTabs(sidebarTabs.hiddenFor(user), user);
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
  // Read at each Hit Point write, so a flip needs no onChange.
  game.settings.register(MODULE_ID, goingDown.ID, {
    name: `${MODULE_ID}.settings.goingDown.name`,
    hint: `${MODULE_ID}.settings.goingDown.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  // Read at setup on each player's client, before the sidebar draws its buttons; a flip takes the
  // tabs away at once, and Foundry offers the GM a reload for everyone, which brings them back.
  game.settings.register(MODULE_ID, sidebarTabs.ID, {
    name: `${MODULE_ID}.settings.sidebarTabs.name`,
    hint: `${MODULE_ID}.settings.sidebarTabs.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
    onChange: () => applySidebarTabs("setting")
  });
  // The GM half: read as each GM's sidebar draws; a flip takes the buttons away at once, and
  // Foundry offers a reload for everyone, which brings them back.
  game.settings.register(MODULE_ID, sidebarTabs.GM_ID, {
    name: `${MODULE_ID}.settings.gmSidebarTabs.name`,
    hint: `${MODULE_ID}.settings.gmSidebarTabs.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
    onChange: () => applyGmSidebarTabs()
  });
});

// The sidebar-tabs rule: setup runs after every module's init (where a module adds its own tab)
// and before the UI is built, so the sidebar draws a player's strip without the hidden buttons.
Hooks.once("setup", () => applySidebarTabs("setup"));

// The GM rule: the strip is drawn on the sidebar's first render, and each render puts nothing back
// (later renders draw the tabs' contents only), so a removal here holds; a second finds nothing.
Hooks.on("renderSidebar", () => applyGmSidebarTabs());

// Belt and braces for a way in neither rule foresaw: a hidden tab that becomes active sends
// the user back to Chat, and a hidden tab's popout (`ui.items.renderPopout()` from a macro or a
// module's key) closes as it opens. The bounce waits a tick: Foundry fires the hook before it
// finishes its own change (the content's active class), which would undo a change made inside it.
Hooks.on("changeSidebarTab", app => {
  const to = sidebarTabs.fallback(app?.tabName, sidebarUser());
  if (to) setTimeout(() => ui.sidebar.changeTab(to, "primary"), 0);
});
Hooks.on("renderAbstractSidebarTab", app => {
  if (app?.isPopout && sidebarTabs.isHidden(app.tabName, sidebarUser())) void app.close();
});

// The going-down rule: a level of Exhaustion written into the same update that takes the Hit
// Points to 0, on the client making that update (a preUpdate hook runs there alone), so the level
// lands with the drop in one write and a damage receipt that snapshots the actor either side of
// its write (By the Books') records the level and reverts it with the Hit Points. The rule reads
// the update, not the damage behind it, so a failed drop save, a declined hold and a GM's edit
// count like a damage card; an update already setting Exhaustion is left as it is.
Hooks.on("preUpdateActor", (actor, changes) => {
  try {
    if (!game.settings.get(MODULE_ID, goingDown.ID)) return;
    const level = goingDown.levelAtDrop({
      before: actor.system?.attributes?.hp?.value,
      after: foundry.utils.getProperty(changes, goingDown.HP),
      exhaustion: actor.system?.attributes?.exhaustion,
      exhaustionSet: foundry.utils.hasProperty(changes, goingDown.EXHAUSTION)
    });
    if (level === null) return;
    foundry.utils.setProperty(changes, goingDown.EXHAUSTION, level);
    log.info(t("goingDown.charged", { name: actor.name, level }));
  } catch (err) {
    log.error(t("goingDown.failed", { name: actor?.name ?? "?" }), err);
  }
});

Hooks.once("ready", () => void applyArrowKeys("ready"));

// A player's own edit in Configure Controls (or its Reset Defaults) lands here; the rule puts its
// keys back. The module's own write matches the plan already, so it changes nothing more.
Hooks.on("clientSettingChanged", key => {
  if (key === KEYBINDINGS) void applyArrowKeys("drift");
});

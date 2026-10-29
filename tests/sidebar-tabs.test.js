import { describe, expect, it } from "vitest";
import { FALLBACK, HIDDEN, fallback, isHidden, mark } from "../scripts/rules/sidebar-tabs.js";

/** Foundry 14's Sidebar.TABS as Dice So Nice leaves it (its tab just above Settings). */
function foundryTabs() {
  return {
    chat: { documentName: "ChatMessage" },
    combat: { documentName: "Combat" },
    scenes: { documentName: "Scene", gmOnly: true },
    placeables: { tooltip: "SIDEBAR.TabPlaceables", icon: "fa-solid fa-puzzle-piece" },
    actors: { documentName: "Actor" },
    items: { documentName: "Item" },
    journal: { documentName: "JournalEntry", tooltip: "SIDEBAR.TabJournal" },
    tables: { documentName: "RollTable" },
    cards: { documentName: "Cards" },
    macros: { documentName: "Macro" },
    playlists: { documentName: "Playlist" },
    compendium: { tooltip: "SIDEBAR.TabCompendium", icon: "fa-solid fa-book-atlas" },
    "dice-so-nice": { icon: "fa-solid fa-dice-d20", tooltip: "DICESONICE.sidebarTabTitle" },
    settings: { tooltip: "SIDEBAR.TabSettings", icon: "fa-solid fa-gears" }
  };
}

const visible = tabs => Object.keys(tabs).filter(id => !tabs[id].gmOnly);

describe("mark — the player's strip", () => {
  it("leaves the user's keep list, in Foundry's order, and the module's tab", () => {
    const tabs = foundryTabs();
    expect(mark(tabs, true, new Set()).sort()).toEqual([...HIDDEN].sort());
    expect(visible(tabs)).toEqual([
      "chat",
      "actors",
      "journal",
      "playlists",
      "compendium",
      "dice-so-nice",
      "settings"
    ]);
  });

  it("changes nothing on a second pass", () => {
    const tabs = foundryTabs();
    const marked = new Set();
    mark(tabs, true, marked);
    expect(mark(tabs, true, marked)).toEqual([]);
  });

  it("off unmarks only what it marked: Scenes stays GM-only", () => {
    const tabs = foundryTabs();
    const marked = new Set();
    mark(tabs, true, marked);
    expect(mark(tabs, false, marked).sort()).toEqual([...HIDDEN].sort());
    expect(tabs.scenes.gmOnly).toBe(true);
    expect(visible(tabs)).toEqual(visible(foundryTabs()));
    expect(marked.size).toBe(0);
  });

  it("does not claim a tab something else already made GM-only", () => {
    const tabs = foundryTabs();
    tabs.macros.gmOnly = true;
    const marked = new Set();
    expect(mark(tabs, true, marked)).not.toContain("macros");
    mark(tabs, false, marked);
    expect(tabs.macros.gmOnly).toBe(true);
  });

  it("skips a tab a Foundry version lacks, and a missing table", () => {
    const tabs = foundryTabs();
    delete tabs.placeables;
    expect(mark(tabs, true, new Set())).not.toContain("placeables");
    expect(mark(undefined, true, new Set())).toEqual([]);
  });

  it("off with nothing marked writes nothing", () => {
    expect(mark(foundryTabs(), false, new Set())).toEqual([]);
  });
});

describe("isHidden and fallback — who loses what, and where they land", () => {
  const player = { on: true, isGM: false };
  it("hides the six from a player while on", () => {
    for (const id of HIDDEN) expect(isHidden(id, player)).toBe(true);
    for (const id of ["chat", "actors", "journal", "settings", "dice-so-nice"]) {
      expect(isHidden(id, player)).toBe(false);
    }
  });
  it("hides nothing from a GM, or with the rule off", () => {
    expect(isHidden("items", { on: true, isGM: true })).toBe(false);
    expect(isHidden("items", { on: false, isGM: false })).toBe(false);
  });
  it("a player on a hidden tab falls back to Chat; on a kept tab stays", () => {
    expect(fallback("macros", player)).toBe(FALLBACK);
    expect(FALLBACK).toBe("chat");
    expect(fallback("journal", player)).toBeNull();
    expect(fallback(undefined, player)).toBeNull();
    expect(fallback("macros", { on: true, isGM: true })).toBeNull();
  });
});

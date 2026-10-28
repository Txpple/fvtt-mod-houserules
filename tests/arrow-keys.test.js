import { describe, expect, it } from "vitest";
import { KEYS, plan, sameBindings, wanted } from "../scripts/rules/arrow-keys.js";

/** Foundry 14's own defaults for the eight actions, as a client that customised them would store. */
const FOUNDRY_DEFAULTS = {
  "core.moveUp": [{ key: "KeyW", modifiers: [] }],
  "core.moveLeft": [{ key: "KeyA", modifiers: [] }],
  "core.moveDown": [{ key: "KeyS", modifiers: [] }],
  "core.moveRight": [{ key: "KeyD", modifiers: [] }],
  "core.panUp": [
    { key: "ArrowUp", modifiers: [] },
    { key: "Numpad8", modifiers: [] }
  ],
  "core.panLeft": [
    { key: "ArrowLeft", modifiers: [] },
    { key: "Numpad4", modifiers: [] }
  ],
  "core.panDown": [
    { key: "ArrowDown", modifiers: [] },
    { key: "Numpad2", modifiers: [] }
  ],
  "core.panRight": [
    { key: "ArrowRight", modifiers: [] },
    { key: "Numpad6", modifiers: [] }
  ]
};

describe("wanted — the arrows move, the numpad pans, W A S D is free", () => {
  it("binds each of the eight actions to exactly one key", () => {
    const want = wanted();
    expect(Object.keys(want)).toEqual(Object.keys(KEYS));
    for (const bindings of Object.values(want)) expect(bindings).toHaveLength(1);
  });
  it("puts the arrows on movement and off panning", () => {
    const want = wanted();
    expect(want["core.moveUp"]).toEqual([{ key: "ArrowUp", modifiers: [] }]);
    expect(want["core.moveDown"][0].key).toBe("ArrowDown");
    expect(want["core.panUp"]).toEqual([{ key: "Numpad8", modifiers: [] }]);
  });
  it("leaves no W A S D anywhere", () => {
    const keys = Object.values(wanted()).flatMap(b => b.map(x => x.key));
    for (const k of ["KeyW", "KeyA", "KeyS", "KeyD"]) expect(keys).not.toContain(k);
  });
});

describe("sameBindings", () => {
  it("ignores order and treats missing modifiers as none", () => {
    expect(
      sameBindings([{ key: "A" }, { key: "B", modifiers: [] }], [{ key: "B" }, { key: "A" }])
    ).toBe(true);
  });
  it("tells a modifier apart", () => {
    expect(sameBindings([{ key: "A", modifiers: ["Shift"] }], [{ key: "A" }])).toBe(false);
  });
  it("tells a different length apart, and a non-list", () => {
    expect(sameBindings([{ key: "A" }], [{ key: "A" }, { key: "B" }])).toBe(false);
    expect(sameBindings(undefined, [{ key: "A" }])).toBe(false);
  });
});

describe("plan, on — a fresh client", () => {
  it("writes all eight actions into an empty map", () => {
    const step = plan({}, true);
    expect(step.changed).toHaveLength(8);
    expect(step.mapping).toEqual(wanted());
  });
  it("treats a missing or odd map as empty", () => {
    expect(plan(undefined, true).changed).toHaveLength(8);
    expect(plan(null, true).changed).toHaveLength(8);
  });
  it("keeps other actions a client stored", () => {
    const step = plan({ "core.target": [{ key: "KeyX", modifiers: [] }] }, true);
    expect(step.mapping["core.target"]).toEqual([{ key: "KeyX", modifiers: [] }]);
  });
});

describe("plan, on — a client with bindings", () => {
  it("replaces Foundry's defaults when a client stored them", () => {
    const step = plan(FOUNDRY_DEFAULTS, true);
    expect(step.changed).toHaveLength(8);
    expect(step.mapping["core.panUp"]).toEqual([{ key: "Numpad8", modifiers: [] }]);
  });
  it("is a no-op once the rule holds", () => {
    expect(plan(wanted(), true)).toBeNull();
  });
  it("puts back only what drifted", () => {
    const drifted = { ...wanted(), "core.moveUp": [{ key: "KeyW", modifiers: [] }] };
    const step = plan(drifted, true);
    expect(step.changed).toEqual(["core.moveUp"]);
    expect(step.mapping["core.moveUp"]).toEqual([{ key: "ArrowUp", modifiers: [] }]);
  });
  it("accepts the same keys in another order", () => {
    const stored = { ...wanted(), "core.moveUp": [{ key: "ArrowUp" }] };
    expect(plan(stored, true)).toBeNull();
  });
});

describe("plan, off — back to Foundry's defaults", () => {
  it("removes the rule's entries, so Foundry's defaults return", () => {
    const step = plan(wanted(), false);
    expect(step.changed).toHaveLength(8);
    expect(step.mapping).toEqual({});
  });
  it("leaves an action a player bound to something else", () => {
    const stored = { ...wanted(), "core.moveUp": [{ key: "KeyI", modifiers: [] }] };
    const step = plan(stored, false);
    expect(step.changed).toHaveLength(7);
    expect(step.mapping).toEqual({ "core.moveUp": [{ key: "KeyI", modifiers: [] }] });
  });
  it("is a no-op on a client that never had the rule", () => {
    expect(plan({}, false)).toBeNull();
    expect(plan(FOUNDRY_DEFAULTS, false)).toBeNull();
  });
  it("never mutates the map it was given", () => {
    const stored = wanted();
    const before = JSON.stringify(stored);
    plan(stored, false);
    plan(stored, true);
    expect(JSON.stringify(stored)).toBe(before);
  });
});

import { describe, expect, it } from "vitest";
import { EXHAUSTION, HP, ID, MAX, levelAtDrop } from "../scripts/rules/going-down.js";

describe("the rule's names", () => {
  it("reads and writes dnd5e's own paths", () => {
    expect(ID).toBe("goingDown");
    expect(HP).toBe("system.attributes.hp.value");
    expect(EXHAUSTION).toBe("system.attributes.exhaustion");
    expect(MAX).toBe(6);
  });
});

describe("levelAtDrop — every way down to 0 costs one level", () => {
  it("damage from above 0 to 0", () => {
    expect(levelAtDrop({ before: 12, after: 0, exhaustion: 0 })).toBe(1);
  });
  it("a drop save failed after a hold at 1, or a hold declined: 1 to 0", () => {
    expect(levelAtDrop({ before: 1, after: 0, exhaustion: 0 })).toBe(1);
  });
  it("a GM's edit straight to 0", () => {
    expect(levelAtDrop({ before: 30, after: 0, exhaustion: 2 })).toBe(3);
  });
  it("a write below 0 counts as 0", () => {
    expect(levelAtDrop({ before: 4, after: -9, exhaustion: 0 })).toBe(1);
  });
  it("stacks on the level the creature already carries", () => {
    expect(levelAtDrop({ before: 7, after: 0, exhaustion: 4 })).toBe(5);
  });
});

describe("levelAtDrop — what costs nothing", () => {
  it("a creature held at 1 (Death Ward, Relentless Endurance, a save that wins)", () => {
    expect(levelAtDrop({ before: 12, after: 1, exhaustion: 0 })).toBeNull();
  });
  it("damage that leaves Hit Points above 0", () => {
    expect(levelAtDrop({ before: 12, after: 5, exhaustion: 0 })).toBeNull();
  });
  it("more damage on a creature already at 0", () => {
    expect(levelAtDrop({ before: 0, after: 0, exhaustion: 1 })).toBeNull();
  });
  it("a heal, including a Revert that brings Hit Points back", () => {
    expect(levelAtDrop({ before: 0, after: 9, exhaustion: 1 })).toBeNull();
  });
  it("an update that leaves Hit Points alone", () => {
    expect(levelAtDrop({ before: 12, after: undefined, exhaustion: 0 })).toBeNull();
    expect(levelAtDrop({ before: 12, exhaustion: 0 })).toBeNull();
  });
  it("an update that already sets Exhaustion itself (a Revert to a recorded state, another writer)", () => {
    expect(levelAtDrop({ before: 12, after: 0, exhaustion: 0, exhaustionSet: true })).toBeNull();
  });
  it("an actor type that does not track Exhaustion", () => {
    expect(levelAtDrop({ before: 12, after: 0, exhaustion: undefined })).toBeNull();
    expect(levelAtDrop({ before: 12, after: 0, exhaustion: null })).toBeNull();
  });
  it("an actor with no Hit Points to read", () => {
    expect(levelAtDrop({ before: undefined, after: 0, exhaustion: 0 })).toBeNull();
    expect(levelAtDrop({ before: Number.NaN, after: 0, exhaustion: 0 })).toBeNull();
  });
});

describe("levelAtDrop — the cap", () => {
  it("the sixth level is the last", () => {
    expect(levelAtDrop({ before: 3, after: 0, exhaustion: 5 })).toBe(MAX);
  });
  it("a creature already at the cap is not written again", () => {
    expect(levelAtDrop({ before: 3, after: 0, exhaustion: MAX })).toBeNull();
    expect(levelAtDrop({ before: 3, after: 0, exhaustion: MAX + 2 })).toBeNull();
  });
  it("a fractional level stored by hand is rounded down before the step", () => {
    expect(levelAtDrop({ before: 3, after: 0, exhaustion: 1.5 })).toBe(2);
  });
});

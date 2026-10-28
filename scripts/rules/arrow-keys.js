/**
 * The arrow-keys rule, the pure half: what the client's keybindings should be while the rule is
 * on, and the one write that gets them there (or back). No Foundry here; scripts/houserules.js
 * reads and writes the setting.
 *
 * Foundry 14 moves tokens on W A S D and pans the canvas on the arrow keys (and the numpad). The
 * rule puts the arrows on movement and leaves W A S D unbound; panning keeps the numpad only, so
 * no key does two things. Keybindings are a client setting (`core.keybindings`, a map of
 * `<namespace>.<action>` to its editable bindings, an action absent from the map standing at
 * Foundry's default), so every client applies this for itself.
 */

export const ID = "arrowKeys";

/** `core.<action>` → the one key it holds while the rule is on. */
export const KEYS = {
  "core.moveUp": "ArrowUp",
  "core.moveLeft": "ArrowLeft",
  "core.moveDown": "ArrowDown",
  "core.moveRight": "ArrowRight",
  "core.panUp": "Numpad8",
  "core.panLeft": "Numpad4",
  "core.panDown": "Numpad2",
  "core.panRight": "Numpad6"
};

/** The bindings the rule wants, in the shape the setting stores. */
export function wanted() {
  const out = {};
  for (const [action, key] of Object.entries(KEYS)) out[action] = [{ key, modifiers: [] }];
  return out;
}

/** One binding in a comparable form: the key and its modifiers, sorted. */
function normalize(binding) {
  const modifiers = Array.isArray(binding?.modifiers) ? [...binding.modifiers].sort() : [];
  return `${binding?.key ?? ""}+${modifiers.join("+")}`;
}

/** Two binding lists hold the same keys, in any order. */
export function sameBindings(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const left = a.map(normalize).sort();
  const right = b.map(normalize).sort();
  return left.every((x, i) => x === right[i]);
}

/**
 * The write that brings `current` (the stored `core.keybindings` map) in line with the rule.
 *
 * On: every action in KEYS whose stored bindings differ from the wanted ones is set; an action
 * absent from the map (at Foundry's default) differs too. Off: an action still holding exactly the
 * rule's bindings is removed from the map, back to Foundry's default; an action a player has since
 * bound to something else is theirs and is left alone.
 *
 * @param {object} current  The stored map, `game.settings.get("core", "keybindings")`.
 * @param {boolean} on      The rule's setting.
 * @returns {{ mapping: object, changed: string[] } | null}  The whole map to store and the
 *   actions it changes, or null when nothing needs writing.
 */
export function plan(current, on) {
  const stored = current && typeof current === "object" ? current : {};
  const want = wanted();
  const mapping = { ...stored };
  const changed = [];
  for (const [action, bindings] of Object.entries(want)) {
    const have = stored[action];
    if (on) {
      if (sameBindings(have, bindings)) continue;
      mapping[action] = bindings;
      changed.push(action);
    } else if (have !== undefined && sameBindings(have, bindings)) {
      delete mapping[action];
      changed.push(action);
    }
  }
  return changed.length ? { mapping, changed } : null;
}

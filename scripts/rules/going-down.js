/**
 * The going-down rule, the pure half: whether one actor update is a drop to 0 Hit Points, and the
 * level of Exhaustion it then costs. No Foundry here; scripts/houserules.js reads the actor and the
 * update and writes the level into it.
 *
 * The table's rule: each time a creature's Hit Points go from above 0 to 0, it gains one level of
 * Exhaustion, at the drop, the sixth being death under the 2024 rules. The rule reads the update
 * itself, not the damage that caused it, so every way down counts the same: damage applied from a
 * card, a drop save failed after a hold at 1, a hold declined, a GM's edit on the sheet. A creature
 * held at 1 never reaches 0 and pays nothing. An update that already sets Exhaustion is another
 * module's considered write (By the Books' Revert restoring a receipt's recorded state, or its own
 * older copy of this rule) and is left alone, so no drop is ever charged twice.
 */

export const ID = "goingDown";

/** The platform's top level; dnd5e reads it as Dead. */
export const MAX = 6;

/** The two actor paths the rule reads and writes. */
export const HP = "system.attributes.hp.value";
export const EXHAUSTION = "system.attributes.exhaustion";

/**
 * Where dnd5e keeps the level an update starts from, on the update's options. Since dnd5e 6.0 the
 * actor's Exhaustion is read off its Exhaustion effect (`prepareExhaustionLevel`), and a write to
 * the attribute moves that effect only when its `_onUpdate` finds this note, which its own
 * `_preUpdate` leaves only when the update already carried Exhaustion. The rule adds the level in
 * the `preUpdateActor` hook, after `_preUpdate` has run, so it leaves the note itself; without it
 * the stored level rose while the effect, and with it the sheet, stayed where it was (Session 03 of
 * Echoes of Halruaa: Lysandra dropped on the glass and stayed at 1).
 */
export const ORIGINAL = "dnd5e.originalExhaustion";

/**
 * The level of Exhaustion one update costs, or null when it costs nothing.
 *
 * @param {object} drop
 * @param {number} drop.before          The actor's Hit Points before the update.
 * @param {number} [drop.after]         The Hit Points the update writes; undefined when it leaves them.
 * @param {number} drop.exhaustion      The actor's Exhaustion before the update; not a number when
 *                                      the actor type does not track it.
 * @param {boolean} [drop.exhaustionSet]  The update already sets Exhaustion itself.
 * @returns {number | null}  The new level to write, or null.
 */
export function levelAtDrop({ before, after, exhaustion, exhaustionSet = false }) {
  if (exhaustionSet) return null;
  if (!(Number(before) > 0)) return null;
  const to = Number(after);
  if (!Number.isFinite(to) || to > 0) return null;
  if (exhaustion === undefined || exhaustion === null) return null;
  const now = Number(exhaustion);
  if (!Number.isFinite(now)) return null;
  const next = Math.min(MAX, Math.floor(now) + 1);
  return next > now ? next : null;
}

/**
 * The whole write one update gets: the level into the changes, and the level it rises from into the
 * options (ORIGINAL), so dnd5e raises its Exhaustion effect with it. Null when the update costs
 * nothing. A note another writer already left is kept.
 *
 * @param {object} drop                As for levelAtDrop.
 * @param {number} [drop.original]     The note already on the options, if any.
 * @returns {{ changes: Record<string, number>, options: Record<string, number> } | null}
 */
export function dropWrite({ original, ...drop }) {
  const level = levelAtDrop(drop);
  if (level === null) return null;
  const from = Number.isFinite(original) ? original : Math.floor(Number(drop.exhaustion));
  return { changes: { [EXHAUSTION]: level }, options: { [ORIGINAL]: from } };
}

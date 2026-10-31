# Changelog

## 1.4.0

- **The two sidebar-tabs rules move to Card Catalogue** (`fvtt-mod-cardcatalogue`), the module
  that replaces the sidebar's directories with cases of cards: *Players see only the sidebar tabs
  they use* and *GMs see only the sidebar tabs they use* leave House Rules whole, their switches
  carried over by Card Catalogue on a GM's first load. Install Card Catalogue with or before this
  version; while an older House Rules still runs them, Card Catalogue's copies step aside. House
  Rules keeps the arrow keys and going down.

## 1.3.0

- **GMs see only the sidebar tabs they use**, a new rule with its own switch, on by default: a
  GM's sidebar loses Combat, Rollable Tables, Cards and Macros; Chat, Scenes, Placeables,
  Actors, Items, Journal, Playlists, Compendium Packs, Settings and module tabs stay. The
  buttons come off as the sidebar draws, so the tabs cannot be switched to or popped out. The
  players' rule is unchanged.

## 1.2.1

- **Players see only the sidebar tabs they use** now hides the Combat tab from players too (the
  user's call). Nothing in Foundry, dnd5e or the table's modules switches a player to it; GMs
  keep it.

## 1.2.0

- **Players see only the sidebar tabs they use** (issue #2). A world setting, on by default: a
  player's sidebar loses Placeables, Items, Rollable Tables, Cards and Macros; Chat, Combat,
  Actors, Journal, Playlists, Compendium Packs, Settings and any tab a module adds stay. GMs keep
  every tab. The tabs are marked GM-only before the sidebar is built, so a hidden tab has no
  button (open or collapsed strip), cannot be switched to by `changeTab` or a key, and its popout
  closes as it opens. Turned on in play, a player on a hidden tab goes back to Chat; turned off,
  the tabs return on reload.

## 1.1.0

- **Going down costs a level of Exhaustion** (issue #1), moved here from By the Books: Hit Points
  from above 0 to 0 cost one level, written in the same update, so By the Books' receipt records
  it and its Revert takes it back.

## 1.0.0

- The first release: **the arrow keys move tokens**; W A S D is unbound and the numpad pans.

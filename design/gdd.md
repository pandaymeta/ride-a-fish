# Ride A Fish

**Decentraland Creator Success Program**

| | |
|---|---|
| Public experience title | Ride A Fish. IP & [Content Policy](https://decentraland.org/content/): owner declaration, TBD. Name screening: not searched. Title and permission checks: TBD. |
| Deployment target | Entenium World (entenium.dcl.eth). |
| Studio / team name | Pandaymeta Studio. |
| Date | 8 November 2026 — local review draft. |
| Contact (Discord + email) | @Entenium on Discord · pandaymetastudioph@gmail.com. |

## 0. TL;DR

| | |
|---|---|
| **Player promise** | Ride a growing fish, chase smaller players, and dodge large predators. Grow until the fish chasing you become your prey. |
| **Primary player** | For players who like short survival games and fish collecting, joining alone or with friends to grow and chase rivals. |
| **Current status** | World republished on 8 November 2026 with the current scene changes (owner-reported). [Play in Entenium World](https://decentraland.org/jump?realm=entenium.dcl.eth). Public save/rejoin verification remains pending. [Repository](https://github.com/pandaymeta/ride-a-fish). |
| **Requested round** | V0, first Creator Success application. |
| **Live at end of the round** | V0: players can grow, chase smaller riders, and dodge predators in Common and Uncommon waters, park only at the island dock, and rejoin with saved size and Fish Index progress. |

## 1. Player Promise

**One-line promise.**

Ride a growing fish, chase smaller players, and dodge large predators. Grow until the fish chasing you become your prey.

**One familiar comparison.**

A fish survival game where your own avatar rides the fish you control.

**Why this game.**

We made Little Fish as a 2D solo game on The Sandbox Game platform. We want players to ride with their own avatars and chase people they know.

## 2. First Minutes & How to Play

| Time | Player experience |
|---|---|
| **0–5 seconds after control** | The island path and red arrow lead to the NPC Guide and dock. |
| **5–10 seconds** | You approach the dock to board your fish. |
| **10–60 seconds** | You board, steer toward food, and see your fish grow. |
| **1–3 minutes** | You catch an NPC fish, fill an Index entry, and park. |
| **3–10 minutes** | Ride again, chase a player, or dodge the Hammerhead. Uncommon requires size 100. |
| **Natural stopping point** | Return to the island dock to park and save. Your size and missing Index entries show the next goal. |

**Player-facing How to Play.**

- Board your fish and eat to grow.
- Chase smaller players; dodge large predators.
- Park to save your size.

## 3. Core Loop

| # | Step (verb) | What the player does (Player input → what they see or hear → what changes) | Why do it again? |
|---|---|---|---|
| 1 | Board | Press E or tap Ride → mount your saved fish, or size 1 if new. | Continue your fish. |
| 2 | Eat | Eat food or smaller fish → grow; new NPC species fill the Index. | Reach larger prey. |
| 3 | Chase | Follow a smaller rider → they try to escape. | Each rival reacts differently. |
| 4 | Dodge | Turn, jump, or take a powerup → try to escape a larger fish. | Keep your growing fish alive. |
| 5 | Park | At the island dock, press E or tap Dock → step off and save size. | Continue on another visit. |

Only strictly larger fish can eat smaller ones. Riding puts your saved fish at risk again; getting eaten means starting at size 1. Index entries, coins, and tutorial progress stay. Park before leaving to keep that size.

| | |
|---|---|
| **One complete loop takes** | Target: 2–3 minutes to catch and park; food rewards come earlier. |
| **Decision, challenge, or expression** | Keep hunting at risk, or return to park and save. |
| **Shortest satisfying visit / typical session** | Target: 2–3 / 5–10 minutes. First growth within one minute. |
| **Why repetition 10 remains appealing** | Growth changes targets; rivals and predators change routes. |

Timing and repeat-play appeal still need player tests.

**Pillars.**

1. Ride with your avatar — steer, jump, and visibly grow.
2. Chase and dodge — turn a hunter into prey.
3. Park and continue — keep your fish between visits.

## 4. Why Players Come Back

### 4.1 The next-day (D1) sentence

> We want players to return to continue their saved fish and catch missing Fish Index species.

### 4.2 The progression chain

> Eat and grow → park size and record discoveries → reach larger prey and Uncommon water → choose the next hunt.

| Moment | What persists or has been built? | What becomes possible next? | How can another player tell? |
|---|---|---|---|
| **End of first session** | Saved size, discoveries, coins, and tutorial progress. | Grow or find a missing species. | Your name and size are visible. |
| **End of first week** | Target: growth and discoveries; pace TBD. | Enter Uncommon; challenge a rival. | Rivals see your larger fish. |
| **Week 3+ — what takes more than two weeks?** | V1: deeper areas and collection; timing TBD. | Hunt missing high-tier species. | Visible size; collection display TBD. |

**Intended first-week scene.**

You return to your saved fish, catch a missing species, and escape a rival. Parking keeps your new size.

**Currency or tradable rewards.** Coins remain a saved reward. V0 focuses on growth and discoveries. V1 adds a shop where players can spend their coins. Items and prices are TBD.

### 4.3 Two return hooks

| Selected hook | Exact trigger or timing | What the player anticipates | Reminder channel + no-reminder fallback |
|---|---|---|---|
| **1. Saved-growth progression** | Park before leaving; rejoin at the saved size. | Grow toward size 100 and Uncommon water. | Saved size and the next gate show the goal. |
| **2. Fish Index collection** | Catch a new NPC species to fill its entry. | Find a missing fish on the next ride. | The Index shows discoveries and empty entries. |

Return results are TBD. Scheduled species spawns belong to V1.

## 5. Social by Design

| | |
|---|---|
| **The repeatable social loop** | A rider chases a smaller player → the target turns, jumps, or takes a powerup → escape or catch → ride again. |
| **The disappearance test** | Chases disappear; NPC hunting, growth, predator escapes, and the Index remain. |
| **From strangers to a group** | Names and sizes show whom to chase or avoid. |
| **Recognition & continuity** | Names and sizes support rivalry; test recognition on return visits. |
| **Quiet hours & player counts** | Solo: NPC targets. Social threshold: 2. V0 tests: 2–4. Current cap: 10; V1: 20. Friend playtests reported; structured results: TBD. |
| **Drop-in / drop-out** | Board at a free dock slot; departures do not stop others. |
| **Visible play (the bystander test)** | A rider visibly eats, grows, and chases another fish. |
| **Shareable play (the memorable moment)** | Escape a larger friend, grow, then chase them back. |
| **Bring-a-friend** | Chase a friend; compare your fish after parking. |

**V1 idea introduced in V0.** A Mythic spawn alerts the whole server and invites riders to race for the same fish. The first valid catch wins. We want this shared goal to create urgent hunts and rivalries. V0 presents the idea; V1 builds and tests the mechanic.

## 6. Mobile-First

**Every core-loop verb on touch.**

| Core-loop verb | How it works with touch controls |
|---|---|
| Board | Tap Ride beside the fish. |
| Eat | Steer into food or smaller fish. |
| Chase | Use the thumbstick; drag to look. |
| Dodge | Turn or tap Jump; collect powerups on contact. |
| Park | Tap Dock near the bridge. |

**UI plan.**

Keep sizes, prompts, and the Index readable on phones. Show nearby prompts when useful.

**Performance.**

V0 targets: 60 fps desktop / 30 fps mobile at 2–4 riders. Mobile device, client, and results: TBD. V1 tests 20 riders.

**Desktop-only dependencies.**

Touch seating, steering, jumping, and docking need device tests. Check the [mobile feature-gap tracker](https://github.com/decentraland/godot-explorer/issues/2402); keyboard play alone does not establish mobile readiness.

## 7. World, Look & Story

**Story / world.**

The NPC Guide welcomes riders to a tropical island and dock. At sea, you hunt smaller fish and escape larger ones.

**Visual direction.**

An avatar rides a bright, growing fish over blue water with a white wake. Clear sizes, bold prompts, and a parchment Index support phone readability. Keep the island and bridge.

## 8. Audience & Comparables

**Primary player + arrival context.**

For players who like short survival games and fish collecting, joining alone or with friends to grow and chase rivals.

**How the first group arrives.**

Invite our contacts with a World link and playtest time. Bring 2–4 riders into the same server.

**Deliberately not for.**

Players seeking a long solo story or equal-size PvP matches.

### Comparables

| | Comparable A — Decentraland: Fishing Game reference, exact link TBD | Comparable B — outside Decentraland: Little Fish, The Sandbox Game |
|---|---|---|
| What we observed works | Clear dock and dialogue in the image; gameplay unverified. | Our solo game uses eating and growth. |
| What does not fit our audience or context—and why | Mounted player chases are unverified. | It has no avatar riding or shared player chase. |
| What we will do differently | Make the ride and chase visible. | Add avatar riding, player chases, and parked-size saving. |

## 9. 4 Week Plan (v1 scope)

**Proposed V0 scope:** the existing island, Common and Uncommon waters, a small Fish Index, the Hammerhead, Shields, and Speedboosters. Deliver ride → grow → chase or dodge → park at the island dock → rejoin. Agree the final scope and timeline with Creator Success.

The Hammerhead roams only in Common and Uncommon waters.

With 2–4 riders, test boarding and prey/predator clarity, voluntary repeat rides, and save/rejoin. Results are TBD.

**Provisional V1 outlook, after V0 review:** the main new social test is the shared Mythic hunt. When a Mythic fish spawns, every player in the server gets an alert. Its location stays hidden. Riders race to find it, chase rivals, and dodge threats; the first valid catch wins. The aim is to turn separate hunts into an exciting shared race.

V1 will build Mythic spawning, the server-wide alert, and a single confirmed winner per fish. Test whether players change routes to join the hunt and choose another ride afterward. Excitement and repeat play are goals to verify.

V1 also includes a coin shop, a leaderboard, six populated rarity areas, a nearly complete Fish Index, 20 players, UTC species rotations, and friend-based Legendary/Mythic spawn bonuses. Shop items and prices, leaderboard scoring and display, species count, and tuning: TBD. Size gates and catch-size rules still apply.

| Week | What is playable / done |
|---|---|
| 1 — Prototype definition | Confirm the V1 roster, growth plan, shop items/prices, and leaderboard rules; resolve V0 playtest issues. |
| 2 — Core interaction + first-group test | Populate all six areas; test fish mix and gates. Prototype a Mythic spawn and server-wide alert. |
| 3 — Core systems refinement | Test shared Mythic hunts and one winner per fish. Add the coin shop and leaderboard; complete most species, rotations, friend bonuses, and 20-player capacity. |
| 4 — Playable release, including testing and deployment | Observe hunt participation, chases, and repeat rides. Check purchases, leaderboard results, saves, collection, and 20-player desktop/mobile performance; publish V1. |

**What keeps the experience changing after launch.**

- Different rivals and fish sizes change the next chase.
- NPC respawns support solo hunts; V1 Mythic spawns start shared races.
- Parked size and discoveries carry across visits; catching an active rider still ends that fish.
- If players stop returning, review chase balance, growth pace, and missing-species goals.

**Not building in v1.**

1. Areas beyond the six rarity areas.
2. Rebirth, trading, and formal crews.

**Top risk + fallback.**

An unreliable save can erase a large fish. Prioritize save/rejoin fixes and preserve stored data after failed loads. New-player fairness, mobile riding, and return visits need tests.

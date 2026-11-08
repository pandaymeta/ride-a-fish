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
| **Primary player** | For players who enjoy survival games and collecting fish, alone or with friends, and want to grow and chase rivals. |
| **Current status** | Playable test scene; republished 8 November 2026 (owner-reported). [Play](https://decentraland.org/jump?realm=entenium.dcl.eth) · [Repository](https://github.com/pandaymeta/ride-a-fish). Public save/rejoin test: TBD. |
| **Requested round** | V0, first Creator Success application. |
| **Live at end of the round** | V0: grow, chase players, and dodge predators in two areas; park at the island dock and rejoin with saved size and discoveries. |

## 1. Player Promise

**One-line promise**

Ride a growing fish, chase smaller players, and dodge large predators. Grow until the fish chasing you become your prey.

**One familiar comparison.**

A fish survival game where your own avatar rides the fish you control.

**Why this game**

We made the 2D solo game Little Fish on The Sandbox Game. Now we want avatar riding and chases between friends.

## 2. First Minutes & How to Play

| Time | Player experience |
|---|---|
| **0–5 seconds after control** | You see a path and red arrow toward the NPC Guide and dock. |
| **5–10 seconds** | You follow the path toward your first fish ride. |
| **10–60 seconds** | You board, eat food, and see your fish grow. |
| **1–3 minutes** | You catch an NPC fish, fill an Index entry, and park to save. |
| **3–10 minutes** | You hunt again or chase a rider. Size 100 opens Uncommon. Larger fish threaten you. |
| **Natural stopping point** | You park at the island dock. Saved size and missing Index entries show your next goal. |

**Player-facing How to Play**

- Board your fish and eat to grow.
- Chase smaller players; dodge large predators.
- Park to save your size.

## 3. Core Loop

| # | Step (verb) | What the player does (Player input → what they see or hear → what changes) | Why do it again? |
|---|---|---|---|
| 1 | Board | Press E or tap Ride → mount your parked fish; new fish start at 1. | Continue growth. |
| 2 | Eat | Touch food or smaller fish → grow; new NPC species fill the Index. | Reach new prey and areas. |
| 3 | Chase | Follow a smaller rider → they try to escape. | Each rival reacts differently. |
| 4 | Dodge | Turn, jump, or take a powerup → escape a larger fish. | Protect your fish. |
| 5 | Park | At the island dock, press E or tap Dock → save size. | Continue next visit. |

Only strictly larger fish can eat others. Boarding risks your saved fish. Getting eaten or leaving before parking restarts it at size 1. Discoveries, coins, and tutorial progress stay. Park only at the island dock.

| | |
|---|---|
| **One complete loop takes** | Target: 2–3 minutes to catch and park; food rewards come sooner. |
| **Decision, challenge, or expression** | Keep hunting at risk, or return to park and save. |
| **Shortest satisfying visit / typical session** | Target: 2–3 / 5–10 minutes. First growth within one minute. |
| **Why repetition 10 remains appealing** | Growth turns threats into prey. Rivals and missing species change routes. |

Timing and repeat play need tests.

**Pillars**

1. Ride with your avatar — steer, jump, and visibly grow.
2. Chase and dodge — turn a hunter into prey.
3. Park and continue — keep your fish between visits.

## 4. Why Players Come Back

### 4.1 The next-day (D1) sentence

> A player returns to grow their parked fish and hunt the missing species shown in their Fish Index.

### 4.2 The progression chain

> Eat and grow → park size and record discoveries → enter Uncommon or outgrow a threat → choose a harder hunt.

| Moment | What persists or has been built? | What becomes possible next? | How can another player tell? |
|---|---|---|---|
| **End of first session** | Parked size, discoveries, coins, and tutorial progress. | Reach size 100 or find a missing species. | Visible name and fish size. |
| **End of first week** | Target: Uncommon access and more discoveries; pace untested. | Hunt rarer visitors; work toward outgrowing the Hammerhead. | Larger fish; familiar player name. |
| **Week 3+ — what takes more than two weeks?** | V1: deeper areas, collection, and shop purchases. Duration: TBD. | Hunt high-tier species and join Mythic races. | Visible size; collection display: TBD. |

**Intended first-week scene.**

You board your parked fish and enter Uncommon at size 100. You hunt a missing species while avoiding larger riders. You park your gains, with the Hammerhead still to outgrow.

**Currency or tradable rewards.** Food and catches earn coins; V1 shop purchases spend them. Items/prices: TBD. Abuse risk to review: automated farming.

### 4.3 Two return hooks

| Selected hook | Exact trigger or timing | What the player anticipates | Reminder channel + no-reminder fallback |
|---|---|---|---|
| **1. Saved-growth progression** | Park, then rejoin at that size. | Unlock Uncommon at 100; hunt larger prey. | Parked size and the next gate show the goal. |
| **2. Fish Index collection** | Catch a new NPC species. | Fill the sample's four entries. Extra completion reward: TBD. | Missing entries show unfinished progress. |

Return results: TBD. V1 expands the Index and adds UTC species rotations.

## 5. Social by Design

| | |
|---|---|
| **The repeatable social loop** | Chase a smaller rider → they turn, jump, or take a powerup → catch or escape changes both riders' next move. |
| **The disappearance test** | Chases disappear. Solo riders still hunt NPC species and choose between risking a predator or parking. |
| **From strangers to a group** | The dock brings riders together. Visible names and sizes help them choose whom to chase or avoid. |
| **Recognition & continuity** | Names identify rivals. Return with saved growth to challenge someone you once avoided. Recognition needs tests. |
| **Quiet hours & player counts** | Solo: catch missing fish and escape the Hammerhead. Social threshold: 2; first tests: 2–4. Current cap: 10; V1: 20. Friend tests reported; structured results/devices: TBD. |
| **Drop-in / drop-out** | Board at a free dock slot; departures do not stop others. |
| **Visible play (the bystander test)** | A rider visibly eats, grows, and chases another fish. |
| **Shareable play (the memorable moment)** | Escape a larger friend, grow, then chase them back. |
| **Bring-a-friend** | Invite a friend for chases and compare your fish after parking. |

**V1 idea introduced in V0.** A Mythic alert starts a shared search; the first valid catch wins. V1 builds this race without a Mythic area.

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

Keep sizes and Index entries readable. Nearby prompts leave steering and jump controls clear.

**Performance.**

Targets: 60 fps desktop / 30 fps mobile. Test 2–4 riders in V0; 20 in V1. Mobile device/client: TBD before testing.

**Desktop-only dependencies.**

Check touch riding and docking against the [mobile feature-gap tracker](https://github.com/decentraland/godot-explorer/issues/2402), then test on devices.

## 7. World, Look & Story

**Story / world**

The NPC Guide welcomes riders to a tropical island and dock. At sea, you hunt smaller fish and escape larger ones.

**Visual direction.**

Your avatar rides a bright, growing fish with a white wake. Visible sizes, colored rings, and short prompts guide play. Keep the tropical island and wooden bridge.

## 8. Audience & Comparables

**Primary player + arrival context**

For players who enjoy survival games and collecting fish, alone or with friends, and want to grow and chase rivals.

**How the first group arrives**

Invite our contacts with a World link and playtest time. Bring 2–4 riders into the same server.

**Deliberately not for**

Players seeking a long solo story or equal-size PvP matches.

### Comparables

| | Comparable A — Decentraland: [Cozy Fishing](https://decentraland.org/places/world/cozyfishing.dcl.eth) | Comparable B — outside Decentraland: Little Fish, The Sandbox Game |
|---|---|---|
| What we observed works | Screenshot reference: clear NPC dialogue and choices. Gameplay review: TBD. | Our 2D solo game uses eating and growth. |
| What does not fit our audience or context—and why | Fit needs a playtest; chase and growth rules are unverified. | No avatar riding or player chases. |
| What we will do differently | Make fish riding, chases, and growth visible. | Add avatar riding, player chases, and parked-size saving. |

## 9. 4 Week Plan (v1 scope)

**Proposed V0 scope:** existing island, Common and Uncommon waters, four Index entries, the Hammerhead, and powerups. Deliver ride → grow → chase or dodge → park at the island dock → rejoin. Agree scope and timing with Creator Success.

The Hammerhead roams only in Common and Uncommon waters.

With 2–4 newcomers, target first action by 5 seconds and goal understanding by 10. Check unaided boarding, predator recognition, and saved size and Index after park/rejoin. Observe unprompted repeat rides and growth pace. Results: TBD.

**Provisional V1 outlook, after V0 review:** five populated areas, ending at Legendary. Each favors its rarity, with rarer visitors. Keep Mythic fish; remove their separate area. Mythic spawn areas and catch-size rules: TBD.

The main social test is the Mythic hunt: a spawn alerts everyone but hides its location. Players search and chase rivals; the server confirms one winner. Observe hunt participation and repeat rides.

V1 includes a coin shop, leaderboard, nearly complete Index, 20 players, UTC species rotations, and friend-based Legendary/Mythic spawn bonuses. Items/prices, scoring, species count, and tuning: TBD. Size and catch rules still apply.

| Week | What is playable / done |
|---|---|
| 1 — Prototype definition | Resolve V0 issues. Set growth, species, Mythic rules, shop items, and leaderboard rules. |
| 2 — Core interaction + first-group test | Populate five areas through Legendary. Test gates and prototype Mythic hunts. |
| 3 — Core systems refinement | Add the shop, leaderboard, rotations, friend bonuses, and most species. Verify one hunt winner. |
| 4 — Playable release, including testing and deployment | Test saves, purchases, hunts, repeat rides, and 20-player desktop/mobile performance. Fix issues and publish. |

**What keeps the experience changing after launch**

- Riders change chases; UTC rotations change dominant species. Timing: TBD.
- NPC respawns and chases vary routes even without updates.
- Loss resets size; discoveries and coins stay. Test newcomer recovery despite larger riders.
- If riders stop returning, review growth pace, losses, and collection goals.

**Not building in v1**

1. Mythic area: V1 ends at Legendary. Keep Mythic fish and the shared hunt. Revisit the area after V1; timing TBD.
2. Rebirth, trading, and formal crews.

**Top risk + fallback.**

An unreliable save can erase a large fish. Preserve stored data after failed loads and prioritize park/rejoin fixes. Cutting the Mythic area reduces V1 work while keeping its shared hunt.

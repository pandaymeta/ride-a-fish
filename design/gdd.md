# Ride A Fish

**Game Design Document | Decentraland Creator Success**

**Studio** Pandaymeta Studio

**Contact** @Entenium on Discord · pandaymetastudioph@gmail.com

**World** Entenium (entenium.dcl.eth) · **Date** 3 November 2026

## 0. TL;DR

| | |
|---|---|
| Player promise | Ride a fish around a tropical island. Eat smaller fish, grow big enough to chase your rivals, and get back to the dock safely. |
| Primary player | For players who like quick survival games and collecting creatures, whether they arrive alone or with friends. |
| Current status | The Decentraland sample is open for public testing. Board, swim, grow, dodge the shark, and dock. The Fish Index has four collectible species. [Play the test scene](https://decentraland.org/jump?realm=entenium.dcl.eth) · [Project repository](https://github.com/pandaymeta/ride-a-fish) |
| Requested round | V0, first Creator Success application. |
| Proposed V0 | Playtest the first ride solo and with a rival. Check whether new players understand the chase and choose to ride again. |

## 1. Player Promise

Ride a fish around a tropical island. Eat smaller fish, grow big enough to chase your rivals, and get back to the dock safely.

This game is an upgraded version of "Little Fish," a 2D single player experience we published on The Sandbox Game platform. In Decentraland, we want you to feel like you are actually riding the fish. Your own avatar sits on the fish as it turns, jumps, and grows beneath you.

## 2. First Minutes & How to Play

| Time | Player experience |
|---|---|
| 0–5 seconds after control | You spawn on the island path. A movement hint appears and a red arrow points to the NPC Guide by the dock. |
| 5–10 seconds | You walk towards the NPC Guide. Press E near NPC for a short welcome, and she will direct you to your fish. |
| 10–60 seconds | Press E beside your fish to step aboard. Follow the white trail to green food, then to a fish you can eat. You see your fish grow. |
| 1–3 minutes | You eat a smaller fish and discover it in the Index. A Speedbooster gives you a burst of speed. A Shield protects you from being eaten. |
| 3–10 minutes | You choose whether to chase a rival, find another species, or head back before the shark catches you. |
| Natural stopping point | You press E at the dock. Your fish parks at its current size, and you can check your discoveries or ride out again. |

**How to play**

- Press E on fish to ride it.
- Eat green food and smaller fish.
- Escape bigger predators. Press E to dock.

The NPC Guide's six-item checklist guides your first ride, food, fish, both power-ups in either order, and return to the dock. The arrows update as you play. The shark and other riders cannot eat you until you eat your first fish. You can dock early, and the movement and jump hints stop after the tutorial.

## 3. Core Loop

| Step | What you do and what happens | Why repeat it |
|---|---|---|
| 1. Board | Press E by your fish and step off the dock into the seat. A fresh fish starts at size 1. | A new run starts with small, easy targets. |
| 2. Steer | Use WASD to turn and Space to jump. The fish rocks with the swell, banks on turns, and leaves a wake. | Learn when to turn, jump, or take a different route. |
| 3. Eat | Swim into green food or strictly smaller fish. Your fish grows visibly. A new species fills a slot in the Index. | Every catch changes what you can hunt. |
| 4. Escape | Break away from larger riders or the Hammerhead. Use a Shield or ride through a Speedbooster when you see one. | A rival can cut you off, give up the chase, or become your next target. |
| 5. Dock | Press E near the dock to step onto the planks. Parked fish keep their size and cannot be eaten. If eaten at sea, you respawn on the island with a fresh run available. | Take a break from the chase, then get back on the same fish. |

**Session targets** First growth within one minute, first satisfying loop in about two to three minutes, typical visit five to ten minutes. We will time these in playtests. The arena runs continuously. On later rides, a rival's route or a fish you still need can change where you head next.

**Pillars** A fish you can feel beneath you. Growth you can see. A hunt that changes when someone else joins.

The sample has 60 green food pickups, five Blue Tangs (size 2), two Reef Angelfish (6), one Red Reef Fish (18), and one roaming Hammerhead (1,000). Food adds one size. Equal sizes cannot eat each other. The three smaller species stay in place until eaten. The Hammerhead chases smaller riders and flees larger ones.

## 4. Why Players Come Back

**4.1 Next day** Before leaving, a player spots a missing fish in the Index and checks the island schedule. If the next window is tomorrow at 13:00 UTC, they have a time to come back and can invite a friend to race for it.

**4.2 Progression** Eat a new species → save the discovery → pick a harder target → learn a better route or bring a friend to help find it.

| When | What lasts and what you can do next | What others see |
|---|---|---|
| First visit | The Index keeps your first discoveries after defeat. Pick a missing fish for your next ride. | Your name and current fish size in the arena. |
| First week | Plan a harder catch with what you have learned, or try to beat your best size. | The planned island board shows the best sizes across servers. |
| Week three onward | Planned fish windows and monthly events give collectors new targets. | Riders can meet for the same spawn and recognize familiar rivals. |

You open the Index and see which fish you still need. A rider you remember from yesterday is heading out, so you try a different route to beat them to the next catch. You can lose the chase and still keep a discovery.

Coins come from food and fish pickups. The sample saves your balance.

**4.3 Reasons to return**

| Hook | Trigger | Why come back and how you know |
|---|---|---|
| Timed fish discoveries | The planned island schedule shows the next daily window for a featured fish. The Index saves each species on its first catch. | Check which fish you still need and plan your next visit around its spawn. A shared countdown gives friends a time to meet. |
| Beat your best | The planned island leaderboard will rank players by their best fish size across runs. | Come back to beat your record and try to earn a place in the global top 20. |

## 5. Social by Design

| | |
|---|---|
| Repeatable social loop | You race another rider to a fish. They can cut you off, chase you, or turn away. Whoever eats first grows, and the chase can reverse on the next pass. |
| If others leave | Solo players can ride, collect fish, and evade the Hammerhead. Human pursuit, contested catches, and rematches depend on other riders. |
| Meeting players | The shared dock puts arrivals in one place. Names above riders make it easy to recognize a rival without using chat. |
| Recognition across visits | You remember who chased you and how they moved. Seeing that rider again can change your route or give you a reason to challenge them. |
| Player counts | Two riders are enough for a chase. The verified maximum is 10 riders. |
| Drop in and out | Players board when a dock spot is available. The arena keeps running as riders join, dock, or leave. Test full dock slots and disconnects with the first group. |
| Visible play | From the dock you can see a named rider grow, turn, and chase the fish that was just chasing them. |
| Shareable moment | A tiny rider jumps out of the Hammerhead's path and lands in a white splash. |
| Bring a friend | Invite a friend back to race for the same rare catch or settle a close chase. |

### Planned leaderboards

- **Live server leaderboard.** A small HUD panel in the top-right corner shows the three largest fish being ridden on your server, with each rider’s name and current fish size. Your own row sits beside the top three and shows your name, size, and rank, even when you are outside the top three. The board updates as riders grow, board, dock, or leave.
- **Global leaderboard.** A billboard on the island shows the top 20 players across servers, with their rank, name, and best fish size. Each player has one entry. Their best size stays on record after they leave, giving them a score to beat on their next visit.

## 6. Mobile-First

The sample uses desktop controls. This is the touch plan to test on the Decentraland mobile client.

| Core verb | Planned touch control |
|---|---|
| Board | Tap a large Ride prompt by your fish. |
| Steer | Use a thumbstick to swim, drag to look, and tap Jump. |
| Eat | Swim into the pickup or smaller fish. |
| Escape | Turn with the stick or tap Jump. Speed and Shield activate on contact. |
| Dock | Tap Dock when close to the planks. Tap the book to check your Index. |

Keep action prompts in thumb reach and leave the rider clear of overlays. Test boarding, seating, camera, and docking on touch before adding more content. Targets are 60 fps on recommended desktop hardware and 30 fps on Android at the target player count. The Android device, client build, and measured performance are TBD.

## 7. World, Look & Story

The NPC Guide welcomes you on a small tropical island with a wooden dock. The sea around it is the arena, and the dock gives you a safe place to stop and watch.

Use bright fish against blue water, clear size numbers, and a parchment Fish Index. The scene's signature is a visible avatar riding a growing fish, banking over the swell with a white wake behind it.

## 8. Audience & Comparables

For players who like quick survival games and collecting creatures, whether they arrive alone or with friends.

We plan to invite the first group through our existing contacts and share one World link and playtest time. The game should also work for players who find it on their own.

**Audience boundary** The focus is short, active arena sessions and fish collecting.

| Reference | What we take from it | What we change |
|---|---|---|
| Little Fish, The Sandbox Game | In our 2D single-player game, you control the fish from inside it. It swims around the map, eats NPC fish, and grows with each catch. | In Decentraland, your avatar rides on top of the fish. You can compete with other riders and park safely at the dock. |
| Fishing Game, Decentraland | In our reference view, the shore and dock show where the player starts, and the guide uses a parchment panel. | Use the dock to board a moving fish and the book to track what you eat. |

## 9. Four Week Plan

**Application sample** The public test scene shows the ride, eat, grow, escape, and dock loop. V0 scope is subject to agreement with Creator Success. [Play Ride A Fish](https://decentraland.org/jump?realm=entenium.dcl.eth)

**Proposed V0 playtest** In the published World, ask fresh players to join with no coaching. Aim for at least 80% to take a useful action within five seconds and explain their immediate goal within ten. Watch whether they find the dock, board, and see their fish grow within one minute. Run a solo session and a two-player session. Check whether riders read the size numbers, know when to chase or flee, and choose another ride after docking or defeat. Use what we learn to tune onboarding and the first chase.

The V0 playtest focuses on the first ride. The fish skin shop, leaderboards, and seasonal fish are planned for later.

**Proposed V1 plan after V0**

| Week | What we will build or check |
|---|---|
| 1 | Fix the onboarding issues found in V0 and test touch boarding early. |
| 2 | Run a group test with four players. Check contested catches, shark contact, voluntary retries, full slots, docking, and rejoining. |
| 3 | Tune starter food, protection, and chase balance. If the core loop is stable, test the shared countdown and timed rare fish. |
| 4 | Test mobile controls and frame rate, verify saved discoveries, and prepare the V1 update. Track first-week returns after release. |

**Planned content after launch**

- **Fish collection.** Add timed and seasonal species to the Index. A planned shared countdown shows the next guaranteed Mythic (every 30 minutes) and Secret (every hour), on UTC boundaries.
- **Fish skin shop.** Let players spend earned coins on skins for their rides.
- **Leaderboards.** Add the live server top three and the island’s global top 20 billboard. Playtest whether players understand both rankings and come back to improve their best size.

**Top risk and fallback** If first-time players get stuck at the dock, shorten the guidance and test one clear Ride action before expanding the tutorial. If touch seating is unreliable, prioritize a reliable board-and-dock transition before adding optional motion effects.

**Open submission items** Confirm rights for reused assets and screen the public title. Record the required Featured-game visits and lessons in the application, and confirm reviewer access to the repository. [Creator Success onboarding](https://docs.decentraland.org/creator/studio-onboarding)

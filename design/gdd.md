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
| Live at the end of V0 | In our World, players can ride, compete for fish, escape predators, and dock with their discoveries saved. |

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

**4.1 Next day** Players can return to hunt a fish missing from their Index. Planned spawn timers will show when rare fish are due, and a future shop will let players save up for a favorite fish skin.

**4.2 Progression** Eat a new species → save the discovery → pick a harder target → learn a better route or bring a friend to help find it.

| When | What lasts and what you can do next | What others see |
|---|---|---|
| First visit | The Index keeps your first discoveries after defeat. Pick a missing fish for your next ride. | Your name and current fish size in the arena. |
| First week | Plan a harder catch with what you have learned. The planned shop will let you save coins for a fish skin. | Other riders can see the skin you equip. |
| Week three onward | Planned fish windows and monthly events give collectors new targets. | Riders can meet for the same spawn and recognize familiar rivals. |

You open the Index and see which fish you still need. A rider you remember from yesterday is heading out, so you try a different route to beat them to the next catch. You can lose the chase and still keep a discovery.

Coins come from food and fish pickups. The sample saves your balance. The planned shop will let you spend coins on fish skins.

**4.3 Two return hooks**

| Hook | Trigger | Why come back and how you know |
|---|---|---|
| The next discovery | The Index saves a species on its first catch. Planned spawns make higher rarities less likely, with one guaranteed Mythic every 30 minutes and one Secret every hour, on UTC boundaries. | The Index shows what you are missing. A shared map countdown will show the next guaranteed spawn so friends can meet for it. |
| Fish skins | The planned shop will sell fish skins for coins earned in the arena. | Pick a skin to save for and use it on future rides. |

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

**Application sample** The public test scene shows the ride, eat, grow, escape, and dock loop. V0 scope is subject to agreement with Creator Success. The following is the proposed V1 plan after V0. [Play Ride A Fish](https://decentraland.org/jump?realm=entenium.dcl.eth)

| Week | What we will build or check |
|---|---|
| 1 | Watch first-time players find the dock and board. Aim for 80% to take a useful action within five seconds and explain the immediate goal within ten. Test touch boarding early. |
| 2 | Run a group test with four players. Check contested catches, shark contact, voluntary retries, full slots, docking, and rejoining. |
| 3 | Tune starter food, protection, and chase balance. If the core loop is stable, test the shared countdown and timed rare fish. |
| 4 | Test mobile controls and frame rate, verify saved discoveries, and prepare the V1 update. Track first-week returns after release. |

**Planned content after launch**

- **Fish collection.** Add species to the Index, with timed and seasonal fish that give players a reason to return.
- **Fish skin shop.** Let players spend earned coins on skins for their rides.

**Top risk and fallback** If first-time players get stuck at the dock, shorten the guidance and test one clear Ride action before expanding the tutorial. If touch seating is unreliable, prioritize a reliable board-and-dock transition before adding optional motion effects.

**Open submission items** Confirm rights for reused assets and screen the public title. Record the required Featured-game visits and lessons in the application, and confirm reviewer access to the repository. [Creator Success onboarding](https://docs.decentraland.org/creator/studio-onboarding)

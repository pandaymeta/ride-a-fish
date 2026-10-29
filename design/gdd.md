# Ride A Fish

**Game Design Document**  
**Decentraland Creator Success Program**

| | |
|---|---|
| Public experience title | Ride A Fish. IP and [Content Policy](https://decentraland.org/content/) status: asset ownership and reuse permissions TBD; name screening of the new title not completed. |
| Deployment target | Entenium (entenium.dcl.eth). Public scene URL pending deployment. |
| Studio / team name | TBD: applicant or studio name and team composition. |
| Date | October 30, 2026 |
| Contact (Discord + email) | TBD: Discord handle and application email. |

## 0. TL;DR

| | |
|---|---|
| **Player promise** | Become a fish in a shared sea. Eat smaller fish to grow, complete your Fish Index, and survive larger player fish. |
| **Primary player** | For players who enjoy short survival arenas and creature collecting, arriving alone or with friends, looking for quick competition and lasting discoveries. |
| **Current status** | Adapted from the existing Little Fish Roblox arena. The local SDK7 sample has three species, four active players, a 128 x 128 metre playable sea, and an elevated wooden spectator stage. Fish transformation replaces the earlier riding design. Source: https://github.com/pandaymeta/ride-a-fish. Public deployment, two-client playtests, and Android validation remain pending. |
| **Requested round** | V0, the first Creator Success application, for the program's $1,000 vertical slice. Scope and delivery dates remain subject to agreement. |
| **Live at end of the round** | A player spawns as their normal avatar on the wooden stage, enters its floor circle, becomes a growing fish in the sea, collects species, and returns to their avatar in the lobby when eaten or choosing to leave. The proposed V0 index contains six species. |

Ride A Fish centers on fish transformation, arena eating and growth, and a permanent Fish Index. Entering the glowing floor circle teleports the player into the sea and hides their human avatar. They directly control a growing fish; there is no visible player, seat, or sitting animation. Other players and spectators see the player-controlled fish. Being eaten by a larger player fish ends the run and restores the normal avatar on the wooden stage. NPC fish and food are stationary. NPCs never move, chase, attack, or eat players. A player must be strictly larger to collect an NPC; larger NPCs are harmless. Consumed fish and food respawn at their original positions. Other counts, timings, and progression features below remain proposed values for playtesting.

## 1. Player Promise

**One-line promise**

Become a fish in a shared sea. Eat smaller fish to grow, complete your Fish Index, and survive larger player fish.

**One familiar comparison**

A fish eat-and-grow survival arena with an elevated wooden spectator lobby and a permanent discovery album.

**Why this game**

I created Little Fish in Roblox Studio, including its arena eating and growth mechanics. Ride A Fish adapts that food-chain tension into a focused Decentraland experience: become a fish in the sea, compete for growth and discoveries, then return to the wooden spectator lobby as your normal avatar.

## 2. First Minutes & How to Play

| Time | Player experience |
|---|---|
| **0–5 seconds after control** | You spawn on foot on a wooden stage eight metres above the water, overlooking the arena. A glowing teleport circle lies five metres ahead on the floor. |
| **5–10 seconds** | You step into the circle, teleport into the sea, and become a starter fish. Stationary food, numbered fish, and rival warnings show your goal. |
| **10–60 seconds** | You swim through food and eat a smaller NPC fish. Your fish grows and the NPC species fills a saved index entry. |
| **1–3 minutes** | You choose safe growth or a risky new catch while larger rival fish threaten your fish. Larger NPC fish are harmless but cannot be eaten yet. A rival can force a different route. |
| **3–10 minutes** | Another player eats your fish or you choose to return. You arrive in the lobby, review discoveries, and enter the portal again when ready. |
| **Natural stopping point** | The lobby shows your run result, saved index, and today's and tomorrow's targets. You can leave safely or choose your next hunt. |

**Player-facing How to Play**

- Enter the circle and become a fish.
- Eat smaller fish to grow your size.
- Avoid bigger players; complete your Fish Index.

## 3. Core Loop

| # | Step (verb) | What the player does (Player input → what they see or hear → what changes) | Why do it again? |
|---|---|---|---|
| 1 | Enter | Walk into the stage floor circle → teleport to the sea on a starter fish → begin a fresh arena run. | You choose when to take the next risk. |
| 2 | Seek | Steer your fish toward food or a missing species → target cues → choose a route through the sea. | An unfinished index suggests a specific next catch. |
| 3 | Eat | Swim into edible prey → bite feedback → only the fish grows; new NPC species enter the index. | A larger fish opens larger prey and different routes. |
| 4 | Evade | Turn away from a threat → a rival player follows or loses your fish → escape keeps the run alive. | Human players make pursuit and timing unpredictable. |
| 5 | Review | Lose your fish or choose to return → teleport to the lobby → review discoveries and choose whether to re-enter. | Saved progress and a new target make another run worthwhile. |

| | |
|---|---|
| **One complete loop takes** | A food-to-fish encounter targets 30–60 seconds. A full lobby-to-sea-to-lobby run targets two to five minutes but has no fixed timer; food growth and discoveries give earlier rewards. |
| **Decision, challenge, or expression** | Choose safe growth, a risky discovery, or a player chase. Route selection and deciding when to abandon prey matter more than repeated eating alone. |
| **Shortest satisfying visit / typical session** | Target two minutes / five to ten minutes. A short visit can save a discovery; a typical visit covers several portal entries. Duration is untested, and leaving the sea is always available. |
| **Why repetition 10 remains appealing** | Rival players, fixed resource locations, replenishing food, contested NPC catches, and a chosen index target alter each run. Fish appearances express collection progress; every portal entry starts at the same fish size. |

**Pillars**

1. Make fish transformation, numerical size, and edible targets immediately readable.
2. Make steering matter through pursuit, escape, and route choices.
3. Keep discoveries permanent while the safe lobby makes retrying a choice.

**Arena rules**

Each circle entry starts the player as a fish at size 1. Food adds 1. Contact automatically eats a fish only when the player fish is numerically larger; equal sizes cannot eat one another. Eating adds the prey size. The visible fish mesh and eating bounds grow, with a visual scale cap for readability. The human avatar is hidden in the arena, so growth has no player alignment or avatar scaling dependency.

Only player-controlled fish are predators. NPC fish are stationary collection targets: they never move, chase, eat food, grow, or harm a player, regardless of their number. A player must be strictly larger to eat an NPC; an equal or larger NPC simply remains in place. The application sample has 18 Clown Fish (size 2), 12 Puffer Fish (size 6), and 6 Reef Sharks (size 18), plus 180 stationary food items. Food respawns after four seconds and NPC fish after eight seconds, at the same positions. V0 proposes six species and V1 twelve, all using these static collection rules. Eating checks use the fish rather than the player avatar; appearances grant no size or speed advantage.

The sea is a continuous shared arena with individual runs. Fish and food replenish while players enter and leave independently. A proposed ten-second entry shield prevents the fish from dealing or receiving player-eating damage, and sea entry points stay away from immediate threats.

**Lobby and run flow**

All initial spawns and respawns occur as the normal avatar on a 64 x 12 metre wooden spectator stage, eight metres above the water at the north edge. Low railings and open sightlines let waiting players watch the arena. Eating and growth are disabled here. The playable sea is 128 x 128 metres within one 160 x 160 metre World scene (10 x 10 parcels). A glowing horizontal circle on the deck teleports the player into the sea and activates their fish form. There is no upright doorway. Entry checks include height, so passing below the stage does not trigger it. An accidental fall from the stage returns a waiting player to its spawn.

When a larger player fish eats the player, the server ends the run, removes that fish, and returns the player to the lobby with their normal avatar visible again. Re-entry requires walking into the circle. Return to Lobby also ends a run safely. Leaving or disconnecting removes the player fish. Run size resets; confirmed index entries, personal records, and future fish appearance unlocks persist.

**Fish Index rules**

The fish eating an NPC records that species immediately. The index stores a discovered flag, capture count, and largest captured specimen; duplicates update records without creating inventory items. Eating another player's fish grants growth but never a species discovery. Losing a fish, returning to the lobby, and leaving do not erase confirmed discoveries.

Undiscovered entries show silhouettes and useful location or size hints. V1 adds fish appearances at 3, 6, and 12 discoveries, selected in the lobby before entry. These are scene-only fish forms with identical starting size and speed. Human avatars are visible only in the lobby; in the sea, player names appear above their fish. Completing the catalog adds a full-collection display beside their in-scene name. No captured fish need feeding, placement, selling, or storage management.

## 4. Why Players Come Back

### 4.1 The next-day (D1) sentence

> A player who enjoyed their first session returns the next day because tomorrow's named target species offers a fresh catch and hunt, previewed in the lobby beside their unfinished Fish Index.

### 4.2 The progression chain

> Eat a new NPC species → save its index entry → earn a fish appearance → choose a more demanding catch or help a friend find that species.

| Moment | What persists or has been built? | What becomes possible next? | How can another player tell? |
|---|---|---|---|
| **End of first session** | First species entries, personal best fish size, and a selected next target. | Use a behavior hint to plan the next portal run. In V1, three entries unlock the first fish appearance. | Discovery count appears beside the player's in-scene name. |
| **End of first week** | A broader index and earned fish appearances; completion speed is untested. | Pursue difficult species, compare discoveries in the lobby, or enter with a friend for a shared hunt. | Player names, selected fish forms, and collection counts identify returning competitors. |
| **Week 3+ — what takes more than two weeks?** | The complete index and specimen records remain. No two-week unlock or completion duration is promised. | Continue player rivalry and target hunts after collection completion. TBD: playtests must establish whether these sustain repeat visits. | Full-collection recognition and fish appearance remain visible. |

You return to the lobby and select a fish appearance earned from your discoveries. A familiar player enters the portal with you, and you follow their route toward a species you still lack. Your fish catches it before a rival player eats your fish and sends you back to the lobby. The entry stays saved, and your next portal entry starts a fresh fish.

Currency or tradable rewards: none. The Fish Index, fish appearances, and personal records are the persistent progression.

### 4.3 Two return hooks

| Selected hook | Exact trigger or timing | What the player anticipates | Reminder channel + no-reminder fallback |
|---|---|---|---|
| **1. Collection** | First catch saves each species; V1 milestones occur at 3, 6, and 12 discoveries. | A missing silhouette becomes a known fish and eventually a fish appearance to select in the lobby. | The lobby index and run results show progress and a pinned next target. No external reminder is required. |
| **2. Daily target hunt** | One eligible species rotates at 00:00 UTC. Catch it three times for a dated stamp in the index. Tomorrow's species is previewed. | A specific hunt to attempt tomorrow, including with a returning rival or friend. | The lobby and run results show the target and reset time. No streak loss or exclusive species; all species remain obtainable every day. |

The daily target uses the existing species pool and requires no daily content production. It begins in V1; V0 tests collection interest without claiming next-day return has been proven.

## 5. Social by Design

| | |
|---|---|
| **The repeatable social loop** | Player A approaches shared prey → Player B contests it, diverts, or chases A's fish → the catch changes their fish sizes → a defeated player returns to the lobby and can re-enter for a rematch. |
| **The disappearance test** | Live player pursuit, contested catches, and recognizable rivals disappear. Solo NPC collecting and index completion remain complete activities, but their enjoyment must also be tested. |
| **From strangers to a group** | Players meet on foot on one wooden spectator stage, watch the live arena below, and use the same glowing floor circle. Names and fish-size cues identify competitors; entering near another player creates shared prey opportunities without voice or a common language. |
| **Recognition & continuity** | Players meet as their recognizable avatars in the lobby. In the sea, a name above each player-controlled fish links that fish to its player. Returning competitors retain their collection progress and future fish appearance unlocks. |
| **Quiet hours & player counts** | Alone, a player can enter the portal immediately, swim, collect NPCs, and fill missing entries on a fresh server. Social threshold: two players; ideal group: four to eight; V1 target: eight concurrent players across lobby and sea; V0 test target: four. Counts are untested. One shared lobby and portal concentrate arrivals; a scheduled first-group playtest creates initial overlap. |
| **Drop-in / drop-out** | New arrivals begin in the lobby and enter the sea when ready, without a queue or shared round start. Disconnecting removes only that player's fish, without rewards or mass transfer; other runs continue. Safe lobby space, protected entry, and distributed food reduce repeated spawn hunting. |
| **Visible play (the bystander test)** | From the wooden stage, a spectator watches a small named fish grow until it can chase a former threat. |
| **Shareable play (the memorable moment)** | A tiny player fish grows enormous, escapes a rival, and completes a missing index entry. |
| **Bring-a-friend** | After returning to the lobby, a player wants a friend to enter the portal alongside them for a rematch or parallel hunt. Their arrival adds a recognizable player whose route and choices change the outcome. |

## 6. Mobile-First

**Every core-loop verb on touch**

| Core-loop verb | How it works with touch controls |
|---|---|
| Enter | Walk into the floor circle with the movement joystick; teleportation and transformation follow automatically. |
| Seek | Use the movement joystick to swim as the fish; food and targets remain visible without hovering. |
| Eat | Swim into valid prey; eating happens automatically without a precision tap. |
| Evade | Change joystick direction; the follow camera keeps the fish and nearby threats visible. |
| Review | Losing the fish returns you to the lobby automatically. Tap the index to inspect or select a target; a large Return to Lobby action also ends a live run. |

**UI plan**

In the sea, show fish size, discoveries, and a reachable Return to Lobby action. Keep the player fish clear of HUD overlays. In the lobby, show run results and the index on request, keeping the spectator view unobstructed. Use large touch targets, short labels, and shape cues alongside color.

**Performance**

Targets are 60 fps on recommended desktop hardware and 30 fps on the Decentraland Android client at eight players, including the maximum visible player fish, static NPCs, food, and lobby avatars. The actual mobile device and client build are TBD; no performance result is claimed. Profile four players first. Use low-poly fish, one textured material per fish model, pooled food, capped NPC counts, simple distance checks, and limited transparent effects.

**Desktop-only dependencies**

No gameplay requires voice, direct messages, platform profile badges, hover, keyboard-only actions, sitting emotes, or moving avatar platforms. Fish transformation, touch steering, avatar visibility restoration, and lobby-to-sea transitions must pass capability tests on both clients. Android integration remains unverified.

**Decentraland implementation**

Build an SDK7 scene in TypeScript using the Roblox arena design and cleared art assets. The elevated spectator stage and 128 x 128 metre sea share one 160 x 160 metre World scene. The floor circle teleports the player into the sea. A static AvatarModifierArea hides human avatars throughout the sea, while each client renders the authoritative player fish. The stage lies outside that volume, restoring normal avatar visibility on return.

The server-controlled fish is the active gameplay body. The client locks normal avatar locomotion, sends steering input, and follows the fish with a VirtualCamera. No seat, riding pose, bone attachment, or moving platform is required. Restore normal walking, touch controls, and camera when returning to the stage. Names above the fish provide player identity while native avatar nametags are hidden.

Use the documented Multiplayer Server for shared state and validated eating. Track lobby, transforming, fish, and returning states; allow one active fish per player. Only player fish may initiate eating; static NPCs must never cause a loss. Resolve catches and return events once, reject impossible movement and duplicate rewards, and preserve discoveries across transitions. Save against authenticated identity, confirm successful writes, and retry failures. Explain guest save limits before play.

## 7. World, Look & Story

**Story / world**

From the wooden spectator stage, watch the sea arena, then step into a glowing floor circle and become a fish. Feeding makes you larger, while each new NPC species you eat adds a discovery to your field guide.

**Visual direction**

Use colorful, blocky fish with their original colors baked into image textures. The wooden lobby overlooks blue water and has a glowing floor circle. Bright food trails and size values make collecting readable. Gold NEED labels mark harmless NPCs requiring more size; red DANGER labels mark larger rival player fish. A YOU label identifies the local player. The signature shot is a huge named fish chasing a smaller player fish while spectators watch from above. Camera framing adapts to fish growth; planned bite and discovery sounds support mute.

## 8. Audience & Comparables

**Primary player + arrival context**

For players who enjoy short survival arenas and creature collecting, arriving alone or with friends, looking for quick competition and lasting discoveries.

**How the first group arrives**

Invite a small group through the applicant's existing contacts and an announced Decentraland playtest, using one time and World link to reach the two-player threshold. After a playable release, use a clear Discover listing and share the same World link; community outreach is planned, not an existing partnership claim.

**Deliberately not for**

Players seeking building systems, passive farming, trading, or a long narrative campaign.

### Comparables

| | Comparable A — outside Decentraland: Little Fish Roblox version | Comparable B — outside Decentraland: Agar.io |
|---|---|---|
| What we observed works | Local source inspection confirms contact eating, size growth, NPC pursuit and escape, and recording caught fish. Audience response and retention are not measured here. | Miniclip's official guide describes a clear larger-eats-smaller rule and mobile joystick control. This is a documented design reference, not an applicant playtest report. |
| What does not fit our audience or context—and why | Pond management, multiple currencies, merging, and shops compete with the focused arena-and-index visit. | Splitting and ejecting mass add actions beyond this version's simple steering and discovery goals. |
| What we will do differently | Focus on becoming a fish, connect the spectator stage and sea through a floor circle, remove NPC movement and attacks, and retain the permanent index. | Add fish species discovery, recognizable player names, collection goals, and a safe spectator lobby to the larger-eats-smaller rule. |

References: existing local Roblox backups dated June 2, 2026; [Miniclip's Agar.io guide](https://support.miniclip.com/hc/en-us/articles/4404685562641-How-to-start-playing-Agar-io). Applicant notes from the required Decentraland Featured-game visits remain TBD and must describe actual play.

## 9. 4 Week Plan (v1 scope)

**Application test scene and requested V0**

Before applying, publish the application sample showing stage spawn as a normal avatar, floor-circle entry, transformation into a growing fish, collecting a smaller static NPC, and avatar restoration on return. The sample has three species, 36 static NPC fish, 180 stationary foods, and four active players in a 128 x 128 metre sea. It is separate from the funded vertical slice. The repository contains the sample, this document at `design/gdd.md`, and the README. Public deployment and its README link remain pending.

The proposed V0 slice contains one spectator lobby, one circle-linked sea arena, direct fish transformation, six NPC species, validated eating, protected entry, avatar restoration after defeat, and a persistent index. Test four players across both locations. Prove fish controls, camera, remote fish visibility, and repeated transitions before expanding species. V0 dates and available hours are TBD with the program; the V1 plan begins after V0 succeeds and scope is agreed.

| Week | What is playable / done |
|---|---|
| 1 — Prototype definition | Review V0 findings; stabilize fish movement, transformation and avatar restoration, camera framing, and reconnecting index saves. |
| 2 — Core interaction + first-group test | Test four players entering and leaving independently, contested catches, fish loss, lobby return, and portal re-entry; observe comprehension and voluntary retry. |
| 3 — Core systems refinement | Expand to twelve species if the transformation flow is stable; add index milestones, lobby fish appearance choices, the daily target, and run results. Tune entry safety and food. |
| 4 — Playable release, including testing and deployment | Profile eight player fish on desktop and the named Android device; verify remote fish visibility, avatar restoration, saving, and repeated lobby returns; publish the World and update the repository and GDD. |

**What keeps the experience changing after launch**

- Variation comes from live opponents, contested static fish, replenishing food, and the automatically rotating target species.
- If a content update is skipped, the full species pool, daily target, and repeatable arena remain available.
- Each portal entry starts a fresh fish; index entries and fish appearances persist. Newcomers target a useful catch within their first minute in the sea.
- If players fill the index but stop returning, test whether better PvP balance or collection goals improve repeat play before adding more species.

**Not building in v1**

Standing non-goals: ponds, tycoon income, and passive farming. This adaptation centers on active arena play and discovery. Also excluded are bag management, fish selling, and merging.

Defer additional arenas and more than twelve species. NPC movement, chasing, and attacking are outside this design. A V2 candidate is improved PvP balancing or a collection goal in the existing arena, chosen from playtest evidence. V1 has no currencies, trading, NFTs, paid power, paid revives, or player-to-player mass gifting.

**Top risk + fallback**

The main technical risk is consistent transformation, input, camera, and avatar visibility on desktop and Android. Prove a full lobby-to-fish-to-lobby cycle repeatedly, including loss, voluntary return, and reconnect. If necessary, simplify the follow camera and cap visual fish growth while preserving numerical size. A human player is not part of this design. Multiplayer catch fairness is a second risk: validate on the server, test simultaneous approaches, and reduce player count or simplify eating bounds if necessary.

**Validation and success criteria**

Observe ten first-time testers against the 5/10 rule: at least eight enter the circle within five seconds and state the become-a-fish and eating goal within ten, without coaching. Observe voluntary re-entry, contested catches, and recognition of player names. Verify the avatar is hidden throughout arena play and visible again in the lobby, textures render on all fish, remote players see the correct player fish, and stage spawn, spectator views, circle height checks, and PvP return work. NPCs must remain static and harmless, only strictly smaller fish can be collected, and resources must respawn at fixed anchors. Repeated transitions and reconnects preserve discoveries and never create duplicate fish.

Use the program dashboard for first-week return once the game is live. The template names a V1 floor above 10% and a program target above 20% dashboard D7; both are evaluation thresholds, not forecasts or current results. No custom retention dashboard is part of scope.

**Platform references**

- [Creator Success onboarding](https://docs.decentraland.org/creator/studio-onboarding) and the downloaded official GDD template define the application format and staged scope.
- [Multiplayer Server](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers) documents shared validation and persistence; [camera controls](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/camera) and [on-screen controls](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/touch-screen-controls) inform the proposed presentation.
- [Entity positioning](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/entity-positioning) informs the separation of fish transforms and avatar position. AvatarModifierArea visibility and VirtualCamera behavior require desktop and Android capability checks.
- [Mobile feature parity tracker](https://github.com/decentraland/godot-explorer/issues/2402), checked October 30, 2026. The project still needs a client-level capability test.

- [Imported model materials](https://docs.decentraland.org/creator/3d-modeling-and-animations/materials) lists vertex painting as unsupported. Fish colors are baked to embedded PNG base-color textures instead.

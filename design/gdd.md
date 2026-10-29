# Ride A Fish

**Game Design Document**  
**Decentraland Creator Success Program**

| | |
|---|---|
| Public experience title | Ride A Fish. IP and [Content Policy](https://decentraland.org/content/) status: asset ownership and reuse permissions TBD; name screening of the new title not completed. |
| Deployment target | TBD: Decentraland World NAME and public scene URL. |
| Studio / team name | TBD: applicant or studio name and team composition. |
| Date | October 29, 2026 |
| Contact (Discord + email) | TBD: Discord handle and application email. |

## 0. TL;DR

| | |
|---|---|
| **Player promise** | Ride a fish through a shared sea. Eat smaller fish to grow your mount and complete your Fish Index while avoiding larger predators. |
| **Primary player** | For players who enjoy short survival arenas and creature collecting, arriving alone or with friends, looking for quick competition and lasting discoveries. |
| **Current status** | Adapted from the existing Little Fish Roblox game and its local Arena and Lobby source backups. The Decentraland riding and portal mechanics are at design stage; a deployed test scene and repository links are TBD. |
| **Requested round** | V0, the first Creator Success application, for the program's $1,000 vertical slice. Scope and delivery dates remain subject to agreement. |
| **Live at end of the round** | A player can spawn in the lobby, enter the sea through a portal, ride a growing fish while their avatar stays normal size, return to the lobby when their mount is eaten, and save discoveries in a six-species Fish Index. |

Ride A Fish centers on mounted arena play and a permanent Fish Index. The confirmed flow is lobby spawn, portal entry, riding and growing a fish in the sea, then teleporting back to the lobby when the mount is eaten. Only the fish grows; the visible player avatar keeps its normal size. Mounts can eat smaller NPC fish and other players' smaller mounts. Other counts, timings, and progression features below remain proposed values for playtesting.

## 1. Player Promise

**One-line promise**

Ride a fish through a shared sea. Eat smaller fish to grow your mount and complete your Fish Index while avoiding larger predators.

**One familiar comparison**

A fish-riding survival arena with a safe shore lobby and a permanent discovery album.

**Why this game**

I created Little Fish in Roblox Studio, including its arena eating and growth mechanics. Ride A Fish adapts that food-chain tension into an experience where my Decentraland avatar rides an increasingly large fish, with a safe lobby between runs and an index that makes new species worth finding.

## 2. First Minutes & How to Play

| Time | Player experience |
|---|---|
| **0–5 seconds after control** | You spawn on foot in a safe lobby. A glowing sea portal and a fish-and-rider marker sit two steps ahead. |
| **5–10 seconds** | You walk through the portal and appear riding a starter fish in the sea. Food, a fish-size number, and threat cues show your goal. |
| **10–60 seconds** | You steer through food and eat a smaller NPC fish. Your mount grows beneath your unchanged avatar, and its species fills a saved index entry. |
| **1–3 minutes** | You choose safe growth or a risky new catch while larger mounts and NPCs threaten your fish. A rival can force a different route. |
| **3–10 minutes** | Your fish is eaten or you choose to return. You arrive in the lobby, review discoveries, and enter the portal again when ready. |
| **Natural stopping point** | The lobby shows your run result, saved index, and today's and tomorrow's targets. You can leave safely or choose your next hunt. |

**Player-facing How to Play**

- Enter the portal and ride your fish.
- Eat smaller fish to grow your mount.
- Avoid bigger mounts; complete your Fish Index.

## 3. Core Loop

| # | Step (verb) | What the player does (Player input → what they see or hear → what changes) | Why do it again? |
|---|---|---|---|
| 1 | Enter | Walk into the lobby portal → teleport to the sea on a starter fish → begin a fresh arena run. | You choose when to take the next risk. |
| 2 | Seek | Steer your mount toward food or a missing species → target cues → choose a route through the sea. | An unfinished index suggests a specific next catch. |
| 3 | Eat | Ride into edible prey → bite feedback → only the fish grows; new NPC species enter the index. | A larger mount opens larger prey and different routes. |
| 4 | Evade | Turn away from a threat → a predator follows or loses your mount → escape keeps the run alive. | Human riders make pursuit and timing unpredictable. |
| 5 | Review | Lose your mount or choose to return → teleport to the lobby → review discoveries and choose whether to re-enter. | Saved progress and a new target make another run worthwhile. |

| | |
|---|---|
| **One complete loop takes** | A food-to-fish encounter targets 30–60 seconds. A full lobby-to-sea-to-lobby run targets two to five minutes but has no fixed timer; food growth and discoveries give earlier rewards. |
| **Decision, challenge, or expression** | Choose safe growth, a risky discovery, or a player chase. Route selection and deciding when to abandon prey matter more than repeated eating alone. |
| **Shortest satisfying visit / typical session** | Target two minutes / five to ten minutes. A short visit can save a discovery; a typical visit covers several portal entries. Duration is untested, and leaving the sea is always available. |
| **Why repetition 10 remains appealing** | Rival riders, changing food availability, NPC movement, and a chosen index target alter each run. Mount appearances express collection progress; every portal entry starts at the same fish size. |

**Pillars**

1. Make the growing fish and its normal-size rider readable together.
2. Make steering matter through pursuit, escape, and route choices.
3. Keep discoveries permanent while the safe lobby makes retrying a choice.

**Arena rules**

Each portal entry gives the player a starter mount at fish size 1. Food adds 1. Contact automatically eats a fish only when the eater's numerical fish size is strictly greater; equal sizes cannot eat one another. Eating adds the prey's size to the mount. Only the fish model and its eating bounds grow. The avatar's body, wearables, and world scale remain unchanged; the riding position adjusts to stay on the fish's back.

Both NPC fish and player-controlled mounts can be predators or prey. NPCs roam, flee larger fish, and pursue smaller ones. Eating checks use the fish, not the rider's body; a mount appearance never grants a starting size or speed advantage. V0 contains six NPC species; V1 proposes twelve, with reusable behaviors. Initial examples are Clown Fish, Puffer Fish, and Angler Fish.

The sea is a continuous shared arena with individual runs. Fish and food replenish while riders enter and leave independently. A proposed ten-second entry shield prevents the mount from dealing or receiving player-eating damage, and sea entry points stay away from immediate threats.

**Lobby and run flow**

All initial spawns and respawns occur on foot in the safe lobby, where eating and growth are disabled. Walking into the sea portal teleports the player to an arena entry point and seats them on one starter fish. Players stay mounted throughout the run.

When the mount is eaten, the server ends the run, removes that mount, and teleports the same normal-size avatar back to the lobby. The run result shows peak fish size and discoveries; re-entry requires walking through the portal again. A Return to Lobby action also ends the run safely. Leaving or disconnecting removes the mount. Mount growth resets after each run; confirmed index entries, personal records, and appearance unlocks persist.

**Fish Index rules**

The mount eating an NPC records that species immediately. The index stores a discovered flag, capture count, and largest captured specimen; duplicates update records without creating inventory items. Eating another player's mount grants growth but never a species discovery. Losing a mount, returning to the lobby, and leaving do not erase confirmed discoveries.

Undiscovered entries show silhouettes and useful behavior or habitat hints. V1 adds mount appearances at 3, 6, and 12 discoveries, chosen in the lobby before portal entry; these scene-only visuals have identical gameplay statistics. The player's own avatar remains visible on every mount. Completing the catalog adds a full-collection display beside their name. No captured fish need feeding, placement, selling, or storage management.

## 4. Why Players Come Back

### 4.1 The next-day (D1) sentence

> A player who enjoyed their first session returns the next day because tomorrow's named target species offers a fresh ride and hunt, previewed in the lobby beside their unfinished Fish Index.

### 4.2 The progression chain

> Have your mount eat a new species → save its index entry → earn a mount appearance → choose a more demanding hunt or help a friend find that species.

| Moment | What persists or has been built? | What becomes possible next? | How can another player tell? |
|---|---|---|---|
| **End of first session** | First species entries, personal best mount size, and a selected next target. | Use a behavior hint to plan the next portal run. In V1, three entries unlock the first mount appearance. | Discovery count appears beside the rider's in-scene name. |
| **End of first week** | A broader index and earned mount appearances; completion speed is untested. | Pursue difficult species, compare discoveries in the lobby, or enter with a friend for a shared hunt. | Players see the rider's avatar, selected mount, and collection count. |
| **Week 3+ — what takes more than two weeks?** | The complete index and specimen records remain. No two-week unlock or completion duration is promised. | Continue rider rivalry and target hunts after collection completion. TBD: playtests must establish whether these sustain repeat visits. | Full-collection recognition and mount appearance remain visible. |

You return to the lobby and select a mount appearance earned from your discoveries. A familiar rider enters the portal with you, and you follow their route toward a species you still lack. Your fish catches it before a predator eats your mount and sends you back to the lobby. The entry stays saved, and your next portal entry starts a fresh fish.

Currency or tradable rewards: none. The Fish Index, mount appearances, and personal records are the persistent progression.

### 4.3 Two return hooks

| Selected hook | Exact trigger or timing | What the player anticipates | Reminder channel + no-reminder fallback |
|---|---|---|---|
| **1. Collection** | First catch saves each species; V1 milestones occur at 3, 6, and 12 discoveries. | A missing silhouette becomes a known fish and eventually a mount appearance to select in the lobby. | The lobby index and run results show progress and a pinned next target. No external reminder is required. |
| **2. Daily target hunt** | One eligible species rotates at 00:00 UTC. Catch it three times for a dated stamp in the index. Tomorrow's species is previewed. | A specific hunt to attempt tomorrow, including with a returning rival or friend. | The lobby and run results show the target and reset time. No streak loss or exclusive species; all species remain obtainable every day. |

The daily target uses the existing species pool and requires no daily content production. It begins in V1; V0 tests collection interest without claiming next-day return has been proven.

## 5. Social by Design

| | |
|---|---|
| **The repeatable social loop** | Rider A approaches shared prey → Rider B contests it, diverts, or chases A's mount → the catch changes their fish sizes → a defeated rider returns to the lobby and can re-enter for a rematch. |
| **The disappearance test** | Live rider pursuit, contested catches, and recognizable rivals disappear. Solo mounted NPC hunting and index completion remain complete activities, but their enjoyment must also be tested. |
| **From strangers to a group** | Players meet on foot in one safe lobby and use the same visible sea portal. Names and mount-size cues identify competitors; entering near another rider creates shared prey opportunities without voice or a common language. |
| **Recognition & continuity** | Players keep their recognizable avatars and names in the lobby and on fish. Returning riders retain their collection count and mount appearance, making a previous predator or fellow collector recognizable on the next run. |
| **Quiet hours & player counts** | Alone, a player can enter the portal immediately, ride, hunt NPCs, and fill missing entries on a fresh server. Social threshold: two players; ideal group: four to eight; V1 target: eight concurrent players across lobby and sea; V0 test target: four. Counts are untested. One shared lobby and portal concentrate arrivals; a scheduled first-group playtest creates initial overlap. |
| **Drop-in / drop-out** | New arrivals begin in the lobby and enter the sea when ready, without a queue or shared round start. Disconnecting removes only that player's mount, without rewards or mass transfer; other runs continue. Safe lobby space, protected entry, and distributed food reduce repeated spawn hunting. |
| **Visible play (the bystander test)** | A normal-size avatar rides a fish that grows beneath them and becomes able to chase a former threat. |
| **Shareable play (the memorable moment)** | A normal-size avatar on an enormous fish escapes a rival mount and completes a missing index entry. |
| **Bring-a-friend** | After returning to the lobby, a player wants a friend to enter the portal alongside them for a rematch or parallel hunt. Their arrival adds a recognizable rider whose route and choices change the outcome. |

## 6. Mobile-First

**Every core-loop verb on touch**

| Core-loop verb | How it works with touch controls |
|---|---|
| Enter | Walk into the lobby portal using the movement joystick; teleportation and mounting follow automatically. |
| Seek | Use the movement joystick to steer the mounted fish; food and targets remain visible without hovering. |
| Eat | Ride into valid prey; the mount eats automatically without a precision tap. |
| Evade | Change joystick direction; the camera keeps the rider, mount, and nearby threats visible. |
| Review | Losing the mount returns you to the lobby automatically. Tap the index to inspect or select a target; a large Return to Lobby action also ends a live run. |

**UI plan**

In the sea, show fish size, discoveries, and a reachable Return to Lobby action; keep the visible rider and mount clear of HUD overlays. In the lobby, show run results, the index, and a clear portal direction using large touch targets, short labels, and shape cues alongside color.

**Performance**

Targets are 60 fps on recommended desktop hardware and 30 fps in the Decentraland Android client at eight players, including the worst case of eight visible mounted avatars. The actual mobile test device and client build are TBD before the first capability test; no performance result is claimed. Profile four players first. Use low-poly mounts and NPCs, shared materials, pooled food, capped NPC counts, simple distance checks, and limited transparent effects.

**Desktop-only dependencies**

No gameplay requires voice, direct messages, platform profile badges, hover, or keyboard-only actions. Collection labels and milestones are scene UI. Visible avatar riding, independent fish scaling, touch steering, and lobby-to-sea teleportation must pass an early test on both clients; their integration is not yet proven.

**Decentraland implementation**

Build a new SDK7 scene in TypeScript using the Roblox design and cleared art assets. The proposed deployment places a safe shore lobby and a separated sea arena inside one World scene; portal teleportation moves between those locations. The actual player avatar stays visible and normal size, seated on a scene-controlled mount with an elevated follow camera.

Keep fish growth separate from the rider's scale. Scale the fish mesh and eating bounds, then update the riding offset as its back rises; do not let mount scaling enlarge the avatar. Verify mounting, movement, pose, and remote rider visibility on both clients before content expansion. A fallback may simplify the riding pose and cap visual fish scale while preserving numerical growth and a visible normal-size rider.

Use the documented Multiplayer Server approach for shared state and validated fish eating. Track lobby, entering, mounted, and returning states; allow one active mount per rider. Resolve catches and return-to-lobby events once, reject impossible movement or duplicate rewards, and restore walking and lobby camera behavior on return. Save index progress against authenticated identity, confirm successful writes, and retry failures. Test cross-device persistence and explain guest saving limits before play.

## 7. World, Look & Story

**Story / world**

From a safe shore lobby, you enter a portal to ride a fish through a lively sea. Feeding makes your mount larger while each new NPC species it eats adds a discovery to your field guide.

**Visual direction**

Use the original project's colorful, blocky fish style with cleared models adapted for Decentraland. The shore lobby has a clear sea portal; blue water, bright food trails, fish silhouettes, and size values make arena threats readable. The signature shot is a recognizable, normal-size Decentraland avatar riding a huge fish beside another rider on a starter mount. The follow camera adapts to fish growth while keeping the rider visible; bite and discovery sounds support mute.

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
| What we will do differently | Put the avatar on a growing fish, connect a safe lobby and sea through a portal, and keep discoveries in a permanent index. | Make the visible rider and growing mount the signature, with solo NPC hunts, collection milestones, and shared rider competition. |

References: existing local Roblox backups dated June 2, 2026; [Miniclip's Agar.io guide](https://support.miniclip.com/hc/en-us/articles/4404685562641-How-to-start-playing-Agar-io). Applicant notes from the required Decentraland Featured-game visits remain TBD and must describe actual play.

## 9. 4 Week Plan (v1 scope)

**Application test scene and requested V0**

Before applying, publish a small Decentraland test scene showing lobby spawn, portal entry, a visible normal-size rider on a growing fish, an NPC eating interaction, and return to the lobby when the mount is eaten. It is separate from the funded vertical slice. The application repository must contain the test scene, this document at `design/gdd.md`, and a README linking to the deployed scene; completion is not claimed here.

The proposed V0 slice contains one safe lobby, one portal-linked sea arena, visible mounted avatars with independent fish growth, six NPC species, validated eating, protected entry, automatic return after mount loss, and a persistent index. Test four players across both locations. Riding and portal transitions add work and must be proven before expanding the species pool. V0 dates and available hours are TBD with the program; the V1 plan applies only after V0 succeeds and the next scope is agreed.

| Week | What is playable / done |
|---|---|
| 1 — Prototype definition | Review V0 findings; stabilize mounted movement, normal avatar scale, camera framing, and portal transitions with reconnecting index saves. |
| 2 — Core interaction + first-group test | Test four players entering and leaving independently, contested catches, mount loss, lobby return, and portal re-entry; observe comprehension and voluntary retry. |
| 3 — Core systems refinement | Expand to twelve species if the riding flow is stable; add index milestones, lobby mount choices, the daily target, and run results. Tune entry safety and food. |
| 4 — Playable release, including testing and deployment | Profile eight mounted players on desktop and the named mobile device; verify rider scale, remote visibility, saving, and repeated lobby returns; publish the World and update the repository and GDD. |

**What keeps the experience changing after launch**

- Variation comes from live opponents, NPC movement, contested food, and the automatically rotating target species.
- If a content update is skipped, the full species pool, daily target, and repeatable arena remain available.
- Each portal entry starts a fresh mount; index entries and mount appearances persist. Newcomers target a useful catch within their first minute in the sea.
- If players fill the index but stop returning, test whether better fish behaviors or collection goals improve repeat play before adding more species.

**Not building in v1**

Standing non-goals: ponds, tycoon income, and passive farming. This adaptation centers on active arena play and discovery. Also excluded are bag management, fish selling, and merging.

Defer additional arenas, more than twelve species, and extended NPC behaviors. The first candidate for V2 is a distinctive NPC behavior in the existing arena, chosen from playtest evidence. V1 has no currencies, trading, NFTs, paid power, paid revives, or player-to-player mass gifting.

**Top risk + fallback**

The main technical risk is keeping the visible avatar seated, controllable, and normal size as the fish grows on desktop and mobile. Prove a single mounted rider and a complete portal-and-return cycle first. If needed, simplify the pose, keep the sea flat, and cap visual fish growth while retaining its numerical size. The rider must remain visible and unchanged in scale. Multiplayer catch fairness is a second risk: validate outcomes on the server, test simultaneous approaches, and reduce player count or simplify eating bounds if necessary.

**Validation and success criteria**

Observe ten first-time testers against the 5/10 rule: at least eight enter the portal within five seconds and state the riding-and-eating goal within ten, without coaching. Observe voluntary portal re-entry, contested catches, and recognition of returning riders. Verify normal avatar scale throughout growth, correct remote rider visibility, safe lobby spawns, and automatic lobby return after mount loss. Repeated returns and reconnects must preserve index entries and never create duplicate mounts.

Use the program dashboard for first-week return once the game is live. The template names a V1 floor above 10% and a program target above 20% dashboard D7; both are evaluation thresholds, not forecasts or current results. No custom retention dashboard is part of scope.

**Platform references**

- [Creator Success onboarding](https://docs.decentraland.org/creator/studio-onboarding) and the downloaded official GDD template define the application format and staged scope.
- [Multiplayer Server](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers) documents shared validation and persistence; [camera controls](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/camera) and [on-screen controls](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/touch-screen-controls) inform the proposed presentation.
- [Entity positioning](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/entity-positioning) documents transform inheritance and attachments. A mounted rider with independent scale remains a prototype requirement, not a proven integration.
- [Mobile feature parity tracker](https://github.com/decentraland/godot-explorer/issues/2402), checked October 29, 2026. The project still needs a client-level capability test.

# Ride A Fish — Progression Appendix

**Date:** 8 November 2026 · **Status:** local review draft.

This file supports the [main GDD](gdd.md). It holds current tuning and the later V1 roadmap. V0 covers riding, growth, player chases, and predator escapes in Common and Uncommon, plus a small Fish Index and park/save/rejoin. Players park only at the island dock. The final V0 scope and timeline still need agreement with Creator Success.

Six size gates and parked-size saving are in the local preview. The grant preview stocks collector fish in Common and Uncommon. The Hammerhead roams and respawns only in these two areas, with no chase or bite beyond Uncommon's outer edge. Full rarity-weighted spawns, UTC species rotations, friend bonuses, Mythic alerts, the larger collection, and the 20-player limit are V1 plans. Current rider code cap: 10. The latest World version and save/rejoin still need tests.

V1 includes all six populated areas and a nearly complete Fish Index. Most planned species must be available to catch across all six rarities. The final species list and count are TBD. The size gates and 20-player maximum are agreed design choices. Spawn weights, times, and friend-bonus values are drafts. The current grant preview stocks collector fish only in Common and Uncommon. The four outer bands lack collector fish for this demo, and the Hammerhead stays in the first two areas. The two-area demo does not reduce the six-area V1 content plan.

## A1. Area progression

Keep the island and wooden bridge in place. Extend the water from the same center, at X 96 and Z 96. Each new area forms an outer band. Common is 20% smaller than the old 78.37 m radius.

| Area | Outer radius | Entry size | Entry color | Current grant preview |
|---|---:|---:|---|---|
| Common | 62.70 m | 0 | No entry label | Fish and food |
| Uncommon | 110 m | 100 | Green | Fish and food |
| Rare | 160 m | 1K | Blue | No collector fish |
| Epic | 210 m | 10K | Purple | No collector fish |
| Legendary | 265 m | 100K | Gold | No collector fish |
| Mythic | 325 m | 1M | Pink | No collector fish |

Each colored ring marks entry into the next band. Its small label appears within 6 m and hides beyond 8 m to avoid flicker. It follows the nearest point of the circle. The bold title uses the player-label sans-serif font and its area's rarity color. A smaller white line shows `Require 100 Size` below `Uncommon Area`. There is no area screen HUD or Common-area label. Gate checks run on the rider and the server. Touching a locked gate does not end the ride.

The existing water layers now span 704 m. Their texture tiling keeps the original wave scale. The old horizon fade is hidden so it does not wash out the outer preview bands. The island and bridge stay unchanged.

The grant preview has 20 collectible fish slots in each populated area. Common holds 16 Common, 3 Uncommon, and at most 1 Rare fish. Uncommon holds 3 Common, 14 Uncommon, and 3 Rare fish. Food starts with 20 pickups in Common and 30 in Uncommon. Their respawns keep these area limits. The Hammerhead can cross between Common and Uncommon, but cannot roam, chase, flee, or respawn beyond Uncommon's outer edge. It drops targets that leave these waters. These are demo quotas, not the full spawn weights below. V1 adds fish and food to all six areas. Growth rewards need tests through the 1M Mythic gate.

| Ocean area | Minimum current fish size to enter | Main NPC rarity | Player goal |
|---|---:|---|---|
| Common | 0 (open starting area) | Common | Learn the controls, collect food, discover starter fish, and grow toward 100. |
| Uncommon | 100 | Uncommon | Find more Uncommon species and growth opportunities on the way to 1,000. |
| Rare | 1,000 (1K) | Rare | Explore a Rare-dominant population and grow toward 10,000. |
| Epic | 10,000 (10K) | Epic | Discover Epic species and grow toward 100,000. |
| Legendary | 100,000 (100K) | Legendary | Pursue Legendary discoveries and grow toward 1,000,000. |
| Mythic | 1,000,000 (1M) | Mythic | Explore the final area and complete its high-tier collection goals. |

Common has no size gate. Its limit is 0. A fresh fish starts at size 1.

- Use current fish size to check entry. Size 100 can enter Uncommon; size 99 cannot.
- A larger fish can return to earlier areas.
- Coins, best-size records, and Index entries do not bypass gates.
- A blocked rider sees the needed size. The boundary must not kill or reset the fish.
- Parking keeps the full size. A saved size-1,000 fish can enter Rare water on a later visit.
- Rejoining starts at the island and dock. Restore size, not the old position at sea.
- Losing the active fish means starting a fresh size-1 fish. Other saved progress stays.
- Collector NPC fish stay in their assigned areas. The Hammerhead can cross the Common/Uncommon boundary, but stays inside Uncommon's outer edge. A rider below size 100 still cannot follow it into Uncommon.

Each gate after Uncommon needs ten times the prior size. Tune food and fish rewards to make this pace work. Rebirth and permanent speed boosts are not needed.

## A2. Rarity-weighted NPC fish spawns

The area favors its matching rarity. Other rarities can still appear. A Mythic can rarely visit Common water.

**Initial spawn weights for review, not final balance**

These are the base weights without a friend bonus.

| Spawn area | Common | Uncommon | Rare | Epic | Legendary | Mythic | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| Common | 80% | 15% | 4% | 0.80% | 0.15% | 0.05% | 100% |
| Uncommon | 15% | 65% | 16% | 3.50% | 0.40% | 0.10% | 100% |
| Rare | 5% | 15% | 65% | 13% | 1.80% | 0.20% | 100% |
| Epic | 1% | 4% | 15% | 65% | 14% | 1% | 100% |
| Legendary | 0% | 1% | 4% | 18% | 73% | 4% | 100% |
| Mythic | 0% | 0% | 1% | 4% | 20% | 75% | 100% |

An NPC slot first picks a rarity. It then picks a species using the current UTC window. The area sets the fish's size range.

A 0.05% Mythic rate means one pick per 2,000 rolls on average. It does not promise one within 2,000 rolls. The number of slots and spawn times also affect encounters.

- Rarity and size are separate. Some Mythic visitors must be small enough for local riders to catch.
- Each area needs food and edible NPC targets at its entry size.
- Keep tutorial fish reliable. Tutorial spawns must not give repeatable rare rewards.
- Use a shared NPC cap. More areas must not multiply every fish count.
- Set rarity caps so rare fish do not replace all starter targets.
- The server owns fish spawns and catch rewards. Rejoining must not reroll the map or duplicate a fish.
- Some species are still missing from the build. Disable empty pools and scale the remaining weights to total 100%.
- UTC windows can allow rarer species to spawn. They do not promise a Mythic at fixed intervals.

### A2.1 Friend-based Legendary and Mythic spawn bonus

More active friends raise future Legendary and Mythic spawn chances, up to a cap. Everyone in that server benefits. Solo players keep the base rates.

**Who counts**

F is the number of active, signed-in players who each have an active, confirmed friend in the same server. Count each player once. Do not count friendship links, idle accounts, or players in other servers. The activity rule and friend check are TBD.

**Draft formula**

Raise Legendary and Mythic weights by 5% for each counted player after the first. Cap the weight boost at 50%.

> m = 1 + min(0.05 × max(F − 1, 0), 0.50)

| Qualifying active players | Proposed shared multiplier for Legendary and Mythic weights |
|---:|---:|
| 2 | 1.05× |
| 5 | 1.20× |
| 11–20 | 1.50× (cap) |

Without a qualifying friend pair, m is 1. Multiply only Legendary and Mythic weights by m. Then scale all weights to total 100%.

This is a weight boost, not extra percentage points. At the cap, Common water's Mythic chance rises from 0.05% to about 0.0749%. Its Legendary chance rises from 0.15% to about 0.2248%.

- Apply the bonus on the next normal spawn. Joining must not create or reroll a fish.
- When friends leave, update future odds. Fish already present stay.
- Keep size gates, catch rules, tutorial targets, and NPC caps.
- The server checks the bonus. Do not trust a count sent by a player.
- Test idle and extra-account abuse. Separate accounts may still belong to one person.
- Show the shared bonus in the UI. Do not claim a guaranteed catch.

Friend access for this scene is TBD. Check a supported method using the [official Social Service docs](https://github.com/decentraland/docs/blob/main/contributor/social-service/js-client.md). If friends cannot be checked, keep the bonus pending. Do not count strangers as confirmed friends. Formal crews are not required.

### A2.2 Scheduled species spawns and the Fish Index

The Index gives players another reason to return. It shows missing species, their areas, and their next UTC windows.

**Two window types**

- **Featured species:** one species appears more often. Other normal species in that rarity stay possible at lower rates.
- **Window-only species:** some rarer species can spawn only during listed hours. Other fish in that rarity remain available.

**The five-Common-species example**

If there are five Common species, a window at 01:00 UTC can favor species A. The one-hour window and weights below are examples.

| Example UTC window | Featured Common species | Other four Common species |
|---|---:|---:|
| 01:00–02:00 UTC | Species A: 80% of Common-species selections | Each remaining species: 5% of Common-species selections |

These are chances among Common species, not all fish. They total 100%. With an 80% Common rarity rate, species A gets 64% of all rolls. Each other Common species gets 4%. The other rarities keep the remaining 20%.

A later window can favor a different Common species. The full daily schedule and real species names are TBD.

**How a spawn is chosen**

1. Pick a rarity using the area and friend weights. Skip empty pools.
2. Pick a species from that rarity's current UTC pool.
3. Pick an area-based size and use the normal spawn slot.

> Fish chance = rarity chance × species chance within that rarity.

A window-only species has zero weight outside its hours. Scale the other species weights to total 100%. Keep normal choices available in each rarity.

- Use real server UTC, not the sky setting or player device clock.
- All servers use the same schedule. Their random fish picks may differ.
- A new window affects future spawns. It does not refill or reroll the map.
- Fish already present stay until their normal end. A fish can remain catchable after its spawn window closes.
- The Index and dock show current and next UTC windows. Mark window-only entries clearly.
- Window changes never reset Index entries or parked size.
- The friend bonus changes rarity odds. It does not bypass a species window or size gate.
- Save the active window in memory. Update it at each time change, not every frame.

Test one rotation first. Final species, window lengths, repeat times, and species weights are TBD.

### A2.3 Shared Mythic hunt alert

**Stage and purpose:** V0 introduces this idea. V1 builds and tests Mythic spawning, server-wide alerts, the shared search, and one winner per fish. This is a main V1 social test: can one rare catch draw riders from separate routes into an urgent race?

A Mythic spawn gives the server a shared goal. Every player is notified; riders compete to find and catch the same fish first. The intended excitement comes from knowing another rider may get there before you. Player participation and enjoyment still need tests.

1. A Mythic NPC really spawns. The server alerts everyone in that same server, including players at the dock.
2. The alert names the fish but hides its exact location. Players search the sea.
3. Players race for the catch. They may chase rivals or dodge predators on the way.
4. The server confirms one valid catch and tells everyone who caught it.

**Example alert:** "A Mythic fish appeared. Search the sea!"

- Size gates and catch-size rules still apply. Search only the water your fish can enter.
- Player mounts do not trigger NPC spawn alerts.
- One fish gives one catch reward. The winner gets the normal growth, coins, and Index progress.
- Send each spawn and catch message once. Do not announce a roll that failed to create a fish.
- If the fish disappears without a catch, close the hunt notice.
- A late joiner sees current hunt status. Their join must not repeat the alert for everyone else.
- Use a small text notice in the existing HUD. Combine notices if several Mythics spawn together.
- Keep a live Mythic cap and tune respawn timing. Alerts must not become constant noise.

The shared hunt adds a race to the collection goal. It does not add a new combat system. Existing chase and fish-size rules decide the contest. Alert timing, display length, and Mythic caps are TBD.

## A3. Parked fish size and returning players

**Players do not start from zero on every rejoin.** A fresh fish uses size 1. A signed-in player keeps a successfully saved parked fish.

| Situation | Fish-size behavior |
|---|---|
| First visit | A fresh fish starts at size 1. |
| Park and save | Store the fish's full size for that account. |
| Leave after parking and rejoin | Restore the saved parked size. A different dock slot may be used. |
| Ride again | Board at the parked size. Boarding puts the fish at risk and uses the banked save. |
| Grow and park again | Save the new parked size. |
| Fish is eaten or lost | Start a fresh size-1 fish. Keep coins, Index entries, tutorial progress, and best-size records. |
| Leave while riding | No automatic save at sea. Under the current rule, leaving before parking again does not restore the consumed checkpoint. |
| Guest player | Progress lasts only for that session. |

**Example:** You park and save at size 12,500. On your next visit, the fish is still size 12,500. It can enter Epic water. Legendary water needs size 100,000.

Show "Saving" until the write succeeds, then "Saved." Load the old profile before offering a replacement fish. A failed load must not overwrite progress. Older accounts without a parked-size field start at 1 but keep other progress.

Extra protection for an accidental disconnect during a ride is TBD. Do not claim that the current build saves an active ride.

## A4. Existing sample and onboarding

The sample has 50 green food pickups. Common has 20 worth +1 size each. Uncommon has 30 worth +5 size each. Uncommon food is 50% wider: 0.72 m across, compared with 0.48 m in Common. Each food still gives one coin.

Coins stay saved between visits. V1 adds a shop where players spend these coins. The shop's items and prices are TBD; it is outside the V0 playable scope.

V1 also adds a leaderboard. Its scoring and display are TBD; it is outside the V0 playable scope.

| Area | NPC fish | Size gained on catch | Slots |
|---|---|---:|---:|
| Common | Blue Tang — Common | 2 | 16 |
| Common | Reef Angelfish — Uncommon | 6 | 3 |
| Common | Red Reef Fish — Rare | 18 | 1 |
| Uncommon | Blue Tang — Common | 10 | 3 |
| Uncommon | Reef Angelfish — Uncommon | 25 | 14 |
| Uncommon | Red Reef Fish — Rare | 75 | 3 |
| Common + Uncommon | Hammerhead | 1,000 initially | 1 |

Equal-size fish cannot eat each other. Every collectible target in Uncommon starts below its size-100 entry requirement. Fish there give more growth than a single food pickup. The three collectible species stay in place until caught, then return at a new water position within the same area. The Hammerhead chases smaller riders and flees larger ones.

Common Rare visitors wait 45 seconds after a catch. Uncommon Rare fish wait 20 seconds. Uncommon fish return after 12 seconds in Common and 10 seconds in Uncommon. Common fish return after 8 seconds. These are bounded slots; they do not add extra NPCs over time. Existing fish coin rewards stay separate from area growth: 2 for Blue Tang, 6 for Reef Angelfish, and 18 for Red Reef Fish.

Each of the six areas has two Shields and two Speedboosters: 24 powerups total. Pickups normally return after 10 seconds. If a type runs out in an area, relocate one replacement right away to a clear point away from riders. Keep the replacement in the same area and give it a new pickup ID. Shields refresh to 30 seconds. Speedboosters refresh to 20 seconds and cannot stack beyond that duration.

These are first-pass balance values. Playtest the time to reach size 100 and 1K before changing later-area rewards. Spawn quotas currently represent the three available collectible rarities; the full rarity-weighted pool remains the V1 plan.

The NPC Guide covers boarding, food, the first fish, both power-ups, and return to the dock. Power-ups can be learned in either order. Predators and riders cannot eat you before your first NPC catch. You can park early. Movement hints return on rejoin, not every respawn. Tutorial progress is saved.

The first area goal is size 100. Keep the island and bridge in place.

## A5. Balance and checks

Use playtests and the program dashboard. No separate return tracker is planned.

**V0 slice checks**

- Watch new players board, eat, grow, read prey/predator sizes, and park. Note whether they choose another ride.
- Test chases and escapes with 2–4 riders, including new players against larger returning fish. Friend playtests have been reported; structured results and conditions remain TBD.
- Test Uncommon entry just below size 100 and exactly at 100.
- Test full leave and rejoin after parking. Include changed dock slots, guests, old accounts, and failed loads or writes.
- Confirm joins cannot duplicate fish or rewards.
- Test touch boarding, steering, jumping, and docking. Record device, client, player count, and performance.

**Later V1 checks**

- Check purchases deduct the right number of coins and the saved balance is correct after rejoining.
- Check leaderboard results and ordering against the agreed scoring rules once defined.
- Test each size gate just below and exactly at its limit.
- Check that base rarity rows total 100%. Test friend counts from 0 to 20. Both boosted rarities must gain chance.
- Keep each area's matching rarity highest after the friend bonus.
- Test UTC changes at midnight, on restart, and on rejoin. Check species weights and window-only rules.
- Check Mythic alerts reach all 20 players once. Test late joins, several spawns, and one winner per fish.
- Observe whether riders change routes to join a Mythic hunt, chase rivals, and choose another ride afterward. Check whether size gates leave new players without a meaningful chance to take part.
- Repeat save/rejoin and duplicate-reward checks with the full collection and bonuses.
- Test 20 players on desktop and mobile, including 20 riding. Record the device, client, and results.
- Keep NPC counts separate from player counts. Check scene bounds before setting area radii.
- Test new players against large returning fish. An alert does not let a small fish enter locked water.

**V1 collection target:** Most planned species are catchable across all six rarities. The Index tracks discoveries, catch counts, and largest catches. These records stay saved between visits. List any species held back from V1 before release. The final roster and count are TBD; "nearly complete" does not mean the current four-species sample is enough.

**Still to decide:** the V1 species list and count, UTC windows, growth rewards, NPC caps, Mythic spawn timing, friend activity rules, and beginner PvP balance. Starter rewards are not yet balanced for size 1 million.

**Still to verify:** title and content permissions, mobile device and client, friend access, 20-player capacity, published save behavior, and the delivery plan for the full six-area V1.

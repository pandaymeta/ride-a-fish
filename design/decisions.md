# Design decisions

## 8 November 2026 — V1 release scope

- **Working direction:** Creator Success GDD. Current task: correct the V1 scope in the local draft.
- **Owner clarification:** V1 covers all six rarity areas and a nearly complete fish collection. This replaces the earlier GDD text that limited V1 to Common and Uncommon.
- **Existing owner request:** The current grant preview stocks Common and Uncommon only, so the first goal is clear to a visiting judge. This is a smaller demo, not the V1 release scope.
- **Open detail:** The final V1 species list and count are TBD. No completion percentage or species count has been agreed.
- **Saved changes:** Updated the release plan and cut list in [the GDD](gdd.md#9-4-week-plan-v1-scope), plus scope and collection notes in [the progression appendix](gdd-progression-appendix.md).
- **Implementation status:** This correction changes documents only. The current scene still stocks two areas. No commit, push, or publication was requested for this correction.

## 8 November 2026 — Nearby gate labels and roaming predator

- **Owner request:** Remove the area screen HUD and Common label. Show only a small boundary label nearby. Use a bold, rarity-colored area title and a smaller white size requirement in the player-label font.
- **Owner request:** Halve the boundary label distance. Show a label within 6 m of its circle and keep it visible until 8 m to avoid flicker. Move that label to the nearest point of the circle, so any approach works.
- **Owner request:** Let the shark roam anywhere. It may cross all five rarity gates and respawn across the full ocean. It still avoids dry land and the outer ocean edge. Player size gates stay in effect.
- **Scope:** The grant preview's ordinary fish and food stay in Common and Uncommon. The shark is the roaming exception. V1 still targets six populated areas and a nearly complete collection.

## 8 November 2026 — Lower area entry requirements

- **Owner decision:** Uncommon opens at 100 size, Rare at 1K, Epic at 10K, Legendary at 100K, and Mythic at 1M. Common stays open at size 0.
- **Replaces:** The earlier 400 / 4K / 40K / 400K / 4M entry requirements.
- **Implementation:** Client and server gates share these values. Boundary labels use the same rules. Area radii, proximity labels, and unrestricted shark roaming stay as agreed.

## 8 November 2026 — Grant food, fish mix, and powerup supply

- **Owner request:** Set Uncommon food to +5 size for now. Stock Common and Uncommon with a rarity mix that favors the area's rarity. Common should have a few Uncommon visitors and rarely one Rare fish. Keep Shields and Speedboosters available in each area.
- **Implementation choice:** 20 collector slots in Common (16 Common / 3 Uncommon / 1 Rare) and 20 in Uncommon (3 / 14 / 3). Rare visitors return more slowly after catches. The one roaming Hammerhead is separate.
- **Implementation choice:** 48 foods per populated area. Common food gives +1 size; Uncommon gives +5. Each food gives one coin. Uncommon-area fish give 10 / 25 / 75 size by rarity, so hunting remains useful. Fish coin rewards keep their existing species values.
- **Implementation choice:** Two Shields and two Speedboosters in every one of the six areas. Refill a depleted type at a clear point within its area. Speedboost duration refreshes to 20 seconds rather than accumulating.
- **Status:** These are local tuning choices for playtesting. They do not replace the six-area V1 scope or approve the final fish roster.

## 8 November 2026 — Focus the application on V0

- **Working direction:** Creator Success GDD. Current aim: a shorter local V0 application draft, with the V1 release plan clearly separated.
- **Owner call:** Apply the reviewed changes after comparing the GDD with [Claim Bite](https://github.com/carlosmu/dcl-claim-bite/blob/master/design/gdd.md). Keep the main hook on riding, growth, player chases, predator escapes, and parking.
- **Approved proposed V0 slice:** Existing island, Common and Uncommon waters, a small Fish Index, the Hammerhead, Shields, Speedboosters, and park/save/rejoin. Initial multiplayer tests target 2–4 riders. This is the studio's proposed slice, not a scope agreed with Creator Success.
- **V0 questions:** Can newcomers board and read prey versus predators? Do riders choose another ride or chase? Does park/save/rejoin preserve size and discoveries? Player-test results remain TBD.
- **Return design:** Lead with saved growth and missing Index species. Coins stay secondary. Scheduled species, friend bonuses, Mythic alerts, and the 20-player target remain in the later V1 plan.
- **Preserved owner decision:** V1 still covers all six populated rarity areas and a nearly complete collection. The final species count and tuning remain open. The V1 week plan is provisional pending V0 review.
- **Source check:** The save/loss description follows the existing game: docking saves size; starting another ride puts that fish at risk; getting eaten starts the next fish at size 1 while discoveries, coins, and tutorial progress remain. This source check is not proof of World persistence or player understanding.
- **Saved records:** Rewrote [the GDD](gdd.md), clarified the stage boundary in [the appendix](gdd-progression-appendix.md), and saved the writing reference in [references](references.md). Previous local files are preserved in `../../output/gdd-v0-focus-2026-11-08/`.
- **Scope of this change:** Documents only. No scene changes, commit, push, or publication. The shortened draft is ready for owner reading; the V0 slice and save/loss wording have not yet received a separate factual readback after this rewrite.

## 8 November 2026 — Limit the Hammerhead to two areas

- **Owner call:** The shark should roam only in Common and Uncommon. This replaces the earlier full-ocean roaming decision.
- **Implementation:** Server movement, chase and flee goals, initial placement, and respawns stay inside Uncommon's outer radius. The shark drops outside targets and cannot bite riders in the outer areas. Client extrapolation uses the same bound.
- **Boundary:** Read the editor-authored Uncommon outer radius (currently 110 m). Preserve the existing shore and edge clearances. This range is independent of how many areas later gain collectible fish.
- **Preserved:** Player size gates, food/fish mix, powerup supply, and the six-area V1 plan.

## 8 November 2026 — Make the shared Mythic hunt a central V1 test

- **Owner priority:** Mythic spawning should change separate fish hunts into an exciting shared race. Notify everyone in the server so riders search for the same fish; the first valid catch wins.
- **Stage boundary:** Introduce the idea in the V0 GDD. Build and playtest the spawning, alert, shared hunt, and single-winner catch in V1. This does not add the mechanic to the V0 playable scope.
- **V1 questions:** Do players change routes to join the hunt, chase rivals, and choose another ride afterward? Excitement and repeat play are intended outcomes, not established results.
- **Preserved:** Six populated V1 areas, the nearly complete collection, 20-player target, UTC rotations, and friend-based spawn bonuses. Existing size gates and catch-size rules remain; notifications do not guarantee every player can reach or catch every spawn.
- **Saved changes:** Emphasized the idea in Social by Design and the V1 delivery plan; updated the detailed hunt rules and V1 checks in the appendix. Documents only; no implementation, push, or publication.

## 8 November 2026 — Reduce Common food density

- **Owner request:** Reduce Common-area food because it looks too crowded.
- **Implementation choice:** Reduce its active spawn slots from 48 to 32, one third fewer. Keep Uncommon at 48, for 80 total. Existing area-preserving respawns use the reduced supply.
- **Preserved:** Food growth values (+1 Common / +5 Uncommon), visual sizes, fish mix, both tutorial starter foods, and powerup supply.

## 8 November 2026 — Clarify where players park

- **Owner correction:** Players park only at the island dock. Common and Uncommon are riding and hunting areas, not parking locations.
- **Wording fix:** Corrected the round deliverable, stopping point, Park step, V0 loop, and appendix introduction. The existing dock-only mechanic is unchanged.

## 8 November 2026 — Set lower food counts in both areas

- **Owner call:** Common has 20 food pickups; Uncommon has 30. This replaces the previous 32 / 48 supply, for 50 total.
- **Preserved:** Food growth values, visual sizes, tutorial starter pickups, area-preserving respawns, fish populations, and powerups.

## 8 November 2026 — Include a coin shop in V1

- **Owner correction:** V1 includes a shop where players can spend their saved in-game coins. This replaces the previous GDD statement that V1 has no shop and removes shops from its cut list.
- **Open details:** Shop items and prices are TBD. No item categories or benefits have been chosen in this correction.
- **Saved changes:** Corrected the currency description, V1 scope, delivery plan, cut list, and appendix. The V0 playable scope stays unchanged. Documents only; no shop implementation or push.

## 8 November 2026 — Commit the republished scene and revised GDD

- **Owner report:** The World has been republished. This records the owner's publication update, not a new public playtest result.
- **Owner request:** Commit and push the pending scene changes and revised GDD to GitHub.
- **Repository sync:** Gameplay source matches the Creator Hub project, apart from whitespace-only differences. Include its current scene settings and authored layout. Preserve the local-asset manifest and existing exclusions for locally supplied assets.
- **Documentation:** The GDD now reports the republish; public save/rejoin verification remains pending. V0 scope and later V1 Mythic hunts and coin shop remain as agreed.

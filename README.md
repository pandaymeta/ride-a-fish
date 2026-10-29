# Ride A Fish

Decentraland SDK7 application sample for the Creator Success Program. World target: **Entenium** (`entenium.dcl.eth`). Public deployment is pending.

## Current game

- 128 x 128 metre playable sea inside a 160 x 160 metre scene (100 parcels).
- Raised wooden spectator stage at the north edge, eight metres above the water. Players spawn and return here.
- Walk into the glowing circle on the stage floor to enter the sea on a starter fish.
- The fish grows; the visible rider stays normal size and seated.
- Food and 36 NPC fish stay stationary. NPCs never chase, attack, or eat players.
- Eat a fish only when your numerical size is strictly greater. Equal or larger NPCs are harmless and remain uncollected.
- Only another player's larger fish can eat your mount. A ten-second entry shield blocks PvP in both directions while allowing collection.
- Food and NPC fish respawn at the same positions after four and eight seconds.
- Four active riders in this sample; others can watch from the lobby. Use WASD or the mobile movement joystick to steer.
- Fish Index saves discoveries, counts, largest catches, and personal best for authenticated players. Guest progress lasts for the session.
- No ponds, tycoon, currencies, trading, selling, or merging.

## Development

Use Node.js 18 or newer.

```sh
npm ci
npm run build
npm run start -- --mcp --skip-auth-screen true -- --hub true
```

The SDK and runtime are pinned together to the Multiplayer Server branch. The server validates movement, size comparisons, collection, PvP, and portal proximity. Static scene layout is authored through Creator Hub in `assets/scene/main.composite`; do not edit that file while the scene is open in Hub.

- `src/server/`: authoritative arena and checkpoint persistence.
- `src/client/`: presentation, steering requests, riding, and stage transitions.
- `src/shared/`: gameplay constants and message schemas.
- `design/gdd.md`: grant design document and proposed V0/V1 scope.

## Validation

Passed: SDK build and type checking; nine isolated server-rule checks covering static NPCs, size comparisons, PvP protection, fixed respawns, and input handling; desktop stage spawn, floor-circle entry, mounted steering and growth, collection, lobby return, and fall recovery. The live preview reported no scene errors.

### Still required

Public World deployment, two-client PvP/remote rider checks, Android riding and touch controls, real-device performance, and first-time-player playtests remain release gates. Do not describe the grant sample as publicly deployed or Android-tested until those checks are completed.

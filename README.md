# Ride A Fish

A Decentraland SDK7 test scene by Pandaymeta Studio for Creator Success V0.

Ride a fish around a tropical island. Eat green food and smaller fish to grow, evade the Hammerhead and larger riders, then park at the dock. The Fish Index tracks discoveries, and signed-in players keep their discoveries and coins across sessions.

## Play the sample

The test scene is open for public testing in **entenium.dcl.eth**. [Play Ride A Fish](https://decentraland.org/jump?realm=entenium.dcl.eth)

Press **E** near the NPC Guide for the tutorial, or beside your fish to board. Use **WASD** to swim and **Space** to jump. Press **E** at the dock to park your fish at its current size.

To preview locally, open the project in Decentraland Creator Hub and choose **Play → Desktop Client**.

## Local island assets

The island’s licensed models and textures are supplied locally. Before previewing or deploying, copy the files listed in the [local asset manifest](design/local-assets.txt) from your Ride A Fish Creator Hub project.

On Windows, run this from the repo root and enter the path to your Creator Hub scene folder.

```powershell
$scene = Read-Host "Creator Hub scene folder"
foreach ($file in Get-Content -LiteralPath "design/local-assets.txt") {
    $source = Join-Path $scene $file
    if (!(Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing local asset $file" }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $file) | Out-Null
    Copy-Item -LiteralPath $source -Destination $file
}
```

## Build

Use Node.js 18 or newer.

```sh
npm ci
npm run build
```

[Game Design Document](design/gdd.md)

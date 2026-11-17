---
title: "Himal Ash"
short: "Himal Ash"
tagline: "2D Action Platformer"
kind: independent
order: 10
domain: "Game Development, Systems Engineering"
role: "Solo Developer (primary)"
summary: "Building responsive, bug free combat and movement in an action game requires state logic that can grow (new moves, new enemies, new spells) without each addition risking side effects across the whole system."
results:
  - "Delivered three connected, playable levels with functioning enemy encounters and a boss arena in approximately two weeks"
stack:
  - "Unity 6"
  - "C#"
  - "Universal Render Pipeline (2D)"
  - "Cinemachine"
  - "Unity Input System"
  - "SQLite"
company: "Personal project"
art: "sword"
group: "games"
repo: "https://github.com/darpan-chapagain/himal-ash"
---

## Problem
Building responsive, bug free combat and movement in an action game requires state logic that can grow (new moves, new enemies, new spells) without each addition risking side effects across the whole system.

## How It Was Built
Player movement and combat run on an 11 state finite state machine (idle, walk, sprint, jump, fall, wall jump, 3 hit melee combo, spellcast, block, damaged, death), with each state's transitions isolated so a change to, say, the combo timing window doesn't risk breaking wall jump behavior. Enemies run on a separate state machine (idle, patrol, chase, melee attack, damaged, death) driven by per enemy ScriptableObject configs (detection range, speed, damage, cooldowns), so a new enemy type is a matter of authoring a new config asset rather than writing new code.

Player and enemy combat both route through a shared, event driven health/damage system, decoupling damage sources from health consumers so a new weapon or spell doesn't need to know anything about what it's hitting. Spells follow the same pattern: a generic spell inventory and cooldown manager plugs into ScriptableObject defined spells (a projectile spell and an AoE spell shipped), so adding a new spell doesn't touch the core pipeline. Player state persists across sessions via a local SQLite save/load system, and three levels (forest, mid level, boss arena) connect through a scene transition system using triggerable doors and spawn points.

Debugging highlights included tracking down a scene transition trigger loop caused by overlapping colliders, invisible sprites traced to a render pipeline configuration gap, and erratic enemy behavior caused by a physics collider sizing mismatch during combat.

## Key Technical Details
- 11 state finite state machine for player movement and combat, with isolated transition logic
- Separate, ScriptableObject configured enemy AI state machine supporting new enemy types without code changes
- Event driven shared health/damage system decoupling damage sources from consumers
- ScriptableObject based spell system (projectile and AoE spells) plugging into a generic inventory/cooldown manager
- Local SQLite save/load system for persistent player state
- Scene transition system connecting three playable levels via triggerable doors and spawn points

## Results
- Delivered three connected, playable levels with functioning enemy encounters and a boss arena in approximately two weeks

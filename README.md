# RaidMonster 🎮

A **Pokémon-style Raid RPG** inspired by Raid Shadow Legends — featuring over **1,025 champions** to collect, turn-based raid battles, and a fully mobile-responsive design you can play on your PC *and* load on your phone.

---

## Features

- **1,025+ Pokémon champions** powered by the [PokéAPI](https://pokeapi.co/)
- **Raid Shadow Legends-style mechanics** — champion collection, star ratings, skill cooldowns, status effects
- **Turn-based combat** — speed-based turn order, type effectiveness, critical hits, AoE skills
- **6 raid dungeons** of increasing difficulty (Forest → Shadow Realm)
- **Summon system** — spend coins/gems to recruit new champions (basic, premium, 10× pulls)
- **Team builder** — pick up to 5 champions for your raid squad
- **Auto-battle** toggle for hands-free play
- **Mobile-first responsive design** — works on phones, tablets, and desktop
- **LocalStorage save** — progress persists between sessions
- **Passive energy regeneration** (1 energy every 3 minutes)

---

## Quick Start

### Requirements
- [Node.js](https://nodejs.org/) v14 or newer

### Run

```bash
npm start
```

The server will print two URLs:

```
🎮  RaidMonster – Pokémon-style Raid Game
════════════════════════════════════════════
  ▸  PC    →  http://localhost:3000
  ▸  Phone →  http://192.168.1.100:3000  (same WiFi)
════════════════════════════════════════════
```

Open the **PC URL** in any browser, or type the **Phone URL** on your mobile device while connected to the same Wi-Fi network.

---

## Project Structure

```
RaidMonster/
├── server.js          – Node.js HTTP server (no dependencies)
├── package.json
└── public/
    ├── index.html     – Main HTML shell
    ├── css/
    │   └── style.css  – Mobile-first dark-fantasy theme
    └── js/
        └── game.js    – Full game logic (state, battle engine, UI)
```

---

## Gameplay Guide

| Screen | Description |
|--------|-------------|
| **Title** | Start screen — begin your adventure |
| **Starter** | Pick your first champion (Bulbasaur / Charmander / Squirtle) |
| **Raids** | Choose a dungeon to battle through multi-wave encounters |
| **Champions** | View, level-up, and manage your roster |
| **Team** | Slot up to 5 champions into your active raid team |
| **Summon** | Spend 🪙 coins or 💎 gems to recruit new Pokémon |

### Battle Mechanics
- Turn order is determined by **Speed** stat
- Each champion has 3–4 **skills** with cooldowns (A1 always available)
- Type effectiveness applies standard Pokémon rules (2×, 0.5×, immune)
- Status effects: Burn 🔥, Poison ☠️, Paralysis ⚡, Freeze ❄️
- Boss Pokémon have doubled HP
- Between waves your team recovers **50% HP**

---

## License

MIT

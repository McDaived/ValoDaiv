# ValoDaiv

A Valorant companion tool that uses the **local Riot Client API** to modify your in-game profile appearance. Since it only communicates with your local client — not Riot's servers directly — it is considered safe to use.

---

## Features

- **Skin Changer** — Equip any skin on any weapon instantly from a searchable, weapon-grouped list
- **Rank Editor** — Change your displayed rank and leaderboard position (visible to friends within ~10 seconds)
- **Customize** — Edit your player card, level border, title, account level, and idle status
- ~~**Agent Instant Locker**~~ *(removed)*

---

## How It Works

ValoDaiv reads your local Riot Client credentials to authenticate, then communicates with the local Valorant API running on your machine. No credentials are sent anywhere else.

---

## Usage

### 1. Authorize
Open Valorant first, then click **Authorize** in the sidebar. This connects the tool to your running game client.

### 2. Skin Changer
- Browse weapons from the left panel
- Search and equip any skin
- ⚠ **Requires a game restart to take effect**

### 3. Rank Editor
- Select a rank tier and optionally set a leaderboard position
- Changes appear on your profile when friends open their friends panel (may take 5Mins)

### 4. Customize
- Change your **Player Card**, **Level Border**, **Title**, **Account Level**, and **Idle Status**
- ⚠ **Requires a game restart to take effect**

---

## Running from Source

**Install dependencies:**
```
npm install
```

**Run in development mode** (starts Vite + Electron together):
```
npm run electron:dev
```

---

## Building

**Build a distributable release:**
```
npm run electron:build
```

This will generate two files inside the `release/` folder:

| File | Description |
|------|-------------|
| `ValoDaiv-x.x.x-win.zip` | Portable — extract and run `ValoDaiv.exe` directly, no installation needed |
| `ValoDaiv Setup x.x.x.exe` | Installer — double-click to silently install and launch |

> The zip is the recommended portable option. The installer installs to `AppData\Local\Programs\ValoDaiv\`.

---
```diff

# v1.0
+ Complete UI redesign — modern dark theme with frameless window and custom title bar
+ Skin Changer now groups weapons by type with a searchable skin grid
+ Rank Editor now includes leaderboard position field
+ Added Customize page — player card, level border, title, account level, idle status
- Removed Agent Instant Locker
- Replaced Discord link with Instagram and Telegram
+ Build output now includes a portable zip and a silent NSIS installer

# v0.2.0
+ Fix API 
+ improve it 

# v0.1.0
+ Initial release
+ Skin Changer
+ Rank Editor
+ Agent Instant Locker
```
---
## Note

This tool uses the **local Valorant client API only** and does not interact with Riot's remote servers in any unauthorized way. It is not bannable.

---
## Preview
<img width="600" src="https://github.com/user-attachments/assets/acacc3e7-d9ee-44e5-aa45-e09435ced1b1" />

<img width="600" src="https://github.com/user-attachments/assets/8230c8a0-d24f-4376-a806-8a36e410922f" />

<img width="600" src="https://github.com/user-attachments/assets/74034baa-b690-4e0c-9b93-7d6b79d97bf6" />

<img width="600" src="https://github.com/user-attachments/assets/a1380f9d-9bfc-48e7-9571-b59d8ebf3a6b" />


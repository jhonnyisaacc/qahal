---
description: Core rules, architecture, and guidelines for the Qahal project - Telegram Mini App for Physical Emunah Community
---

# Qahal Project - קהל - Physical Emunah Assembly Finder

Qahal (קהל - "assembly" or "congregation") is a sacred Telegram Mini App designed to help people find brothers, sisters, and living congregations who walk in **Emunah** (active faithfulness and trust) in the exact physical location where they are.

The goal is to move faith from digital screens to real-life encounters: connecting individuals and communities for prayer, study, fellowship, and support in the physical world.

## Project Overview

- **Core Purpose**: Help users discover and meet people and congregations near them who share a living Emunah.
- **Key Experience**: Location-based discovery (world map → local map after sharing location) with a strong focus on physical, face-to-face connection.
- **Languages**: English (primary for launch), Spanish, Hebrew (RTL support). Future: Portuguese and others.
- **Platform**: Telegram Mini App (must feel native inside Telegram).

## Architecture Guidelines (for developers)

### Tech Stack (Recommended)

- Frontend: Telegram Mini App (JavaScript / TypeScript + React recommended) (Using Bun)
- Maps: Not sure yet
- Backend: Bun
- Offline support: Cache maps and previously loaded congregations
- Hosting: Suitable for Telegram Mini Apps (Cloudflare)

### Public vs Private Branches

- This is an open source project with a public repository for transparency and community contributions. But databases will be stored securely and privately to protect user data and location information.
- Production branch will be main.

## Critical Reminders

### NEVER:

- Use cold, modern, or corporate map styles.
- Depart from the canonical DESIGN.md system (Manrope, Purple/Ink/Paper/Black, Purple 800 actions) or the draft Pen file `design/qahal.pen`.

### ALWAYS:

- Make the map experience beautiful, warm and inviting.
- Ensure excellent mobile performance inside Telegram.
- Write all code, comments, and documentation **in English**.
- Prioritize safety, privacy, and respectful community moderation.

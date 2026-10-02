# Qahal UX decisions

Product/UX source of truth: rules, eligibility, flags and flow. Visuals: [DESIGN.md](../../DESIGN.md) and [`design/qahal.pen`](../../design/qahal.pen). Implementation: [paper-to-code.md](./paper-to-code.md).

Status: **draft**. Decided items are locked unless you change them.

---

## Decided

### Access

- Gate is the existing **invite-code** flow (`INVITE_GATE_ENABLED`), not a new per-person referral type.
- When the flag is **off**, new users skip the code screen entirely.
- Hebrew UI is right-to-left. Latin names, ages and distances stay readable in mixed strings.

### Questions and Home

- Doctrinal questions must be finished before Home. No skip.
- If they close Telegram mid-questionnaire, they **resume** there on the next open. They never land on Home until the set is complete (7 questions, or 2 if Starting).

### Visibility

- Visible is **off by default**.
- Do **not** collect it on the name/gender onboarding step.
- A **separate screen** after city explains hidden-by-default and lets them turn Visible on before the first Home.
- After that, Visible is edited only in **Profile**.
- Visible means nearby people can find them and contact them on Telegram.

### Gender

- Onboarding collects **Male** or **Female** (guy / girl person icons, not ♂ ♀).
- A woman cannot be a Qahal leader. If they chose Congregation leader, Female is disabled. If they chose Female first, Congregation leader is disabled.
- They **cannot** later switch Female → leader through Profile.
- Show sex on **request details** (not required on every list row).

### Leaders and Qahals

- Create Qahal only after **endorsement or operator verification**. Those two paths are the same outcome: verified mark + permission to create.
- A leader may have **one** Qahal at a time. If that Qahal is gone, they may create another.
- Create asks **Local** or **Online**.
- **All online qehilot** appear in the Online list when someone is searching. Local results stay city/radius based.
- Endorsement needs the named leaders. If **one declines**, the applicant **contacts support** (no in-app replacement picker).

### Place

- City search is **cities only**. Neighborhoods (Palermo, Villa Crespo, other CABA barrios) never appear, including from GPS. Snap GPS to the parent city.

### Contact, badges, notifications

- Contact on Telegram must work **without a public username** (they are already in Telegram; use the Telegram user identity).
- **Leader** mark is the verified `badge-check`. **Community member** has a different mark (`Member/Mark`).
- Join and endorsement events notify **both** via the Telegram bot and in-app.

### Manage

- Manage is Qahal / People / Requests.
- Requests show a count bubble of active join requests, age on the row, Contact, then Accept/Decline on the detail.

---

## Still open

1. Who issues invite codes — any verified leader, or only operators?
2. Visibility copy — privacy-only, or a short community reason?
3. Existing women who already lead — grandfathered, or hard rule from day one?
4. Must **both** endorsers accept (decline-one → support implies yes)?
5. Waiting for endorsement — pending banner on Home and no Create?
6. Can a leader also be a member of other qehilot?
7. Can leadership transfer to another verified male leader?
8. Can Local/Online type change after create? Does Online still store a city?
9. CABA label — “Buenos Aires”, “Ciudad Autónoma de Buenos Aires”, or either?
10. Age missing — hide it, or block join until birth date is set? Minimum age?
11. Starting users — who reaches them if they cannot join or contact?
12. Can Starting later become Experienced and take the remaining questions?
13. Profile language override later, or Telegram locale only?
14. RTL — mirror chrome and keep Qof / “qahal.” unflipped?

---

## Screen order

Splash → (invite code if flag on) → carousel → state → (endorsement if leader) → questions → name + gender → city → **visibility** → Home.

Create Qahal (verified leader, no current Qahal): name, Local/Online, city when Local.

Manage: Qahal | People | Requests (count).

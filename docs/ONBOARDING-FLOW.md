# ONBOARDING-FLOW.md — New State-Based Onboarding

Current onboarding behavior: [docs/product/ux.md](./product/ux.md). Visuals: [DESIGN.md](../DESIGN.md) and [`design/qahal.pen`](../design/qahal.pen). Verify remaining implementation against `apps/miniapp/src/app/useAppFlow.ts`.

---

## 1. New Initial Screen: "What's your current state?"

**Screen:** `OnboardingStateScreen.tsx` (new)

**Question:**  
**English:** "What's your current state in the Emunah?"  
**Spanish:** "¿Cuál es tu estado actual en la Emunah?"

**Single-choice options:**

| Option (English)          | Option (Español)           | Internal Value |
| ------------------------- | -------------------------- | -------------- |
| Congregation leader       | Líder de congregación      | `leader`       |
| Experienced in the Emunah | Experimentado en la Emunah | `experienced`  |
| Starting in the Emunah    | Comenzando en la Emunah    | `starting`     |

---

## 2. Conditional Question Flow

### If user selects **"Starting in the Emunah"** (`starting`)

- Only **2 questions** are shown:
  1. Do you believe that Yeshua is the Messiah of Israel?  
     ¿Crees que Yeshua es el Mesías de Israel?
  2. Do you believe that Yeshua is The Prophet written by Mosheh?  
     ¿Crees que Yeshua es El Profeta escrito por Moshé?

- After answering, the user proceeds directly to the **data onboarding screen** (name, then city). There is no language selector; locale follows Telegram.
- On the **Home screen**, these users:
  - Cannot send join requests to congregations
  - Cannot contact nearby people
  - See a message: "A community leader from your country will contact you soon."
- These users are marked with a special profile flag (`emunahLevel: "starting"`).

### If user selects **"Experienced in the Emunah"** (`experienced`)

- The **full 7-question** doctrinal questionnaire is shown, then name and city.
- Full access to all features after completing onboarding.

### If user selects **"Congregation leader"** (`leader`)

- After the state screen they go to **Endorsement** (Pen `KLY1B`): search and name two verified community leaders.
- They then complete the full 7-question questionnaire and name/city.
- They cannot create a Qahal until endorsed or manually verified. See section 3.

---

## 3. Congregation Leader Restrictions

If the user selects **"Congregation leader"** (`leader`):

- They **cannot** create a new Qahal immediately.
- After the state screen they go to **Endorsement**: search and name two verified community leaders who know them.
- Those two leaders see the request on **Home** and can open it, Contact on Telegram, then Endorse or Decline.
- Until endorsed (or approved manually at the start), they do not receive the verified leader mark and cannot create a Qahal.
- When endorsed or manually verified:
  - They receive the verified mark and the ability to create a Qahal.

---

## 4. Technical Implementation Notes

- New field in user profile: `emunahState: "leader" | "experienced" | "starting"`
- New field: `emunahLevelApproved: boolean` (for leaders)
- New component: `OnboardingStateScreen.tsx`
- Modify `OnboardingQuestionsScreen.tsx` to accept a prop for reduced question set.
- Update `HomeScreen.tsx` and join request logic to respect `emunahState === "starting"`.
- Update `ManageQahalScreen.tsx` creation flow to block leaders until endorsed or manually verified.
- Persist endorsement requests so the two named leaders see them on Home.

---

## 5. Future Considerations

- Backend endpoints to create, accept and decline endorsement requests
- Manual operator verification of leaders (already sketched in `apps/worker/scripts/operator.ts`)
- Visual verified mark on leader names (Pen `LsKT9`)

---

**Status:** Specified in DESIGN.md v2.1 and `design/qahal.pen`. Implementation pending.

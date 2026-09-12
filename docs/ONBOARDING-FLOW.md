# ONBOARDING-FLOW.md — New State-Based Onboarding

Historical onboarding behavior proposal. Verify implementation against apps/miniapp/src/app/useAppFlow.ts and the owning screens; map and pending-implementation statements below are historical. Current visual policy and screen inventory live in [DESIGN.md](../DESIGN.md).

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

- After answering, the user proceeds directly to the **data onboarding screen** (name + city).
- On the **Home screen**, these users:
  - Cannot send join requests to congregations
  - Cannot contact people on the map
  - See a message: "A community leader from your country will contact you soon."
- These users are marked with a special profile flag (`emunahLevel: "starting"`).

### If user selects **"Experienced in the Emunah"** (`experienced`) or **"Congregation leader"** (`leader`)

- The **full 7-question** doctrinal questionnaire is shown (same as current behavior).
- Full access to all features after completing onboarding.

---

## 3. Congregation Leader Restrictions

If the user selects **"Congregation leader"** (`leader`):

- They **cannot** create a new Qahal immediately.
- After completing onboarding, they see a message:

  > "To lead a congregation, you must first meet with the leaders of the congregations in your country. A national leader will contact you."

- When the user is approved by the national leadership:
  - They receive the ability to create a Qahal.
  - A message is sent to **all current congregation leaders** in that country notifying them of the new leader.

---

## 4. Technical Implementation Notes

- New field in user profile: `emunahState: "leader" | "experienced" | "starting"`
- New field: `emunahLevelApproved: boolean` (for leaders)
- New component: `OnboardingStateScreen.tsx`
- Modify `OnboardingQuestionsScreen.tsx` to accept a prop for reduced question set.
- Update `HomeScreen.tsx`, `MapScreen.tsx`, and join request logic to respect `emunahState === "starting"`.
- Update `ManageQahalScreen.tsx` creation flow to block leaders until approved.

---

## 5. Future Considerations

- Backend endpoint to approve/reject leader requests
- Notification system to national leaders and country congregation leaders
- Badge or visual indicator for "Starting in the Emunah" users

---

**Status:** Design phase complete. Implementation pending.

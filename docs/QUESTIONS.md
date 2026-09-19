# QUESTIONS.md — Onboarding Questionnaire

This document contains the official onboarding questions used during the first-time user experience in the Qahal app.

---

## Onboarding Questions

The questionnaire consists of **7 core doctrinal questions** presented after the welcome carousel.

| #  | English                                                                 | Español                                                                 |
|----|-------------------------------------------------------------------------|-------------------------------------------------------------------------|
| 1  | Do you believe that Yeshua is the Messiah of Israel?                    | ¿Crees que Yeshua es el Mesías de Israel?                               |
| 2  | Do you believe that we're called to keep the Torah and Yeshua's testimony? | ¿Crees que fuimos llamados a guardar la Torá y el testimonio de Yeshua? |
| 3  | Do you believe that Yeshua is The Prophet?                              | ¿Crees que Yeshua es El Profeta?                                        |
| 4  | Do you believe that Elohim is one?                                      | ¿Crees que Elohim es uno?                                               |
| 5  | Do you believe that Yeshua is YHWH?                                     | ¿Crees que Yeshua es YHWH?                                              |
| 6  | Do you believe that Adonai has made one single people out of Jews and Gentiles? | ¿Crees que Adonai hizo un solo pueblo de judíos y gentiles?             |
| 7  | From now on, will you abstain from what is offered to idols, blood, what is strangled, and sexual immorality? | Desde ahora, ¿te abstendrás de lo ofrecido a ídolos, sangre, ahogado y de inmoralidad sexual? |

---

## Scriptural References

Each question (except the first and last) is accompanied by relevant Scripture references shown to the user:

| #  | English References                          | Referencias en Español                      |
|----|---------------------------------------------|---------------------------------------------|
| 1  | —                                           | —                                           |
| 2  | Isaiah 53:5, John 20:31                     | Isaías 53:5, Juan 20:31                     |
| 3  | Isaiah 8:20, Revelation 14:12               | Isaías 8:20, Apocalipsis 14:12              |
| 4  | Deuteronomy 18:18, Acts 7:37                | Deuteronomio 18:18, Hechos 7:37             |
| 5  | Deuteronomy 6:4, John 17:3                  | Deuteronomio 6:4, Juan 17:3                 |
| 6  | Psalm 110:1, Philippians 2:11               | Salmos 110:1, Filipenses 2:11               |
| 7  | Zechariah 2:11, John 10:16                  | Zacarías 2:11, Juan 10:16                   |
| 8  | Acts 15:29                                  | Hechos 15:29                                |
| 9  | —                                           | —                                           |

> **Note:** The last question (abstaining from idols, blood, strangled meat, and sexual immorality) is based on the Jerusalem Council decision in Acts 15.

---

## User Flow

1. **Intro screen** — "We'll ask you a couple of questions to get you started"
2. **7 questions** — Yes / No answers
3. **Result screen** (if any "No" answers) — Encourages further personal study
4. **Name + City** collection screen follows successful completion

All answers are currently stored locally for the MVP. Future versions may persist responses server-side for badge eligibility (`Emunah` badge).

---

**Source of truth:** `apps/miniapp/src/app/i18n/locales/{en,es}.ts`

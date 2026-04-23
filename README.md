# Stethescope — Premium Prototype

A redesigned mobile-first web prototype for Stethescope, a digital clinic platform for physicians. Same feature set as the existing app, refined surface built on the **Clinical Precision** design system (Manrope + Inter, deep navy + professional teal, glassmorphic depth).

## Screens

| File | Screen |
|---|---|
| `index.html` | Landing / screen index |
| `onboarding.html` | Signup, email verification, profile |
| `dashboard.html` | Physician dashboard — appointments, activity, quick actions |
| `patients.html` | Patient directory with clinical actions |
| `prescription.html` | New prescription creator (Favorites + Protocols) |
| `teleconsult.html` | Tele-consultation with split-screen EMR |
| `chronic-care.html` | Chronic care monitoring with vitals + alerts |
| `calendar.html` | Clinic calendar (virtual + physical) |
| `revenue.html` | Revenue analytics, billing, subscriptions |
| `profile.html` | Digital clinic profile (patient-facing) |

## Navigation

Every authenticated screen shares:
- **Desktop side-nav** (8 items) on `lg:` breakpoint and up
- **Mobile bottom-nav** (5 items): Home · Patients · Scripts · Calendar · More

## Running locally

No build step. Just open `index.html` in a browser, or serve the folder:

```bash
# any static server works
python -m http.server 8000
# or
npx serve .
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo
2. Settings → Pages → Source: `main` branch, root
3. Open `https://<your-username>.github.io/<repo>/`

## Design system

Based on `stitch_elite_medical_dashboard/clinical_precision/DESIGN.md`:
- **Primary:** Deep Navy (`#1A237E → #08005E`)
- **Secondary:** Professional Teal (`#006c48`, success states)
- **Tertiary:** Cyan (`#33d7fe`, info highlights)
- **Alert:** Orange (warnings, out-of-threshold vitals only)
- **Type:** Manrope (headlines), Inter (body + tabular data)
- **Shape:** 12px cards, 8px inputs, pill data
- **Depth:** Tonal layers + ambient navy-tinted shadows

## Feature parity with the existing app

All subscription tier features preserved:
- Unlimited patients, clinic staff, medical facilities
- Appointments (App + Web)
- Patient management
- Physician consultation schedule + holiday calendar
- Physician blog
- Prescription on image / pre-printed stationary / system format / WhatsApp
- Business card on WhatsApp
- WhatsApp reminders

## Status

Prototype only — all data is mock. To productionize: wire screens to an API (your existing backend or a new one), replace mock arrays, add auth, and optionally wrap with Capacitor for native iOS/Android.

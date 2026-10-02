---
id: faith-hair
lang: en
ordre: 6
domaines: [web, conseil]
focus: "UX/UI · Web development · Automation"
marche: "France"
resultats_cles: ["6 days", "0", "Automatic", "2"]
titre: Faith Hair
intitule: Designer & developer · booking and management app
periode:
  affichage: "September 2026 (10 to 15)"
  debut: 2026-09
  fin: 2026-09
categorie: Professional experience
cadre: Web development assignment · micro-business
statut: delivered
liens:
  - { libelle: "View the app", url: "https://faith-hair.vercel.app" }
qualites_cles: [Q-ANL, Q-ADA, Q-REA]
qualites_secondaires: [Q-RIG]
familles_cles: [WEB, DES]
familles_secondaires: [STR, PRO]
sous_competences: [STR-6, DES-4, PRO-1, WEB-2, WEB-3, WEB-4]
---

# Faith Hair

## Header

- **Title**: Designer & developer · booking and management app
- **Period**: September 2026, 10 to 15
- **Short summary**: Designed and built, in six days, a booking and management app for a hairstylist specialising in braids and afro hairstyles. It replaces bookings by Instagram message: complete requests, automatic pricing, a schedule with no overlaps.
- **Key qualities**: `Q-ANL` Analytical & synthesis skills · `Q-ADA` Adaptability & self-directed learning · `Q-REA` Responsiveness & composure
- **Key skill families**: `WEB` Web, AI & automation · `DES` Design & art direction

## My role

- Needs analysis and service mapping
- Solution and user experience design (UX/UI, mobile first)
- Front-end development in HTML, CSS and JavaScript
- Supabase back-end: data model, security, scheduled jobs
- Deployment on Vercel, code versioned on GitHub

## Context

Faith Hair is a hairstylist specialising in braids and afro hairstyles who was getting back to work. She took bookings through Instagram direct messages and collected a €10 deposit via PayPal, tracked by hand.

Replying to clients, adjusting her schedule and checking deposits took all her free time. Requests were often incomplete or unclear, which hurt the quality of exchanges, and the risk of overlapping appointments was constant.

**Before**: bookings by Instagram DM, PayPal deposits tracked by hand, vague requests, a schedule hard to keep up to date.
**After**: a guided questionnaire (service, slot, contact details), price and duration estimated automatically, time-blocked schedule and booking tracking.

## Missions

### 1. Diagnosis & solution design
- **Sub-skills**: `STR-6` Strategic diagnosis & recommendations · `PRO-1` Product design
- **Qualities**: `Q-ANL` Analytical & synthesis skills

I started by pinning down the need precisely, then mapped all the services offered, with their durations, prices and add-ons. This map became the basis for the booking questionnaire and automatic pricing. I then proposed a solution suited to her situation: lightweight, no server to maintain, and editable by her.

### 2. A dual-interface app
- **Sub-skills**: `DES-4` UX/UI design & wireframing · `WEB-2` Website creation & front-end development · `WEB-4` AI-assisted development
- **Qualities**: `Q-ADA` Adaptability & self-directed learning · `Q-REA` Responsiveness & composure

**Client area**: a guided four-step questionnaire, designed mobile first (home, service, genuinely available slot, contact details), then a summary to send on Instagram. Requests arrive complete, add-ons included, with an automatically calculated price.

**Admin area**: everything the hairstylist needs day to day. Service catalogue, booking tracking (CRM), availability and settings. She updates the client interface herself as her business evolves, without going through me.

App fully built with the help of Claude Code.

::: media carrousel
- images/projets/faith-hair/faith-hair_01_espace-cliente.webp | Client area · a guided 4-step questionnaire
- images/projets/faith-hair/faith-hair_02_espace-admin.webp | Admin area · services, bookings, availability, settings
:::

### 3. Under the hood
- **Sub-skills**: `WEB-3` Back-end, data & automation · `WEB-4` AI-assisted development
- **Qualities**: `Q-RIG` Rigour & high standards

A simple architecture, with no always-on server to run:
- **Supabase model**: 5 tables (services, settings, opening hours, exceptions, bookings) with strict row-level security (RLS): clients can create a request, only the admin can read and edit it
- **Automatic time blocking**: duration and buffer recalculated at each choice; only confirmed appointments actually block the schedule
- **Scheduled jobs (pg_cron)**: automatic archiving of past appointments and trash purge after 7 days, with no manual action

::: media image
- images/projets/faith-hair/faith-hair_03_stack-technique.webp | Stack & how it works
:::

::: media icones-outils
- HTML / CSS / JavaScript
- Supabase
- Vercel
- GitHub
- Claude Code
:::

## Results & key figures

| Value | Label | Detail |
|---|---|---|
| 6 days | from brief to live app | 10 to 15 September 2026 |
| 2 | interfaces | Client area + admin area |
| 0 | overlapping appointments | Only confirmed bookings block the schedule |
| Automatic | price and duration | Add-ons included, at every choice |
| 5 | secured Supabase tables (RLS) | Automatic archiving and purge |

Note: the slides are in French; the carousel captions are translated.

# ForkIt — Project Summary & Path Forward

## 1. Product Concept (What ForkIt Is)

**ForkIt** is a decision-resolution food app, not a restaurant search app.

The core value is **removing decision fatigue**, not surfacing more options.

### The problem

* Google Maps already shows nearby restaurants, filters, ratings, hours, etc.
* What it does *not* do well:
  **“Just tell me where to eat.”**

### ForkIt’s solution

ForkIt makes the decision *for* the user, then offers a fallback if they don’t want to go out.

---

## 2. Core Differentiators (Why This App Exists)

### 1) True random decision-making

* One primary CTA: **“Fork It”**
* App selects **one** restaurant from a filtered pool
* No scrolling, no browsing, no analysis paralysis
* Optional reroll, but the default experience encourages commitment

### 2) “Make at home” fallback

* Every selection includes a **signature dish**
* Links to **copycat recipes** so the user can recreate the vibe at home
* Even if the user doesn’t go out, the app still provides value

### 3) Hidden Gems mode

* Explicit **non-chain / local priority**
* Chains are deprioritized or excluded
* Encourages discovery instead of defaults

---

## 3. Naming & Theme

### App name: **ForkIt**

* Imperative, playful, decisive
* “Fork it” = stop thinking, just go
* Works as both brand and verb (“Forked it already”)

### Tone

* Playful but confident
* Light irreverence (“Fuck it… I mean Fork it”)
* The app *owns* the decision so the user doesn’t have to

---

## 4. MVP Feature Set (What We’ve Built / Are Building)

### Platform

* **Android-first**
* Built with **Expo (React Native)**

### Data source

* **Google Places API** for restaurant discovery

### Filters (guardrails, not browsing tools)

* Radius
* Price
* Minimum rating
* Open now
* Cuisine keyword (optional)
* Hidden Gems toggle (exclude chains)

### Core interaction

1. User opens app
2. Taps **Fork It**
3. App animates selection (slot-machine style reveal)
4. One restaurant is returned
5. User can:

   * Navigate (Google Maps)
   * Call
   * Reroll
   * “Fork it at home” (recipes)

---

## 5. UX / Personality (Intentionally Built In)

The current prototype includes:

* Playful loading phrases (“Consulting the vibes…”)
* Slot-machine preview of restaurant names
* Haptics for feedback
* Success/failure microcopy
* Visual polish (gradients, glass cards, chips, icons)

This is not accidental — **the personality is part of the value.**

---

## 6. Current Technical State

### What exists now

* Fully working **Expo Snack prototype**
* Single-file app (`App.js`)
* Location permission + GPS
* Google Places Nearby Search
* Client-side filtering + randomness
* Signature dish heuristics
* Recipe links
* Polished UI + animations

### Known shortcuts (acceptable for MVP)

* Google API key is client-side
* Signature dish logic is heuristic/manual
* Chain detection is keyword-based
* No backend
* No user accounts
* Local-only state

---

## 7. Release Strategy (Agreed Direction)

### Goal

A **real Play Store release**, with **friends testing first**.

### Release pipeline

1. Convert Snack → real Expo project (download ZIP)
2. Use **EAS Build** to generate Android App Bundles (AAB)
3. Create app in **Google Play Console**
4. Use **Internal Testing** first (up to 100 testers)
5. Share opt-in link with friends
6. Promote to Closed Testing → Production later

### Why this path

* Internal testing is fast (hours, not days)
* No public exposure until ready
* Matches Google’s intended workflow

---

## 8. Updates & Iteration Plan

### During testing

* Minor UI / copy changes via **EAS Update** (OTA updates)
* Bug fixes without rebuilding AABs (when JS-only)

### Rebuild required when:

* Adding native modules
* Changing permissions
* Modifying app config significantly

---

## 9. Security & Scaling Considerations (Next Phase)

### Google API key

For testing:

* Restrict key to **Places API only**
* Acceptable risk

For real users:

* Either heavily restrict key (Android package + SHA)
* Or proxy Places calls through a backend (recommended)

---

## 10. Path Forward (Concrete Next Steps)

### Immediate (this week)

* [ ] Download Snack as project
* [ ] Set up Git repo
* [ ] Install EAS CLI
* [ ] Configure `eas.json`
* [ ] Create Play Console app
* [ ] Build first **production AAB**
* [ ] Publish to **Internal Testing**
* [ ] Invite friends via opt-in link

### Near-term (post-testing)

* Improve chain detection logic
* Allow user overrides for signature dish
* Add “avoid repeats” logic
* Add saved/favorites view

### Future versions (already scoped)

* Recipe import → ingredient parsing
* Shopping list generation
* Pantry tracking
* iOS build
* Lightweight personalization (not recommendations)

---

## 11. One-sentence Pitch (for stakeholders)

> **ForkIt** removes food decision fatigue by choosing a restaurant for you — and if you don’t go, it gives you the recipe to recreate the best thing there.

---

Product Requirements Document (PRD)

1. Overview

Problem
Users are not lacking restaurant information—they are lacking decision resolution. Choice overload, indecision fatigue, and “nothing sounds good” lead to wasted time and frustration.

Solution
An Android app that:

Makes the choice for the user via true random selection with guardrails

Provides a “Make at home” fallback by identifying a restaurant’s signature dish and linking recipes

Prioritizes hidden gems (non-chain, local restaurants)

Non-Goal
This is not a replacement for Google Maps search, reviews, or discovery browsing.

2. Target Users

Individuals or couples deciding where to eat

Users who are mentally tired, time-constrained, or indecisive

Users who enjoy cooking but want takeout inspiration

Local-support-minded users (“hidden gems” preference)

3. Platform & Tech Assumptions

Platform: Android (MVP)

Maps Data: Google Places API

User Model: Single user per device (no accounts v1)

Persistence: Local storage (SharedPreferences / Room)

Backend: None required for MVP

4. Core Value Pillars

Decision removal – “Pick for me” is the primary CTA

Fallback utility – If you don’t go out, you still get value

Local discovery – Hidden gems prioritized by design

5. Primary User Flows
Flow A: “Pick for Me” (Default)

User opens app

Sets filters (or uses saved defaults)

Taps Pick for Me

App returns one restaurant

User:

Navigates

Rerolls

Saves

Uses “Make at home”

Flow B: Hidden Gems

User toggles Hidden Gems

App excludes chains and prioritizes local restaurants

Random selection returned from filtered pool

Flow C: Make at Home

User taps Make at home

App displays:

Signature dish name

Recipe links

User exits or saves recipe idea

6. MVP Feature Requirements
6.1 Location & Search

Current location (GPS)

Radius selector (e.g., 1–15 miles)

Google Places Nearby Search

6.2 Filters

Cuisine / food type

Price range ($–$$$)

Open now

Minimum rating

Distance

Exclude chains (Hidden Gems)

6.3 Random Selection Engine (Core)

Pull eligible places from Places API

Apply filters

Randomly select one result

Support reroll

Prevent repeat selections within session (optional)

Nice-to-have v1.1

Weighted randomness (distance, novelty)

6.4 Restaurant Result Card

Displayed information:

Name

Photo

Rating

Price level

Distance

Open/closed status

Actions:

Navigate (Google Maps deep link)

Call

Save

Reroll

6.5 Signature Dish + Recipes (MVP Implementation)

Displayed below result card

Fields:

Dish name

3–5 external recipe links

Dish identification (v1):

Manual mapping for:

Major chains

User-added favorites

Fallback: “Popular dish” label with manual override

6.6 Hidden Gems Logic (MVP)

Chain exclusion list (known major brands)

Exclude places with:

Many locations (heuristic)

Chain indicators in name

Boost single-location restaurants

7. Data Storage (Local Only)

Stored locally:

Filter preferences

Saved restaurants

Recently selected places

Custom signature dish overrides

No cloud sync in MVP.

8. UX / UI Principles

One primary action per screen

No infinite scrolling

Minimal text

Fast results (<2s target)

Fun but not gimmicky

Tone: decisive, friendly, slightly playful

9. Out of Scope (Explicitly)

User accounts / login

Social sharing

Reviews or comments

In-app ordering

Nutrition tracking

10. Future Roadmap
V2

Recipe import (URL → ingredients)

Shopping list generation

Pantry tracking

Cuisine rotation logic

V3

Meal planning

Budget-aware mode

History-based novelty scoring

11. Success Metrics

Time from open → decision

Reroll frequency

% of sessions using “Make at home”

Saved places count

App retained after 7/30 days

12. Open Questions for Dev Discussion

Best chain-detection heuristic for MVP?

How aggressive should randomness be?

Recipe source curation vs open web?

Local data storage structure (Room vs lightweight prefs)?
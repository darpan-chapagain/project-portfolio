---
title: "FitTracker"
short: "FitTracker"
tagline: "Local First, On Device AI Fitness Tracker"
kind: independent
order: 9
domain: "Mobile, On Device AI/ML"
role: "Solo Developer (personal project)"
summary: "Most AI powered fitness apps require sending personal health and dietary data to a cloud backend, which means ongoing hosting costs, privacy exposure, and no functionality without an internet connection."
results:
  - "Fully offline Android app with no recurring hosting cost"
  - "No user data ever leaves the device"
stack:
  - "Kotlin"
  - "Jetpack Compose"
  - "Room (SQLite)"
  - "Retrofit"
  - "MediaPipe (on device LLM/Gemma 2B)"
  - "Navigation Compose"
  - "Coroutines/Flow"
  - "WorkManager"
  - "Play Billing"
  - "MVVM/Repository Pattern"
---

## Problem
Most AI powered fitness apps require sending personal health and dietary data to a cloud backend, which means ongoing hosting costs, privacy exposure, and no functionality without an internet connection.

## Constraints
- Zero cloud backend, zero recurring hosting cost
- All inference and data storage fully on device
- Nutrition figures must be accurate, not hallucinated by a language model

## How It Was Built
The app runs a quantized Gemma 2B model directly on the phone via Google's MediaPipe LLM Inference API, so natural language logging like "had chicken breast and rice for lunch" is parsed entirely on device with nothing sent to a server. The key architectural decision was keeping the LLM's job narrow: it only extracts structured meaning from free text (what food, how much). Every actual nutrition and macro number comes from a verified, locally cached Open Food Facts database lookup, not from the model, which removes the model's ability to hallucinate a calorie count.

On top of that sits a deterministic nutrition engine using the Müller BMR formula (based on lean and fat mass rather than just height and weight), with goal driven macro targets for cutting, bulking, or recomposition, plus a rule based workout progression engine and a constraint based weekly meal planner. All of this is built on a normalized 10 entity relational schema behind a repository pattern, with a local first data pipeline that falls back to an API only when a food isn't already cached, keeping the app usable fully offline after initial data population.

## Key Technical Details
- On device LLM inference (Gemma 2B, quantized) via MediaPipe, zero data leaving the device
- Hybrid AI/deterministic architecture: LLM parses language only, verified database supplies all nutrition data
- Local first data pipeline with on demand API fallback and permanent caching
- Müller BMR based nutrition engine with goal driven, adaptive macro targeting
- Rule based workout progression engine and constraint based weekly meal planner
- Normalized 10 entity relational schema with strict repository pattern data access
- Custom Jetpack Compose design system (typography, color tokens, spring physics motion, 15+ reusable components)
- Play Store native subscription billing with tiered feature gating; scheduled reminders via WorkManager/AlarmManager

## Results
- Fully offline Android app with no recurring hosting cost
- No user data ever leaves the device

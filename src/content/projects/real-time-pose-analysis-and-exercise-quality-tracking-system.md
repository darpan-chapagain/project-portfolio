---
title: "Real Time Pose Analysis & Exercise Quality Tracking System"
short: "Pose and form tracking"
kind: independent
order: 11
domain: "Computer Vision"
role: "Developer"
summary: "Fitness tracking systems often lack real time feedback on exercise form and quality, leaving users to guess whether they're performing a movement correctly."
results:
  []
stack:
  - "Python"
  - "MediaPipe"
  - "OpenCV"
art: "pose"
group: "ai"
---

## Problem
Fitness tracking systems often lack real time feedback on exercise form and quality, leaving users to guess whether they're performing a movement correctly.

## How It Was Built
The system tracks body landmarks per frame and computes joint angles from their geometric relationships (e.g., the angle at the elbow or knee) rather than relying on raw pixel positions, which makes the tracking robust to camera distance and angle. A state machine tracks each repetition through its phases (starting position, contraction, extension) using angle thresholds, so a rep only counts once it passes through the full expected range of motion, and the live feedback loop flags form issues (e.g., incomplete range of motion) in real time.

## Key Technical Details
- Joint angle computation using geometric relationships between tracked landmarks
- State based repetition counting driven by angle thresholds across the full movement range
- Real time feedback loop for exercise form quality

---
title: "Multi Channel Banking Notification System (SMS & Viber)"
short: "SMS and Viber alerts"
kind: professional
order: 4
domain: "Messaging & Notifications"
role: "Technical Project Manager"
summary: "Banks required reliable customer notifications with delivery guarantees, provider fallback, and visibility into message success or failure across multiple channels."
results:
  - "Achieved 99.5%+ delivery rate with zero delivery dropouts"
  - "Reduced operational overhead for message handling"
stack:
  - "PHP"
  - "REST APIs"
  - "Messaging Queues"
---

## Problem
Banks required reliable customer notifications with delivery guarantees, provider fallback, and visibility into message success or failure across multiple channels.

## How It Was Built
The system sits behind a single internal interface that abstracts away which underlying provider (SMS or Viber) actually sends a given message. If the primary provider fails or times out, the router automatically falls back to a secondary provider without the calling service needing to know a failure occurred. Delivery confirmations arrive via secure, verified callbacks, and every attempt (success, retry, or final failure) is logged for analytics and troubleshooting.

## Key Technical Details
- Provider agnostic message routing behind a unified interface
- Automatic retry and fallback strategy for failed delivery attempts
- Secure callback verification for delivery confirmation
- Delivery analytics and logging for full visibility into message outcomes

## Results
- Achieved 99.5%+ delivery rate with zero delivery dropouts
- Reduced operational overhead for message handling

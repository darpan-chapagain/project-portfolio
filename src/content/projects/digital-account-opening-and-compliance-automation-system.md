---
title: "Digital Account Opening & Compliance Automation System"
short: "Digital account opening"
kind: professional
order: 1
domain: "Digital Banking, Compliance"
role: "Technical Project Manager"
summary: "Traditional bank account opening relied on manual paperwork and fragmented verification, leading to long onboarding times, inconsistent compliance enforcement, and poor customer experience."
results:
  - "Reduced onboarding time from 3 days to under 1 hour"
  - "Cut manual document error rate by 60%"
  - "Enabled scalable digital onboarding across multiple banks"
stack:
  - "PHP"
  - "Laravel"
  - "SQL"
  - "REST APIs"
  - "Core Banking Systems"
---

## Problem
Traditional bank account opening relied on manual paperwork and fragmented verification, leading to long onboarding times, inconsistent compliance enforcement, and poor customer experience.

## Constraints
- Regulatory requirements (CDD / ECDD)
- Integration with Core Banking Systems
- Multi role approval workflows (maker checker)
- Auditability and traceability
- No partial or duplicate execution allowed

## How It Was Built
The core of the system is a workflow state machine that models the full account lifecycle: customer registration, document capture, risk scoring, blacklist/PEP screening, multi level maker checker approval, and finally an irreversible commit to the Core Banking System. Each state transition is validated server side so a request can never skip a required approval step or reach the bank's core ledger in a partial state.

Two design decisions did most of the work: idempotency keys on every state-changing request, so retries or duplicate submissions during a slow network or an approver's double click never create duplicate accounts; and a strict separation between "propose" and "commit" phases, so nothing touches the Core Banking System until every compliance check and approval has cleared.

## Key Technical Details
- Explicit workflow states for account lifecycle management, enforced server side rather than left to client logic
- Rule based validation engine for CDD/ECDD risk scoring and blacklist/PEP checks
- Maker checker approval gate before any irreversible action
- Failure path handling designed around "no partial execution," including automatic rollback of in-flight state on error
- Idempotent request handling so retries and delays never duplicate an account

## Results
- Reduced onboarding time from 3 days to under 1 hour
- Cut manual document error rate by 60%
- Enabled scalable digital onboarding across multiple banks

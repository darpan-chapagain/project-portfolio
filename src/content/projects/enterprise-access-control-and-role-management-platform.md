---
title: "Enterprise Access Control & Role Management Platform"
short: "Access control and roles"
kind: professional
order: 3
domain: "Identity & Access Management"
role: "Technical Project Manager / Systems Lead"
summary: "User access provisioning across enterprise banking systems was manual, inconsistent, and difficult to govern, leading to delays and security risk when employees changed roles or left the organization."
results:
  - "Reduced manual access provisioning overhead"
  - "Improved operational turnaround time for access requests"
  - "Increased consistency and security across banking systems"
stack:
  - ".NET"
  - "SQL"
  - "PostgreSQL"
  - "MySQL"
  - "Redis"
  - "RabbitMQ"
  - "Workflow Engines"
company: "AMNIL Technologies"
art: "key"
group: "fintech"
---

## Problem
User access provisioning across enterprise banking systems was manual, inconsistent, and difficult to govern, leading to delays and security risk when employees changed roles or left the organization.

## Constraints
- Role based access control (RBAC) across multiple internal systems
- Multi step approval workflows for access grants and revocations
- Auditability and safe, immediate revocation

## How It Was Built
Access requests flow through a hierarchical RBAC model rather than being granted ad hoc: each role maps to a defined set of permissions, and requests to change a user's role trigger an asynchronous approval queue (backed by RabbitMQ) so approvers aren't blocking the requester in real time. Approved changes are applied atomically, and every grant or revocation is written to an immutable audit log.

Revocation was treated as a first class path, not an afterthought: because access changes are queued and applied through the same state machine as grants, revoking access follows the identical, auditable code path rather than a separate, less tested one.

## Key Technical Details
- Hierarchical RBAC model with clearly scoped role to permission mappings
- Asynchronous approval queues via RabbitMQ, decoupling approval latency from request submission
- Safe rollback and revocation handling using the same state machine as access grants
- Complete audit trail for every access change

## Results
- Reduced manual access provisioning overhead
- Improved operational turnaround time for access requests
- Increased consistency and security across banking systems

# Project Portfolio: Darpan Chapagain

This repository documents the professional and academic projects I have worked on across fintech systems, enterprise platforms, distributed applications, mobile and on-device AI, game systems, computer vision, and high-performance computing.

The focus of this portfolio is on:

- system design and architecture
- workflow and state management
- data validation and correctness
- integration patterns and failure handling
- scale, constraints, and trade-offs

This repository does not contain proprietary code or confidential information. All descriptions are written at a system and architectural level. For projects I built solo (marked "Solo Developer"), the code itself is public in the linked repos; for professional projects, only the architecture is described.

---

## Professional Projects (Industry)

### Digital Account Opening & Compliance Automation System
**Domain:** Digital Banking, Compliance
**Role:** Technical Project Manager

**Problem**
Traditional bank account opening relied on manual paperwork and fragmented verification, leading to long onboarding times, inconsistent compliance enforcement, and poor customer experience.

**Constraints**
- Regulatory requirements (CDD / ECDD)
- Integration with Core Banking Systems
- Multi role approval workflows (maker checker)
- Auditability and traceability
- No partial or duplicate execution allowed

**How It Was Built**
The core of the system is a workflow state machine that models the full account lifecycle: customer registration, document capture, risk scoring, blacklist/PEP screening, multi level maker checker approval, and finally an irreversible commit to the Core Banking System. Each state transition is validated server side so a request can never skip a required approval step or reach the bank's core ledger in a partial state.

Two design decisions did most of the work: idempotency keys on every state-changing request, so retries or duplicate submissions during a slow network or an approver's double click never create duplicate accounts; and a strict separation between "propose" and "commit" phases, so nothing touches the Core Banking System until every compliance check and approval has cleared.

**Key Technical Details**
- Explicit workflow states for account lifecycle management, enforced server side rather than left to client logic
- Rule based validation engine for CDD/ECDD risk scoring and blacklist/PEP checks
- Maker checker approval gate before any irreversible action
- Failure path handling designed around "no partial execution," including automatic rollback of in-flight state on error
- Idempotent request handling so retries and delays never duplicate an account

**Results**
- Reduced onboarding time from 3 days to under 1 hour
- Cut manual document error rate by 60%
- Enabled scalable digital onboarding across multiple banks

**Tech Stack:** PHP, Laravel, SQL, REST APIs, Core Banking Systems

---

### Automated Banking Payroll Processing System
**Domain:** Banking Operations, Payroll
**Role:** Technical Project Manager

**Problem**
Payroll execution for corporate banking customers was manual, error prone, and difficult to audit, creating operational risk and delays for HR teams managing large employee counts.

**Constraints**
- Batch payroll processing at scale (10,000+ employees per run)
- Approval based execution before any funds move
- Core Banking System integration
- High sensitivity to duplicate or partial execution

**How It Was Built**
Payroll runs as a batch pipeline with a validation pass that checks every line item (account numbers, amounts, employer funding balance) before a single transaction is allowed to post. Execution only proceeds after an explicit approval step, and the whole batch is treated as a single unit: if any part of the batch fails validation, the entire run halts rather than posting a partial payroll, which would be far harder to reconcile than not running at all.

Every step, from batch intake to individual transaction posting, writes to an execution log, so any payroll run can be reconstructed end to end for audit or dispute resolution.

**Key Technical Details**
- Batch level validation prior to execution (account validity, balance checks, duplicate detection)
- Approval enforcement gating transaction posting
- Failure handling designed to prevent partial payroll posting through controlled transaction commits
- Execution logs providing a full audit and reconciliation trail per run

**Results**
- Reduced HR processing effort by 40%
- Enabled secure monthly payroll execution for 10,000+ employees
- Improved audit readiness and reconciliation speed

**Tech Stack:** PHP, Laravel, SQL, Oracle, REST APIs

---

### Enterprise Access Control & Role Management Platform
**Domain:** Identity & Access Management
**Role:** Technical Project Manager / Systems Lead

**Problem**
User access provisioning across enterprise banking systems was manual, inconsistent, and difficult to govern, leading to delays and security risk when employees changed roles or left the organization.

**Constraints**
- Role based access control (RBAC) across multiple internal systems
- Multi step approval workflows for access grants and revocations
- Auditability and safe, immediate revocation

**How It Was Built**
Access requests flow through a hierarchical RBAC model rather than being granted ad hoc: each role maps to a defined set of permissions, and requests to change a user's role trigger an asynchronous approval queue (backed by RabbitMQ) so approvers aren't blocking the requester in real time. Approved changes are applied atomically, and every grant or revocation is written to an immutable audit log.

Revocation was treated as a first class path, not an afterthought: because access changes are queued and applied through the same state machine as grants, revoking access follows the identical, auditable code path rather than a separate, less tested one.

**Key Technical Details**
- Hierarchical RBAC model with clearly scoped role to permission mappings
- Asynchronous approval queues via RabbitMQ, decoupling approval latency from request submission
- Safe rollback and revocation handling using the same state machine as access grants
- Complete audit trail for every access change

**Results**
- Reduced manual access provisioning overhead
- Improved operational turnaround time for access requests
- Increased consistency and security across banking systems

**Tech Stack:** .NET, SQL, PostgreSQL, MySQL, Redis, RabbitMQ, Workflow Engines

---

### Multi Channel Banking Notification System (SMS & Viber)
**Domain:** Messaging & Notifications
**Role:** Technical Project Manager

**Problem**
Banks required reliable customer notifications with delivery guarantees, provider fallback, and visibility into message success or failure across multiple channels.

**How It Was Built**
The system sits behind a single internal interface that abstracts away which underlying provider (SMS or Viber) actually sends a given message. If the primary provider fails or times out, the router automatically falls back to a secondary provider without the calling service needing to know a failure occurred. Delivery confirmations arrive via secure, verified callbacks, and every attempt (success, retry, or final failure) is logged for analytics and troubleshooting.

**Key Technical Details**
- Provider agnostic message routing behind a unified interface
- Automatic retry and fallback strategy for failed delivery attempts
- Secure callback verification for delivery confirmation
- Delivery analytics and logging for full visibility into message outcomes

**Results**
- Achieved 99.5%+ delivery rate with zero delivery dropouts
- Reduced operational overhead for message handling

**Tech Stack:** PHP, REST APIs, Messaging Queues

---

### Banking Microsite & Content Management Platform
**Domain:** Web Platforms, Banking Marketing
**Role:** Project Manager

**Problem**
Banks required a flexible platform to manage marketing content, product information, and financial calculators without needing engineering involvement for routine updates.

**How It Was Built**
The platform is built around a modular page and component architecture: marketing and product teams compose pages from reusable components (text blocks, product cards, calculators) through the CMS rather than requesting new templates from engineering. The EMI calculator was built as a self contained, embeddable component so it could be dropped into any page without custom development. Page configuration also drives SEO metadata directly, keeping search optimization in the hands of the content team.

**Key Technical Details**
- CMS based content architecture with modular page and component structure
- Interactive, embeddable financial calculators (e.g., EMI)
- SEO focused page configuration exposed to non-technical users

**Results**
- Site speed improved by 70%
- Page retention increased 2.3x
- Eliminated engineering dependency for routine content updates

**Tech Stack:** PHP, CMS Architecture, SQL

---

### Learning Management & Job Matching Platform (Hivelaya)
**Domain:** EdTech, Recruitment Platforms
**Role:** Project Manager / Systems Coordinator

**Problem**
Job seekers lacked a unified platform to build skills, prove competency, and get matched to relevant openings, forcing them to piece together separate learning and job search tools.

**How It Was Built**
The platform combines a course and enrollment engine with a skills assessment layer: completing a course or quiz produces a certification record that feeds directly into a skills profile, which in turn drives job recommendations. A resume builder pulls from the same skills profile so a learner's proven competencies (not just self reported skills) shape both their resume and the jobs they're matched to.

**Key Technical Details**
- Course publishing and enrollment flows
- Skill assessment, quiz, and certification logic feeding a shared skills profile
- Resume builder integrated with the skills profile
- Skills based job recommendation logic connecting learners to relevant postings
- Analytics for user progress and engagement tracking

**Results**
- Served thousands of learners across Nepal
- Centralized learning, certification, and job matching into one workflow

**Tech Stack:** Python, .NET, REST APIs, PostgreSQL

---

### E-commerce Marketplace Integration & Synchronization Platform
**Domain:** SaaS, E-commerce Integrations
**Role:** Tech Support Team Lead & Scrum Master

**Problem**
Merchants selling on several channels at once (Shopify, Etsy, eBay, Amazon, Faire, WooCommerce) had to keep listings, stock, and orders in step by hand. One missed update meant overselling an item that had already sold elsewhere, and hours of manual reconciliation.

**Context**
Digital Product Labs builds a family of Shopify apps that connect a store to other sales channels: DPL Etsy Integration, DPL eBay Integration, Faire: Import, Export, Fulfill, an Awin and CJ product feed for affiliate networks, and License Keys & Codes for selling digital keys. I worked across these apps for two and a half years, first in customer technical support and PHP development, then as Scrum Master, then leading the support team.

**How It Was Built**
Synchronization is webhook driven: marketplace events (a sale, a stock change) trigger background jobs rather than blocking the request that generated them. Each job is built to handle partial failure gracefully, since a downstream marketplace API returning an error or timing out shouldn't leave inventory counts inconsistent across platforms; failed jobs are retried with rate-limit awareness so retries don't trip the marketplace's own throttling.

Inventory is matched by SKU and location, so a sale on one channel reduces stock everywhere else. Orders flow back into Shopify with their tracking details, and merchants choose which fields (price, title, description) sync, so a channel-specific listing isn't overwritten by accident.

**My Part**
- Fixed bugs and shipped feature updates in PHP and Laravel across the Shopify, Etsy, and WooCommerce sync apps, and kept their data consistent
- Ran Scrum ceremonies (planning, standups, reviews, retros) and kept the backlog clean
- Led a 6-person customer support team serving merchants worldwide
- Turned support tickets into product work: recurring issues went straight into the backlog as fixes and improvements
- Reworked the HelpScout setup with automated tagging and better FAQ flows

**Key Technical Details**
- Webhook driven updates across Shopify, Etsy, eBay, Amazon, Faire, and WooCommerce
- Background job processing decoupled from the triggering request
- Rate limit aware retry logic and partial failure handling
- SKU and location based inventory matching to prevent overselling
- Data consistency enforcement across marketplaces after partial failures

**Results**
- Reduced manual merchant errors by approximately 25%
- App store rating improved from 4.5 to 4.8
- Support tickets down 30% after better backend error handling in the Shopify and Etsy sync
- Listing-to-sale time for WooCommerce sellers on Amazon and eBay down 15%
- Average customer response time cut from 12 hours to 45 minutes
- Customer satisfaction up from 75% to 90% in a year

**Tech Stack:** PHP, Laravel, React, MySQL, Shopify, Etsy, eBay, Amazon, Faire, and WooCommerce APIs

---

### Large Scale Banking Data Migration & Validation
**Domain:** Data Engineering
**Role:** Project Manager

**Problem**
Migrating over 100,000 legacy customer records to a new system carried high risk of data loss, duplication, or service disruption during cutover.

**How It Was Built**
Migration ran in controlled phases rather than as a single cutover event: a validation pass checked source data integrity before migration, a staged cutover moved data in verifiable batches, and a post migration verification pass reconciled record counts and checksums against the source system before the legacy system was retired. Rollback readiness was maintained at every stage, so any phase could be reversed without touching data that had already been verified.

**Key Technical Details**
- Pre migration data integrity validation
- Staged, verifiable cutover execution
- Post migration verification and reconciliation
- Rollback readiness maintained at every phase

**Results**
- Migrated 100,000+ customer records with zero data loss
- Zero rollback required
- Minimal service disruption during cutover

**Tech Stack:** SQL, Oracle DB

---

## Independent & Academic Projects

### FitTracker: Local First, On Device AI Fitness Tracker
**Domain:** Mobile, On Device AI/ML
**Role:** Solo Developer (personal project)

**Problem**
Most AI powered fitness apps require sending personal health and dietary data to a cloud backend, which means ongoing hosting costs, privacy exposure, and no functionality without an internet connection.

**Constraints**
- Zero cloud backend, zero recurring hosting cost
- All inference and data storage fully on device
- Nutrition figures must be accurate, not hallucinated by a language model

**How It Was Built**
The app runs a quantized Gemma 2B model directly on the phone via Google's MediaPipe LLM Inference API, so natural language logging like "had chicken breast and rice for lunch" is parsed entirely on device with nothing sent to a server. The key architectural decision was keeping the LLM's job narrow: it only extracts structured meaning from free text (what food, how much). Every actual nutrition and macro number comes from a verified, locally cached Open Food Facts database lookup, not from the model, which removes the model's ability to hallucinate a calorie count.

On top of that sits a deterministic nutrition engine using the Müller BMR formula (based on lean and fat mass rather than just height and weight), with goal driven macro targets for cutting, bulking, or recomposition, plus a rule based workout progression engine and a constraint based weekly meal planner. All of this is built on a normalized 10 entity relational schema behind a repository pattern, with a local first data pipeline that falls back to an API only when a food isn't already cached, keeping the app usable fully offline after initial data population.

**Key Technical Details**
- On device LLM inference (Gemma 2B, quantized) via MediaPipe, zero data leaving the device
- Hybrid AI/deterministic architecture: LLM parses language only, verified database supplies all nutrition data
- Local first data pipeline with on demand API fallback and permanent caching
- Müller BMR based nutrition engine with goal driven, adaptive macro targeting
- Rule based workout progression engine and constraint based weekly meal planner
- Normalized 10 entity relational schema with strict repository pattern data access
- Custom Jetpack Compose design system (typography, color tokens, spring physics motion, 15+ reusable components)
- Play Store native subscription billing with tiered feature gating; scheduled reminders via WorkManager/AlarmManager

**Results**
- Fully offline Android app with no recurring hosting cost
- No user data ever leaves the device

**Tech Stack:** Kotlin, Jetpack Compose, Room (SQLite), Retrofit, MediaPipe (on device LLM/Gemma 2B), Navigation Compose, Coroutines/Flow, WorkManager, Play Billing, MVVM/Repository Pattern

---

### Himal Ash: 2D Action Platformer
**Domain:** Game Development, Systems Engineering
**Role:** Solo Developer (primary)

**Problem**
Building responsive, bug free combat and movement in an action game requires state logic that can grow (new moves, new enemies, new spells) without each addition risking side effects across the whole system.

**How It Was Built**
Player movement and combat run on an 11 state finite state machine (idle, walk, sprint, jump, fall, wall jump, 3 hit melee combo, spellcast, block, damaged, death), with each state's transitions isolated so a change to, say, the combo timing window doesn't risk breaking wall jump behavior. Enemies run on a separate state machine (idle, patrol, chase, melee attack, damaged, death) driven by per enemy ScriptableObject configs (detection range, speed, damage, cooldowns), so a new enemy type is a matter of authoring a new config asset rather than writing new code.

Player and enemy combat both route through a shared, event driven health/damage system, decoupling damage sources from health consumers so a new weapon or spell doesn't need to know anything about what it's hitting. Spells follow the same pattern: a generic spell inventory and cooldown manager plugs into ScriptableObject defined spells (a projectile spell and an AoE spell shipped), so adding a new spell doesn't touch the core pipeline. Player state persists across sessions via a local SQLite save/load system, and three levels (forest, mid level, boss arena) connect through a scene transition system using triggerable doors and spawn points.

Debugging highlights included tracking down a scene transition trigger loop caused by overlapping colliders, invisible sprites traced to a render pipeline configuration gap, and erratic enemy behavior caused by a physics collider sizing mismatch during combat.

**Key Technical Details**
- 11 state finite state machine for player movement and combat, with isolated transition logic
- Separate, ScriptableObject configured enemy AI state machine supporting new enemy types without code changes
- Event driven shared health/damage system decoupling damage sources from consumers
- ScriptableObject based spell system (projectile and AoE spells) plugging into a generic inventory/cooldown manager
- Local SQLite save/load system for persistent player state
- Scene transition system connecting three playable levels via triggerable doors and spawn points

**Results**
- Delivered three connected, playable levels with functioning enemy encounters and a boss arena in approximately two weeks

**Tech Stack:** Unity 6, C#, Universal Render Pipeline (2D), Cinemachine, Unity Input System, SQLite

---

### Real Time Pose Analysis & Exercise Quality Tracking System
**Domain:** Computer Vision
**Role:** Developer

**Problem**
Fitness tracking systems often lack real time feedback on exercise form and quality, leaving users to guess whether they're performing a movement correctly.

**How It Was Built**
The system tracks body landmarks per frame and computes joint angles from their geometric relationships (e.g., the angle at the elbow or knee) rather than relying on raw pixel positions, which makes the tracking robust to camera distance and angle. A state machine tracks each repetition through its phases (starting position, contraction, extension) using angle thresholds, so a rep only counts once it passes through the full expected range of motion, and the live feedback loop flags form issues (e.g., incomplete range of motion) in real time.

**Key Technical Details**
- Joint angle computation using geometric relationships between tracked landmarks
- State based repetition counting driven by angle thresholds across the full movement range
- Real time feedback loop for exercise form quality

**Tech Stack:** Python, MediaPipe, OpenCV

---

### High Performance Route Optimization (Traveling Salesman Problem)
**Domain:** Algorithms, High Performance Computing
**Role:** Developer

**Problem**
Solving the Traveling Salesman Problem for large, real world location datasets is computationally expensive on a single machine, since the search space grows factorially with the number of points.

**How It Was Built**
The distance matrix between all location pairs is generated using the Haversine formula (great circle distance), then the optimization search is parallelized across an HPC cluster using SLURM for job scheduling, splitting the search space across compute nodes. The same workload was also run on AWS to compare parallel execution performance and cost across a traditional HPC cluster versus elastic cloud compute.

**Key Technical Details**
- Haversine formula based distance matrix generation for geographic coordinates
- Parallel search execution across an HPC cluster via SLURM job scheduling
- Performance and cost comparison across HPC cluster and AWS cloud execution

**Tech Stack:** Python, SLURM, AWS, HPC

---

## Contact

**Darpan Chapagain**
Email: darpanchapagain8@gmail.com
LinkedIn: [www.linkedin.com/in/darpan-chapagain-8h28](https://www.linkedin.com/in/darpan-chapagain-8h28)
GitHub: [github.com/darpan-chapagain](https://github.com/darpan-chapagain)

# Project Portfolio — Darpan Chapagain

This repository documents the professional and academic projects I have worked on across fintech systems, enterprise platforms, distributed applications, computer vision, and high-performance computing.

The focus of this portfolio is on:
- system design and architecture
- workflow and state management
- data validation and correctness
- integration patterns and failure handling
- scale, constraints, and trade-offs

This repository does **not** contain proprietary code or confidential information. All descriptions are written at a system and architectural level.

---

## Professional Projects (Industry)

---

## Digital Account Opening & Compliance Automation System
**Domain:** Digital Banking, Compliance  
**Role:** Technical Project Manager  

### Problem
Traditional bank account opening relied on manual paperwork and fragmented verification processes, leading to long onboarding times, inconsistent compliance enforcement, and poor customer experience.

### Constraints
- Regulatory requirements (CDD / ECDD)
- Integration with Core Banking Systems
- Multi-role approval workflows (maker–checker)
- Auditability and traceability
- No partial or duplicate execution allowed

### Solution
Designed and delivered a backend-driven workflow system that automated the account onboarding lifecycle, enforced compliance checks, and gated execution through approval flows before committing data to the Core Banking System.

### Key Technical Details
- Defined workflow states for account lifecycle management
- Rule-based validation for compliance and risk checks
- Maker–checker approval before irreversible actions
- Failure-path handling to prevent partial execution
- Idempotent request handling for retries and delays

### Results
- Reduced onboarding time from days to under one hour
- Improved consistency of compliance enforcement
- Enabled scalable digital onboarding for multiple banks

### Tech Stack
PHP, Laravel, SQL, REST APIs, Core Banking Systems

---

## Automated Banking Payroll Processing System
**Domain:** Banking Operations, Payroll  
**Role:** Technical Project Manager  

### Problem
Payroll execution for corporate banking customers was manual, error-prone, and difficult to audit, creating operational risk and delays.

### Constraints
- Batch payroll processing
- Approval-based execution
- Core Banking System integration
- High sensitivity to duplication and partial execution

### Solution
Delivered an automated payroll workflow with validation, approval checkpoints, and controlled execution against Core Banking Systems.

### Key Technical Details
- Batch-level validation prior to execution
- Approval enforcement before posting transactions
- Failure handling to avoid partial payroll execution
- Execution logs for audit and reconciliation

### Results
- Improved payroll execution reliability
- Reduced operational errors
- Enhanced audit readiness

### Tech Stack
PHP, Laravel, SQL, Oracle, REST APIs

---

## Enterprise Access Control & Role Management Platform
**Domain:** Identity & Access Management  
**Role:** Technical Project Manager / Systems Lead  

### Problem
User access provisioning across enterprise banking systems was manual, inconsistent, and difficult to govern, leading to delays and security risk.

### Constraints
- Role-based access control (RBAC)
- Multi-step approval workflows
- Integration with multiple internal systems
- Auditability and safe revocation

### Solution
Designed a centralized access control platform using workflow-driven approvals and asynchronous execution to manage access consistently and securely.

### Key Technical Details
- RBAC models with hierarchical roles
- Workflow-driven approval states for access changes
- Asynchronous execution using message queues
- Safe rollback and revocation handling
- Complete audit trail for access updates

### Results
- Reduced manual access handling
- Improved operational turnaround time
- Increased consistency and security

### Tech Stack
.NET, SQL, PostgreSQL, MySQL, Redis, RabbitMQ, Workflow Engines

---

## Multi-Channel Banking Notification System (SMS & Viber)
**Domain:** Messaging & Notifications  
**Role:** Technical Project Manager  

### Problem
Banks required reliable customer notifications with delivery guarantees, fallback mechanisms, and visibility into message success or failure.

### Solution
Delivered a centralized notification system with provider abstraction, fallback logic, and secure callback handling.

### Key Technical Details
- Provider-agnostic message routing
- Retry and fallback strategies for failed delivery
- Delivery analytics and logging
- Secure callback verification

### Results
- Improved notification delivery reliability
- Reduced operational overhead for message handling

### Tech Stack
PHP, REST APIs, Messaging Queues

---

## Banking Microsite & Content Management Platform
**Domain:** Web Platforms, Banking Marketing  
**Role:** Project Manager  

### Problem
Banks required a flexible platform to manage marketing content, product information, and calculators without developer involvement.

### Solution
Delivered a CMS-driven microsite platform enabling content updates, product displays, and interactive financial tools.

### Key Technical Details
- CMS-based content architecture
- Modular page and component structure
- Interactive calculators (e.g., EMI)
- SEO-focused page configuration

### Results
- Faster content updates
- Reduced dependency on engineering teams

### Tech Stack
PHP, CMS Architecture, SQL

---

## Learning Management & Job Matching Platform
**Domain:** EdTech, Recruitment Platforms  
**Role:** Project Manager / Systems Coordinator  

### Problem
Job seekers lacked a unified platform for skill development, assessment, and job matching.

### Solution
Delivered a platform combining learning management, skill assessment, and job application workflows.

### Key Technical Details
- Course publishing and enrollment flows
- Skill assessment and certification logic
- Job posting and application workflows
- Analytics for user progress and engagement

### Results
- Improved skill-to-job matching
- Centralized learning and recruitment workflows

### Tech Stack
Python, .NET, REST APIs, PostgreSQL

---

## E-commerce Marketplace Integration & Synchronization Platform
**Domain:** SaaS, E-commerce Integrations  
**Role:** Tech Support Team Lead & Scrum Master  

### Problem
Merchants struggled to keep inventory, orders, and products synchronized across multiple marketplaces.

### Solution
Led development of a synchronization platform that automated data flow across e-commerce marketplaces.

### Key Technical Details
- Webhook-driven updates
- Background job processing
- Rate-limit and partial failure handling
- Data consistency enforcement

### Results
- Reduced manual errors by approximately 25%
- Improved merchant operational efficiency

### Tech Stack
PHP, Laravel, React, MySQL, Shopify, Etsy, Amazon, eBay APIs

---

## Large-Scale Banking Data Migration & Validation
**Domain:** Data Engineering  
**Role:** Project Manager  

### Problem
Migrating legacy banking data carried high risk of data loss and service disruption.

### Solution
Executed a structured migration strategy with validation checkpoints, controlled cutover, and rollback readiness.

### Key Technical Details
- Data integrity validation
- Cutover planning and execution
- Post-migration verification

### Results
- Migrated over 100,000 customer records with zero data loss
- Minimal service disruption

### Tech Stack
SQL, Oracle DB

---

## Academic & Technical Projects

---

## Real-Time Pose Analysis & Exercise Quality Tracking System
**Domain:** Computer Vision  
**Role:** Developer  

### Problem
Fitness tracking systems often lack real-time feedback on exercise form and quality.

### Solution
Built a real-time pose analysis system to track joint angles, count repetitions, and evaluate exercise quality.

### Key Technical Details
- Joint angle computation using geometric relationships
- State-based repetition counting
- Real-time feedback loop

### Tech Stack
Python, MediaPipe, OpenCV

---

## High-Performance Route Optimization (Traveling Salesman Problem)
**Domain:** Algorithms, High-Performance Computing  
**Role:** Developer  

### Problem
Solving the Traveling Salesman Problem for large datasets is computationally expensive on a single machine.

### Solution
Implemented a distributed optimization workflow using HPC clusters and cloud resources.

### Key Technical Details
- Distance matrix generation using Haversine formula
- Parallel execution using SLURM
- Performance comparison across execution environments

### Tech Stack
Python, SLURM, AWS, HPC

---

## Contact
Darpan Chapagain  
Email: darpanchapgain8@gmail.com
LinkedIn: [www.linkedin.com/in/darpan-chapagain-8h28](www.linkedin.com/in/darpan-chapagain-8h28)

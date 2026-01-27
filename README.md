# Project Portfolio — Darpan Chapagain

This repository contains technical case studies of professional and academic projects I have worked on across fintech, enterprise systems, distributed platforms, computer vision, and high-performance computing.

The focus of these write-ups is on:
- system architecture and workflows
- integration patterns and data flow
- validation, failure handling, and correctness
- scale, constraints, and trade-offs

No proprietary code or confidential information is included.

---

## Professional Projects (Industry)

---

## Digital Account Opening & Compliance Automation
**Type:** Professional (FinTech)  
**Domain:** Digital Banking, Compliance Automation  
**Role:** Technical Project Manager  

### Problem
Traditional bank account opening relied heavily on manual processes and fragmented verification steps, resulting in long turnaround times and inconsistent compliance enforcement.

### Constraints
- Regulatory compliance (CDD / ECDD)
- Integration with existing Core Banking Systems
- Multi-role approval flows (maker–checker)
- Auditability and traceability
- Zero tolerance for partial or duplicate execution

### Solution
A backend-driven workflow system was implemented to automate the account onboarding lifecycle, enforce compliance checks, and gate execution through approval flows before committing data to Core Banking Systems.

### Key Technical Details
- Defined workflow states for account lifecycle management
- Implemented rule-based validation for compliance checks
- Enforced maker–checker approval before irreversible actions
- Designed failure paths to prevent partial execution
- Ensured idempotent handling of repeated requests

### Data & Integrations
- Core Banking System integrations via REST APIs
- External verification services
- Structured request/response validation

### Results
- Reduced onboarding time from days to under one hour
- Improved compliance consistency
- Enabled scalable digital onboarding for multiple banks

### Tech Stack
PHP, Laravel, SQL, REST APIs, Core Banking Systems

---

## Banking Payroll Automation & Core Banking Integration
**Type:** Professional (FinTech)  
**Domain:** Payroll Processing, Banking Operations  
**Role:** Technical Project Manager  

### Problem
Payroll execution for corporate clients was manual and error-prone, creating audit risk and operational inefficiencies.

### Constraints
- Batch execution with strict validation
- Approval-gated processing
- Core Banking System integration
- Prevention of partial or duplicate execution

### Solution
An automated payroll workflow was implemented with pre-execution validation, approval checkpoints, and controlled execution against Core Banking Systems.

### Key Technical Details
- Batch validation prior to execution
- Approval enforcement before CBS posting
- Failure handling to prevent partial payroll processing
- Execution logging for audit and reconciliation

### Results
- Improved payroll execution reliability
- Reduced operational errors
- Enhanced audit readiness

### Tech Stack
PHP, Laravel, SQL, Oracle, REST APIs

---

## Enterprise Access Control & Workflow Automation Platform (ACMS)
**Type:** Professional (Enterprise FinTech)  
**Domain:** Identity & Access Management  
**Role:** Technical Project Manager / Systems Lead  

### Problem
User access provisioning across enterprise banking systems was manual, inconsistent, and difficult to govern at scale.

### Constraints
- Role-based access control (RBAC)
- Multi-step approval workflows
- Integration with multiple internal systems
- Auditability and safe revocation

### Solution
A centralized access control platform was designed using workflow-driven approvals and asynchronous execution to manage access provisioning consistently.

### Key Technical Details
- RBAC models with hierarchical roles
- Workflow-driven approval states
- Asynchronous execution using message queues
- Safe rollback and revocation handling
- Full audit trail of access changes

### Results
- Reduced manual access handling
- Improved operational turnaround time
- Increased consistency and security

### Tech Stack
.NET, SQL, PostgreSQL, MySQL, Redis, RabbitMQ, Workflow Engines

---

## Notification Engine (SMS / Viber)
**Type:** Professional  
**Domain:** Messaging & Notifications  
**Role:** Technical Project Manager  

### Problem
Banks required reliable notification delivery across multiple providers with fallback and delivery tracking.

### Solution
A centralized notification engine was implemented with provider abstraction, fallback logic, and secure callback handling.

### Key Technical Details
- Provider-agnostic routing
- Retry and fallback strategies
- Delivery analytics and logging

### Tech Stack
PHP, REST APIs, Messaging Queues

---

## E-commerce Marketplace Synchronization Platform
**Type:** Professional (SaaS)  
**Domain:** E-commerce Integrations  
**Role:** Team Lead & Scrum Master  

### Problem
Merchants faced inconsistent inventory, order, and product data across multiple marketplaces.

### Solution
An API-driven synchronization platform was built to automate inventory, order, and product updates across marketplaces.

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

## Large-Scale Banking Data Migration
**Type:** Professional  
**Domain:** Data Engineering  
**Role:** Project Manager  

### Problem
Migration of legacy banking data posed risks of data loss and service disruption.

### Solution
A structured migration plan was executed with validation checkpoints, controlled cutover, and rollback readiness.

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

## Real-Time Pose Analysis & Exercise Quality Tracker
**Type:** Academic / Technical  
**Domain:** Computer Vision  
**Role:** Developer  

### Problem
Existing fitness tracking systems lacked real-time feedback on exercise form and quality.

### Solution
A real-time pose analysis system was built to track joint angles, count repetitions, and evaluate exercise quality.

### Key Technical Details
- Joint angle computation using geometric relationships
- State-based repetition counting
- Real-time feedback loop

### Tech Stack
Python, MediaPipe, OpenCV

---

## High-Performance Route Optimization (Traveling Salesman Problem)
**Type:** Academic (HPC / Algorithms)  
**Domain:** Optimization & Parallel Computing  
**Role:** Developer  

### Problem
Solving the Traveling Salesman Problem for large datasets is computationally expensive on a single machine.

### Solution
A distributed optimization workflow was implemented using HPC clusters and cloud resources.

### Key Technical Details
- Distance matrix generation using Haversine formula
- Parallel execution using SLURM
- Performance comparison across environments

### Tech Stack
Python, SLURM, AWS, HPC

---

## Contact
Darpan Chapagain  
Email: darpanchapgain8@gmail.com
LinkedIn: [www.linkedin.com/in/darpan-chapagain-8h28](www.linkedin.com/in/darpan-chapagain-8h28)

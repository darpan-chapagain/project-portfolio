---
title: "High Performance Route Optimization (Traveling Salesman Problem)"
short: "Route optimization on HPC"
kind: independent
order: 12
domain: "Algorithms, High Performance Computing"
role: "Developer"
summary: "Solving the Traveling Salesman Problem for large, real world location datasets is computationally expensive on a single machine, since the search space grows factorially with the number of points."
results:
  []
stack:
  - "Python"
  - "SLURM"
  - "AWS"
  - "HPC"
---

## Problem
Solving the Traveling Salesman Problem for large, real world location datasets is computationally expensive on a single machine, since the search space grows factorially with the number of points.

## How It Was Built
The distance matrix between all location pairs is generated using the Haversine formula (great circle distance), then the optimization search is parallelized across an HPC cluster using SLURM for job scheduling, splitting the search space across compute nodes. The same workload was also run on AWS to compare parallel execution performance and cost across a traditional HPC cluster versus elastic cloud compute.

## Key Technical Details
- Haversine formula based distance matrix generation for geographic coordinates
- Parallel search execution across an HPC cluster via SLURM job scheduling
- Performance and cost comparison across HPC cluster and AWS cloud execution

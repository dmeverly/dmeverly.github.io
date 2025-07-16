---
layout: post
title: Schedule Templater
date: 2025-06-25
summary: >
    Generates schedule templates using Greedy Search with Simulated Annealing and Local Search/Repair
---

# Problem Statement  
Manual schedule creation is time-consuming and error-prone, particularly when managing overlapping employee preferences and business constraints. I developed this personal project to automate both the generation of a template and its mapping to a calendar. The aim was to reduce the time and coordination burden typically required during scheduling.


# Theoretical Approach  
Scheduling is a classic constraint satisfaction problem. Many algorithms can be applied; however, given the size of the state space, exhaustive search (DFS, BFS) is impractical. Even with weekends hardcoded, assigning three shifts per weekday over six weeks produces a search space of 7<sup>90</sup> possible states.  

Greedy search offers a faster alternative by selecting the best local choice at each step. However, it risks getting stuck in local minima. Simulated Annealing (SA) addresses this by occasionally accepting worse states to escape these local optima. My approach combines both methods, followed by local search and repair to better satisfy remaining constraints.  

# Purpose  
To create a program that automates the creation of schedule templates using Greedy Search with Simulated Annealing.  

# Methods  
I created a list of common workplace scheduling constraints which fell into two broad (non-exhaustive) categories:  

**Employee-specific constraints**  
- Maximum hours per pay period  
- Days each person cannot work  
- Preferred shift times  
- Maximum consecutive shifts  

**Global constraints**  
- Priority order for filling day shifts: Thursday → Monday → Wednesday  
- Only 1 day shift every other weekend  
- Only 1 day shift on Tuesday and Friday unless needed to achieve minimum hours  
- All night shifts must be filled, and at least one day shift every weekday  
- Employees must work at least 80% of their FTE hours  

Each constraint was encoded as a boolean validation rule. I experimented with SA hyperparameters and found an initial temperature of **100** and a cooling rate of **0.9995** worked well. To avoid wasted epochs on stagnant states, I implemented a “best-state restart” after 300 iterations without improvement.  

# Results  
Due to the stochastic nature of Greedy + SA, each run varies. Nearly all runs satisfied all **absolute** constraints and minimized **relative** violations (typically 0–20). Analysis showed most remaining violations were related to “minimum rest” (time between shifts); removing that constraint resulted in zero total violations.  

**Example run _without_ min-rest**  
Initial state → 280,004  
Greedy state → 70,009  
Repair state → 10,005  
Fill state   → 10,000  
Final Sweep  → 0  

**Example run _with_ min-rest & hard-max days/week**  
Initial state → 1,640,011  
Greedy state → 70,013  
Repair state → 5  
Fill state   → 13  
Final Sweep  → 13  

---

### Final Optimization Result  
After reprocessing the best solution through the pipeline, the **final state was globally optimized with a score of just 4** — the lowest recorded across all runs.

---



[View the final template in Google Sheets →](https://docs.google.com/spreadsheets/d/1pQ2ikx7xCO3GEW18450oJszRIT6FUK3cu3nQw0aWBz8/edit?usp=sharing)  

<figure>
  <img src="/assets/templater_Score_by_Epoch.png" alt="Score by Epoch chart showing improvement over training" />
  <figcaption><strong>Figure 1.</strong> Score by Epoch over the course of training.</figcaption>
</figure>  

# Conclusion  
- **Greedy + SA + local repair** reliably produces schedules satisfying all absolute and most relative constraints.  
- No fully constraint-free solution was found without staffing additional hours on “underserved” days—indicating that staffing capacity exceeds current demand.  
- The automation reduces manual effort dramatically compared to hand-crafting templates.  

# Future Work  
This tool automates template generation; a companion “Scheduler” maps that template to an annual calendar. A unified system combining both would be a logical next step.  

# References  
No external publications were cited; however, LLM-assisted queries supported architectural decisions and debugging.  

<a href="https://github.com/dmeverly/ScheduleTemplater?tab=readme-ov-file" style="display: block; text-align:right;" target="_blank">GitHub Repo →</a>

> *Disclaimer: This project was developed independently on personal time and is not affiliated with or endorsed by any employer. It reflects personal exploration of constraint-based scheduling and was inspired by a general challenge, not a formal work assignment.*

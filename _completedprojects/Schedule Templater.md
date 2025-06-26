---
layout: post
title: Schedule Templater
date: 2025-06-25
summary: >
    Builds a schedule template using Greedy Search with Simulated Annealing and Local Search and Repair
---

# Problem Statement  
The project sponsor described issues with the existing scheduling workflow, which involved manually creating a schedule template and mapping it onto an annual calendar. Conflicting employee and business constraints resulted in excessive meetings and constant revisions. I was asked to automate both the creation of the template and its mapping to the calendar.  

# Theoretical Approach
Scheduling is a classic constraint satisfaction problem. Many algorithms can be applied; however, given the size of the state space, exhaustive search (DFS, BFS) is impractical. Even when weekends are hardcoded, assigning 3 shifts per weekday for 6 weeks results in a state space of: 7<sup>90</sup> states!  

Greedy search offers a faster alternative by selecting the best local option at each step. However, it risks getting stuck in local minima. Simulated Annealing (SA) addresses this by occasionally accepting worse states to escape these local optima. My approach combines both methods, followed by local search and repair, to thoroughly analyze and satisfy constraints.  

# Methods  
I interviewed the sponsor and individual employees to gather requirements. Constraints fell into two groups (not-exhaustive):

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
- Employees work at least 80% of their FTE hours  

Once defined, each constraint was encoded as a boolean check. I experimented with SA hyperparameters and found an initial temperature of **100** and a cooling rate of **0.9995** worked well. To avoid wasted epochs on unchanging states, I implemented a “best-state restart” after 300 stagnant iterations.  


# Results 
Because of the stochastic nature of greedy+SA, each run varies. However, nearly all runs met **all absolute** constraints and minimized **relative** violations (typically 0–20). Analysis showed most remaining violations were “minimum rest” (time between shifts) issues—removing that constraint yielded 0 total violations.

**Example run _without_ min-rest**  
Initial state -> 280,004  
Greedy state  -> 70,009  
Repair state  -> 10,005  
Fill state    -> 10,000  
Final Sweep   -> 0  

**Example run _with_ min-rest & hard-max days/week**  
Initial state -> 1,640,011  
Greedy state  -> 70,013  
Repair state  -> 5   
Fill state    -> 13  
Final Sweep   -> 13  

![Score by Epoch chart showing improvement over training](/assets/templater_Score_by_Epoch.png)  
![Final Template preview](/assets/templater_template.png)  

[View the final template in Google Sheets](https://docs.google.com/spreadsheets/d/1pQ2ikx7xCO3GEW18450oJszRIT6FUK3cu3nQw0aWBz8/edit?usp=sharing)  

# Conclusion  
- **Greedy + SA + local repair** reliably produces schedules satisfying all absolute and most relative constraints.  
- No fully constraint-free solution was possible without staffing extra hours on “underserved” days—indicating the organization has more staffing capacity than demand.  
- The automation reduces manual effort dramatically compared to hand-crafting templates.  

# Future Work  
This tool automates template creation; a companion “Scheduler” maps that template to an annual calendar. Integrating both into a single workflow would be a natural next step.  

# References  
No external publications were used, though LLM queries aided architecture and debugging.  

<a href="https://github.com/dmeverly/ScheduleTemplater?tab=readme-ov-file" style="display: block; text-align:right;" target = "_blank">  Github Repo -> </a>  
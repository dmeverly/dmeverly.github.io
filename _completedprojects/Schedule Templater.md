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
The project sponser and individual employees were queried with regard to their scheduling needs and preferences.  Common themes were analyzed and defined as constraints, further divided into global or employee-specific constraints.  
<br></br>

Employee-specific constraints included concepts such as:  
- Maximum hours per pay period  
- Specific days of the week an employee cannot work
- Preferred shift time
- Preferred number of consecutive shifts
<br></br>

While global constraint concepts included:  
- Shift filling priorities for extra coverage (Thursday -> Monday -> Wednesday -> other days only if needed)  
- All critical shifts filled (All nightshifts and at least 1 dayshift every day)

After constraints were defined, boolean satisfaction logic was created, and used as a foundation for creation of the model. SA hyperparameters were explored iteravely and found to be optimal with initial temperature 1000 and cooling rate 0.9995. To avoid wasted epochs on unsolveable states, best-state restart was initiated if the state had not changed for over 300 epochs.

# Results 
As expected, due to the stochastic nature of greedy search and simulated annealing, model performance varied between runs.  Despite variation is final results, the model typically found a workable solution which satisfies all absolute constraints and substantially minimized relative constraint violations.  Typical solutions involved approximately 0-20 relative constraint violations. Analysis of violations on a series of runs found that most violations were minimum rest (ie: time between stretches of shifts) violations, often satisfied early and then violated during the hour-filling step.  Removing this constraint found the model producing a globally-optimal solution with 0 violations.

A typical run without min-rest constraint:  
Initial state -> 280,004  
Greedy state  -> 70,009  
Repair state  -> 10,005  
Fill state    -> 10,000  
Final Sweep   -> 0  

A typical run with min-rest constraint and absolute max days per week:  

Initial state -> 1,640,011  
Greedy state  -> 70,013  
Repair state  -> 5   
Fill state    -> 13  
Final Sweep   -> 13  


![Score by Epoch chart showing improvement over training](.assets/templater_Score_by_Epoch.png) 

![Final Template](.assets/templater_template.xlsx) 

<a href="https://docs.google.com/spreadsheets/d/1pQ2ikx7xCO3GEW18450oJszRIT6FUK3cu3nQw0aWBz8/edit?usp=sharing"
   target="_blank" rel="noopener noreferrer">View Final Template (Google Sheets)
</a>

# Conclusion
Two major observations were made about this solution:  
- The model reliably generates a solution that satisfy the majority of global and employee-level constraints
- No solution was found which satisfies all constraints and does not include employees working on days the organization desired to leave understaffed 

These observations lead me to conclude:  
- Greedy Search with Simulated Annealing followed by Local Search and Repair is a valid model to solve this problem  
- The model significantly reduces the effort compared to manual schedule creation  
- The constraints of employees working their minimum number of hours per pay and the organization's desire to understaff certain shifts are in conflict. The organization appears to have more employees than their work demands.  

# Future Work and Extension  
This solution addresses one half of the sponsor’s problem—template creation. The other half involved mapping the template to an annual calendar. I have already created a separate solution for that task (see "Scheduler"). A natural next step would be to integrate both tools into a unified workflow.  

# References  
No external sources were used. However, LLM queries assisted with architectural design and debugging.  

<a href="https://github.com/dmeverly/ScheduleTemplater" style="display: block; text-align:right;" target = "_blank">  Readme -> </a>

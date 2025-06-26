---
layout: post
title: Schedule Templater
date: 2025-06-25
summary: >
    Builds a schedule template using Greedy Search with Simulated Annealing and Local Search and Repair
---

## Problem Statement  
The project sponsor described issues with the existing scheduling workflow, which involved manually creating a schedule template and mapping it onto an annual calendar. Conflicting employee and business constraints resulted in excessive meetings and constant revisions. I was asked to automate both the creation of the template and its mapping to the calendar. 
  
# Description  
This program automates the template creation process by accepting a rough draft of a schedule and refining it using predefined global and employee-specific constraints. The system explores the state space using greedy search combined with simulated annealing until no significant improvements are observed. This is followed by local repair and local search phases to resolve any remaining constraint violations. The final template is exported as template.xlsx.

# Theoretical Approach
Scheduling is a classic constraint satisfaction problem. Many algorithms can be applied; however, given the size of the state space, exhaustive search (DFS, BFS) is impractical. Even when weekends are hardcoded, assigning 3 shifts per weekday for 6 weeks results in a state space of: 7<sup>90</sup> states!  

Greedy search offers a faster alternative by selecting the best local option at each step. However, it risks getting stuck in local minima. Simulated Annealing addresses this by occasionally accepting worse states to escape these local optima. My approach combines both methods, followed by local search and repair, to thoroughly analyze and satisfy constraints.

# Methods 
- templater.py is the main script which begins initilization and flow orchestration.  
- Employee and constraint definitions are located in helpers.py.  These can be edited, including the addition of new constraints.  If new constraints are added, logic for constraint satisfaction needs to also be added.
- solver.py contains agent search and repair methods. Those wishing to solve using another model can extend solver.py with methods suited for other algorithms.  
- Multi-week template generation  
- Custom employee constraints  
- Greedy intialization with annealing  
- Visualization of performance over time  
- Template in .xlsx format  

# Results 
Due to the stochastic nature of greedy search and simulated annealing, output will vary between runs. The algorithm continues refining the solution until it reaches a near-optimal state. A typical run with minimal constraints:    

Initial state -> 280,004  
Greedy state  -> 70,009  
Repair state  -> 10,005  
Fill state    -> 10,000  
Final Sweep   -> 0  

To challenge the model, constraints were added for minimum rest period between shifts and to prevent solutions involving any employee working more than 5 days in a single week:  

Initial state -> 1,640,011  
Greedy state  -> 70,013  
Repair state  -> 5   
Fill state    -> 13  
Final Sweep   -> 13  


![Score by Epoch chart showing improvement over training](assets/templater_Score_by_Epoch.png) 

![Final Template](assets/templater_template.xlsx) 

<a href="https://docs.google.com/spreadsheets/d/1pQ2ikx7xCO3GEW18450oJszRIT6FUK3cu3nQw0aWBz8/edit?usp=sharing"
   target="_blank" rel="noopener noreferrer">View Final Template (Google Sheets)
</a>

# Conclusion
The model reliably generates schedule templates that satisfy both global and employee-level constraints in most runs. This significantly reduces the effort compared to manual schedule creation. Any dissatisfaction with the output can typically be resolved by encoding additional constraints or adjusting the scoring logic accordingly.

# Future Work and Extension  
This solution addresses one half of the sponsor’s problem—template creation. The other half involved mapping the template to an annual calendar. I have already created a separate solution for that task (see the "Scheduler" on GitHub). A natural next step would be to integrate both tools into a unified workflow.

# References  
No external sources were used. However, LLM queries assisted with architectural design and debugging.  

<a href="https://github.com/dmeverly/ScheduleTemplater" style="display: block; text-align:right;" target = "_blank">  Readme -> </a>

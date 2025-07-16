---
layout: post
title: Scheduler
date: 2025-02-06
summary: >
  Automated schedule transcription tool that reads a rotating template and generates a monthly employee work schedule.
---

# Problem Statement  
Manual transcription of rotating shift templates onto an annual calendar can be time-consuming and error-prone. After encountering this problem in a workplace setting, I independently developed a solution to automate the process and improve efficiency.

# Purpose  
To build a Python script that automates the conversion of a rotating shift template into a monthly employee schedule, minimizing manual input and reducing the chance for human error.

# Methods  
I analyzed a typical shift template and created a `pandas`-based script that:
- Cleans and parses structured Excel data
- Transcribes employee names and shifts onto a monthly calendar
- Outputs the final schedule as a `.csv` file

Additional features include:
- Flexible start week selection within the template
- Support for generating schedules over any number of months

# Results & Conclusion  
The tool produces clean, accurate schedules with minimal runtime. It eliminates the need for manual transcription and has proven effective in real-world scheduling workflows. It pairs well with my separately developed **Schedule Templater** to support full automation from template generation to calendar export.

# Future Work  
Plans include combining this scheduler with the templating engine to allow fully automated monthly schedule generation from customizable constraints and preferences.

# References  
No formal publications were used; LLM-based tools supported design, syntax learning, and debugging.

<a href="https://github.com/dmeverly/Scheduler" style="display: block; text-align:right;" target="_blank">GitHub Repo →</a>

---

> *Disclaimer: This project was developed independently using public tools on personal time. It is not affiliated with or endorsed by any employer, and no proprietary systems or resources were used in its creation.*

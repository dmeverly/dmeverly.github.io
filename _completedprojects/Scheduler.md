---
layout: post
title: Scheduler
date: 2025-02-06
summary: >
  Automated schedule transcription tool that reads a rotating template and generates a monthly employee work schedule.
---

# Problem Statement  
The client’s workflow involved manually transcribing a rotating employee schedule onto an annual calendar—a process described as tedious and inefficient. I was asked to automate this task to save time and reduce errors.

# Purpose  
To develop a script that reads a predefined rotating template and automatically generates a monthly employee work schedule.

# Methods  
I analyzed the template format and built a Python script using `pandas` to read, clean, and process the data. The script:
- Removes headers and extraneous information.
- Transcribes employee shifts onto a monthly calendar.
- Exports the result as a `.csv` file.

Additional features include the ability to:
- Start from any week in the template.
- Generate schedules for an arbitrary number of months.

# Results & Conclusion  
The final tool runs quickly and generates accurate, visually structured schedules. It has fully replaced the client’s manual process.

# Future Work  
Next steps include integration with the full schedule templater system, enabling end-to-end automation of both template creation and calendar generation with minimal user input.

# References  
No formal publications were used; LLM queries supported design and debugging.

<a href="https://github.com/dmeverly/Scheduler" style="display: block; text-align:right;" target="_blank">GitHub Repo →</a>

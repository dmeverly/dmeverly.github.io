---
layout: post
title: Problem List Initiative
date: 2025-05-01
summary: >
  In progress  
--- 
writeup in progress

# Summary  
As part of a multidisciplinary team of healthcare providers, Physician Builders, software engineers, and executives tasked with cleaning up the Problem List, I implemented a standardized ICU transfer note.  The tool provided prompts for users to address the problem list at time of transfer and served as a platform to improve communication during provider handoff.  After successful pilot at WellSpan Chambersburg Hospital, the note is now being implemented system-wide as part of the standard workflow.  

The outcome of the project was a 1.57% year-over-year decline in problem list length for the first time ever, with at least 232,000 outdated conditions removed and saving approximately 483 hours of providers' time. A follow-up survey of providers showed a 4.5% improvement in communication and 5.3% improvement in overall efficiency.

# Problem Statement  
In July, 2024, the average problem list length for an active WellSpan patient was 12.21 items, with an annual growth rate of 2.66%.  Among providers polled:
- 73% believed the problem list harmed communication and provider experience
- 75% believed the problem list reduced efficiency
- 65% reported problem list length was a patient safety risk

During problem analysis we found that the problem list was not being effectively updated at times of care transitions, especially during transfers from the ICU to the general inpatient floors. This was thought to be an excellent opportunity for improvement, and I was asked to take charge of this part of the project.

# Approach
The issue of medical error during transitions of care is well-documented in literature.  Errors are especially prevelant when transitions are occuring from highly complex care areas to areas of lower complexity or at time of hospital discharge.  ICU Hospital Course Summaries are often long and bloated, leading to failure to clearly communicate pertinent information effectively.  Further complicating communication at the time of ICU transfer is variability in ICU-providers' documentation, system-oriented charting (SOC), and Hospitalist documentation, problem-oriented charting (POC).

When examining current workflows it was evident that all ICU providers write a progress note on the day of transfer, but there was no standardized process in place for communication.  Standardizing a note for use on the day of transfer seemed the most logical solution.

# Purpose  
To develop a standardized note template which:
- Reminds user to update the problem list
- Provides an effective means to communicate the hospital course
- Eases the process of conversion from SOC to POC charting

# Methods  
During information gathering, I arranged meetings with the Directors of the Hospitalist and Critical Care service lines.  We discussed preferences and anticipated barriers to transfer note implementation. I found that the leaders of both service lines were receptive and supportive of the solution.  The ICU team had an additional request that the note would meet the minimum necessary criteria to be billed as a Progress Note, such that they did not need to write 2 notes on the day of discharge. The note was created in Epic and approved by WellSpan Senior Administration.

The note was piloted at WellSpan Chambersburg Hospital, the note is now being implemented system-wide as part of the standard workflow and had the following features:  
- Minimalist style
- Dynamic Hospital Course SmartLink
- EpicACT Link to Problem List
- Free-text section for POC
- SmartLinks to requested clinical data

To support ease of maintaining the Hospital Course Summary, EpicACT links were added to the ICU progress note template. This link allows providers to update the Hospital Course but does not include in the progress note at the time of signing, further reducing note character counts.

Transfer Note During Creation - Pulls in Hospital Course SmartLink
![Transfer Note](/assets/transfer1.PNG)

Separate Hospital Course
![Hospital Course](/assets/hc1.PNG)

Added EpicACT Links to ICU Progress Note Template
![Progress Note](/assets/pn1.PNG)

# Results 
The transfer note template met tremendous success during the pilot phase. Hospitalist and ICU staff members were given several follow-up surveys over the next few months and found the note to significantly improve transfer communications and did not cause undue documentation burden from ICU staff. 

One concern was brought by an ICU staff member over the preservation of Hospital Course data between hospitalizations. After review, it was found that the data remained persistent and accessible.

After the pilot, I attended several meetings with WellSpan Senior Administration and provided a demonstration of the solution to several stakeholders at other WellSpan facilities. The organization decided to implement the note system-wide as part of the standard workflow for ICU transfer of care.

The outcome of the overall project was a 1.57% year-over-year decline in problem list length for the first time ever, with at least 232,000 outdated conditions removed and saving approximately 483 hours of providers' time. A follow-up survey of providers showed a 4.5% improvement in communication and 5.3% improvement in overall efficiency.

# Conclusion  
Our work made a significant impact on problem list size and, by extension, provider perception of patient safety and efficiency.  The ICU Transfer Note was an effective solution for increasing Problem List reconcilitation, improving provider perception of communication, and providing a standard method for converting SOC to POC charting formats.

# Future Work  
Minimizing note bloat can significantly improve clinical documentation quality, communication, and efficiency. Diagnosis-Aware Notes (DAN) are an alternative to POC or SOC note formats and may more effectively address note bloat, but conversion to DAN requires user acceptance.  While a DAN implementation was considered, all parties were not in agreement, so we chose to forego a solution involving DAN.  Future work may consider DAN, if users are willing to adapt to the change.

# References  
No external publications were used, though LLM queries aided architecture and debugging.  

<a href="https://github.com/dmeverly/ScheduleTemplater?tab=readme-ov-file" style="display: block; text-align:right;" target = "_blank">  Github Repo -> </a>  
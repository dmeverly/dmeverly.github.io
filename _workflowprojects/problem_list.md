---
layout: post
title: Problem List Initiative
date: 2025-05-01
summary: >
  Standardized ICU transfer note to improve Problem List accuracy and provider communication system-wide.
--- 

# Summary  
As part of a multidisciplinary team of healthcare providers, Physician Builders, software engineers, and executive leadership, I implemented a standardized ICU transfer note aimed at improving Problem List reconciliation and provider handoffs during care transitions. The note prompts clinicians to update the Problem List at the time of transfer and provides a structured format for communicating hospital course.

Following a successful pilot at WellSpan Chambersburg Hospital, the note was approved for **system-wide rollout** across all WellSpan facilities.

The initiative led to a **1.57% year-over-year reduction** in Problem List length—marking the first decline ever recorded. More than **232,000 outdated conditions were removed**, saving an estimated **483 hours of provider time**. Post-implementation surveys showed a **4.5% improvement in communication** and **5.3% improvement in efficiency**.

# Problem Statement  
As of July 2024, the average active-patient Problem List at WellSpan contained **12.21 diagnoses**, with an annual growth rate of **2.66%**. A provider survey revealed:

- 73% felt the Problem List harmed communication and provider experience  
- 75% said it reduced efficiency  
- 65% viewed it as a patient safety risk  

Workflow analysis showed that the Problem List was rarely updated during **ICU-to-floor transfers**—a high-risk transition point. I was asked to take the lead on improving this specific workflow.

# Approach  
Transitions of care are a well-documented source of communication error, especially from high-acuity units like the ICU. Documentation styles vary significantly: ICU teams typically use **System-Oriented Charting (SOC)** while Hospitalists use **Problem-Oriented Charting (POC)**. This mismatch further complicates handoffs.

Most ICU providers write a progress note on the day of transfer, but no standard format was in place. A structured note prompting clinicians to reconcile the Problem List and summarize the hospital course was the most logical solution.

# Purpose  
To develop a standardized ICU transfer note that:
- Reminds providers to reconcile the Problem List  
- Supports smooth communication of the hospital course  
- Bridges SOC to POC documentation styles  
- Meets billing requirements for a daily progress note  

# Methods  
I coordinated meetings with the Directors of Hospitalist and Critical Care services to understand barriers and align expectations. ICU teams requested that the new note meet progress note billing criteria to avoid writing duplicate notes.

The note was created in **Epic**, approved by WellSpan Senior Administration, and piloted at **WellSpan Chambersburg Hospital**. Key features included:

- Minimalist design  
- Dynamic Hospital Course SmartLink  
- EpicACT link to update the Problem List  
- Free-text section for POC documentation  
- SmartLinks for clinical data (e.g., vitals, labs)

To reduce note bloat, the **EpicACT link** enabled asynchronous editing of the Hospital Course without bloating the signed note. This preserved data for future hospitalizations without increasing character count.

**Figure 1.** Transfer Note During Creation – includes dynamic Hospital Course SmartLink  
![Transfer Note](/assets/transfer1.PNG)

**Figure 2.** Separate editable Hospital Course maintained outside the note  
![Hospital Course](/assets/hc1.PNG)

**Figure 3.** EpicACT link added to ICU progress note template for editable Hospital Course  
![Progress Note](/assets/pn1.PNG)

# Results  
During the pilot phase, ICU and Hospitalist teams reported that the new note significantly improved communication without adding documentation burden.

One concern was raised regarding long-term visibility of Hospital Course data. Upon review, we confirmed the data persisted across encounters and was accessible during future admissions.

Following several stakeholder demonstrations, the note was approved for **system-wide deployment** as the standard ICU transfer documentation method.

### Measurable Outcomes:
- **232,000 outdated problems removed**  
- **1.57% reduction** in Problem List length  
- **483 hours of provider time saved**  
- **4.5% improvement** in provider-reported communication  
- **5.3% improvement** in workflow efficiency  

# Conclusion  
The ICU Transfer Note served as a scalable, efficient intervention that improved documentation quality, reduced outdated diagnoses, and enhanced provider communication. By targeting ICU transitions, we addressed a high-risk workflow and achieved measurable improvement with strong user satisfaction.

# Future Work  
Long-term documentation improvements may include **Diagnosis-Aware Notes (DAN)**, which auto-populate relevant diagnoses into the note body. While DAN was considered, stakeholder consensus was not achieved. Future projects may revisit DAN integration pending broader user acceptance and education.
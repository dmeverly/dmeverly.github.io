---
layout: page
title: All Projects
sidebar_category: Projects
order: 3
---

All of my work is publicly available on GitHub. Feel free to explore, and reach out if you have questions!  
<a href="https://github.com/dmeverly" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
  <i class="fab fa-github" style="font-size: 24px;"></i>
</a>

<div class="section">
  <blockquote>
    Blending clinical expertise with digital innovation, David streamlines care through smarter documentation and workflow solutions. His work ranges from leading departmental projects like ICU note standardization to supporting system-wide initiatives in problem list refinement and inpatient optimization as a certified physician builder.
    <br>
    <span style="display: block; margin-top: 1em; font-weight: bold;">
      — Manjot Gill, MD
    </span>
    <span style="display: block; font-weight: normal;">
      Associate Chief Medical Information Officer<br>
      WellSpan Health
    </span>
  </blockquote>
</div>

{% assign recent = site.incompleteprojects | sort: "date" | reverse %}
{% if recent.size > 0 %}
  <div class="section">
    <div class="section-divider"></div>
    <h2 style="text-align: center;">Works in Progress</h2>
    <div class="posts">
      {% for project in recent %}
        <div class="post">
          <h3>
            <a href="javascript:void(0)" class="open-modal"
               data-url="{{ project.url | relative_url }}"
               data-title="{{ project.title }}">
              {{ project.title }}
            </a>
          </h3>
          <p>{{ project.summary }}</p>
        </div>
      {% endfor %}
    </div>
  </div>
{% endif %}

{% assign recent = site.completedprojects | sort: "date" | reverse %}
{% if recent.size > 0 %}
  <div class="section">
    <div class="section-divider"></div>
    <h2 style="text-align: center;">Recently Completed Projects</h2>
    <div class="posts">
      {% for project in recent %}
        <div class="post">
          <h3>
            <a href="javascript:void(0)" class="open-modal"
               data-url="{{ project.url | relative_url }}"
               data-title="{{ project.title }}">
              {{ project.title }}
            </a>
          </h3>
          <p>{{ project.summary }}</p>
        </div>
      {% endfor %}
    </div>
  </div>
{% endif %}

{% assign recent = site.workflowprojects | sort: "date" | reverse %}
{% if recent.size > 0 %}
  <div class="section">
    <div class="section-divider"></div>
    <h2 style="text-align: center;">Workflow Optimization</h2>
    <div class="posts">
      {% for project in recent limit:3 %}
        <div class="post">
          <h3>
            <a href="javascript:void(0)" class="open-modal"
               data-url="{{ project.url | relative_url }}"
               data-title="{{ project.title }}">
              {{ project.title }}
            </a>
          </h3>
          <p>{{ project.summary }}</p>
        </div>
      {% endfor %}
    </div>
  </div>
{% endif %}

<div class="section" style="text-align: center;">
  <span style="display: inline-flex; align-items: center; gap: 2em;">
    <a href="mailto:dmeverly@hotmail.com" class="contact-button">
      <i class="fas fa-envelope" style="margin-right: 8px;"></i> Contact Me
    </a>
    <a href="https://github.com/dmeverly" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
      <i class="fab fa-github" style="font-size: 24px;"></i>
    </a>
    <a href="https://www.linkedin.com/in/david-everly-a4aa7528a" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
      <i class="fab fa-linkedin" style="font-size: 24px;"></i>
    </a>
  </span>
</div>

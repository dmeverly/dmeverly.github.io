---
layout: page
title: All Projects
sidebar_category: Projects
order: 3
---

All of my work is publically available on Github. Feel free to explore, and reach out if you have questions! <a href="https://github.com/dmeverly" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
      <i class="fab fa-github" style="font-size: 24px;"></i>
    </a>

<div class = "section">
<blockquote>
Greatful for David's outstanding work on our ICU transition-of-care note. His thoughtful design improved handoff clarity and streamlined discharge summaries for our most complex patients. A brilliant clinical innovator - no doubt he'll continue to do great things
<br>
    <span style="display: block; margin-top: 1em; font-weight: bold;">
      — Julie Platt, MD, MBA, MS
    </span>
    <span style="display: block; font-weight: normal;">
      Medical Director, Clinical Transformation<br>
      WellSpan Health
    </span>
  </blockquote>
</div>

{% assign recent = site.incompleteprojects | sort: "date" | reverse %}
{% if recent.size >= 0 %}
  <div class="section">
    <div class="section-divider"></div>
    <h2 style="text-align: center;">Works in Progress</h2>

    {% if recent.size > 0 %}
      <div class="posts">
        {% for project in recent %}
          <div class="post">
            <h3><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h3>
            <p>{{ project.summary }}</p>
          </div>
        {% endfor %}
      </div>
    {% else %}
      <p style="text-align:center;">Coming Soon!</p>
    {% endif %}
  </div>
{% endif %}

<div class="section">
  <div class="section-divider"></div>
  <h2 style="text-align: center;">Recently Completed Projects</h2>
  {% assign recent = site.completedprojects | sort: "date" | reverse %}
  {% if recent.size > 0 %}
    <div class="posts">
      {% for project in recent %}
        <div class="post">
          <h3><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h3>
          <p>{{ project.summary }}</p>
        </div>
      {% endfor %}
    </div>
  {% endif %}
</div>

{% assign recent = site.workflowprojects | sort: "date" | reverse %}
{% if recent.size >= 0 %}
  <div class="section">
    <div class="section-divider"></div>
    <h2 style="text-align: center;">Workflow Optimization</h2>

    {% if recent.size > 0 %}
      <div class="posts">
        {% for project in recent limit:3 %}
          <div class="post">
            <h3><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h3>
            <p>{{ project.summary }}</p>
          </div>
        {% endfor %}
      </div>
    {% else %}
      <p style="text-align:center;">Coming Soon!</p>
    {% endif %}
  </div>
{% endif %}

---  

<div class="contact-section" style="text-align: center;">
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

---  
---
layout: page
title: CTFHub
permalink: /ctfhub/
---

<div class="post-grid">
  {% for post in site.posts %}
    {% if post.categories contains 'CTFHub' %}
    <div class="post-card">
      <div class="post-date">{{ post.date | date: "%Y-%m-%d" }}</div>
      <h3 class="post-title">{{ post.title }}</h3>
    </div>
    {% endif %}
  {% endfor %}
</div>

<style>
.post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
.post-card { background: #161b22; padding: 20px; border-radius: 8px; border: 1px solid #30363d; }
.post-date { color: #8b949e; font-size: 14px; margin-bottom: 8px; }
.post-title a { text-decoration: none; color: #58a6ff; font-size: 18px; }
.post-title a:hover { text-decoration: underline; }
</style>

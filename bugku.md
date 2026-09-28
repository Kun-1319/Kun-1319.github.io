---
layout: page
title: Bugku
permalink: /bugku/
---

<div class="page-wrapper">
  <div class="main-content">
    <div class="post-grid">
      {% for post in site.posts %}
        {% if post.categories contains 'Bugku' %}
        <div class="post-card" onclick="window.location.href='{{ post.url | relative_url }}';" style="cursor: pointer;">
          <div class="post-date">{{ post.date | date: "%Y-%m-%d" }}</div>
          <div class="post-title" style="color: #58a6ff !important; font-size: 19px; font-weight: 600; line-height: 1.4;">{{ post.title }}</div>
        </div>
        {% endif %}
      {% endfor %}
    </div>
  </div>

  <div class="sidebar">
    <div class="widget">
      <h3>标签</h3>
      <div class="tags">
        {% for tag in site.tags %}
          {{ tag[0] }}
        {% endfor %}
      </div>
    </div>
  </div>
</div>

<style>
.page-wrapper { display: flex; gap: 30px; margin-top: 20px; }
.main-content { flex: 1; min-width: 0; }
.sidebar { width: 300px; flex-shrink: 0; }
@media (max-width: 768px) {
  .page-wrapper { flex-direction: column; }
  .sidebar { width: 100%; }
}
.post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.post-card { background: #161b22; padding: 20px; border-radius: 8px; border: 1px solid #30363d; display: block; text-decoration: none; transition: border-color 0.2s; }
.post-card:hover { border-color: #58a6ff; text-decoration: none; }
.post-date { color: #8b949e; font-size: 15px; margin-bottom: 10px; }
.widget h3 { font-size: 20px; border-bottom: 1px solid #30363d; padding-bottom: 10px; margin-bottom: 15px; color: #ffffff; }
.tag { display: inline-block; background: #21262d; color: #c9d1d9; padding: 5px 12px; border-radius: 15px; font-size: 15px; margin: 0 6px 8px 0; text-decoration: none; transition: background 0.2s; }
.tag:hover { background: #30363d; color: #58a6ff; }
</style>

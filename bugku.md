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
        <div class="post-card">
          <div class="post-date">{{ post.date | date: "%Y-%m-%d" }}</div>
          <h3 class="post-title">{{ post.title }}</h3>
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
.sidebar { width: 260px; flex-shrink: 0; }
@media (max-width: 768px) {
  .page-wrapper { flex-direction: column; }
  .sidebar { width: 100%; }
}
.post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.post-card { background: #161b22; padding: 20px; border-radius: 8px; border: 1px solid #30363d; }
.post-date { color: #8b949e; font-size: 14px; margin-bottom: 8px; }
.post-card a { color: #58a6ff !important; text-decoration: none; font-size: 18px; }
.post-card a:hover { text-decoration: underline; }
.widget h3 { font-size: 18px; border-bottom: 1px solid #30363d; padding-bottom: 10px; margin-bottom: 15px; color: #ffffff; }
.tag { display: inline-block; background: #21262d; color: #c9d1d9 !important; padding: 4px 10px; border-radius: 12px; font-size: 13px; margin: 0 5px 5px 0; text-decoration: none; pointer-events: auto; }
.tag:hover { background: #30363d; color: #58a6ff !important; }
</style>

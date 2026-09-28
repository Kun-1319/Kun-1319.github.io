---
layout: page
title: 标签
permalink: /tags/
---

<style>
.tag-section { margin-bottom: 40px; }
.tag-title { font-size: 22px; color: #ffffff; border-bottom: 1px solid #30363d; padding-bottom: 10px; margin-bottom: 15px; }
.tag-list { padding-left: 20px; }
.tag-list li { margin-bottom: 10px; }
.tag-list li a { color: #58a6ff; font-size: 17px; text-decoration: none; }
.tag-list li a:hover { text-decoration: underline; }
</style>

{% for tag in site.tags %}
  <div class="tag-section">
    <h2 id="{{ tag[0] | slugify }}" class="tag-title">{{ tag[0] }}</h2>
    <ul class="tag-list">
      {% for post in tag[1] %}
        <li>{{ post.title }}</li>
      {% endfor %}
    </ul>
  </div>
{% endfor %}

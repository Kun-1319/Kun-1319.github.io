---
layout: page
title: 标签
permalink: /tags/
---

{% for tag in site.tags %}
  <div style="margin-bottom: 30px;">
    <h2 id="{{ tag[0] | prepend: ' ' | slugify }}" style="color: #ffffff; border-bottom: 1px solid #30363d; padding-bottom: 10px;">{{ tag[0] }}</h2>
    <ul style="padding-left: 20px;">
      {% for post in tag[1] %}
        <li>{{ post.title }}</li>
      {% endfor %}
    </ul>
  </div>
{% endfor %}

---
layout: page
title: Bugku
permalink: /bugku/
---

<ul>
  {% for post in site.posts %}
    {% if post.categories contains 'Bugku' %}
      <li>{{ post.title }}</li>
    {% endif %}
  {% endfor %}
</ul>

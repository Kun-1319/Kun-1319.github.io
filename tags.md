---
layout: page
title: 标签
description: 按标签浏览文章。
permalink: /tags/
---

<div class="tag-cloud">{% for tag in site.tags %}<a href="#{{ tag[0] | append: '' | slugify: 'raw' | uri_escape }}">{{ tag[0] | escape }} <span>{{ tag[1].size }}</span></a>{% endfor %}</div>
{% for tag in site.tags %}
<section class="tag-section"><h2 id="{{ tag[0] | append: '' | slugify: 'raw' | escape }}">{{ tag[0] | escape }}<span>{{ tag[1].size }}</span></h2><ul class="tag-list">{% for post in tag[1] %}<li><a href="{{ post.url | relative_url }}"><span>{{ post.title | escape }}</span><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y.%m.%d' }}</time><span aria-hidden="true">↗</span></a></li>{% endfor %}</ul></section>
{% endfor %}


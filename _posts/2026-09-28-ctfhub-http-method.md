---
layout: post
title: CTFHub Web HTTP Method Writeup
date: "2026-09-28 11:30:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, web, http]
---

## 一、 题目信息
- **平台**：CTFHub
- **题型**：Web
- **考点**：HTTP请求方法伪造、Burp Suite抓包改包

## 二、 解题思路与踩坑记录
访问题目环境后，页面提示当前HTTP Method为GET，并给出了Use CTF**B Method, I will give you flag.的提示。结合平台名称CTFHub，推断CTF**B实际代表CTFHUB，即需要将请求方法伪造为CTFHUB。
最初直接尝试在浏览器地址栏中访问根目录，未能获取到正确结果。查阅页面底部的提示If you got 「HTTP Method Not Allowed」 Error, you should request index.php.后，明白需要将请求的路径修改为明确的index.php文件，同时配合修改请求方法。

## 三、 解题步骤

1. **开启拦截**：打开Burp Suite，进入Proxy -> Intercept界面，确保拦截功能已开启。
2. **抓取请求**：使用Burp Suite的内置浏览器访问题目URL，或在外部浏览器设置代理后刷新页面，成功抓取到请求包。
3. **修改请求包**：在Intercept界面中，将请求行修改为以下内容，将请求方法改为CTFHUB
4. **得到答案**：点击forward，进入网页后得到正确的flag。
 

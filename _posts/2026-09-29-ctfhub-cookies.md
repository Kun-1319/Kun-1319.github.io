---
layout: post
title: CTFHub Web Cookie Writeup
date: "2026-09-29 16:00:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, web, cookie]
---

## 一、 题目信息
- **平台**：CTFHub
- **题型**：Web
- **考点**：Cookie欺骗、认证、伪造

## 二、 解题思路与踩坑记录
访问题目环境后，页面提示需要特定权限或直接显示无权限访问。
Web应用常使用Cookie来识别用户身份。如果后端代码仅依赖客户端传递的Cookie值来判断用户是否为管理员，就可以通过伪造Cookie来绕过权限验证。解决思路为：查看当前浏览器或请求包中的Cookie值，尝试修改为管理员标识，观察服务器响应。

## 三、 解题步骤

1. **启动环境**：在CTFHub平台启动靶场，获取目标URL。
2. **查看Cookie**：在浏览器中访问目标URL，按F12打开开发者工具，进入应用程序（Application）面板，在Cookies列表中查看当前域名的Cookie。或者在网络（Network）面板中查看请求头中的Cookie字段。
3. **分析字段**：发现一个名为`admin`的Cookie，其值为`0`。这表明服务器可能将`admin=0`视为普通用户。
4. **伪造Cookie**：在开发者工具的应用程序面板中，双击该Cookie的值，将其修改为`1`。或者使用BurpSuite拦截请求，将请求头中的`Cookie: admin=0`修改为`Cookie: admin=1`，然后放行请求。
5. **获取Flag**：刷新页面或查看修改后请求的响应，页面成功返回`ctfhub{...}`格式的Flag。
6. **提交答案**：将Flag复制并提交至CTFHub平台，解题成功。

## 四、 总结与反思
通过本题掌握了Cookie欺骗的基本原理：
1. **Cookie的存储位置**：Cookie由服务器下发，存储在客户端浏览器中。用户可以随意查看和修改本地Cookie的值。
2. **认证机制的缺陷**：如果服务器仅根据Cookie中的某个字段（如`admin=0`或`1`）来决定用户权限，而缺乏服务端的二次校验，攻击者只需修改客户端Cookie即可越权。
3. **防御建议**：在真实的Web开发中，不能信任客户端提交的任何数据。权限验证必须在服务端结合Session、Token或数据库中的用户信息进行严格校验。

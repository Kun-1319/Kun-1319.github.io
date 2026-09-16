---
layout: post
litle: "Bugku Web POST Writeup"
date: “2026-09-16 08:38:00 +0800"
gategories: [CTf,Bugku,Web]
---

## 一、题目信息
- **平台**:Bugku
- **题型**:Web
- **考点**:burp的应用（抓包修改请求）、POST请求参数传递

## 二、解题思路
POST请求参数无法通过修改网址得到flag，需要利用应用Burp Suite来抓包并修改请求（将GET请求改为POST请求并输入“what=flag”）

## 三、解题步骤
初次接触POST请求将其误判成了GET请求，直接在网网址中输入了what=flag但任何内容都没得到，于是上网查资料转换思路发现利用Burp抓包并修改参数可以解决本题，经过学习Burp的抓包、该请求和多次尝试终于吃透并解决了本题。

## 四、遇到的困难
在解题中我多次用了同一个方法和步骤但只解出了两次答案，目前没有发现原因，需要后期和老师或者学长沟通解决。

解题过程图片如下

<img width="1280" height="800" alt="pic2026-09-16 083355" src="https://github.com/user-attachments/assets/621594e5-c734-4e91-a50d-91038cff86c4" />

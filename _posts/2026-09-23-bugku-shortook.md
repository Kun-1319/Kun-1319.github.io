---
layout: post
title: 'Bugku Crypto .!? Writeup'
date: "2026-09-23 12:20:00 +0800"  # ← 请把这个时间改成你电脑现在的时间！
categories: [CTF, Bugku, Crypto]
---

## 一、 题目信息
- **平台**：Bugku
- **题型**：Crypto（密码学）
- **考点**：Short Ook! 语言识别与解码

## 二、 解题思路
题目名为 `.!?`，评论区提示 `shortOok!`。这种由 .?! 三种符号组成的编码，是ShortOok语言的典型特征。它的原理与 Ook! 语言相同，只是把 `Ook.`、`Ook?`、`Ook!` 简写成了对应的单个符号。解题思路为：下载附件，提取密文，使用在线工具解码。

## 三、 解题步骤
下载题目所给文件，点开后Ctrl+C复制密码，随后在浏览器中搜索shortook在线解码，Ctrl+V将密码粘贴至输入框内进行解码得到flag。

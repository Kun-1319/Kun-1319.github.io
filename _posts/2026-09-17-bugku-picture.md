---
layout: post
title: 'Bugku Misc 这是一张单纯的图片 Writeup'
date: '2026-09-17 12:00:00 +0800'
categories: [CTF, Bugku, Misc]
---

## 一、 题目信息
- **平台**：Bugku
- **题型**：MISC
- **考点**：CyberChef的运用

## 二、 解题思路
题目名为“这是一张单纯的图片”，描述中提示 `key{}`，并且提供了一个图片下载链接。通常在 MISC 方向中，图片本身看似正常，但它的二进制数据中被悄悄修改或追加了隐藏信息。我决定先下载图片正常查看，再用文本编辑器或十六进制查看器审查其底层数据。

## 三、 解题步骤
将图片下载，打开cyberchef并将图片放入input栏中，随后在input栏底部找到&#开头;结尾的乱码，放进html编码工具中进行解码得到key（flag）

图片如下

<img width="1280" height="800" alt="屏幕截图 2026-09-17 105614" src="https://github.com/user-attachments/assets/0b1e2568-5d2b-488e-8506-618a42ce7bf1" />

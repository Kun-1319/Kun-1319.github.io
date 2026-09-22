---
layout: post
title: 'Bugku Misc linux Writeup'
date: 2026-09-22 10：00：00 +0800
categories: [CTF, Bugku, Misc]
---

## 一、 题目信息
- **平台**：Bugku
- **题型**：Misc（杂项）
- **考点**：Linux 基础命令、压缩包解压、文件查看

## 二、 解题思路
题目名为“linux”，描述为linux基础问题，提示为 key{}。根据题目描述和评论区提示，这是一道考察 Linux 基础操作命令的题目。需要将附件下载并传入 Kali 环境，解压后使用命令查看隐藏文件内容。

## 三、 解题步骤
下载题目中所给的文件得到zip格式，打开虚拟机，将文件拖入虚拟机中，打开虚拟机终端输入tar -zxvf 文件名，得到了一个名为test的文件夹，打开后发现名为flag的文件。在终端中输入cd /test/显示没有该文件，说明该文件不在根目录中，于是输入test cd打开了test文件夹，再输入cat flag，将flag文件的内容打印到了屏幕上，发现内容中有格式为kay{}的内容，依据题目中所给的提示判断这就是题目所需恶的flag，点击Ctrl+Shift+c在虚拟机中复制并粘贴到题目输入栏中，解决了本题目。

图片如下

<img width="1280" height="800" alt="1 2026-09-22 103908" src="https://github.com/user-attachments/assets/ba849f7f-f240-4fa7-bc33-b954121e6fc5" />

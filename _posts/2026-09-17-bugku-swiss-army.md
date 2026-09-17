---
layout: post
title: 'Bugku Web 瑞士军刀 Writeup'
date: '2026-09-17 20:00:00 +0800'
categories: [CTF, Bugku, Pwn]
---

## 一、 题目信息
- **平台**：Bugku
- **题型**：Web
- **考点**：Linux 基础命令(nc)(cat)(ls)

## 二、 解题思路
题目名为“瑞士军刀”，在网安圈，Netcat简称nc，通常被称为“网络瑞士军刀”，它是用来连接网络服务的利器。题目描述为 `ls`（Linux 列出目录命令），暗示我们需要通过 `nc` 连接目标环境，并在获取的 Shell 中执行 Linux 命令来寻找并读取 Flag。

## 三、 解题步骤
在虚拟机中打开终端输入指令nc+网址+端口再输入ls（此处为LS而非IS）列出目录，发现目录中有“flag”，于是输入cat flag查看文件内容吧得到题目所需flag。

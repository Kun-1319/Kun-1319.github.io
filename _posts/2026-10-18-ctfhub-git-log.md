---
layout: post
title: CTFHub Web Git泄露-Log Writeup
date: "2026-10-18 16:30:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, web, git-leak]
---

## 一、 题目信息
- **平台**：CTFHub
- **题型**：Web
- **考点**：Git源码泄露、GitHack工具使用、Git版本回退

## 二、 解题思路与踩坑记录
题目描述指出网站存在.git目录泄露，并明确提示使用BugScanTeam的GitHack工具。
最初在Kali中运行GitHack时，因为工具基于Python 2编写，遇到了SyntaxError报错。切换至python2环境运行后，成功将泄露的Git仓库克隆到了本地。
进入生成的源码目录后，使用git log查看历史提交记录，发现开发人员曾进行过add flag和remove flag操作。解决思路为：定位到add flag的那次提交，通过git show命令查看该次提交的代码差异，从而找回被删除的Flag。

## 三、 解题步骤

1. **运行GitHack**：在Kali Linux终端中执行 python2 GitHack.py http://靶场地址:10800/.git/，成功拉取仓库文件。
2. **进入源码目录**：执行 cd /home/kali/GitHack/dist/challenge-xxxx_10800 进入本地仓库。
3. **查看日志**：执行 git log，获取历史提交记录列表。发现包含 add flag 关键字的提交哈希值为 4bd91fd53fb8e808d3d1fdabb317c91703db5371。
4. **查看历史提交**：执行 git show 4bd91fd53fb8e808d3d1fdabb317c91703db5371。
5. **获取Flag**：在终端输出的diff差异代码中，找到被标记为新增（+）的代码行，成功提取出 ctfhub{...} 格式的Flag。
6. **提交答案**：将Flag提交至CTFHub平台，解题成功。

## 四、 总结与反思
通过本题掌握了Git泄露漏洞的利用方法：
1. **Git泄露的危害**：.git目录包含完整的版本控制信息。泄露后，攻击者可以恢复出整个网站的源码，包括被删除的敏感配置文件、源码中的硬编码密码等。
2. **版本回退的威力**：即使开发人员在最新版本中删除了flag，只要历史提交记录没有清理，攻击者就能通过git log和git show轻松找回。
3. **环境兼容性**：利用老旧工具时需注意Python版本兼容性问题，遇到报错需及时切换环境。

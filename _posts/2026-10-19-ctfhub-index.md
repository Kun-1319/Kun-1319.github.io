---
layout: post
title: "CTFhub Web Git泄露-Index Writeup"
date: "2026-10-18 20:00:00 +0800"
categories: [CTF, CTFHub, web]
tags: [ctfhub, web, git-leak]
---

## 一、 题目信息
- **平台**: CTFHub
- **类型**: web
- **考点**: Git源码泄露、GitHack工具使用、Git暂存区（Index）还原

## 二、 解题思路与踩坑记录
题目描述指出站点存在.git目录泄露，并明确提示使用BugScanTeam的GitHack工具。本题与Log题的区别在于：flag被开发人员git add进暂存区但未commit，随后工作区文件被删除，需要从暂存区（Index）中还原文件。
最初克隆时因URL末尾缺少/.git/路径导致失败，补全后切换至python2环境成功克隆。克隆日志最后一行输出的Dist File给出了本地目录路径，注意路径中冒号会被转换为下划线、目录名不含.git后缀，应以该输出为准，此前曾因cd目录名写错而两次进入失败。
进入目录后执行git status，结果显示"nothing to commit, working tree clean"，并非预期中的暂存区改动记录。原因是GitHack克隆完成后会自动执行重置操作，将暂存区与最新commit同步，等效于已经完成了checkout还原。因此无需手动恢复，直接ls查看目录即可发现flag文件：一个33字节、纯数字随机命名的txt文件，特征十分明显。

## 三、 解题步骤

1. **运行GitHack**：在Kali Linux终端中执行 `python2 GitHack.py http://靶场地址:10800/.git/`，注意URL必须以/.git/结尾，成功拉取仓库文件。

2. **进入源码目录**：执行 `cd /home/kali/GitHack/dist/challenge-xxxx.sandbox.ctfhub.com_10800` 进入本地仓库，目录名以克隆日志最后的Dist File输出为准。

3. **查看暂存区状态**：执行 `git status`，结果显示 nothing to commit, working tree clean，说明GitHack克隆时已自动将暂存区内容同步还原到工作区。

4. **查看目录文件**：执行 `ls -la`，发现文件 `28111208829559.txt`（33字节，纯数字随机命名），其余均为nginx默认页面，判定该文件即为flag文件。

5. **提取flag**：执行 `cat 28111208829559.txt`，成功提取出ctfhub{...}格式的flag。

6. **提交答案**：将flag提交至CTFHub平台，解题成功。

## 四、 总结与反思
通过本题掌握了Git暂存区泄露的利用方法，并与Log题形成对照。
1. **暂存区泄露原理**：git提交分两步，git add将文件放入暂存区，git commit才写入版本库。被add过但未commit的文件，其内容已保存在.git/objects对象库中，即使工作区文件被删除，依然可以通过git checkout还原或直接从对象库中找回。
2. **理解工具行为**：GitHack克隆完成后会自动执行重置，将暂存区与最新commit同步，因此git status显示clean不代表没有隐藏内容，应先ls检查目录再决定下一步，避免盲目套用教科书式步骤。
3. **备用恢复手段**：若目录中未能直接找到flag，可使用git fsck --lost-found扫描游离对象（dangling blob），再通过git cat-file -p <哈希>打印对象内容找回；若涉及stash记录，可使用git stash list与git stash pop恢复。
4. **修复建议**：部署时应排除.git目录，并在nginx中配置 location ~ /\.git { deny all; } 禁止外部访问，避免源码与敏感信息泄露。

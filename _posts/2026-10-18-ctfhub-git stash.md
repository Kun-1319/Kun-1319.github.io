---
layout: post
title: CTFHub Web Git泄露-Stash Writeup
date: "2026-10-18 23:30:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, web, git-leak]
---

## 一、 题目信息
- **平台**：CTFHub
- **题型**：Web
- **考点**：Git源码泄露、Git stash机制、GitHack工具使用、Python版本兼容性

## 二、 解题思路与踩坑记录
题目描述指出网站存在.git目录泄露。

**遇到困难一：GitHack运行报错。**
最初在Kali中直接使用python运行GitHack脚本，出现了SyntaxError报错。查阅资料得知，GitHack是基于Python2编写的，在Python3环境下存在语法不兼容的问题（如except语句的写法差异）。解决方法为：在命令中显式使用python2来运行该脚本。

**遇到困难二：不熟悉stash机制。**
克隆源码后，执行git log未发现有效Flag，查看目录下的index.html和50x.html也未找到线索。查阅资料了解到Git有一个stash机制。起初不理解stash是什么意思，学习后得知，它用于临时储藏未提交的工作区修改，就像把写到一半的草稿锁进抽屉。开发人员误以为未commit的代码不会被记录，但如果.git目录泄露，这个储藏区也会被攻击者获取。解决方法为：使用git stash list查看储藏记录，并使用git stash pop恢复被隐藏的文件。

## 三、 解题步骤

1. **克隆源码**：在Kali终端执行`python2 GitHack.py http://靶场地址:10800/.git/`，成功拉取Git仓库。
2. **进入目录**：执行`cd dist`，然后进入生成的特定靶场文件夹。
3. **查看储藏记录**：执行`git stash list`，终端输出`stash@{0}: WIP on master: e97ea22 add flag`，确认存在被隐藏的修改。
4. **恢复文件**：执行`git stash pop`。终端提示文件冲突（CONFLICT），说明隐藏文件已被释放到当前目录。
5. **获取Flag**：执行`ls`，发现多出一个文本文件（如144509126579.txt）。使用`cat 144509126579.txt`查看其内容，成功获得ctfhub{...}格式的Flag。
6. **提交答案**：将Flag提交至CTFHub平台，解题成功。

## 四、 总结与反思
通过本题掌握了Git泄露漏洞中stash机制的利用方法：
1. **理解git stash**：stash用于临时储藏工作区的修改。开发者常误以为没有commit的代码就安全，但.git目录一旦泄露，stash中的敏感信息同样会被攻击者获取。
2. **工具兼容性**：部分老旧安全工具依赖Python2环境，在实际操作中需注意根据报错信息及时切换执行环境。
3. **防御建议**：线上环境部署时，必须彻底删除.git目录。可通过设置Web服务器规则，禁止外部访问所有以点（.）开头的隐藏文件及目录。

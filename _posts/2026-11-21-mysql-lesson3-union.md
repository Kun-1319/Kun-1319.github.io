---
layout: post
title: Writeup：UNION 拼接入门
date: "2026-11-21 01:10:00 +0800"
categories: [课外拓展, MySQL, Web安全]
tags: [mysql, sql-injection, union, information-schema]
---

## 一、学习环境

- 靶机：OWASP Broken Web Apps v1.2，地址 192.168.216.129
- 远程登录：ssh bwa
- 数据库：mysql -u root -powaspbwa
- 常用练习库：dvwa、owasp10、bricks、peruggia、mutillidae
- 全程不使用 use 命令，跨库一律用点号或 table_schema 过滤

## 二、今日目标

把侦察从单条查询升级成拼接查询：一条 SQL 里同时拿到函数结果和多张表的清单。

## 三、热身：跨库盲测

题目：不用 use，列出 bricks 库 users 表的全部列名。

```sql
select column_name
from information_schema.columns
where table_schema = "bricks"
  and table_name = "users";
```

结果：终端逐行返回该表全部列名。

思路复盘：

- information_schema.columns 是整个数据库的列名总目录，所有库的所有列都登记在里面。
- table_schema 锁定库，table_name 锁定表，column_name 才是要输出的东西。
- 全程没有 use，靠 where 过滤完成跨库。

## 四、第 1 关：UNION 的四条铁律

铁律一：列数必须严格相等。
左右两条 select 的列数要一模一样，多一列少一列都会直接报错：

```
ERROR 1222 (21000): The used SELECT statements have a different number of columns
```

铁律二：位数不够用数字占位。
左边三列、右边两列，就补一个 0 当第三列。这个 0 不来自任何表，纯粹占位。

铁律三：表头以左边第一条为准。
合并后的列名只看第一条 select，右边 select 写什么列名都不影响显示。

铁律四：左右各自 from 自己的表。
两条 select 完全独立，两个 where 也互不干扰。

三个实操，把函数塞进 UNION 的回显位：

```sql
select user(), 0
from dvwa.users
union
select table_name, 1
from information_schema.tables
where table_schema = "owasp10";
```

第一列显示当前数据库账号，第二列是 owasp10 的表名清单。

```sql
select database(), 0
from dvwa.users
union
select table_name, 1
from information_schema.tables
where table_schema = "bricks";
```

同理，第一列换成本次连接默认使用的库名。

```sql
select group_concat(table_name), 0
from information_schema.tables
where table_schema = "owasp10";
```

group_concat 把整份表名清单压成一行，用逗号分隔。行数从几十行变成一行，注入时能省下大量请求次数。

## 五、第 2 关 2.1：常量列标记来源

场景：UNION 之后，账号密码和表名清单混在同一张结果表里，肉眼分不清哪一行来自哪一边。

做法：在 select 后面直接写一个字符串常量，凭空造出一列当标签。

```sql
select "left", user
from dvwa.users
union
select "right", table_name
from information_schema.tables
where table_schema = "bricks";
```

要点：

- 这一列不对应任何真实字段，是纯人工标签。
- 只有第一条 select 的常量决定列名，右边的常量只负责填值。
- 左边写 left、右边写 right，一眼就能看出数据来源。

练习题还没做完，留到下次：不用 use，查出 mutillidae 库的全部表名，结果两列，第一列每行都是常量 mutillidae，第二列是表名。

## 六、今天踩过的坑

1. 列数不等时直接报 ERROR 1222。写右边之前先数清楚左边有几列。
2. 忘了加常量列，两半数据混在一起，看不出谁是谁。
3. order by 的位置是整条 union 的最末尾，写进两半中间会语法报错。今天先记住结论，细节下次拆开练。

## 七、下次课计划

- 2.2 两半各自的 where：目录表的过滤和业务表的过滤分开写。
- 2.3 数字占位补列数，以及字符串与数字的隐式转换。
- 2.4 order by 放在整条 union 末尾，用左表列名或列序号排序。
- 结课跨库盲测一道。
- 第四次课进入 Kali 与 Burp，把终端里的 UNION 搬到真实网页和抓包改包里。

## 八、一句话总结

UNION 的本质是按位置拼表：列数对齐、表头从左、各自取材。会拼之后，一条 SQL 就能同时完成查表和取数。

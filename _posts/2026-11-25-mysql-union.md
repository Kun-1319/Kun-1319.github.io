---
layout: post
title: UNION 拼接入门2
date: "2026-11-25 15:20:00 +0800"
categories: [课外拓展, MySQL, Web安全]
tags: [mysql, sql-injection, union, information-schema]
---

## 一、学习环境

- 靶机：OWASP Broken Web Apps v1.2，地址 192.168.216.129
- 远程登录：ssh bwa，密码 owaspbwa
- 数据库：mysql -u root -powaspbwa
- 全程不使用 use 命令，跨库一律用点号或 table_schema 过滤

## 二、今日目标

把侦察从单条查询升级成拼接查询：一条 SQL 里同时拿到函数结果和多张表的清单。

## 三、先确认库名

进入任何陌生靶机，第一步先让数据库报出它有哪些库：

```sql
select schema_name from information_schema.schemata;
```

本机实测返回 34 个库，包括 bricks、bwapp、citizens、cryptomg、dvwa、gallery2、ghost、joomla、mutillidae、nowasp、peruggia、phpbb、phpmyadmin、sqlol、tikiwiki、vicnum、wordpress、yazd 等。

注意：网上流传的 owasp10 库在这个镜像里不存在。库名不能凭记忆写，先查再写，否则查询返回空集，白白排查半天。

## 四、第 1 关：UNION 的四条铁律

铁律一：列数必须严格相等。左右两条 select 的列数不一样，直接报错：

```
ERROR 1222 (21000): The used SELECT statements have a different number of columns
```

铁律二：位数不够用数字占位。左边三列、右边两列，就补一个 0 当第三列。这个 0 不来自任何表。

铁律三：表头以左边第一条为准。合并后的列名只看第一条 select，右边写什么列名都不影响显示。

铁律四：左右各自 from 自己的表。两条 select 完全独立，两个 where 互不干扰。

把函数塞进回显位：

```sql
select user(), 0 from dvwa.users
union
select table_name, 1 from information_schema.tables where table_schema = "bricks";
```

```sql
select group_concat(table_name), 0 from information_schema.tables where table_schema = "mutillidae";
```

group_concat 把整份表名清单压成一行，注入时能省下大量请求。

## 五、第 2 关一：常量列

information_schema.tables 输出的 table_name 只写表名，不写库名。两个库拼在一起时，光看表名分不清来源，所以要自己补一列。

```sql
select "peruggia", table_name from information_schema.tables where table_schema = "peruggia"
union
select "mutillidae", table_name from information_schema.tables where table_schema = "mutillidae";
```

结果 13 行，第一列整列标着来源。

这一列还有第二个作用：防止 union 误删行。union 等于合并加去重，整行完全一样才会删。dvwa 和 bricks 都有 users，不加标签时 4 行会被压成 3 行，数据静悄悄少一行；加上库名后每行都不同，一行不丢。

如果确实要保留全部行，可以用 union all，它只合并不去重。

## 六、第 2 关二：两半各自的 WHERE

每条 select 后面都能跟自己独立的 where，只筛自己那半，互不影响。

```sql
select "L", user from dvwa.users where user_id = 1
union
select "R", table_name from information_schema.tables where table_schema = "mutillidae";
```

左边只出 admin 一行，右边出 11 张表，合计 12 行。

## 七、第 2 关三：数字占位补列

两边列数不等时，用数字补。数字也是常量，写 0 或 1 都行，占一列不占内容。

```sql
select "L", user, 0 from dvwa.users where user_id = 1
union
select "R", table_name, user() from information_schema.tables where table_schema = "bricks";
```

左三列、右三列，跑通，共 2 行。右边第三列显示 root@localhost。

实战意义：目标页面的回显位有几列你事先不知道，只能试。写 2 列报错、改 3 列成功，就说明是 3 列。

## 八、第 2 关四：ORDER BY 的位置

排序对整张合并后的表做，所以只能写一次，位置在整条语句最末尾，写进两半中间会报语法错。

排序键可以写列名，也可以写列序号。序号更省事，两边列名不一致时照样用。

```sql
select "L", user, 0 from dvwa.users where user_id = 1
union
select "R", table_name, user() from information_schema.tables where table_schema = "bricks"
order by 2;
```

加 desc 就是倒序，行的先后会反过来。

字符串按字符逐个比较，等同于查字典；默认不区分大小写。数字列按数值大小排，不是按字符。

实战价值不在阅读，而在数数：注入时依次试 order by 1、2、3，数字一超过真实列数就报错，报错数字减一就是列数。这是下一节课定位回显位的基础。

## 九、结课盲测

题目：查出 mutillidae 库里 accounts 表的所有列名，两列，第一列常量 mutillidae，第二列列名，按第二列升序。

```sql
select "mutillidae", column_name from information_schema.columns
where table_schema = "mutillidae" and table_name = "accounts"
order by 2;
```

结果 5 列：cid、is_admin、mysignature、password、username。

## 十、踩过的坑

1. 库名凭记忆写错，查询返回空集。先查 schemata 再写。
2. 列数不等报 ERROR 1222，写下一半之前先数清前面有几列。
3. 常量忘加引号，报 ERROR 1054 Unknown column，因为没引号的常量会被当成列名去找。
4. 把 column 当列名用，报 ERROR 1064 语法错误。这里叫 column_name，column 是保留字。
5. 复制粘贴时带上命令提示符，或者 from 被换行拆成 fr 和 om，都会报 1064。看报错里 near 后面那几个词就能定位。
6. union 会去重，没撞上同名表时行数不变，撞上了就少行。别把少行当成查错了。

## 十一、下次课

- 进入 Kali Linux 网页实战与 Burp Suite 抓包
- 把终端里练熟的 UNION 拼接搬到真实页面参数上
- 用 order by 数数定位列数，用 union select 找可见回显位

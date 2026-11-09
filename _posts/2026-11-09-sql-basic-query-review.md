---
layout: post
title: SQL基础查询复习笔记
date: "2026-11-09 22:25:00 +0800"
categories: [课外拓展, MySQL, Web安全]
tags: [mysql, sql, learning]
---

## 一、这次复习怎么安排的

停了一周多再回来，直接做题会卡，所以先看一遍完整的例子，再补空、改条件、独立写。节奏按二十分钟一节，一个概念、两三个练习、一条小测。

目标是撤掉提示能独立写对，换条件还能写对。

错题只记三样：能重做的题、错在哪一步、下次怎么检查。

## 二、查询的三段结构

```sql
select [列] from [表] where [条件];
```

三段各跟什么：

- select后面跟列名，多个用英文逗号隔开，写星号表示全部列
- from后面跟表名
- where后面跟条件，不写where就是取全部行

顺序固定，不能调换。

**执行顺序不是从左往右**

以这条为例：

```sql
select user, password from users where user_id = 1;
```

数据库实际是按这个顺序做的：

1、from users：先定位表
2、where user_id = 1：再筛出满足条件的行
3、select user, password：最后从剩下的行里取列

理解这个顺序，后面写union和子查询时不容易乱。

## 三、条件的四种写法

**比较**

```sql
select * from users where user_id > 2;
select * from users where user_id <> 1;
```

不等于写作`<>`，MySQL也接受感叹号加等号的形式。

**区间**

```sql
select * from users where user_id between 2 and 3;
```

**模糊匹配**

```sql
select * from users where password like '5f%';
```

like配合通配符使用：

| 写法 | 含义 |
|---|---|
| '5f%' | 以5f开头 |
| '%5f' | 以5f结尾 |
| '%5f%' | 包含5f |
| '5f____' | 5f后面正好四个字符 |

百分号代表任意个字符，下划线代表一个字符。

**多条件连接**

```sql
select user, password from users where user <> 'admin' and user_id < 3;
```

and要求两个条件都成立，or只要一个成立。and优先级高于or，混用时加括号。

## 四、引号规则

引号只包值，不包列名、运算符和关键字。

判断一个值要不要加引号，看两步：

1、看列类型。执行`desc users;`，Type列是int就不加，是varchar、char、text就要加。
2、看值本身。纯数字一般不加，带字母、符号、中文的都加。

对照：

| 写法 | 结果 |
|---|---|
| user_id = 3 | 正确，数字类型 |
| user = 'admin' | 正确，字符串类型 |
| user = admin | 错误，admin被当成列名 |
| user_id = '3' | 能跑，MySQL会隐式转换，但不推荐 |

## 五、踩坑记录

**坑一：列名之间用了中文逗号**

写成`select user，password`，逗号是全角的，SQL只认英文半角，语句直接断。输入法要切到英文。

**坑二：把整个条件包进引号**

写成`where 'user <> admin' and 'user_id < 3'`，等于把条件变成了两段文本，数据库不会判断它们成不成立，语法报错。引号只包值。

**坑三：字符串不加引号**

写成`where user = admin`，MySQL把admin当成列名去找，报Unknown column。字符串必须加单引号。

**坑四：关键字拼错**

写成`selece`，少一个字母还错位，报1064。关键字要写全。

**坑五：where后面漏列名**

写成`where like '5f%'`，like是运算符，左边必须跟列名，正确是`where password like '5f%'`。

## 六、问题与解答

**问：select、from、where后面分别跟什么。**

答：select跟列名，from跟表名，where跟条件。顺序固定，不能交换。

**问：like是什么。**

答：模糊匹配运算符，配合百分号和下划线使用。等号要求完全相同，like允许部分匹配。

**问：怎么判断一个值要不要加引号。**

答：先看列类型，int不加，varchar要加；再看值，纯数字一般不加，带字母符号中文的必须加。字符串不加引号会被当成列名。

**问：星号什么时候用。**

答：探索表结构、不知道有哪些列时用。只取几列、拼union时不要用，union要求列数明确。

**问：为什么不加引号的数字也能和字符串列比较。**

答：MySQL会做隐式类型转换，把'3'转成3再比较。能跑但不建议，类型不一致时可能出意外结果，也会让索引失效。

## 七、总结与下次计划

1、查询结构是地基：select取什么，from从哪取，where留哪些行。
2、引号只包值，这条错一次就够，后面写payload会反复用到。
3、条件可以组合，and要求全成立，or只要一个成立。

下次内容：order by排序、distinct去重，然后是union。这三个是注入里数列数和找回显位的工具。

下次开头先默写一条：查出users表里user等于admin、且user_id大于1的行，只要password一列。

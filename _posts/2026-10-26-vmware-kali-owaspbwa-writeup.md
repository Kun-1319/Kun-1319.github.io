---
layout: post
title: "课外拓展：VMware、Kali 与 OWASP BWA 环境搭建 Writeup"
date: "2026-10-26 00:00:00 +0800"
permalink: /课外任务/2026/10/25/vmware-kali-owaspbwa-writeup.html
categories: [课外拓展]
tags: [课外拓展, VMware, Kali, SQL基础, 环境搭建]
---

## 一、实验目标

跟随黑马程序员的 SQL 注入教程，搭建本地实验环境，完成虚拟机互通、复制粘贴配置和 MySQL 基础操作。

电脑中原来已有 VirtualBox 版 Kali，因此本次采用磁盘复制转换的方式迁移到 VMware，保留原虚拟机。

## 二、实验环境

| 项目 | 配置 |
|---|---|
| 宿主机 | Windows 11 |
| 虚拟化软件 | VMware Workstation Pro 26H1u1 |
| Kali | Kali Linux 2026.2，2 核、2 GB 内存 |
| 靶机 | OWASP Broken Web Applications 1.2，1 GB 内存 |
| 实验网络 | Host-only，VMnet1 |
| Kali 联网 | 另外增加一张 NAT 网卡 |

本次分配的实验 IP：

- Kali：`192.168.216.128`
- OWASP BWA：`192.168.216.129`

这些地址由 DHCP 分配，重新启动后应以实际地址为准。

## 三、配置过程

### 1. 安装 VMware，迁移 Kali

安装 VMware 后，使用 VirtualBox 的 `VBoxManage` 将原 Kali 的 VDI 磁盘复制转换为 VMDK，再为副本创建 VMware 配置。

原虚拟磁盘保留，迁移后的 Kali 与原系统分别保存各自的修改。

### 2. 导入两台虚拟机

解压 OWASP BWA 镜像，在 VMware 中选择：

`File → Open`，或按 `Ctrl + O`。

分别打开：

- Kali 的 `Kali-Lab.vmx`
- 靶机的 `OWASP Broken Web Apps.vmx`

`.vmx` 是配置文件，`.vmdk` 是虚拟磁盘。靶机的多个磁盘分卷需要一起保留。

### 3. 配置网络

先把两台虚拟机都设为 **Host-only**，用于实验通信。

为了让 Kali 下载工具，再给 Kali 增加第二张网卡：

`Edit virtual machine settings → Add → Network Adapter → NAT`

保留原来的 Host-only 网卡。最终由 Host-only 负责访问靶机，NAT 负责联网安装软件。

### 4. 验证靶机访问

两台虚拟机启动后，在 Kali 的 Firefox 中访问：

```text
http://192.168.216.129/
```

成功打开 OWASP BWA 首页，说明实验网络可以正常通信。

靶机本身是黑色命令行界面，停在 `login:` 并不表示启动失败，网页服务可以在后台运行。

## 四、修复复制粘贴

Windows 中复制的文字最初无法粘贴进 Kali。检查时发现：

```text
Unit open-vm-tools.service not found.
```

说明系统没有找到对应服务，需要安装工具包。在 Kali 联网后执行：

```bash
sudo apt update
sudo apt install open-vm-tools-desktop
```

安装完成后重启：

```bash
sudo reboot
```

重新登录后测试：

- Firefox 地址栏：`Ctrl + V`
- Kali 终端：`Ctrl + Shift + V`

最终确认跨系统复制粘贴正常。

## 五、进入 MySQL

最初在靶机的 Linux 命令行直接输入：

```sql
SELECT DATABASE();
```

结果出现：

```text
-bash: syntax error near unexpected token '('
```

原因是当前提示符为 `root@owaspbwa:~#`，输入由 Bash 解释，还没有进入 MySQL。

正确操作是先执行：

```bash
mysql -u root -p
```

在密码提示后输入本练习镜像的默认管理密码：

```text
owaspbwa
```

看到 `mysql>` 后，再执行：

```sql
SHOW DATABASES;
SELECT DATABASE();
```

SQL 语句末尾使用英文分号。如果 `SELECT DATABASE();` 返回 `NULL`，表示当前连接还没有选中数据库。

## 六、遇到的问题与解决办法

| 问题 | 原因与处理 |
|---|---|
| 下载的镜像只有一百多 KB | 保存下来的是网页；更换可用下载来源，并校验完整文件 |
| VMware 库里找不到虚拟机 | 文件存在但尚未添加，通过 `File → Open` 打开 `.vmx` |
| 靶机只有黑色命令行 | 属于正常界面，出现 `root@owaspbwa:~#` 表示已登录 |
| 提示虚拟机正在被使用 | 先取消，检查已有运行窗口；没有直接接管或删除锁文件 |
| `Display all … possibilities?` | 触发了 Tab 补全，按 `n` 或 `Ctrl + C` 取消 |
| 输入 `cc` 后报错 | 将组合键误当成文字；`Ctrl + C` 要按住 Ctrl 再按 C |
| Tools 服务 `not found` | 对应工具尚未装好，先确认安装结果 |
| 找不到 `open-mv-tools-desktop` | 将 `vm` 写成了 `mv`，正确包名是 `open-vm-tools-desktop` |
| SQL 报 Bash 语法错误 | SQL 输入到了 Linux shell，应先登录 MySQL |

结合其他排障记录，还需要注意：`apt-get install kali` 不会把 Ubuntu 靶机转换成 Kali。安装工具前，先确认自己操作的是哪台虚拟机。

## 七、实验结果与总结

本次完成了：

- VMware 安装，以及已有 Kali 的副本迁移。
- OWASP BWA 导入和 Host-only 实验网络配置。
- Kali 通过浏览器访问靶机。
- Kali 增加 NAT 网卡、安装桌面工具并修复复制粘贴。
- 登录 MySQL，开始进行数据库基础操作。

最大的收获是：**先确认操作环境，再检查实际输入，最后验证功能。**

安装命令执行结束不一定代表安装成功；报错中的一个字母顺序也可能是关键。Linux 命令、SQL 语句和浏览器地址都有各自的输入位置，排错时首先要看当前提示符。

## 参考资料

- [课程视频](https://www.bilibili.com/video/BV1rC4y1s7YC/?p=3)
- [OWASP BWA 用户指南](https://github.com/chuckfw/owaspbwa/wiki/UserGuide)
- [Kali VMware Tools 安装说明](https://www.kali.org/docs/virtualization/install-vmware-guest-tools/)

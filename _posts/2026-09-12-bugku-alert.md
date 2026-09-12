<img width="1280" height="800" alt="屏幕截图 2026-09-12 193714" src="https://github.com/user-attachments/assets/f01682e0-83e2-4d43-a94a-839f948420b5" /><img width="1280" height="800" alt="屏幕截图 2026-09-12 193714" src="https://github.com/user-attachments/assets/f4e7fc37-2444-48b5-adad-f4b4d62bf276" /><img width="1280" height="800" alt="屏幕截图 2026-09-12 193714" src="https://github.com/user-attachments/assets/9119f5c3-6dc7-4c99-b836-bd60fa4908e2" />
---
layout: post
title: "Bugku Web alert题 Writeup"
date: "2026-09-12 19:42:00 +0800"
categories: [CTF,Bugku,Web]
---

## 一、题目信息
- **平台**:Bugku
- **题型**:Web
- **考点**:Ctrl+U查看源代码、代码解码。

 ## 二、解题思路
 打开页面后显示答案就在这里，但没有任何链接和可以处理的内容，推测需要用到源代码查找flag相关内容并以此得到源代码。

 ## 三、解题步骤
 在页面中利用Ctrl+U查找到源代码，原本想用Ctrl+F搜索flag相关内容，但搜索后一无所获，于是转变思路想到flag可能被编码加密，于是逐行搜索与flag格式相似的内容，找到后复制并利用HTML解码工具对内容进行解码得到了flag

<img width="1280" height="800" alt="屏幕截图 2026-09-12 193714" src="https://github.com/user-attachments/assets/5b8a0912-d31d-406a-9287-2827948b3769" />


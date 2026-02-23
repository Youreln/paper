# 🚀 飞传 FileFly

<div align="center">

**局域网高速文件传输工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)](https://nodejs.org)
[![Author](https://img.shields.io/badge/author-Youreln-orange.svg)](https://github.com/Youreln)
[![Pages](https://img.shields.io/badge/GitHub-Pages-brightgreen.svg)](https://youreln.github.io/FileFly)

**作者**: Youreln  
**版权**: © 2026 Youreln 版权所有  
**开源地址**: [https://github.com/Youreln/FileFly](https://github.com/Youreln/FileFly)

**🌐 [在线演示](https://youreln.github.io/FileFly) | 📥 [下载客户端](https://github.com/Youreln/FileFly/releases)**

</div>

---

## 📖 项目简介

**飞传 FileFly** 是一款现代化的局域网文件传输工具，支持多设备间快速、安全地传输文件。无需安装客户端，只需浏览器即可使用。

### ✨ 核心特性

- 🌐 **多方式连接** - 自动获取局域网IP、二维码扫码连接、热点直连
- 📤 **超强传输** - 多选上传、文件夹上传、拖拽上传、截图粘贴
- 📊 **实时进度** - 字节级进度条、实时速度显示、大文件支持(4GB+)
- 📁 **文件管理** - 单文件下载、批量ZIP打包、删除、清空
- 🔒 **安全权限** - 访问密码、权限开关、自动清理、访问日志
- 🎨 **炫酷界面** - 现代科技风、渐变动画、深浅主题切换

---

## � 客户端下载

### 桌面端

| 平台 | 下载 | 说明 |
|------|------|------|
| Windows | [FileFly-Setup.exe](https://github.com/Youreln/FileFly/releases) | 安装包，支持开机自启 |
| Windows | [FileFly-Portable.exe](https://github.com/Youreln/FileFly/releases) | 便携版，免安装 |
| macOS | [FileFly.dmg](https://github.com/Youreln/FileFly/releases) | DMG 安装包 |
| Linux | [FileFly.AppImage](https://github.com/Youreln/FileFly/releases) | AppImage 便携版 |

**桌面端优势：**
- ✅ 后台运行，系统托盘常驻
- ✅ 开机自启动
- ✅ 原生通知提醒
- ✅ 更稳定的文件传输

### 移动端 (PWA)

| 平台 | 安装方式 |
|------|---------|
| Android | 浏览器打开 → 菜单 → 添加到主屏幕 |
| iOS | Safari 打开 → 分享 → 添加到主屏幕 |

**移动端优势：**
- ✅ 离线访问支持
- ✅ 类原生应用体验
- ✅ 推送通知
- ✅ 全屏运行

---

## ⚠️ 网页版局限性说明

当前 GitHub Pages 演示版本存在以下限制：

| 功能 | 网页版 | 客户端 |
|------|--------|--------|
| 文件传输 | ❌ 需要自建服务端 | ✅ 内置服务端 |
| 后台运行 | ❌ 关闭页面即停止 | ✅ 最小化到托盘 |
| 离线使用 | ❌ 需要网络 | ✅ 完全离线 |
| 开机自启 | ❌ 不支持 | ✅ 支持 |
| 系统通知 | ⚠️ 部分支持 | ✅ 完整支持 |

**建议：** 如需完整功能，请下载对应平台的客户端！

---

## �🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Node.js | 后端运行环境 |
| Express | Web服务框架 |
| Electron | 桌面应用框架 |
| Multer | 文件上传处理 |
| Archiver | ZIP打包下载 |
| QRCode | 二维码生成 |
| PWA | 移动端渐进式应用 |
| Font Awesome | 图标库 |

---

## 📦 安装与启动

### 方式一：下载客户端（推荐）

1. 前往 [Releases](https://github.com/Youreln/FileFly/releases) 页面
2. 下载对应平台的安装包
3. 安装并运行

### 方式二：源码运行

```bash
# 克隆项目
git clone https://github.com/Youreln/FileFly.git

# 进入目录
cd FileFly

# 安装依赖
npm install

# 启动服务
npm start
```

### 方式三：开发模式

```bash
# 安装依赖
npm install

# 启动 Electron 开发模式
npm run electron:dev
```

启动成功后，控制台会显示访问地址：

```
=================================
  飞传 FileFly 已启动!
  作者: Youreln
=================================

访问地址:
  本地: http://localhost:3000
  局域网: http://192.168.x.x:3000
```

---

## 🔨 构建客户端

### 构建桌面应用

```bash
# 安装依赖
npm install

# 构建 Windows 版
npm run build:win

# 构建 macOS 版
npm run build:mac

# 构建 Linux 版
npm run build:linux

# 构建所有平台
npm run build:all
```

构建产物位于 `release/` 目录。

### 构建要求

- Node.js >= 14.0.0
- Windows: 无额外要求
- macOS: Xcode Command Line Tools
- Linux: fakeroot, dpkg

---

## 🔗 连接方式

### 方式一：局域网连接（推荐）

1. 确保设备连接同一WiFi/路由器
2. 启动服务后查看局域网地址
3. 在手机/其他设备浏览器输入地址

### 方式二：二维码扫码

1. 启动服务后打开主页
2. 使用手机扫描二维码
3. 自动跳转到传输页面

### 方式三：热点直连

1. 电脑开启移动热点
2. 手机连接该热点
3. 使用热点IP地址访问

### 方式四：USB共享

1. 手机通过USB连接电脑
2. 开启USB网络共享
3. 使用共享网络IP访问

---

## 📋 功能清单

### 文件上传

| 功能 | 说明 |
|------|------|
| 多选上传 | 一次选择多个文件上传 |
| 文件夹上传 | 整个文件夹批量上传 |
| 拖拽上传 | 拖拽文件到上传区域 |
| 截图粘贴 | Ctrl+V 直接粘贴截图 |
| 进度显示 | 实时字节级进度条 |
| 速度显示 | 实时传输速度 MB/s |

### 文件下载

| 功能 | 说明 |
|------|------|
| 单文件下载 | 点击下载单个文件 |
| 批量下载 | 勾选多个文件打包ZIP |
| 断点续传 | 支持Range请求 |

### 文件管理

| 功能 | 说明 |
|------|------|
| 文件列表 | 实时显示所有文件 |
| 类型图标 | 自动识别文件类型 |
| 文件信息 | 名称、大小、时间 |
| 单文件删除 | 删除指定文件 |
| 一键清空 | 清除所有文件 |

### 安全权限

| 功能 | 说明 |
|------|------|
| 访问密码 | 设置密码保护 |
| 上传权限 | 开关上传功能 |
| 下载权限 | 开关下载功能 |
| 删除权限 | 开关删除功能 |
| 自动清理 | 定时清理过期文件 |
| 访问日志 | 记录IP和操作 |

---

## 📁 项目结构

```
FileFly/
├── index.js              # 主服务入口
├── electron.js           # Electron 主进程
├── package.json          # 依赖配置
├── public/               # 前端文件
│   ├── index.html        # 主页面
│   ├── settings.html     # 设置页面
│   ├── style.css         # 样式文件
│   ├── app.js            # 前端逻辑
│   ├── manifest.json     # PWA 配置
│   └── sw.js             # Service Worker
├── utils/                # 后端工具
│   ├── ip.js             # IP获取工具
│   ├── auth.js           # 认证工具
│   └── fileManager.js    # 文件管理工具
├── assets/               # 应用图标
├── scripts/              # 构建脚本
├── uploads/              # 文件存储目录
├── docs/                 # GitHub Pages
└── README.md             # 使用文档
```

---

## 🚀 部署到 GitHub Pages

本项目支持自动部署到 GitHub Pages，提供在线演示页面。

### 自动部署

1. Fork 本项目到你的 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 推送代码后自动部署

部署完成后访问：`https://你的用户名.github.io/FileFly`

---

## ❓ 常见问题

### Q: 局域网其他设备无法访问？

**A:** 检查以下几点：
1. 确认设备在同一局域网
2. 检查防火墙是否放行端口
3. Windows防火墙设置：
   ```bash
   netsh advfirewall firewall add rule name="FileFly" dir=in action=allow protocol=tcp localport=3000
   ```

### Q: 上传大文件失败？

**A:** 
1. 默认支持最大10GB文件
2. 如需更大，修改 index.js 中的 `limits.fileSize`

### Q: 如何修改端口？

**A:** 
```bash
# 临时修改
PORT=8080 npm start

# 永久修改
# 编辑 config.json 或在设置页面修改
```

### Q: 忘记密码怎么办？

**A:** 
删除 `config.json` 文件或手动编辑移除 password 字段。

### Q: 手机无法扫描二维码？

**A:** 
直接在手机浏览器输入显示的局域网地址即可。

### Q: 如何安装 PWA 到手机？

**A:**
- **Android**: 浏览器菜单 → 添加到主屏幕
- **iOS**: Safari 分享 → 添加到主屏幕

---

## 🔄 更新日志

### v1.0.0 (2026-01-01)

- ✨ 首次发布
- 🎉 完整文件传输功能
- 🔒 安全权限控制
- 🎨 炫酷界面设计
- 📱 全平台兼容
- 🌐 GitHub Pages 在线演示
- 💻 Electron 桌面客户端
- 📲 PWA 移动端支持

---

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<div align="center">

**⭐ 如果觉得有用，请给个 Star ⭐**

Made with ❤️ by [Youreln](https://github.com/Youreln)

© 2026 Youreln · 飞传 FileFly

</div>

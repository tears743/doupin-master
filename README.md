# 豆拼 - 专业的拼豆图纸绘制与转换工具

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-mac%20%7C%20windows%20%7C%20linux-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/electron-28.2.0-47848F?logo=electron)
![TypeScript](https://img.shields.io/badge/typescript-5.0.2-3178C6?logo=typescript)

🎨 **让拼豆创作更简单**

[下载最新版](#下载) • [功能特性](#功能特性) • [使用指南](#使用指南) • [技术栈](#技术栈)

</div>

---

## 📖 项目介绍

**豆拼** 是一款专业的拼豆（Perler Beads / Fuse Beads）图纸绘制与转换工具，帮助你轻松创作精美的拼豆作品。

无论你是拼豆新手还是资深玩家，豆拼都能提供：
- 🖌️ 直观的图纸绘制界面
- 🔄 多种格式互转能力
- 📱 跨平台桌面应用
- 💾 本地数据管理

---

## ✨ 功能特性

### 🎨 图纸绘制
- [ ] 自由绘制拼豆图案
- [ ] 多种画布尺寸预设
- [ ] 颜色选择器与调色板
- [ ] 撤销/重做功能
- [ ] 图层管理

### 🔄 格式转换
- [ ] 图片转拼豆图纸
- [ ] 支持 PNG/JPG 导入
- [ ] 导出为 PDF 打印版
- [ ] 导出为图片分享

### 📊 数据统计
- [ ] 自动统计豆子数量
- [ ] 按颜色分类计数
- [ ] 成本估算

### 💾 数据管理
- [ ] 本地 SQLite 数据库
- [ ] 作品分类管理
- [ ] 搜索与筛选
- [ ] 数据备份与恢复

---

## 📸 界面预览

> 待添加界面截图

---

## 🚀 快速开始

### 下载安装

#### macOS
```bash
# 下载 dmg 安装包
curl -L https://github.com/tears743/doupin-master/releases/latest/download/doupin-1.0.0-arm64.dmg -o doupin.dmg
# 安装后拖拽到 Applications 文件夹
```

#### Windows
```bash
# 下载 exe 安装包
curl -L https://github.com/tears743/doupin-master/releases/latest/download/doupin-1.0.0-x64.exe -o doupin.exe
# 运行安装程序
```

#### Linux
```bash
# 下载 AppImage
curl -L https://github.com/tears743/doupin-master/releases/latest/download/doupin-1.0.0-arm64.AppImage -o doupin.AppImage
chmod +x doupin.AppImage
./doupin.AppImage
```

### 源码构建

#### 环境要求
- Node.js >= 18.x
- pnpm >= 8.x
- Git

#### 安装依赖
```bash
git clone https://github.com/tears743/doupin-master.git
cd doupin-master
pnpm install
```

#### 开发模式
```bash
pnpm dev
```

#### 构建发布
```bash
# macOS
pnpm build:mac

# Windows
pnpm build:win

# 全平台
pnpm build:all
```

---

## 📖 使用指南

### 1. 创建新作品
1. 启动豆拼应用
2. 点击「新建作品」
3. 选择画布尺寸（或自定义）
4. 开始绘制！

### 2. 导入图片
1. 点击「导入图片」
2. 选择本地图片文件
3. 调整转换参数（尺寸、颜色数）
4. 确认生成图纸

### 3. 导出图纸
1. 完成绘制后点击「导出」
2. 选择导出格式（PDF/PNG）
3. 选择保存路径
4. 完成！

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Electron 28.2.0 |
| **前端** | React 18 + TypeScript |
| **构建** | Vite 4.4 |
| **样式** | TailwindCSS 3.4 |
| **图标** | Lucide React |
| **数据库** | SQLite3 |
| **打包** | electron-builder |
| **国际化** | i18next |

---

## 📁 项目结构

```
doupin-master/
├── electron/          # Electron 主进程
│   └── main.js        # 主进程入口
├── src/               # React 前端源码
│   ├── components/    # UI 组件
│   ├── pages/         # 页面组件
│   ├── utils/         # 工具函数
│   └── styles/        # 样式文件
├── server/            # 后端服务
├── public/            # 静态资源
├── dist/              # 构建输出
├── release/           # 发布包
└── package.json       # 项目配置
```

---

## 🤝 贡献指南

欢迎贡献！你可以通过以下方式帮助项目：

1. 🐛 报告 Bug
2. 💡 提出新功能建议
3. 📝 改进文档
4. 🔧 提交代码

### 开发流程
```bash
# 1. Fork 项目
# 2. 创建分支
git checkout -b feature/your-feature

# 3. 提交代码
git commit -m "feat: add new feature"

# 4. 推送并创建 PR
git push origin feature/your-feature
```

---

## 📄 开源协议

MIT License

---

## 🙏 致谢

感谢所有使用和支持豆拼的用户！

---

<div align="center">

**豆拼** - 让创作更简单

Made with ❤️ by 豆拼团队

[回到顶部](#豆拼---专业的拼豆图纸绘制与转换工具)

</div>

# Crypto Side Screen — 加密副屏工具

> 竖向分屏的 Telegram alpha + 社交信号监控面板，专为副屏 / 第二显示器设计。
> 一眼掌握 6 个 alpha 群、X、币安广场、新闻的多窗格实时流。

**Phase 1**：纯前端 UI（模拟数据）。Phase 2 将接入 Telegram Bot + DexScreener 实时数据。

---

## 功能（Phase 1）

### 左侧群聊面板（默认 65%，可拖拽）

- **三种布局可一键切换**（顶部布局切换器）：
  - `2 列` — 2×N 网格
  - `3 列` — 3×N 网格（默认）
  - `Focus` — 单卡主格 + 左侧 128px 略缩列（可点击切换主格）
- **多窗格自由组合**：
  - `+ 添加` 弹层显示当前未启用的群，点击加入网格
  - 卡片左上角红色按钮一键移除
- **每张卡片自带 Mac 风格红绿灯**（CardTrafficLights）：
  - 🔴 关闭：网格模式 → 移除卡片 / Focus 模式 → 退出 Focus
  - 🟡 折叠：仅保留头部，节省屏幕空间（也可双击 header 触发）
  - 🟢 最大化：进入 / 退出 Focus
- **每张卡片自带独立过滤面板**（点击 header 过滤图标，弹出 Popover）：
  - 最低市值
  - 关键词白 / 黑名单
  - "仅显示含 CA" 开关
  - 头像旁的小红点提示当前是否处于过滤状态
- **消息高亮**：自动检测并高亮 CA（Solana Base58 / EVM 0x）、市值（$XXK / $XXM）、信号词（moon / 100x / 🚀 等）
- **快捷操作**：点击 CA 一键复制；hover 出现 DexScreener 跳转按钮

### 右侧信息流面板（默认 35%）

- 三个子 Tab：**X (Twitter)** / **币安广场** / **新闻**
- 卡片式垂直滚动列表：头像、用户名、认证标识、时间、tag、来源标签
- 点击卡片用系统默认浏览器打开链接

### 顶部栏 / 底部栏

- **顶部栏**：Logo、应用状态、全局过滤搜索框、全局刷新、全屏切换、设置入口
- **可拖拽中间分隔条**：双击复位到 65 / 35
- **设置弹窗**：预留 Bot Token / 群 ID / DexScreener / 刷新间隔字段（Phase 2 启用）
- **状态栏**：连接状态 + BTC / ETH / SOL 价格占位

### 窗口

- macOS 使用 `hiddenInset` 原生红绿灯（无自定义窗口控件）
- Windows / Linux 使用普通框架
- 支持系统级全屏（`Maximize2` 按钮 → IPC `toggle-fullscreen`）

---

## 技术栈

- **Electron 33** + `vite-plugin-electron`（主进程 + preload 一键集成）
- **Vite 5 + React 18 + TypeScript 5**
- **Tailwind CSS v4**（CSS-first 配置，深色主题，`@theme` 变量）
- shadcn 风格的自封装组件（Button / Input / Tabs / Switch / Dialog / Badge / Popover）
- **lucide-react** 图标
- **electron-builder** 打包（dmg / nsis / AppImage）

---

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发模式（Electron 窗口 + 热重载）
npm run dev
```

启动后会自动打开 Electron 窗口；改动 `src/` 下任意文件会立即热更新。
DevTools 默认以 detach 模式打开，方便调试。

---

## 打包

```bash
# 仅构建（不打包安装包）
npm run build

# 打 macOS .dmg
npm run electron:dist:mac

# 打 Windows .exe
npm run electron:dist:win

# 按当前平台打包
npm run electron:dist
```

产物输出到 `release/` 目录。

---

## 项目结构

```
crypto-side-screen/
├── electron/
│   ├── main.ts                  # Electron 主进程（hiddenInset 标题栏 + IPC）
│   ├── preload.ts               # 预加载脚本（暴露 cssApi）
│   └── electron-env.d.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # 根布局：TopBar + SplitPane(LeftPanel | RightPanel) + StatusBar
│   ├── index.css                # Tailwind v4 + 主题变量 + signal-pulse 等动效
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts             # 全局类型（TelegramGroup / ChatMessage / FilterState / FeedItem 等）
│   ├── lib/
│   │   └── utils.ts             # cn / 正则提取（CA / MC / keywords）/ 复制 / 打开链接 / 格式化
│   ├── data/
│   │   └── mockData.ts          # 6 个群 + ~50 条消息 + feed 数据
│   └── components/
│       ├── TopBar.tsx
│       ├── SplitPane.tsx        # 可拖动分屏（双击复位）
│       ├── SettingsModal.tsx
│       ├── LeftPanel.tsx        # 群聊面板：布局切换 + 网格 + 添加卡片
│       ├── GroupCard.tsx        # 单卡：traffic lights + 头部 + 滚动消息流
│       ├── CardTrafficLights.tsx# 卡片红绿灯（红/黄/绿,group-hover 显图标）
│       ├── ChatMessage.tsx      # 消息渲染 + CA / MC / 信号词高亮
│       ├── FilterPanel.tsx      # 过滤面板内容（被 Popover 包裹）
│       ├── RightPanel.tsx       # 信息流（Tabs）
│       ├── FeedPanel.tsx        # 信息流滚动列表
│       ├── FeedCard.tsx         # 单条 feed 卡片
│       └── ui/                  # shadcn 风格基础组件
│           ├── button.tsx
│           ├── input.tsx
│           ├── tabs.tsx
│           ├── switch.tsx
│           ├── dialog.tsx
│           ├── badge.tsx
│           └── popover.tsx      # Portal-based Popover（anchor-rect 定位）
├── index.html
├── package.json                 # 含 electron-builder 配置
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.mts
├── .gitignore
└── README.md
```

---

## 内置 Mock 群（Phase 1）

| ID             | 名称           | Emoji |
| -------------- | -------------- | ----- |
| `alpha-calls`  | Alpha Calls    | 🎯    |
| `solana-gems`  | Solana Gems    | 💎    |
| `meme-snipers` | Meme Snipers   | 🚀    |
| `100x-calls`   | 100x Calls     | 💯    |
| `eth-gems`     | ETH Gems       | ⟠     |
| `pumpfun-live` | Pump.fun Live  | ⚡    |

---

## IPC（preload `window.cssApi`）

| 方法                 | 说明                                |
| -------------------- | ----------------------------------- |
| `openExternal(url)`  | 用系统浏览器打开 http(s) 链接        |
| `copyText(text)`     | 写入系统剪贴板                       |
| `toggleFullscreen()` | 切换主窗口全屏                       |
| `platform`           | `process.platform` 字段（同步暴露）  |

---

## Phase 2 路线图（待实现）

- 主进程引入 `telegraf`，监听 Bot Token 拉取的多个群
- 正则解析消息中的 CA → 调 DexScreener `/tokens/v1/{chain}/{ca}`
- 富化后的消息通过 IPC `ipcMain.emit('msg:new', …)` 推送到渲染进程
- 渲染进程订阅事件 → 替换 mock store
- 缓存层：本地 SQLite / lowdb 存最近 N 小时消息
- 设置项落盘到 `app.getPath('userData')`

---

## 已知 Phase 1 局限

- 所有数据均为硬编码 mock；过滤、复制、链接跳转是真的，但消息不会更新
- "全局刷新"按钮只是动画反馈，不会拉新数据
- 状态栏 BTC / ETH / SOL 价格是占位字符串
- 折叠后的卡片仍占网格行最小高度（220px）—— 行高由 `[grid-auto-rows:minmax(220px,1fr)]` 控制

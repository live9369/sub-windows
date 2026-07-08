# Crypto Side Screen — 加密副屏工具

> 竖向分屏的 Telegram alpha + 社交信号监控面板，专为副屏 / 第二显示器设计。
> 一眼掌握 6 个 alpha 群、X、币安广场、新闻的多窗格实时流。

**Phase 1**：纯前端 UI（模拟数据）。
**Phase 2**：微信只读数据聚合（wechat-decrypt）已接入，支持微信群实时监控、CA/市值高亮、设置持久化。

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
# 1. 克隆前端仓库
git clone <repo-url>

# 2. 安装前端依赖
npm install

# 3. 启动开发模式（Electron 窗口 + 热重载）
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
│   ├── main.ts                  # Electron 主进程（hiddenInset 标题栏 + IPC + settings 持久化）
│   ├── preload.ts               # 预加载脚本（暴露 cssApi + wechat + settings API）
│   ├── wechatService.ts         # 微信解密服务管理（探测/spawn/轮询/IPC 推送）
│   └── electron-env.d.ts
├── vendor/                      # 可选：本地放后端工具（默认不纳入 Git）
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # 根布局：TopBar + SplitPane + StatusBar + Settings + Wechat hook
│   ├── index.css                # Tailwind v4 + 主题变量 + signal-pulse 等动效
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts             # 全局类型（MonitoredGroup / ChatMessage / FilterState / FeedItem / AppSettings 等）
│   ├── lib/
│   │   ├── utils.ts             # cn / 正则提取（CA / MC / keywords）/ 复制 / 打开链接 / 格式化
│   │   └── wechatAdapter.ts     # wechat-decrypt 响应 → ChatMessage / MonitoredGroup 适配器
│   ├── hooks/
│   │   └── useWechatMessages.ts # 渲染进程订阅 IPC、聚合微信消息
│   ├── data/
│   │   └── mockData.ts          # 6 个 TG mock 群 + ~50 条消息 + feed 数据
│   └── components/
│       ├── TopBar.tsx
│       ├── SplitPane.tsx        # 可拖动分屏（双击复位）
│       ├── SettingsModal.tsx
│       ├── LeftPanel.tsx        # 群聊面板：来源 Tab + 布局切换 + 网格 + 添加卡片
│       ├── GroupCard.tsx        # 单卡：traffic lights + 头部 + 滚动消息流 + 离线空态
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

## 数据接入页面与新手接入指南（前后端分离）

有。前端统一通过「设置」弹窗接入数据源：

- 入口：右上角齿轮按钮（`SettingsModal`）
- 页面代码：`src/components/SettingsModal.tsx`
- 配置持久化：`window.cssApi.loadSettings/saveSettings`（主进程落盘到本地）

### 先说清楚：当前架构里的“前后端”

- **前端**：React 页面（`src/`）
- **本地后端桥接层**：Electron 主进程（`electron/main.ts` + 各 service），负责:
  - 调外部服务（HTTP / WSS）
  - 维护长连接
  - 通过 IPC 推送给前端
- **外部后端服务**（你需要自己启动）：
  - WeChat decrypt HTTP 服务
  - Twitter WSS 推送服务
  - BlockBeats API（远端）

> 你现在已把后端目录设为不进 Git，符合前后端分离开发：前端仓库干净，后端服务由每个开发者本地单独准备。

### 新用户 0 到 1 启动顺序（推荐）

1. 启动前端桌面容器：`npm run dev`
2. 打开设置页，先配置并验证 **WeChat**（最容易看见结果）
3. 再配置 **Telegram 用户客户端**
4. 再配置 **Twitter WSS**
5. 最后填 **BlockBeats API Key**

---

### 1) WeChat 数据接入（HTTP）

前端依赖的设置字段：

- `启用微信监控`（开关）
- `服务地址`（默认 `http://localhost:5678`）
- `Python 路径`、`脚本路径`（仅在 Electron 代启模式下需要）
- `轮询间隔（毫秒）`

前端/主进程实际调用：

- `wechat:start` 启动连接
- `wechat:discover` 拉取群列表
- `onWechatMessage` 订阅消息推送

后端最小接口约定（你的服务必须满足）：

- `GET /api/history?since=<timestamp>&limit=<n>`
- 返回 JSON，至少包含 `messages` 数组；每条消息建议字段：
  - `id`
  - `timestamp`
  - `chat`（群名）
  - `sender`
  - `content`

启动方式（按你当前本地后端工程为准）：

- 若你本地有 `wechat-decrypt`：进入其目录后运行 `python main.py`
- 若前端仓库里不再携带后端代码：请单独 clone 后端仓库并启动，再把 `服务地址` 指向对应 URL

成功标志：

- 设置页测试连接不报错
- 左侧切到 `WX`，点「加卡片」能看到自动发现的群
- 新消息持续进入卡片

---

### 2) Telegram 数据接入（本地账号直连）

这一路目前不是“你的独立后端 API”，而是 Electron 主进程直接用 Telegram 客户端库登录用户账号。

设置字段：

- `API ID`
- `API Hash`
- `手机号`

接入流程：

1. 在设置页填 `API ID / API Hash`，点「连接」
2. 填手机号，点「登录」
3. 根据提示输入验证码 / 2FA 密码
4. 连接成功后会自动拉取 dialogs 并开始推送消息

成功标志：

- 设置页状态显示 `connected`
- 左侧 Telegram 群可发现并接收实时消息

---

### 3) X / Twitter 数据接入（WSS）

设置字段：

- `启用 WSS 推送`
- `WSS 地址`（例如 `wss://your-domain/ws`）
- `Token`

主进程连接行为：

- 连接成功后会发送：`{"token":"<your-token>"}`
- 随后接收服务端推送并转成 feed 卡片

服务端建议消息格式：

- 连接确认：`{ "status": "connected" }`
- 推文消息：`{ "action":"tweet", "author": {...}, "content": {...}, "tweet_id": "...", "timestamp": 1710000000 }`

`tweet` 事件里常用字段：

- `author.handle`, `author.name`, `author.avatar`, `author.followers`
- `content.text`
- `content.media`（图片可选）
- `reference`（引用/回复信息，可选）

成功标志：

- 设置后状态从 `connecting` 变 `connected`
- 右侧 `X` tab 持续出现新卡片

---

### 4) BlockBeats 新闻接入

设置字段：

- `启用新闻监控`
- `API Key`

行为说明：

- 前端通过 IPC 调 `blockbeats:fetch`
- 主进程请求 BlockBeats RSS 接口并返回 XML
- 前端解析 XML 为新闻卡片

成功标志：

- 右侧 `新闻` tab 能拉到列表
- 不再出现 “请配置 BlockBeats API Key / 未解析到新闻” 提示

---

### 新用户常见失败点（排障清单）

- **WeChat 连不上**
  - 先访问 `http://localhost:5678/api/history?limit=1` 看是否有响应
  - 检查端口占用、防火墙、Python 环境、脚本路径
- **Telegram 一直 idle/error**
  - `API ID / API Hash` 填错最常见
  - 检查手机号格式和账号 2FA
- **Twitter 一直 reconnect**
  - WSS 地址错误、Token 校验失败、服务端未按约定回 `status: connected`
- **前端看不到数据**
  - 设置保存后确认对应开关已开启
  - 查看设置页状态文案和主进程日志（连接态/报错）

---

## IPC（preload `window.cssApi`）

| 方法                 | 说明                                |
| -------------------- | ----------------------------------- |
| `openExternal(url)`  | 用系统浏览器打开 http(s) 链接        |
| `copyText(text)`     | 写入系统剪贴板                       |
| `toggleFullscreen()` | 切换主窗口全屏                       |
| `platform`           | `process.platform` 字段（同步暴露）  |

---

## Phase 2：微信接入（只读数据聚合）

### 功能

- **来源切换 Chips**：左侧面板顶部新增 `TG | WX | 全部`，一键过滤卡片来源。
- **微信群监控卡片**：与 Telegram 卡片完全一致的 UI（红绿灯、过滤 Popover、CA 高亮），来源徽标 `WX` 区分。
- **双模式服务**：
  - **外部模式**：在独立终端运行 `python main.py`，Electron 自动探测 `localhost:5678`。
  - **主进程 spawn**：在设置中填写 Python / 脚本路径，点击「启动微信解密服务」由 Electron 主进程直接拉起。
- **消息实时推送**：主进程轮询 `/api/history?chat=&since=`，增量推送到渲染进程，卡片自动滚动到底部。
- **离线空态**：微信服务未连接时，卡片显示「微信服务未连接」+ 重试 / 打开设置按钮。
- **设置持久化**：所有配置自动保存到 `app.getPath('userData')/app-settings.json`，重启后恢复。

### 安装 wechat-decrypt（独立后端，按需准备）

```bash
# 在 wechat-decrypt 项目目录安装 Python 依赖
npm run wechat:install
```

### 平台差异与权限

| 平台 | 前置条件 | 运行命令 |
|------|----------|----------|
| **Windows** | 管理员权限（读取进程内存） | `python main.py` |
| **macOS** | Xcode CLI + 对微信重新签名 + root | `sudo codesign --force --deep --sign - /Applications/WeChat.app` <br> `cc -O2 -o find_all_keys_macos find_all_keys_macos.c -framework Foundation` <br> `sudo ./find_all_keys_macos` <br> `python3 decrypt_db.py` <br> `python3 main.py` |
| **Linux** | root 或 `CAP_SYS_PTRACE` | `sudo python3 main.py` |

### 并行运行 Electron + wechat-decrypt

**方案 A（推荐）：单独终端**

终端 1：
```bash
npm run wechat:start        # 需要你本地已有 wechat-decrypt 目录；否则请在独立后端仓库启动
```

终端 2：
```bash
npm run dev
```

Electron 启动后会自动探测 `localhost:5678`；若可达则自动发现群聊并显示在「加卡片」弹层。

**方案 B：一键 concurrently（可选）**

```bash
npm run dev:all            # 同时启动 Electron + wechat-decrypt（需要管理员 / root）
```

### 配置

1. 打开应用 → 设置（⚙️）
2. 开启「启用微信监控」
3. （可选）修改服务地址 / Python 路径 / 脚本路径
   - 脚本路径默认已指向 `vendor/wechat-decrypt/main.py`
4. 保存
5. 若使用外部模式：确保 `python main.py` 已在运行
6. 若使用 spawn 模式：点击「启动微信解密服务」
7. 服务连接成功后，切换到「WX」Tab → 点击「加卡片」→ 选择自动发现的微信群加入网格

---

## IPC（preload `window.cssApi`）

| 方法 | 说明 |
|------|------|
| `openExternal(url)` | 用系统浏览器打开 http(s) 链接 |
| `copyText(text)` | 写入系统剪贴板 |
| `toggleFullscreen()` | 切换主窗口全屏 |
| `platform` | `process.platform` 字段（同步暴露） |
| `loadSettings()` | 从 `userData/app-settings.json` 加载配置 |
| `saveSettings(data)` | 保存配置到本地 JSON |
| `wechatStart(cfg)` | 启动/连接微信解密服务（含可选 spawn） |
| `wechatStop()` | 停止服务并终止子进程 |
| `wechatStatus()` | 获取当前服务状态 |
| `onWechatMessage(cb)` | 订阅批量消息推送（返回 unsubscribe） |
| `onWechatStatusChange(cb)` | 订阅服务状态变更（返回 unsubscribe） |

---

## 已知 Phase 1/2 局限

- Telegram 数据仍为硬编码 mock；过滤、复制、链接跳转是真的，但消息不会更新
- "全局刷新"按钮只是动画反馈，不会拉新数据（Telegram 侧）
- 状态栏 BTC / ETH / SOL 价格是占位字符串
- 折叠后的卡片仍占网格行最小高度（220px）—— 行高由 `[grid-auto-rows:minmax(220px,1fr)]` 控制
- wechat-decrypt 需要管理员/root 权限，macOS 需重新签名微信 App

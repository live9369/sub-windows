> 欢迎使用。这个向导面向第一次使用本产品的用户（不要求会写代码）。  
> **使用方式**：打开 Vercel 上的链接即可，无需安装前端。在设置里填入你的数据源参数，主界面就会显示内容。  
> 左侧导航分区与「设置」页面一一对应：WeChat、Telegram、币安广场、BlockBeats、X / Twitter。

### 0) 产品定位：Vercel 分发 + 用户自备数据源

- **我们提供**：托管在 Vercel 的前端页面——用户打开链接就能用，不用装 Node、不用跑 `npm`
- **用户自备**：各自的 API Key、Bot 推送地址、WSS 等（数据不经过我们的服务器）
- **面向小白**：优先选「零安装」类数据源（见下方分级）；微信因涉及本机解密，需额外一步「本机助手」（开发中）
- **首次打开**：界面为空是正常的，在设置里完成至少一路接入后才会有数据

### 1) 数据源分级（按使用门槛）

#### 🟢 零安装 · 打开 Vercel 链接即可（填参数）

适合完全不懂技术的小白——只需在设置里粘贴服务商给的地址或 Key：

| 数据源 | 用户要做什么 |
|--------|-------------|
| Telegram Bot 推送 | 粘贴 Bot 推送 WS/SSE 地址（由 Bot 服务商提供） |
| X / Twitter | 粘贴 WSS 地址 + Token（由推送服务商提供） |
| BlockBeats 新闻 | 粘贴 API Key |
| GMGN | 粘贴 API Key |

> 注：币安行情 / 币安广场在 Vercel 线上版仍需服务端代理（开发中），本地 `dev:web` 已可用。

#### 🟡 需装一次「本机助手」（开发中，面向微信）

微信消息存在你电脑本地，浏览器网页**无法**从 Vercel 页面直接读取。  
计划提供：**下载 → 双击运行 → 扫码配对**，之后 Vercel 上的页面自动收到微信流，用户无需懂命令行。

#### 🔴 进阶用户自选

- 桌面版 Electron（功能最全）
- 本地 `npm run dev:web` / `preview:web`
- ngrok 隧道、自建网关等

### 2) 先看链路状态

#### 可用链路（Vercel 零安装）

- Telegram Bot 推送（粘贴 WS/SSE 地址）
- X / Twitter WSS 推送（粘贴地址 + Token）
- BlockBeats 新闻（粘贴 API Key）
- GMGN Token 卡片（粘贴 API Key）

#### 可用链路（需本机环境）

- WeChat（本机助手方案开发中；临时可用桌面版或本地 Web）
- 币安行情 / 币安广场（Vercel 代理开发中；本地 `dev:web` 已可用）

#### 开发中链路（为「Vercel + 小白零门槛」服务）

- **微信本机助手**：下载即用，扫码配对 Vercel 页面，自动推送微信流
- **Vercel API 代理**：币安 / BlockBeats / GMGN 等公网 API 的 CORS 中转
- Telegram 用户链路（MTProto，仅桌面版）
- 统一链路诊断与配对引导

#### 待开发链路（未上线）

- 多环境配置与团队共享模板
- 链路断流/鉴权失效的主动告警
- 消息与 feed 的历史回放与导出

### 2) 先理解：为什么打开后默认没数据

这个产品是**前端数据聚合框架**，不是内置数据平台，也不托管任何用户的敏感数据。  
首次打开能看到界面，但不会自动有实时数据——必须先接入**你自己的**至少一个数据源。

### 3) 推荐接入顺序（Vercel 小白向）

1. Telegram Bot 推送 或 X WSS（只需粘贴地址，最容易）  
2. BlockBeats（粘贴 API Key）  
3. 微信（等「本机助手」上线；或暂用桌面版）

每完成一步，回主界面确认是否有数据流入。

### 4) WeChat（本地敏感数据，必须本机）

WeChat 数据属于敏感数据，请只在你自己的电脑本地处理，不要上传到公网。

#### 接入方案对比（推荐方案 B）

| 方案 | 适合谁 | Vercel 小白 | 说明 |
|------|--------|-------------|------|
| A. 浏览器轮询 localhost（当前） | 开发者 / 桌面版 | ❌ | 依赖 `wechat-decrypt` + 命令行，Vercel 页面无法直连本机 |
| B. **本机助手 + 推送流（推荐）** | **所有 Vercel 用户** | ✅ | 助手在本机读微信 → 推到 WSS → 浏览器只订阅，和 Telegram Bot 推送同思路 |
| C. ngrok 隧道 | 临时调试 | △ | 能通但不稳，不适合小白 |
| D. 微信官方 / 企微 API | 企业公众号 | ❌ | 读不了个人微信群聊记录，不是本产品的场景 |

#### 方案 B 工作流程（目标形态，开发中）

```
你的电脑                         公网（可选中继）              Vercel 前端
┌──────────────┐                ┌─────────────┐              ┌────────────┐
│ wechat-decrypt│ ←轮询─ │ 本机助手     │ ──WSS──→ │ 配对会话     │ ←─WSS── │ 设置里填   │
│ localhost:5678│                │ 双击即用     │              │ 配对码连接  │              │ 配对码即可 │
└──────────────┘                └─────────────┘              └─────────────┘              └────────────┘
```

小白操作：**下载助手 → 双击运行 → 把 6 位配对码填进 Vercel 页面 → 完成**。  
数据仍在本机解密，不经平台存储；浏览器只收推送，不访问 localhost。

#### 方案 A（开发者路径，已可用）

你需要先准备并启动 `wechat-decrypt`：

- 项目地址：<https://github.com/ylytdeng/wechat-decrypt>
- 使用说明：请按该项目 README 完成安装与启动

当 `wechat-decrypt` 启动后，再回到本产品设置页填写：

- 启用微信监控：开启
- 服务地址：`http://localhost:5678`（默认）
- 轮询间隔：建议 2000~5000ms

点击“测试连接”成功后，到主界面切换 `WX`，添加群卡片即可看到消息。

### 5) Telegram（个人账号接入）

你需要准备：

- API ID
- API Hash
- 登录手机号

获取地址：

- Telegram 开发者入口：<https://my.telegram.org/apps>

在设置页操作：

1. 填写 API ID / API Hash，点击“连接”
2. 填写手机号，点击“登录”
3. 输入验证码（如果开了 2FA，再输入密码）

状态显示 `connected` 即表示接入成功。

说明：Telegram 支持两种接入：个人账号（MTProto，实时）与 Bot 推送流（由你的 Bot 服务通过 WS/SSE 实时推送到本应用）。

### 6) BlockBeats（新闻）

你需要一个 BlockBeats API Key。

申请与文档：

- 官方 API 文档：<https://theblockbeats.info/apiDoc>

在设置页操作：

- 启用新闻监控：开启
- API Key：填入申请到的 Key

接入成功后，右侧新闻标签会自动刷新。

### 7) 币安广场（独立数据源）

币安广场与 X 是两个独立数据源，不共用配置。

请注意：币安广场数据源 **不是 Binance 公共行情接口**，而是推文/帖子类数据源。  
当前版本支持你“直接粘贴浏览器里抓到的完整 `curl` 请求”。

在设置页操作：

1. 打开币安广场页面并抓包，复制可用的完整 `curl`（包含 `-H`、`-b`、`--data-raw`）
2. 在“币安广场”分区打开“启用币安广场拉取”
3. 将完整 `curl` 粘贴到“curl 请求”输入框并保存
4. 回到右侧“币安广场”标签，等待轮询刷新

注意事项：

- `cookie` / `token` 过期后，请重新复制新的 `curl`
- 尽量保留完整请求头，删减后可能导致返回空数据
- 该命令只保存在本机设置中，不会上传到远端仓库

### 8) X / Twitter（WSS 推送）

这一项通常需要你已有“可推送 tweet 的 WSS 服务”（例如团队内部服务或第三方服务商提供）。

在设置页填写：

- 启用 WSS 推送：开启
- WSS 地址：`wss://...`
- Token：服务方提供的访问令牌

如果你没有现成 WSS 服务，请联系提供方先开通地址和 Token。

### 9) 常见问题（新手排障）

- 页面打开正常但没有数据：通常是数据源还未接入或未启动
- WeChat 连接失败（本地）：先在浏览器访问 `http://localhost:5678/api/history?limit=1`
- WeChat 连接失败（Vercel / 线上）：不能用 `localhost`，需 ngrok 等 HTTPS 隧道，或改用桌面版 / `npm run dev:web`
- Telegram 报错：优先检查 API ID / API Hash / 手机号 / 2FA
- Twitter 无推送：通常是 WSS 地址或 Token 不正确

### 10) 运行形态说明

- 桌面版（Electron）：支持全部本地桥接能力，含 Telegram MTProto 用户登录。
- Web 版（本地开发，`npm run dev:web`）：已支持 WeChat / Bot 推送 / 币安行情 / 币安广场 / BlockBeats / X WSS / GMGN；通过 Vite 同源代理规避 CORS。
- Web 版（本地生产预览，`npm run preview:web`）：构建后在本机 `http://localhost:4173` 打开，仍带 `/__wechat` 等代理，适合当「本机 Web 应用」日常使用。
- Web 版（线上部署，如 Vercel）：**不能**用 `http://localhost:5678` 连微信——无 Vite 代理，且 HTTPS 页面禁止请求本机 HTTP。可行替代见下方第 11 节。

### 11) Web 如何使用本机数据源（四种可行方案）

浏览器里的网页**可以**用本机数据，但页面必须和本机服务在「安全策略上说得通」。按推荐顺序：

#### 方案 A：本机 Web（推荐，仍是纯 Web）

页面也跑在你电脑上，和 `dev:web` 一样走 Vite 代理，不经过 Vercel：

```bash
npm run dev:web       # 开发热更新 → http://localhost:5173
npm run preview:web   # 构建后本机 Web → http://localhost:4173
```

微信地址仍填 `http://localhost:5678`，前端自动走 `/__wechat` 代理。

#### 方案 B：推送流（适合必须坚持 Vercel 线上 UI）

和 Telegram Bot 推送同一思路：**本机主动往外推，浏览器只订阅公网 WS/SSE**。

```
本机 wechat-decrypt → 本地桥接脚本 → wss://你的中继 → Vercel 上的 Web 订阅
```

浏览器从不直接 `fetch localhost`，因此没有混合内容 / CORS 问题。

#### 方案 C：HTTPS 隧道（临时调试）

用 ngrok / Cloudflare Tunnel 把本机 `5678` 暴露为 `https://xxx`，在设置里填隧道地址，并配置 CORS。

#### 方案 D：桌面版（Electron）

主进程直连 `localhost`，不受浏览器网页安全限制。

---

**不能指望的做法**：在 `https://xxx.vercel.app` 里让 JS 直接请求 `http://localhost:5678`——浏览器故意禁止，前端无法绕过。

> 建议：日常用 **方案 A** 或 **方案 D**；必须远程打开页面时用 **方案 B** 或 **方案 C**。

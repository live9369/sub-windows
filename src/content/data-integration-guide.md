> 欢迎使用。这个向导面向第一次使用本产品的用户（不要求会写代码）。  
> 目标是：按步骤接入数据源，并在主界面看到实时内容。
> 左侧导航分区与「设置」页面一一对应：WeChat、Telegram、币安广场、BlockBeats、X / Twitter。

### 0) 先看链路状态

#### 可用链路（可直接接入）

- WeChat 本地链路（桌面版 + Web 本地开发，连接本机 `wechat-decrypt`）
- Telegram Bot 推送链路（外部 WS/SSE 推送，桌面版与 Web 版均可）
- 币安行情（底部价格栏，Web 经 Vite 代理）
- 币安广场（手动 `curl`，Web 端浏览器解析并请求）
- BlockBeats 新闻（API Key，Web 经 Vite 代理）
- X / Twitter（WSS 推送，Web 端浏览器直连）
- GMGN Token 卡片（API Key，Web 经 Vite 代理）

#### 开发中链路（持续迭代）

- Telegram 用户链路（MTProto，仅桌面版）
- Web 线上部署（Vercel）的统一 API 网关（替代本地 Vite 代理）
- 统一链路诊断视图（状态、错误、重连、延迟）
- 设置页与引导页联动的排障提示优化

#### 待开发链路（未上线）

- 多环境配置与团队共享模板
- 链路断流/鉴权失效的主动告警
- 消息与 feed 的历史回放与导出

### 1) 先理解：为什么打开后默认没数据

这个产品是“数据聚合面板”，不是内置数据平台。  
首次打开能看到界面，但不会自动有实时数据，必须先接入至少一个数据源。

### 2) 推荐接入顺序（成功率最高）

1. WeChat（本地）  
2. Telegram Bot 推送（Web 推荐）或 Telegram 账号登录（仅桌面版）  
3. 币安广场（手动 curl）  
4. BlockBeats（新闻）  
5. X / Twitter（WSS）

每完成一步，都可以回主界面确认是否已经有数据流入。

### 3) WeChat（本地敏感数据，必须本机）

WeChat 数据属于敏感数据，请只在你自己的电脑本地处理，不要上传到公网。

你需要先准备并启动 `wechat-decrypt`：

- 项目地址：<https://github.com/ylytdeng/wechat-decrypt>
- 使用说明：请按该项目 README 完成安装与启动

当 `wechat-decrypt` 启动后，再回到本产品设置页填写：

- 启用微信监控：开启
- 服务地址：`http://localhost:5678`（默认）
- 轮询间隔：建议 2000~5000ms

点击“测试连接”成功后，到主界面切换 `WX`，添加群卡片即可看到消息。

### 4) Telegram（个人账号接入）

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

### 5) BlockBeats（新闻）

你需要一个 BlockBeats API Key。

申请与文档：

- 官方 API 文档：<https://theblockbeats.info/apiDoc>

在设置页操作：

- 启用新闻监控：开启
- API Key：填入申请到的 Key

接入成功后，右侧新闻标签会自动刷新。

### 6) 币安广场（独立数据源）

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

### 7) X / Twitter（WSS 推送）

这一项通常需要你已有“可推送 tweet 的 WSS 服务”（例如团队内部服务或第三方服务商提供）。

在设置页填写：

- 启用 WSS 推送：开启
- WSS 地址：`wss://...`
- Token：服务方提供的访问令牌

如果你没有现成 WSS 服务，请联系提供方先开通地址和 Token。

### 8) 常见问题（新手排障）

- 页面打开正常但没有数据：通常是数据源还未接入或未启动
- WeChat 连接失败：先在浏览器访问 `http://localhost:5678/api/history?limit=1`
- Telegram 报错：优先检查 API ID / API Hash / 手机号 / 2FA
- Twitter 无推送：通常是 WSS 地址或 Token 不正确

### 9) 运行形态说明

- 桌面版（Electron）：支持全部本地桥接能力，含 Telegram MTProto 用户登录。
- Web 版（本地开发，`npm run dev:web`）：已支持 WeChat / Bot 推送 / 币安行情 / 币安广场 / BlockBeats / X WSS / GMGN；通过 Vite 同源代理规避 CORS。
- Web 版（线上部署）：不含 Electron 与 Vite 代理；仅 WSS 推送类数据源可直接用，其余需自建网关。

> 建议：先在桌面版跑通至少一个数据源，再扩展到完整链路。

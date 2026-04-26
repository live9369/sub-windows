import type { ChatMessage, FeedItem, MonitoredGroup } from '@/types'

/* -----------------------------------------------------------------
 * Telegram 群
 * ----------------------------------------------------------------- */

export const MOCK_GROUPS: MonitoredGroup[] = [
  {
    id: 'alpha-calls',
    name: 'Alpha Calls',
    emoji: '🎯',
    description: '高质量 alpha 信号 / 早期项目',
    members: 3242,
    unread: 12,
    source: 'telegram',
  },
  {
    id: 'solana-gems',
    name: 'Solana Gems',
    emoji: '💎',
    description: 'Solana 链上低市值 gem',
    members: 5887,
    unread: 4,
    source: 'telegram',
  },
  {
    id: 'meme-snipers',
    name: 'Meme Snipers',
    emoji: '🚀',
    description: 'Meme 抢跑 / pump.fun 监控',
    members: 8924,
    unread: 27,
    source: 'telegram',
  },
  {
    id: '100x-calls',
    name: '100x Calls',
    emoji: '💯',
    description: '高倍数信号 / 长线持有',
    members: 2105,
    unread: 0,
    source: 'telegram',
  },
  {
    id: 'eth-gems',
    name: 'ETH Gems',
    emoji: '⟠',
    description: 'Ethereum 链上低市值 / 早期项目',
    members: 4421,
    unread: 6,
    source: 'telegram',
  },
  {
    id: 'pumpfun-live',
    name: 'Pump.fun Live',
    emoji: '⚡',
    description: 'pump.fun 实时新盘 + bonding curve 监控',
    members: 12380,
    unread: 41,
    source: 'telegram',
  },
]

/* -----------------------------------------------------------------
 * 头像配色 — 用户名首字母圆形头像
 * ----------------------------------------------------------------- */

const AVATAR_COLORS = [
  'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/40',
  'bg-orange-500/30 text-orange-300 ring-1 ring-orange-500/40',
  'bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-500/40',
  'bg-pink-500/30 text-pink-300 ring-1 ring-pink-500/40',
  'bg-violet-500/30 text-violet-300 ring-1 ring-violet-500/40',
  'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500/40',
  'bg-blue-500/30 text-blue-300 ring-1 ring-blue-500/40',
  'bg-rose-500/30 text-rose-300 ring-1 ring-rose-500/40',
]

const c = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length]

/* -----------------------------------------------------------------
 * 群聊消息
 * 用绝对/相对时间字符串 — UI 直接展示
 * ----------------------------------------------------------------- */

export const MOCK_MESSAGES: ChatMessage[] = [
  /* ============ Alpha Calls ============ */
  {
    id: 'm-ac-1', groupId: 'alpha-calls', time: '14:02:11',
    username: 'whale.eth', avatarColor: c(0), isPinned: true,
    content: '📌 今日 Alpha 池：我们筛选了 3 个 LP 锁定 + dev 透明的项目，都在下面。',
  },
  {
    id: 'm-ac-2', groupId: 'alpha-calls', time: '14:05:33',
    username: 'whale.eth', avatarColor: c(0),
    content: '$SPACEX  CA: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU\nMC: $1.8M  LP 锁 6m  dev 持仓 3.2%',
  },
  {
    id: 'm-ac-3', groupId: 'alpha-calls', time: '14:06:48',
    username: 'degen_kira', avatarColor: c(1),
    content: '已经 ape，目标 $20M 🚀',
  },
  {
    id: 'm-ac-4', groupId: 'alpha-calls', time: '14:09:02',
    username: 'sol.maxi', avatarColor: c(2),
    content: '看一眼这个 $KAPY  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263 — MC $253K，holder 470，老 dev 第 4 个项目',
  },
  {
    id: 'm-ac-5', groupId: 'alpha-calls', time: '14:11:21',
    username: 'lp_locker', avatarColor: c(3),
    content: '0x6982508145454ce325ddbe47a25d4ec3d2311933 已经验证，PEPE 类盘子，警惕 cex listing 砸盘',
  },
  {
    id: 'm-ac-6', groupId: 'alpha-calls', time: '14:13:09',
    username: 'whale.eth', avatarColor: c(0), isHot: true,
    content: '🔥 信号 — 这个钱包 14 分钟买了 4 个新盘，上周三个直接 50x：\n钱包: 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  },
  {
    id: 'm-ac-7', groupId: 'alpha-calls', time: '14:14:55',
    username: 'apefren', avatarColor: c(4),
    content: '梭了 1 sol 做实验',
  },
  {
    id: 'm-ac-8', groupId: 'alpha-calls', time: '14:18:12',
    username: 'degen_kira', avatarColor: c(1),
    content: '$SPACEX 上 $4.2M 了，4 分钟拉了 130%',
  },
  {
    id: 'm-ac-9', groupId: 'alpha-calls', time: '14:22:40',
    username: 'sol.maxi', avatarColor: c(2),
    content: '注意：DexScreener 显示 $42.8K MC 的 $WIF2 不是同一个项目，watch out for impersonators',
  },
  {
    id: 'm-ac-10', groupId: 'alpha-calls', time: '14:25:01',
    username: 'whale.eth', avatarColor: c(0),
    content: '更新 — $SPACEX 突破 100x 区间 💎  下一目标 1B MC',
  },

  /* ============ Solana Gems ============ */
  {
    id: 'm-sg-1', groupId: 'solana-gems', time: '14:00:02',
    username: 'sg-bot', avatarColor: c(2), isPinned: true,
    content: '📌 Solana Gems daily：今日筛选 holder>200, MC<$500K, LP 锁定 ≥30 天的新盘',
  },
  {
    id: 'm-sg-2', groupId: 'solana-gems', time: '14:03:18',
    username: 'spacepepe', avatarColor: c(3),
    content: '$BONKER 5tN42n9vMi6ubp67Uy4NnmM5DMZYN8aS8GeB3bEDHr6E\nMC: $89K  Holders: 312  Dev: 1.8%',
  },
  {
    id: 'm-sg-3', groupId: 'solana-gems', time: '14:05:42',
    username: 'sol_chad', avatarColor: c(0),
    content: '已经上车 0.5 sol，目标 $1M MC',
  },
  {
    id: 'm-sg-4', groupId: 'solana-gems', time: '14:08:11',
    username: 'gemfinder', avatarColor: c(5),
    content: '$JUPER  4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R 看着不错  $145K MC  bondingcurve 67% — 即将迁移到 raydium',
  },
  {
    id: 'm-sg-5', groupId: 'solana-gems', time: '14:11:30',
    username: 'sg-bot', avatarColor: c(2),
    content: '⚠️ Honeypot 检测警告 — 5tN42n9vMi6ubp67Uy4NnmM5DMZYN8aS8GeB3bEDHr6E 卖出滑点 99%，请远离',
  },
  {
    id: 'm-sg-6', groupId: 'solana-gems', time: '14:13:55',
    username: 'sol_chad', avatarColor: c(0),
    content: '靠，刚才那个我已经买了，现在能撤吗',
  },
  {
    id: 'm-sg-7', groupId: 'solana-gems', time: '14:14:21',
    username: 'gemfinder', avatarColor: c(5),
    content: '不能。已经 100% 出手续费往里走了 💀',
  },
  {
    id: 'm-sg-8', groupId: 'solana-gems', time: '14:18:40',
    username: 'sg-bot', avatarColor: c(2), isHot: true,
    content: '🔥 $JUPER 已经迁移到 raydium，MC 现在 $620K，2x 完成',
  },
  {
    id: 'm-sg-9', groupId: 'solana-gems', time: '14:20:09',
    username: 'spacepepe', avatarColor: c(3),
    content: '今日复盘：4 个推荐里 2 个 2x，1 个 honeypot，1 个还在观察',
  },
  {
    id: 'm-sg-10', groupId: 'solana-gems', time: '14:23:14',
    username: 'sol_chad', avatarColor: c(0),
    content: '能加个 holder 分布图吗？看不到就不敢冲',
  },

  /* ============ Meme Snipers ============ */
  {
    id: 'm-ms-1', groupId: 'meme-snipers', time: '14:01:00',
    username: 'sniper-bot', avatarColor: c(1), isPinned: true,
    content: '📌 pump.fun 实时监控 — 每 30 秒推送过滤后的新盘（MC>$10K, dev 不持仓 >5%）',
  },
  {
    id: 'm-ms-2', groupId: 'meme-snipers', time: '14:02:14',
    username: 'sniper-bot', avatarColor: c(1),
    content: '🆕 $WIFAKE  新盘上线 30 秒\nCA: HxAZ4cLbu8KZWQGdYFbT6wTZbKeM3CRdYpPvxJC3kPkR\nMC: $12K | Bonding: 4%',
  },
  {
    id: 'm-ms-3', groupId: 'meme-snipers', time: '14:02:45',
    username: 'fastfingers', avatarColor: c(6),
    content: '冲 — 0.3 sol 进了',
  },
  {
    id: 'm-ms-4', groupId: 'meme-snipers', time: '14:03:21',
    username: 'sniper-bot', avatarColor: c(1),
    content: '🆕 $TRUMPCAT  CA: 8DMqYzXVVhWA5Gax6vHazqz1BCuiezdCxgPpTW4cqzg5\nMC: $18K | Holders: 45',
  },
  {
    id: 'm-ms-5', groupId: 'meme-snipers', time: '14:03:50',
    username: 'rugdoctor', avatarColor: c(7),
    content: 'TRUMPCAT 的 dev 之前跑了 3 个盘，钱包: 9pHmKnNxVpTLRyR8sScHcgjRYPyUzx3PzBCH8UMgWXrh，🚨 不建议',
  },
  {
    id: 'm-ms-6', groupId: 'meme-snipers', time: '14:05:03',
    username: 'sniper-bot', avatarColor: c(1),
    content: '🆕 $SOLNYAN  CA: 2vN5LoRmkQiDBsvSxC6e3qVvr89KdZWvwjJHaQLRGhYE\nMC: $8.5K | Bonding: 1%',
  },
  {
    id: 'm-ms-7', groupId: 'meme-snipers', time: '14:05:34',
    username: 'fastfingers', avatarColor: c(6),
    content: 'WIFAKE 已经 $46K，3 分钟 +280% 🚀',
  },
  {
    id: 'm-ms-8', groupId: 'meme-snipers', time: '14:06:18',
    username: 'apefren', avatarColor: c(4),
    content: '上车上车，TG 群人数刚突破 1k',
  },
  {
    id: 'm-ms-9', groupId: 'meme-snipers', time: '14:08:42',
    username: 'sniper-bot', avatarColor: c(1), isHot: true,
    content: '🔥 $WIFAKE 突破 $120K MC — 15 分钟 10x，bonding 91%，即将 graduate',
  },
  {
    id: 'm-ms-10', groupId: 'meme-snipers', time: '14:10:11',
    username: 'rugdoctor', avatarColor: c(7),
    content: 'WIFAKE 第一个买家是 dev 钱包伪装的，holder 集中度 67%，准备出货',
  },
  {
    id: 'm-ms-11', groupId: 'meme-snipers', time: '14:11:59',
    username: 'fastfingers', avatarColor: c(6),
    content: '已经 5x，先撤 50%',
  },
  {
    id: 'm-ms-12', groupId: 'meme-snipers', time: '14:14:22',
    username: 'sniper-bot', avatarColor: c(1),
    content: '⚠️ $WIFAKE -42%，dev 钱包出货 80% 的供应',
  },
  {
    id: 'm-ms-13', groupId: 'meme-snipers', time: '14:15:01',
    username: 'apefren', avatarColor: c(4),
    content: '💀',
  },

  /* ============ 100x Calls ============ */
  {
    id: 'm-xc-1', groupId: '100x-calls', time: '13:58:03',
    username: '100x-research', avatarColor: c(5), isPinned: true,
    content: '📌 这个频道每周只发 2-3 条 — 长期持有 100x 候选，不是日内交易',
  },
  {
    id: 'm-xc-2', groupId: '100x-calls', time: '14:00:48',
    username: '100x-research', avatarColor: c(5),
    content: 'AI x DePIN 赛道：$NEXUS  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\nMC: $4.2M  团队 KYC，路线图清晰，6 个月持有目标 $400M',
  },
  {
    id: 'm-xc-3', groupId: '100x-calls', time: '14:08:21',
    username: 'dca-king', avatarColor: c(3),
    content: '我会分 4 周建仓，每周 25% — 这种盘子不能一次梭哈',
  },
  {
    id: 'm-xc-4', groupId: '100x-calls', time: '14:12:45',
    username: 'fundamentals', avatarColor: c(0),
    content: '团队上一个项目 $REALM 拉了 60x 后稳住，现在 MC $180M，这次的产品更硬核',
  },
  {
    id: 'm-xc-5', groupId: '100x-calls', time: '14:18:33',
    username: '100x-research', avatarColor: c(5),
    content: '风险提示：6-12 个月持有视角，短期会有 -50% 的波动，不能扛波动的不要参与 💎',
  },
  {
    id: 'm-xc-6', groupId: '100x-calls', time: '14:22:09',
    username: 'apefren', avatarColor: c(4),
    content: '问个问题：6 个月你怎么对冲整体市场风险？',
  },
  {
    id: 'm-xc-7', groupId: '100x-calls', time: '14:26:50',
    username: '100x-research', avatarColor: c(5),
    content: '简单说：仓位控制在总可承受亏损的 5%，市场系统性风险用 BTC 短头寸对冲。详细方法下周专题。',
  },

  /* ============ ETH Gems ============ */
  {
    id: 'm-eg-1', groupId: 'eth-gems', time: '13:55:21',
    username: 'eth-watch', avatarColor: c(6), isPinned: true,
    content: '📌 ETH Gems 每日监控 — Uniswap 新盘 + LP 锁定 ≥ 30 天 + dev wallet < 5%',
  },
  {
    id: 'm-eg-2', groupId: 'eth-gems', time: '14:01:48',
    username: 'eth-watch', avatarColor: c(6),
    content: '$AGIX-V2  0x5b7533812759b45c2b44c19e320ba2cd2681b542\nMC: $1.4M  LP 锁 12m  Holders: 624',
  },
  {
    id: 'm-eg-3', groupId: 'eth-gems', time: '14:04:12',
    username: 'mev-hunter', avatarColor: c(2),
    content: '观察了一下，Uniswap V3 0.3% 池，深度 $80K，盘子健康',
  },
  {
    id: 'm-eg-4', groupId: 'eth-gems', time: '14:07:33',
    username: 'eth-watch', avatarColor: c(6),
    content: '$NEAR-AI 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n这个不要碰 — 是 wETH 合约伪装，注意辨别',
  },
  {
    id: 'm-eg-5', groupId: 'eth-gems', time: '14:10:54',
    username: 'l2-degen', avatarColor: c(4),
    content: 'Base 链上的 $BRETT 重新拉了 30%，MC 现在 $850M 还在涨',
  },
  {
    id: 'm-eg-6', groupId: 'eth-gems', time: '14:13:05',
    username: 'mev-hunter', avatarColor: c(2),
    content: 'AI 板块今天集体异动 — $AGIX-V2 已经 +180%，注意止盈',
  },
  {
    id: 'm-eg-7', groupId: 'eth-gems', time: '14:16:19',
    username: 'eth-watch', avatarColor: c(6), isHot: true,
    content: '🔥 $AGIX-V2 突破 $4.2M MC，3 倍完成。继续持有冲 10x？还是先撤一半？',
  },
  {
    id: 'm-eg-8', groupId: 'eth-gems', time: '14:18:44',
    username: 'l2-degen', avatarColor: c(4),
    content: '我先撤了本，剩下的让它跑',
  },
  {
    id: 'm-eg-9', groupId: 'eth-gems', time: '14:22:01',
    username: 'eth-watch', avatarColor: c(6),
    content: 'Base 新盘观察池：$DEGEN $TOSHI $HIGHER 今日体量都翻倍，建议关注 onchain summer 叙事',
  },
  {
    id: 'm-eg-10', groupId: 'eth-gems', time: '14:24:38',
    username: 'mev-hunter', avatarColor: c(2),
    content: 'gas 费现在 18 gwei，进出场成本可接受',
  },

  /* ============ Pump.fun Live ============ */
  {
    id: 'm-pf-1', groupId: 'pumpfun-live', time: '14:00:09',
    username: 'pf-bot', avatarColor: c(7), isPinned: true,
    content: '📌 Pump.fun 实时流 — 每个新盘 5s 内推送，bonding curve > 50% 单独标红',
  },
  {
    id: 'm-pf-2', groupId: 'pumpfun-live', time: '14:01:17',
    username: 'pf-bot', avatarColor: c(7),
    content: '🆕 $CHILLPEPE  CA: 9rT2AszAtkYNrMfsBnYYQYBxbXjzNvKoNydXBWqYHCpL\nMC: $4.2K | Bonding: 1%',
  },
  {
    id: 'm-pf-3', groupId: 'pumpfun-live', time: '14:01:55',
    username: 'pf-bot', avatarColor: c(7),
    content: '🆕 $MOONCAT  CA: BLkqQYy4r8VfSSY6aE5NpVrwhpw3tk6kN5W7uK6dHYTW\nMC: $5.1K | Bonding: 2%',
  },
  {
    id: 'm-pf-4', groupId: 'pumpfun-live', time: '14:02:30',
    username: 'volumechaser', avatarColor: c(0),
    content: 'CHILLPEPE 5 分钟 +400%，流动性已加深，可以小仓位试',
  },
  {
    id: 'm-pf-5', groupId: 'pumpfun-live', time: '14:03:08',
    username: 'pf-bot', avatarColor: c(7),
    content: '🆕 $BANANAGUN  CA: 6kFaRKcZpQVbsKvXFPmY3WHTmLJpDrWTXbAekqLBbgN1\nMC: $7.8K | Bonding: 4%',
  },
  {
    id: 'm-pf-6', groupId: 'pumpfun-live', time: '14:04:52',
    username: 'rugdoctor', avatarColor: c(1),
    content: 'BANANAGUN 的 dev 上一个盘是 $RUGDOG，72h 内归零，🚨 强烈不建议',
  },
  {
    id: 'm-pf-7', groupId: 'pumpfun-live', time: '14:06:11',
    username: 'pf-bot', avatarColor: c(7),
    content: '🆕 $SAMOYEDCOIN2  CA: 3HbfV2pKv8nqF7e2Lz8mGrPvjpKJHAbGm4u7jWdvZpXn\nMC: $6.4K | Bonding: 3%',
  },
  {
    id: 'm-pf-8', groupId: 'pumpfun-live', time: '14:07:42',
    username: 'volumechaser', avatarColor: c(0),
    content: 'CHILLPEPE 已经 $89K MC，bonding 78%，准备 graduate 到 raydium',
  },
  {
    id: 'm-pf-9', groupId: 'pumpfun-live', time: '14:09:25',
    username: 'pf-bot', avatarColor: c(7), isHot: true,
    content: '🔥 $CHILLPEPE 已 graduate — 最终 MC $145K，2 分钟后开始 raydium 交易',
  },
  {
    id: 'm-pf-10', groupId: 'pumpfun-live', time: '14:10:48',
    username: 'apefren', avatarColor: c(4),
    content: '梭哈 0.5 sol 上车',
  },
  {
    id: 'm-pf-11', groupId: 'pumpfun-live', time: '14:12:33',
    username: 'pf-bot', avatarColor: c(7),
    content: '🆕 $SOLBONK  CA: HXMjpBkk67UbXYNT7B6Lru8z1VpW1tJsCN4xMx3zVYsB\nMC: $9.2K | Bonding: 5%',
  },
  {
    id: 'm-pf-12', groupId: 'pumpfun-live', time: '14:14:09',
    username: 'rugdoctor', avatarColor: c(1),
    content: '$CHILLPEPE 第一买家持仓 32%，注意大户砸盘风险',
  },
]

/* -----------------------------------------------------------------
 * 信息流：X / 币安广场 / 新闻
 * ----------------------------------------------------------------- */

export const MOCK_FEED: FeedItem[] = [
  /* ============ X (Twitter) ============ */
  {
    id: 'x-1', source: 'x',
    author: 'Ansem', handle: '@blknoiz06',
    avatarColor: c(0), avatarLabel: 'A', verified: true,
    time: '2m',
    content: '$WIF 还远没结束。看看持仓分布，巨鲸一个没动，这只是开始 🐕',
    link: 'https://x.com/blknoiz06/status/1234567890123456789',
    tags: ['$WIF'],
  },
  {
    id: 'x-2', source: 'x',
    author: 'Cobie', handle: '@cobie',
    avatarColor: c(2), avatarLabel: 'C', verified: true,
    time: '7m',
    content: 'Memecoin 周期还有 3-6 个月，但叙事会从狗狗、猫猫转向 AI agent + 政治。准备好仓位。',
    link: 'https://x.com/cobie/status/1234567890123456788',
    tags: ['memecoin', 'AI'],
  },
  {
    id: 'x-3', source: 'x',
    author: 'Murad', handle: '@MustStopMurad',
    avatarColor: c(3), avatarLabel: 'M', verified: true,
    time: '14m',
    content: '社区驱动的 memecoin > VC 项目。$BRETT $SPX $MOG $POPCAT 还在早期阶段。',
    link: 'https://x.com/MustStopMurad/status/1234567890123456787',
    tags: ['$BRETT', '$SPX', '$MOG', '$POPCAT'],
  },
  {
    id: 'x-4', source: 'x',
    author: 'Hsaka', handle: '@HsakaTrades',
    avatarColor: c(4), avatarLabel: 'H', verified: true,
    time: '23m',
    content: '今晚关注 $ETH 突破 $4200，决定接下来 alts 是否补涨。L2 一篮子已经超买。',
    link: 'https://x.com/HsakaTrades/status/1234567890123456786',
    tags: ['$ETH', 'L2'],
  },
  {
    id: 'x-5', source: 'x',
    author: 'Pentoshi', handle: '@Pentosh1',
    avatarColor: c(5), avatarLabel: 'P', verified: true,
    time: '38m',
    content: 'BTC 主导率开始走弱 — 历史上这是 alt season 的前置信号。三周内见分晓。',
    link: 'https://x.com/Pentosh1/status/1234567890123456785',
    tags: ['BTC', 'altseason'],
  },
  {
    id: 'x-6', source: 'x',
    author: 'CL', handle: '@CL207',
    avatarColor: c(6), avatarLabel: 'C', verified: true,
    time: '51m',
    content: '看到一个新盘 0x6982508145454ce325ddbe47a25d4ec3d2311933 — dev 是知名 anon，老盘 50x。先观察。',
    link: 'https://x.com/CL207/status/1234567890123456784',
    tags: ['alpha'],
  },
  {
    id: 'x-7', source: 'x',
    author: 'Tangem Wallet', handle: '@Tangem',
    avatarColor: c(7), avatarLabel: 'T', verified: true,
    time: '1h',
    content: '安全提醒 — 最近钓鱼网站激增，签任何交易前请仔细核对合约地址前缀。',
    link: 'https://x.com/Tangem/status/1234567890123456783',
    tags: ['security'],
  },
  {
    id: 'x-8', source: 'x',
    author: 'Sol Whale', handle: '@solwhale',
    avatarColor: c(0), avatarLabel: 'S',
    time: '1h',
    content: 'Solana 链上活跃地址数 7 天 +18%，meme 板块成交量重新超越主流币 — 健康信号',
    link: 'https://x.com/solwhale/status/1234567890123456782',
    tags: ['Solana'],
  },
  {
    id: 'x-9', source: 'x',
    author: 'GCR', handle: '@GiganticRebirth',
    avatarColor: c(1), avatarLabel: 'G', verified: true,
    time: '2h',
    content: '现在的市场 — 80% 的 alpha 在 TG 群和私聊里，剩 20% 在 X。但你必须能筛选信号 vs 噪音。',
    link: 'https://x.com/GiganticRebirth/status/1234567890123456781',
    tags: ['alpha'],
  },

  /* ============ 币安广场 ============ */
  {
    id: 'b-1', source: 'binance',
    author: 'CZ',  handle: '@cz_binance',
    avatarColor: c(1), avatarLabel: 'C', verified: true,
    time: '8m',
    content: '别看价格，看技术。短期波动是市场情绪，长期价格是产品。Build。',
    link: 'https://www.binance.com/en/square/post/cz-12345',
    category: '观点',
  },
  {
    id: 'b-2', source: 'binance',
    author: '何一', handle: '@heyibinance',
    avatarColor: c(3), avatarLabel: '何', verified: true,
    time: '32m',
    content: 'Binance Alpha 今日新上 $NEXUS $POPCAT $MOG，详情见公告。Alpha 用户记得早期参与。',
    link: 'https://www.binance.com/en/square/post/heyi-12345',
    tags: ['$NEXUS', '$POPCAT', '$MOG'],
    category: 'Alpha',
  },
  {
    id: 'b-3', source: 'binance',
    author: 'Binance', handle: '@binance',
    avatarColor: c(5), avatarLabel: 'B', verified: true,
    time: '1h',
    content: '现货新币上线公告：Binance 将于今日 18:00 (UTC) 上线 $XYZ 现货交易，开放 USDT、FDUSD 交易对。',
    link: 'https://www.binance.com/en/support/announcement/12345',
    tags: ['$XYZ', 'spot'],
    category: '公告',
  },
  {
    id: 'b-4', source: 'binance',
    author: 'Binance Research', handle: '@binance_research',
    avatarColor: c(2), avatarLabel: 'R', verified: true,
    time: '2h',
    content: '本周报告：Solana 生态 TVL 周环比 +12%，meme 板块占链上交易量 38%，DePIN 项目锁仓增长 8%。',
    link: 'https://research.binance.com/en/analysis/solana-w17',
    category: '研报',
  },
  {
    id: 'b-5', source: 'binance',
    author: 'CZ', handle: '@cz_binance',
    avatarColor: c(1), avatarLabel: 'C', verified: true,
    time: '3h',
    content: '永远 DYOR。任何项目方私信你"内幕"——99.9% 是骗局。',
    link: 'https://www.binance.com/en/square/post/cz-12346',
    category: '观点',
  },
  {
    id: 'b-6', source: 'binance',
    author: 'Yi He', handle: '@heyibinance',
    avatarColor: c(3), avatarLabel: '何', verified: true,
    time: '5h',
    content: 'Web3 钱包用户突破 5000 万。下一步重点是社交身份和支付，这是大众采用的两个突破口。',
    link: 'https://www.binance.com/en/square/post/heyi-12346',
    tags: ['Web3'],
    category: '观点',
  },
  {
    id: 'b-7', source: 'binance',
    author: 'Binance Square', handle: '@binance_square',
    avatarColor: c(5), avatarLabel: 'S', verified: true,
    time: '8h',
    content: '本周 Square 创作者激励池：5 万 USDT，参与活动详见广场页面。',
    link: 'https://www.binance.com/en/square/post/square-12345',
    category: '活动',
  },

  /* ============ 新闻 ============ */
  {
    id: 'n-1', source: 'news',
    author: 'CoinDesk', handle: 'coindesk.com',
    avatarColor: c(0), avatarLabel: 'CD',
    time: '12m',
    content: 'Bitcoin Holds Above $98K as ETF Inflows Resume; Spot Volume Hits 30-Day High',
    link: 'https://www.coindesk.com/markets/2026/04/26/bitcoin-holds-above-98k',
    category: 'Markets',
  },
  {
    id: 'n-2', source: 'news',
    author: 'The Block', handle: 'theblock.co',
    avatarColor: c(1), avatarLabel: 'TB',
    time: '38m',
    content: 'Solana Network Activity Surges as Memecoin Volumes Hit Record $4.2B in 24 Hours',
    link: 'https://www.theblock.co/post/solana-memecoin-record-volume',
    category: 'Solana',
  },
  {
    id: 'n-3', source: 'news',
    author: 'Decrypt', handle: 'decrypt.co',
    avatarColor: c(2), avatarLabel: 'DC',
    time: '1h',
    content: 'SEC Drops Long-Running Investigation Into Major DeFi Protocol; Token Rallies 27%',
    link: 'https://decrypt.co/2026/04/26/sec-drops-defi-investigation',
    category: 'Regulation',
  },
  {
    id: 'n-4', source: 'news',
    author: 'Cointelegraph', handle: 'cointelegraph.com',
    avatarColor: c(3), avatarLabel: 'CT',
    time: '2h',
    content: 'Ethereum Layer-2 TVL Crosses $80 Billion as New Restaking Protocol Goes Live',
    link: 'https://cointelegraph.com/news/ethereum-l2-tvl-80b',
    category: 'Ethereum',
  },
  {
    id: 'n-5', source: 'news',
    author: 'Bloomberg Crypto', handle: 'bloomberg.com',
    avatarColor: c(4), avatarLabel: 'BC',
    time: '3h',
    content: 'BlackRock Files Amendment to Bitcoin ETF; Allows In-Kind Creation, Could Boost Liquidity',
    link: 'https://www.bloomberg.com/news/articles/2026-04-26/blackrock-bitcoin-etf-in-kind',
    category: 'Institutional',
  },
  {
    id: 'n-6', source: 'news',
    author: 'CoinDesk', handle: 'coindesk.com',
    avatarColor: c(0), avatarLabel: 'CD',
    time: '5h',
    content: 'Memecoin Mania: 5 Tokens That Returned 100x in April, and What They Have in Common',
    link: 'https://www.coindesk.com/markets/2026/04/26/memecoin-100x-april',
    category: 'Memecoin',
  },
  {
    id: 'n-7', source: 'news',
    author: 'The Block', handle: 'theblock.co',
    avatarColor: c(1), avatarLabel: 'TB',
    time: '8h',
    content: 'Hong Kong Approves First Spot Solana ETF; Trading to Begin Next Week',
    link: 'https://www.theblock.co/post/hong-kong-spot-solana-etf',
    category: 'Solana',
  },
  {
    id: 'n-8', source: 'news',
    author: 'Decrypt', handle: 'decrypt.co',
    avatarColor: c(2), avatarLabel: 'DC',
    time: '12h',
    content: 'AI x Crypto Sector Tops $50B in Combined Market Cap as New Agents Launch',
    link: 'https://decrypt.co/2026/04/26/ai-crypto-50b-marketcap',
    category: 'AI',
  },
]

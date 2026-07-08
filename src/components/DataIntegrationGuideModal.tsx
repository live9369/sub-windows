import * as React from 'react'
import { AlertTriangle, MonitorSmartphone, Server, Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export interface DataIntegrationGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const Step: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
    <div className="text-xs font-semibold text-zinc-200">{title}</div>
    <div className="text-xs text-zinc-400 leading-relaxed">{children}</div>
  </div>
)

const Cmd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="text-[11px] font-mono rounded-md bg-black/40 border border-zinc-800 px-2 py-1.5 overflow-x-auto text-zinc-200">
    {children}
  </pre>
)

export const DataIntegrationGuideModal: React.FC<DataIntegrationGuideModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>数据接入向导</DialogTitle>
            <Badge variant="cyan">Route A</Badge>
          </div>
          <DialogDescription>
            前端可同时运行在 Web 与桌面版；微信数据只允许本地后端接入，不走远程托管。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-amber-700/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">微信数据安全策略（固定）</div>
                <div className="mt-1 text-amber-100/90">
                  WeChat 数据依赖本地解密与本地进程访问，属于敏感数据链路。请在本机启动后端并在设置里填写本地地址，
                  不要把微信原始数据或解密库部署到公网服务。
                </div>
              </div>
            </div>
          </div>

          <Step title="1) 启动前端">
            <div className="mb-1">在前端项目目录启动：</div>
            <Cmd>npm run dev</Cmd>
            <div className="mt-1">打开右上角设置页，按下述步骤接入数据源。</div>
          </Step>

          <Step title="2) 接入 WeChat（本地后端，必走本机）">
            <div>先在本地后端目录启动微信服务（示例）：</div>
            <Cmd>python main.py</Cmd>
            <div className="mt-1">设置页填写：</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>启用微信监控：开启</li>
              <li>服务地址：`http://localhost:5678`（或你本机端口）</li>
              <li>轮询间隔：建议 2000~5000ms</li>
            </ul>
            <div className="mt-1">点击“测试连接”，成功后到左侧 `WX` 标签添加群卡片。</div>
          </Step>

          <Step title="3) 接入 Telegram 用户客户端（桌面桥接）">
            <ul className="list-disc pl-4 space-y-0.5">
              <li>填写 API ID / API Hash / 手机号</li>
              <li>先点“连接”，再点“登录”</li>
              <li>按提示输入验证码 / 二次密码</li>
            </ul>
            <div className="mt-1">状态变为 connected 后会自动拉取对话列表。</div>
          </Step>

          <Step title="4) 接入 X / Twitter WSS">
            <ul className="list-disc pl-4 space-y-0.5">
              <li>启用 WSS 推送：开启</li>
              <li>WSS 地址：`wss://...`</li>
              <li>Token：你的鉴权令牌</li>
            </ul>
            <div className="mt-1">连接成功后，右侧 X Tab 会持续出现实时卡片。</div>
          </Step>

          <Step title="5) 接入 BlockBeats 新闻">
            <ul className="list-disc pl-4 space-y-0.5">
              <li>启用新闻监控：开启</li>
              <li>API Key：填入你的 Key</li>
            </ul>
            <div className="mt-1">成功后新闻 Tab 会定时刷新 RSS。</div>
          </Step>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-300 mb-1">
              <MonitorSmartphone className="w-3.5 h-3.5" />
              运行形态说明
            </div>
            <div>桌面版：可用本地桥接能力（WeChat / Telegram / WSS）。</div>
            <div>Web 版（如 Vercel）：页面可运行，但本地桥接能力需改为远端 API（WeChat 仍建议只本地）。</div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-300 mb-1">
              <Server className="w-3.5 h-3.5" />
              常见排障
            </div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>WeChat 连不上：先访问 `http://localhost:5678/api/history?limit=1` 自检。</li>
              <li>Telegram 报错：优先检查 API ID/API Hash 与 2FA。</li>
              <li>Twitter 一直重连：检查 WSS 地址、Token 和服务端 connected 回执。</li>
            </ul>
          </div>

          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            如需部署到 Vercel，建议保留桌面版并行，前端逐步切到 Web API 数据源。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

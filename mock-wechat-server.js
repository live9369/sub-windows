const http = require('http');

const messages = [
  { id: 1, timestamp: Math.floor(Date.now()/1000), sender: '张三', content: '发现一个CA: 0x1234567890abcdef1234567890abcdef12345678', chat: 'Alpha 群' },
  { id: 2, timestamp: Math.floor(Date.now()/1000)-5, sender: '李四', content: '市值 $1.2M，可以看看 🚀', chat: '合约讨论群' },
  { id: 3, timestamp: Math.floor(Date.now()/1000)-10, sender: '王五', content: 'Solana 新盘 moon 100x gem', chat: 'Alpha 群' },
  { id: 4, timestamp: Math.floor(Date.now()/1000)-20, sender: '赵六', content: '冲！上车突破', chat: '合约讨论群' },
];

const server = http.createServer((req, res) => {
  console.log('[mock]', req.url);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url.startsWith('/api/history')) {
    const url = new URL(req.url, 'http://localhost:5678');
    const since = parseInt(url.searchParams.get('since') || '0');
    const filtered = messages.filter(m => m.timestamp > since);
    res.end(JSON.stringify({ messages: filtered }));
  } else {
    res.end(JSON.stringify({}));
  }
});

server.listen(5678, () => console.log('[mock] wechat-decrypt on http://localhost:5678'));

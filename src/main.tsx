import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ensureRuntimeBridge } from '@/lib/runtimeBridge'

ensureRuntimeBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

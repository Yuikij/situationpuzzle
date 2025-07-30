import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  // 支持多种环境变量格式 (本地开发、Cloudflare Workers)
  const hello = process.env.hello || process.env.HELLO || 'Hello World from Workers!'
  
  return NextResponse.json({ 
    message: hello,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  // 支持多种环境变量格式 (本地开发、Cloudflare Workers)
  const hello = process.env.hello || process.env.HELLO || 'Hello World from Workers!'
  
  return NextResponse.json({ 
    message: hello,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  })
} 
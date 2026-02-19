/**
 * WebSocket endpoint for real-time agent communication.
 *
 * NOTE: Next.js App Router doesn't natively support WebSocket upgrades.
 * For production, use a separate WebSocket server (e.g., ws library on a custom server)
 * or use Server-Sent Events as a fallback.
 *
 * This route serves as a placeholder / SSE fallback.
 */

export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { wsClients } from '@/lib/db'

export async function GET(req: NextRequest) {
  // SSE fallback for real-time updates
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`))
      }

      wsClients.add(send)

      // Send heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
          wsClients.delete(send)
        }
      }, 30000)

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        wsClients.delete(send)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

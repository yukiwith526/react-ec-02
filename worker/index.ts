import { VILLAS } from '../src/data/inn'
import { handleAdmin } from './admin'
import {
  createBooking,
  createInquiry,
  getAvailability,
  getBooking,
  parseBookingBody,
  quoteRequest,
} from './bookings'

function jsonError(message: string, status = 404) {
  return Response.json({ error: message }, { status })
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

async function handleRequest(request: Request, env: Env) {
  const url = new URL(request.url)
  const { pathname } = url

  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/admin')) {
      return new Response(null, { status: 204 })
    }
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (pathname.startsWith('/api/admin')) {
    return handleAdmin(request, env)
  }

  if (pathname === '/api/villas' && request.method === 'GET') {
    return Response.json({ villas: VILLAS })
  }

  if (pathname === '/api/availability' && request.method === 'GET') {
    const villaId = url.searchParams.get('villa') ?? ''
    const month = url.searchParams.get('month') ?? ''
    return getAvailability(env, villaId, month)
  }

  if (pathname === '/api/quote' && request.method === 'POST') {
    const parsed = parseBookingBody(await readJson(request))
    if (parsed instanceof Response) return parsed
    return quoteRequest(env, parsed)
  }

  if (pathname === '/api/bookings' && request.method === 'POST') {
    const parsed = parseBookingBody(await readJson(request))
    if (parsed instanceof Response) return parsed
    return createBooking(env, parsed)
  }

  const booking = pathname.match(/^\/api\/bookings\/([^/]+)$/)
  if (booking && request.method === 'GET') {
    return getBooking(env, decodeURIComponent(booking[1]))
  }

  if (pathname === '/api/inquiries' && request.method === 'POST') {
    return createInquiry(env, (await readJson(request)) as Record<string, string>)
  }

  if (pathname.startsWith('/api/')) {
    return jsonError('Not found', 404)
  }

  return new Response(null, { status: 404 })
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'サーバーエラーが発生しました。'
      return Response.json({ error: message }, { status: 500 })
    }
  },
} satisfies ExportedHandler<Env>

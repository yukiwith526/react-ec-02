export type AdminUser = {
  id: string
  username: string
  displayName: string
}

const COOKIE = 'somaoto_admin'
const SESSION_HOURS = 12
const PBKDF2_ITERATIONS = 100_000
const MAX_FAILURES = 8

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

function toB64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromB64(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) return false
  let diff = 0
  for (let i = 0; i < a.byteLength; i += 1) diff |= a[i] ^ b[i]
  return diff === 0
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    256,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await derive(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(key)}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, saltB64, hashB64] = stored.split('$')
  if (scheme !== 'pbkdf2' || !iter || !saltB64 || !hashB64) return false
  const actual = await derive(password, fromB64(saltB64), Number(iter))
  return timingSafeEqual(actual, fromB64(hashB64))
}

async function sha256Hex(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return toB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function clientIp(request: Request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'local'
}

function isHttps(request: Request) {
  const url = new URL(request.url)
  return url.protocol === 'https:' || (request.headers.get('CF-Visitor')?.includes('https') ?? false)
}

function cookieHeader(token: string, maxAge: number, secure: boolean) {
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`
}

export function clearSessionCookie(request: Request) {
  return cookieHeader('', 0, isHttps(request))
}

export function readSessionToken(request: Request) {
  const bearer = request.headers.get('Authorization')
  if (bearer?.startsWith('Bearer ')) return bearer.slice(7).trim()
  const cookie = request.headers.get('Cookie') ?? ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  return match?.[1] ? decodeURIComponent(match[1]) : ''
}

export async function writeAudit(
  env: Env,
  user: AdminUser | null,
  action: string,
  entity?: string,
  entityId?: string,
  detail?: string,
) {
  await env.DB.prepare(
    `INSERT INTO admin_audit (id, user_id, username, action, entity, entity_id, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      user?.id ?? null,
      user?.username ?? null,
      action,
      entity ?? null,
      entityId ?? null,
      detail ?? null,
    )
    .run()
}

async function tooManyFailures(env: Env, ip: string) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM login_attempts
     WHERE ip = ? AND success = 0 AND created_at > datetime('now', '-15 minutes')`,
  )
    .bind(ip)
    .first<{ n: number }>()
  return (row?.n ?? 0) >= MAX_FAILURES
}

async function recordAttempt(env: Env, username: string, ip: string, success: boolean) {
  await env.DB.prepare(`INSERT INTO login_attempts (username, ip, success) VALUES (?, ?, ?)`).bind(
    username,
    ip,
    success ? 1 : 0,
  ).run()
}

async function bootstrapAdmin(env: Env, username: string, password: string) {
  const count = await env.DB.prepare(`SELECT COUNT(*) AS n FROM admin_users`).first<{ n: number }>()
  if ((count?.n ?? 0) > 0) return false
  if (!env.ADMIN_PASSWORD) {
    throw new Error('UNCONFIGURED')
  }
  if (username !== 'admin' || password !== env.ADMIN_PASSWORD) return false
  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO admin_users (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)`,
  )
    .bind(id, 'admin', await hashPassword(password), '管理者')
    .run()
  return true
}

export async function login(env: Env, request: Request, usernameRaw: string, password: string) {
  const ip = clientIp(request)
  const username = usernameRaw.trim().toLowerCase()
  if (await tooManyFailures(env, ip)) {
    return jsonError('ログイン試行が多すぎます。15分後に再度お試しください。', 429)
  }
  if (username.length < 2 || password.length < 8) {
    await recordAttempt(env, username, ip, false)
    return jsonError('ユーザー名またはパスワードが正しくありません。', 401)
  }

  try {
    await bootstrapAdmin(env, username, password)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNCONFIGURED') {
      return jsonError('管理者の初期パスワードが未設定です。ADMIN_PASSWORD を設定してください。', 503)
    }
    throw error
  }

  const row = await env.DB.prepare(`SELECT id, username, password_hash, display_name FROM admin_users WHERE username = ?`)
    .bind(username)
    .first<{ id: string; username: string; password_hash: string; display_name: string }>()

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    await recordAttempt(env, username, ip, false)
    return jsonError('ユーザー名またはパスワードが正しくありません。', 401)
  }

  await recordAttempt(env, username, ip, true)
  await env.DB.prepare(`DELETE FROM admin_sessions WHERE user_id = ? AND expires_at < datetime('now')`).bind(row.id).run()

  const token = randomToken()
  const sessionId = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO admin_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+${SESSION_HOURS} hours'))`,
  )
    .bind(sessionId, row.id, await sha256Hex(token))
    .run()

  const user: AdminUser = { id: row.id, username: row.username, displayName: row.display_name }
  await writeAudit(env, user, 'auth.login', 'session', sessionId)

  return Response.json(
    { user },
    {
      headers: {
        'Set-Cookie': cookieHeader(token, SESSION_HOURS * 3600, isHttps(request)),
      },
    },
  )
}

export async function requireAdmin(env: Env, request: Request): Promise<AdminUser | Response> {
  const token = readSessionToken(request)
  if (!token) return jsonError('ログインが必要です。', 401)

  const row = await env.DB.prepare(
    `SELECT s.id AS session_id, u.id, u.username, u.display_name
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`,
  )
    .bind(await sha256Hex(token))
    .first<{ session_id: string; id: string; username: string; display_name: string }>()

  if (!row) return jsonError('ログインが必要です。', 401)

  await env.DB.prepare(`UPDATE admin_sessions SET last_seen_at = datetime('now') WHERE id = ?`).bind(row.session_id).run()
  return { id: row.id, username: row.username, displayName: row.display_name }
}

export async function logout(env: Env, request: Request, user: AdminUser | null) {
  const token = readSessionToken(request)
  if (token) {
    await env.DB.prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`).bind(await sha256Hex(token)).run()
  }
  if (user) await writeAudit(env, user, 'auth.logout', 'session')
  return Response.json(
    { ok: true },
    { headers: { 'Set-Cookie': clearSessionCookie(request) } },
  )
}

export async function changePassword(env: Env, request: Request, user: AdminUser, current: string, next: string) {
  if (next.length < 10) return jsonError('新しいパスワードは10文字以上にしてください。')
  const row = await env.DB.prepare(`SELECT password_hash FROM admin_users WHERE id = ?`)
    .bind(user.id)
    .first<{ password_hash: string }>()
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return jsonError('現在のパスワードが正しくありません。', 401)
  }
  await env.DB.prepare(
    `UPDATE admin_users SET password_hash = ?, password_changed_at = datetime('now') WHERE id = ?`,
  )
    .bind(await hashPassword(next), user.id)
    .run()
  await env.DB.prepare(`DELETE FROM admin_sessions WHERE user_id = ?`).bind(user.id).run()
  await writeAudit(env, user, 'auth.password_change', 'admin_user', user.id)
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie(request) } })
}

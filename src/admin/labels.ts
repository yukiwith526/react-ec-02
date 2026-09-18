export const BOOKING_STATUS: Record<string, string> = {
  confirmed: '確定',
  cancelled: 'キャンセル',
  completed: '滞在済',
  noshow: '不泊',
}

export const INQUIRY_STATUS: Record<string, string> = {
  new: '未対応',
  in_progress: '対応中',
  closed: '完了',
}

export const BOOKING_SOURCE: Record<string, string> = {
  web: '公式サイト',
  phone: '電話',
  walkin: '来館',
  other: 'その他',
}

export const AUDIT_ACTION: Record<string, string> = {
  'auth.login': 'ログイン',
  'auth.logout': 'ログアウト',
  'auth.password_change': 'パスワード変更',
  'booking.create': '予約登録',
  'booking.update': '予約更新',
  'block.create': '休業設定',
  'block.delete': '休業解除',
  'inquiry.update': '問い合わせ更新',
}

export function formatDateTime(value: string) {
  if (!value) return '—'
  const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function monthKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

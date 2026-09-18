export type MealPlan = 'none' | 'breakfast' | 'dinner' | 'both'

export type Villa = {
  id: string
  slug: string
  name: string
  nameEn: string
  kicker: string
  capacity: number
  sizeSqm: number
  floors: number
  parking: number
  weekdayRate: number
  weekendRate: number
  summary: string
  description: string
  highlights: string[]
  amenities: string[]
  images: string[]
}

export const INN = {
  name: '杣音',
  nameEn: 'SOMAOTO',
  nameKana: 'そまおと',
  fullName: '安曇野 離れ 杣音',
  tagline: '畳の上で、山の気配を聴く。',
  phone: '0263-82-2183',
  hours: '受付時間 9:00〜18:00',
  email: 'stay@somaoto.example',
  postal: '〒399-8301',
  address: '長野県安曇野市穂高有明 杣音2183',
  checkIn: '15:00',
  checkOut: '11:00',
  lodgingTaxPerPerson: 200,
  maxNights: 7,
} as const

const photo = (id: string, width = 1800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

const local = (file: string) => `/photos/${file}`

export const IMAGES = {
  hero: photo('1506905925346-21bda4d32df4', 2400),
  forest: photo('1441974231531-c6227db76b6e'),
  mist: photo('1470071459604-3b5ec3a7fe05'),
  architecture: local('room-wide.jpg'),
  house: photo('1670854753472-4d7cbe07a1c0'),
  entrance: photo('1686933021211-19a669f3acb2'),
  tatamiGarden: local('room-table.jpg'),
  tatami: local('room-futon.jpg'),
  shoji: local('room-shoji.jpg'),
  garden: local('room-garden.jpg'),
  lantern: photo('1669711671802-7efa7074bd3f'),
  vermilion: photo('1545569341-9eb8b30979d9'),
  dining: local('kaiseki.jpg'),
  sashimi: local('kaiseki.jpg'),
  irori: local('room-hanare.jpg'),
  teaRoom: local('room-living.jpg'),
  bedroom: local('room-beds.jpg'),
  bedroomSun: local('room-wide.jpg'),
  bath: local('bath-hinoki.jpg'),
  ofuro: local('bath-hinoki.jpg'),
  snow: photo('1418065460487-3e41a6c84dc5'),
  river: photo('1501785888041-af3ef285b470'),
  alps: photo('1464822759023-fed622ff2c3b'),
  fuji: photo('1493976040374-85c8e12f0c0e'),
  night: photo('1478436127897-769e1b3f0f36'),
} as const

export const VILLAS: Villa[] = [
  {
    id: 'rokumei',
    slug: 'rokumei',
    name: '鹿鳴',
    nameEn: 'ROKUMEI',
    kicker: '秋の山に響く、鹿の声のように。',
    capacity: 6,
    sizeSqm: 168.4,
    floors: 2,
    parking: 3,
    weekdayRate: 98000,
    weekendRate: 128000,
    summary: '障子を開けば森が近い、畳敷きの広間を持つ一棟。梁の下で湯を分かち、縁側で山の気配を待ちます。',
    description:
      '旧杣小屋の骨格をいかし、居間から縁側、半露天までが一続きになるよう整えました。広間は畳、開口は障子。夜は鹿の通り道が近い森へ、朝は北アルプスの稜線へ視線が抜けます。寝室は上下に距離をとり、複数世代の滞在にも応えます。',
    highlights: [
      '森を望む半露天風呂',
      '畳敷きの広間と障子',
      '信州唐松の現し梁',
      '縁側から続く庭石と灯籠',
    ],
    amenities: [
      '専用半露天風呂',
      '畳敷きの寝室',
      '浴衣・丹前',
      'システムキッチン',
      '食洗機・冷蔵庫',
      '洗濯機・乾燥機',
      '無料Wi-Fi',
    ],
    images: [IMAGES.tatamiGarden, IMAGES.teaRoom, IMAGES.irori, IMAGES.bath],
  },
  {
    id: 'yukihotaru',
    slug: 'yukihotaru',
    name: '雪蛍',
    nameEn: 'YUKIHOTARU',
    kicker: '雪明かりが、庭をほのかに灯す。',
    capacity: 4,
    sizeSqm: 112.6,
    floors: 1,
    parking: 2,
    weekdayRate: 78000,
    weekendRate: 98000,
    summary: '中庭を抱く平屋。和紙の灯、蹲、小さな露天。二人または小さな家族が、庭の白さを眺めながら過ごします。',
    description:
      '雪の夜に庭の白さがほのかに光る様子から名づけました。客室は畳に座り、障子の奥に中庭が広がります。浴室は内湯と小さな露天を組み合わせ、長い湯治のような時間を過ごせます。',
    highlights: [
      '中庭を囲む平屋構成',
      '畳と障子、和紙の照明',
      '内湯と小さな露天',
      '灯籠と蹲のある庭',
    ],
    amenities: [
      '内湯＋露天',
      '畳敷きの寝室',
      '浴衣・丹前',
      'コンパクトキッチン',
      '冷蔵庫・電子レンジ',
      '洗濯機',
      '無料Wi-Fi',
    ],
    images: [IMAGES.bedroomSun, IMAGES.shoji, IMAGES.tatami, IMAGES.ofuro],
  },
]

export const MEAL_PLANS: { id: MealPlan; name: string; pricePerPerson: number; note: string }[] = [
  { id: 'none', name: 'お食事なし（素泊まり）', pricePerPerson: 0, note: 'キッチンをご自由にお使いください。' },
  { id: 'breakfast', name: '朝食付き', pricePerPerson: 4500, note: '一汁三菜。安曇野米と焼き魚の朝餉。' },
  { id: 'dinner', name: '夕食付き', pricePerPerson: 18000, note: '旬を器に盛る、お部屋での会席。' },
  { id: 'both', name: '夕朝食付き', pricePerPerson: 22000, note: '会席の夜と、静かな朝餉まで。' },
]

export const STORY_BEATS = [
  {
    year: '明治末',
    title: '杣人の休み場',
    body: '北アルプス山麓の木材を里へ運ぶ人々が、峠の手前で一夜を明かした小さな小屋が始まりです。',
  },
  {
    year: '昭和初期',
    title: '山の仕事と食',
    body: '囲炉裏を囲み、岩魚と山菜で腹を満たした記録が、当主の手控えに残っています。',
  },
  {
    year: '昭和40年代',
    title: '里の迎賓',
    body: '林業が移り変わるなか、訪れる研究者や画家を泊める離れが加わりました。',
  },
  {
    year: '平成',
    title: '針の止まった時間',
    body: '最後の当主が山を守り続け、建物は静かに冬を重ねました。',
  },
  {
    year: '令和',
    title: '杣音として開く',
    body: '残された梁と石垣をいかし、一日一組のヴィラとして針がふたたび動き始めます。',
  },
]

export const CULTURE = [
  { title: '客室', image: IMAGES.bedroom, caption: '畳、障子、寝具。滞在の基本の姿。' },
  { title: '離れ', image: IMAGES.house, caption: '灯が点き、庭の松が静まる。' },
  { title: '会席', image: IMAGES.dining, caption: '旬を小さく、丁寧に盛る。' },
  { title: '露天の湯', image: IMAGES.bath, caption: '木の香りと、湯気だけの時間。' },
  { title: '障子の間', image: IMAGES.shoji, caption: '格子の影が、畳に落ちる。' },
  { title: '庭', image: IMAGES.garden, caption: '障子の先に、庭の緑が続く。' },
]

export const FAQS = [
  {
    q: '一日何組まで宿泊できますか。',
    a: '各ヴィラとも一日一組限定です。鹿鳴と雪蛍は敷地を分けており、同時に二組が滞在する場合もありますが、動線は交差しません。',
  },
  {
    q: '子どもや乳幼児の宿泊は可能ですか。',
    a: '可能です。人数に含めてください。未就学児の寝具はご予約時にお知らせください。添い寝は6歳未満まで無償です（食事は実費）。',
  },
  {
    q: 'ペットは同伴できますか。',
    a: '申し訳ございません。建物と森の保全のため、ペット同伴はお受けしておりません。補助犬はご相談ください。',
  },
  {
    q: '食事のアレルギーに対応できますか。',
    a: '夕食・朝食ともに、可能な範囲で調整します。ご予約時と三日前までに、詳しい内容をお知らせください。',
  },
  {
    q: 'チェックイン・チェックアウトの時間は。',
    a: 'チェックインは15:00、チェックアウトは11:00です。早到着・遅出発は空室状況により有償でお受けします。',
  },
  {
    q: 'キャンセル規定を教えてください。',
    a: '7日前まで無料、6〜3日前30%、2日前50%、前日80%、当日および不泊は100%を申し受けます。',
  },
  {
    q: '公共交通でのアクセスは。',
    a: 'JR大糸線・穂高駅よりお車で約15分です。15:00までの到着に限り、駅までの送迎を無料でご用意します。',
  },
  {
    q: '支払い方法は。',
    a: 'サイトからのご予約は、現地精算（現金または主要クレジットカード）です。予約確定のメールをお送りします。',
  },
]

export const GUIDES = [
  { title: '滞在の流れ', body: '15時にお迎えし、畳の間と湯をご案内します。夕食の会席はお部屋へ。翌朝は障子の光とともに目覚め、11時までごゆるりと。' },
  { title: '客室のしつらえ', body: '各棟に畳、障子、専用風呂、キッチン、洗濯を備えています。浴衣と丹前は客室にご用意します。' },
  { title: '周辺', body: 'わさび田、美術館、温泉郷まで車で10〜20分。歩ける範囲に里山の小径と清流もあります。' },
  { title: 'お願い', body: '山の生き物と近隣への配慮から、夜間の大きな音と敷地外へのランプ持ち出しはご遠慮ください。' },
]

export function getVilla(slug: string) {
  return VILLAS.find((villa) => villa.slug === slug || villa.id === slug)
}

export function getMealPlan(id: MealPlan) {
  return MEAL_PLANS.find((plan) => plan.id === id)
}

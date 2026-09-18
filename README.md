# 杣音（そまおと）公式サイト

長野・安曇野を舞台にした、一日一組限定の一棟貸しヴィラ「杣音」の公式Webサイトです。参考にしたのは上質な旅館サイトの構成と空気感であり、写真・文章・施設名はオリジナルです。

## 技術

- React 19 + Vite + TypeScript
- Cloudflare Workers（`@cloudflare/vite-plugin`）
- Cloudflare D1（空室管理と予約保存）

## ローカル起動

```bash
cd Booking
npm install
npx wrangler types
npm run db:migrate:local
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## 予約の確認

- `/reserve` から客室・日程・食事プランを選び、予約を確定できます
- 満室日の例: 鹿鳴 `2026-10-10`〜`10-11`、雪蛍 `2026-11-20`〜`11-22`
- 年末年始（2026-12-31 / 2027-01-01）は休業

## 管理者画面

```bash
# 初回のみ、.dev.vars.example をコピーして初期パスワードを置く
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run dev
```

- URL: `/admin/login`
- 初期ユーザー: `admin`
- 初期パスワード: `.dev.vars` の `ADMIN_PASSWORD`（初回ログイン時に管理者アカウントを作成します）
- 本番: `npx wrangler secret put ADMIN_PASSWORD` のあと `npm run db:migrate:remote`

予約台帳、電話予約の登録、空室／休業カレンダー、お問い合わせ対応、操作履歴、パスワード変更が使えます。公開サイトのメニューには出しません。

## デプロイ

```bash
npm run db:migrate:remote
npm run deploy
```

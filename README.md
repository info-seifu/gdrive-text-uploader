# Google Drive Text Uploader

@i-seifu.jpドメインのユーザーが、テキストファイルをGoogle Driveへアップロードできるシステムです。

## 🚀 デプロイ

このプロジェクトは**Vercel**にフロントエンドとバックエンドを統合してデプロイできます。

詳細は [デプロイメントガイド](docs/deployment-guide.md) を参照してください。

### クイックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/gdrive-text-uploader)

デプロイ後、環境変数の設定が必要です。

## 💻 ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
# ルート、バックエンド、フロントエンドすべての依存関係をインストール
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成（`.env.example` を参考）:

```bash
cp .env.example .env
```

Google OAuth クライアントの登録とリダイレクトURI設定が必要です。
詳細は [デプロイメントガイド](docs/deployment-guide.md) の「Google Cloud Console の設定」を参照。

### 3. 開発サーバーの起動

```bash
# バックエンド（ターミナル1）
cd backend
npm run dev

# フロントエンド（ターミナル2）
cd frontend
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:4000

## 主な仕様
- Google OAuth 2.0 でログインし、Drive アクセスを許可
- 学生番号（8桁数字）、日付（YYYY-MM-DD）、テキストファイル(.txt)をアップロード
- ファイルサイズ上限: 10MB
- 重複ファイル名は `{学生番号}_{日付}_{連番}.txt` として保存
- Google Drive の指定フォルダ（環境変数 `GOOGLE_DRIVE_FOLDER_ID`）に multipart アップロード
- 認証・アップロード結果をフロントエンドで fileId とともに表示

## レスポンスフォーマット
APIは以下の共通フォーマットで返却します。

```json
// success
{ "success": true, "data": { ... }, "message": "任意の説明" }

// failure
{ "success": false, "errorCode": "INVALID_FILE", "message": "理由", "details": ["追加の説明"] }
```

バリデーションエラーや認証エラーは HTTP 400/401 を利用し、`errorCode` で原因を識別できます。

## テスト

バリデーションやユーティリティの単体テストを `backend/test` 配下に追加しています。

```bash
npm --prefix backend run test
```

CI（GitHub Actions）は lint と test をバックエンド／フロントエンド双方で実行する設定になっています。

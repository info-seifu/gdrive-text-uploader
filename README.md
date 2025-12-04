# Google Drive Text Uploader

ドキュメントの仕様に沿って、React + Express でテキストファイルをGoogle Driveへアップロードするプロトタイプを構築しました。

## 開発環境のセットアップ

```bash
# 依存関係のインストール
cd backend && npm install
cd ../frontend && npm install
```

バックエンドは `.env` をプロジェクトルートに配置して起動します（`.env.example` を参考）。Google OAuth クライアントの登録とリダイレクトURI設定が必要です。

```bash
# backend/.env ではなくプロジェクト直下の .env を使用
npm --prefix backend run dev
```

フロントエンドは Vite の開発サーバーを利用します。

```bash
npm --prefix frontend run dev
```

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

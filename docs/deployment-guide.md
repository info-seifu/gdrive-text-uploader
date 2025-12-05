# デプロイメントガイド - Vercel統合版

このガイドでは、フロントエンドとバックエンドをVercelに統合してデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（無料枠で使用可能）
- Google Cloud Consoleへのアクセス権限

## 1. Google Cloud Console の設定

### OAuth 2.0 クライアント ID の作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「OAuth同意画面」
   - User Type: **内部**（i-seifu.jpドメイン限定の場合）
   - アプリ名、サポートメールを入力
   - スコープ: `userinfo.email`, `drive.file` を追加

4. 「APIとサービス」→「認証情報」
   - 「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: **ウェブアプリケーション**
   - 承認済みのリダイレクトURI:
     - ローカル開発用: `http://localhost:4000/api/auth/google/callback`
     - **本番用: `https://your-app.vercel.app/api/auth/google/callback`** （後で更新）
   - **クライアントID**と**クライアントシークレット**をコピー

### Google Drive API の有効化

1. 「APIとサービス」→「ライブラリ」
2. 「Google Drive API」を検索して**有効化**

### アップロード先フォルダの準備

1. Google Driveでアップロード先フォルダを作成
2. フォルダを開いてURLから**フォルダID**をコピー
   - URL例: `https://drive.google.com/drive/folders/【ここがフォルダID】`

## 2. GitHubリポジトリの準備

リポジトリがGitHubにプッシュされていることを確認してください。

```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

## 3. Vercelへのデプロイ

### 初回デプロイ

1. [Vercel](https://vercel.com/) にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定:
   - **Framework Preset**: Other
   - **Root Directory**: そのまま（ルート）
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && cd backend && npm install && cd ../frontend && npm install`

5. 「Deploy」をクリック

### 環境変数の設定

デプロイ後、Vercelのダッシュボードで環境変数を設定します：

1. プロジェクト → Settings → Environment Variables
2. 以下の環境変数を追加:

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `SESSION_SECRET` | ランダムな文字列（32文字以上推奨） | セッション暗号化キー |
| `GOOGLE_CLIENT_ID` | Google Cloudからコピーした値 | OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google Cloudからコピーした値 | OAuth クライアントシークレット |
| `GOOGLE_OAUTH_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/google/callback` | OAuth リダイレクトURI |
| `GOOGLE_OAUTH_SCOPES` | `https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email` | OAuth スコープ |
| `GOOGLE_DRIVE_FOLDER_ID` | Google DriveフォルダID | アップロード先フォルダ |
| `FRONTEND_ORIGIN` | `https://your-app.vercel.app` | フロントエンドのURL |
| `NODE_ENV` | `production` | 本番環境フラグ |

**注意**: `your-app.vercel.app`は実際のVercelのURLに置き換えてください。

### Google Cloud Console の更新

環境変数設定後、Google Cloud Consoleに戻って：

1. OAuth 2.0 クライアント ID の設定を開く
2. 承認済みのリダイレクトURIに追加:
   - `https://your-app.vercel.app/api/auth/google/callback`
3. 保存

### 再デプロイ

環境変数を設定したら、Vercelで再デプロイ：

1. Vercelダッシュボード → Deployments
2. 最新のデプロイの「⋯」→「Redeploy」

## 4. 動作確認

1. `https://your-app.vercel.app` にアクセス
2. Googleログインをテスト
3. ファイルアップロードをテスト
4. Google Driveでファイルが保存されているか確認

## ローカル開発環境

ローカルで開発する場合は、プロジェクトルートに `.env` ファイルを作成：

```bash
# Backend configuration
PORT=4000
SESSION_SECRET=your-local-secret
FRONTEND_ORIGIN=http://localhost:5173

# Google OAuth configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
GOOGLE_OAUTH_SCOPES="https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

### ローカルサーバー起動

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

## トラブルシューティング

### 認証エラーが発生する

- Google Cloud ConsoleのリダイレクトURIが正しいか確認
- Vercelの環境変数が正しく設定されているか確認
- 環境変数変更後は再デプロイが必要

### ファイルアップロードが失敗する

- `GOOGLE_DRIVE_FOLDER_ID`が正しいか確認
- Google Drive APIが有効化されているか確認
- OAuth スコープに`drive.file`が含まれているか確認

### 10秒タイムアウトエラー

- Vercel無料枠はServerless Functionの実行時間が10秒まで
- テキストファイルなら通常問題なし
- 大容量ファイルの場合はPro プランへのアップグレードを検討

### CORS エラー

- `FRONTEND_ORIGIN`環境変数が正しく設定されているか確認
- 本番環境では`https://your-app.vercel.app`に設定

## セキュリティのベストプラクティス

1. **SESSION_SECRET**は本番環境で必ず変更（ランダムな文字列）
2. Google OAuth を**内部アプリ**に設定（i-seifu.jpドメイン限定）
3. 環境変数は.envファイルに保存（Gitにコミットしない）
4. 定期的にOAuthクライアントシークレットをローテーション

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)

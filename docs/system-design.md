# Googleドライブ テキストファイルアップローダー システム設計書

## 1. システム概要

### 1.1 目的
社内（@i-seifu.jpドメイン）のユーザーが、WebUI経由でテキストファイルをGoogleドライブの指定フォルダにアップロードできるシステムを構築する。

### 1.2 主要機能
- Google OAuth2.0による認証（@i-seifu.jpドメイン限定）
- テキストファイルのアップロード
- 学生番号と日付の入力
- Googleドライブへの自動保存

### 1.3 制約事項
- @i-seifu.jpドメインのメールアドレスのみログイン可能
- @マークより前が数字のみのメールアドレスはログイン不可
- アップロードファイルはテキストファイルのみ対応

## 2. システムアーキテクチャ

### 2.1 技術スタック
- **フロントエンド**: React.js + TypeScript
- **バックエンド**: Node.js + Express
- **認証**: Google OAuth 2.0
- **ストレージ**: Google Drive API
- **スタイリング**: Tailwind CSS

### 2.2 システム構成図

```
┌─────────────────┐
│   ユーザー       │
│  (Webブラウザ)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  フロントエンド  │
│   (React App)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   バックエンド   │
│  (Express API)   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────────┐
│ Google │ │ Google  │
│ OAuth  │ │  Drive  │
└────────┘ └─────────┘
```

## 3. 機能詳細

### 3.1 認証機能

#### 3.1.1 ログインフロー
1. ユーザーがトップページにアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleの認証画面へリダイレクト
4. 認証成功後、メールアドレスをチェック
   - ドメインが`@i-seifu.jp`でない場合 → エラー表示
   - @マーク前が数字のみの場合 → エラー表示
   - 上記以外 → ホーム画面へ遷移

#### 3.1.2 認証チェックロジック
```javascript
function validateEmail(email) {
  // ドメインチェック
  if (!email.endsWith('@i-seifu.jp')) {
    return { valid: false, error: 'i-seifu.jpドメインのメールアドレスでログインしてください' };
  }

  // ローカル部分（@より前）を取得
  const localPart = email.split('@')[0];

  // 数字のみかチェック
  if (/^\d+$/.test(localPart)) {
    return { valid: false, error: 'このアカウントではログインできません' };
  }

  return { valid: true };
}
```

### 3.2 ファイルアップロード画面

#### 3.2.1 画面構成
- **ヘッダー**: ユーザー名とログアウトボタン
- **入力フォーム**:
  - 学生番号入力欄（テキストボックス）
  - 日付入力欄（デフォルト：今日の日付）
  - ファイル選択エリア（ドラッグ&ドロップ対応）
  - アップロードボタン
- **結果表示エリア**: 成功/エラーメッセージ

#### 3.2.2 入力バリデーション
- **学生番号**: 必須、半角数字のみ、8桁
- **日付**: 必須、YYYY-MM-DD形式
- **ファイル**: 必須、.txtファイルのみ、最大サイズ 10MB

### 3.3 ファイルアップロード処理

#### 3.3.1 処理フロー
1. フロントエンドでバリデーション実施
2. FormDataにファイルと入力情報を格納
3. バックエンドAPIへPOSTリクエスト送信
4. バックエンドでGoogle Drive APIを使用してアップロード
5. 結果をフロントエンドに返却
6. 画面に結果を表示

#### 3.3.2 ファイル名規則
- 基本形式: `{学生番号}_{日付}.txt`
- 例: `12345678_2025-12-04.txt`
- 重複時: `{学生番号}_{日付}_{連番}.txt`
- 例: `12345678_2025-12-04_2.txt`

#### 3.3.3 エラーハンドリング
| エラー種別 | エラーメッセージ | 対処法 |
|-----------|----------------|--------|
| 認証エラー | 認証の有効期限が切れました | 再ログインを促す |
| ファイル形式エラー | テキストファイル(.txt)のみアップロード可能です | ファイル形式を確認 |
| ファイルサイズエラー | ファイルサイズが10MBを超えています | ファイルサイズを確認 |
| ネットワークエラー | ネットワーク接続を確認してください | 再試行ボタンを表示 |
| Google Drive API エラー | Googleドライブへの保存に失敗しました | 詳細エラーを表示 |
| 容量不足 | Googleドライブの容量が不足しています | 管理者に連絡を促す |

### 3.4 並行処理対策

#### 3.4.1 実装方針
- **セッション管理**: ユーザーごとにセッションを分離
- **ファイル名の一意性**: タイムスタンプとユーザーIDを組み合わせた一時ファイル名を使用
- **トランザクション**: アップロード処理をアトミックに実行
- **キューイング**: 同一ユーザーからの複数リクエストは順次処理

#### 3.4.2 重複チェックロジック
```javascript
async function generateUniqueFileName(studentId, date, drive) {
  let fileName = `${studentId}_${date}.txt`;
  let counter = 1;

  while (await fileExists(fileName, drive)) {
    counter++;
    fileName = `${studentId}_${date}_${counter}.txt`;
  }

  return fileName;
}
```

## 4. API仕様

### 4.1 エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /auth/google | Google認証開始 | 不要 |
| GET | /auth/google/callback | 認証コールバック | 不要 |
| POST | /api/upload | ファイルアップロード | 必要 |
| GET | /api/user | ユーザー情報取得 | 必要 |
| POST | /auth/logout | ログアウト | 必要 |

### 4.2 ファイルアップロードAPI

**エンドポイント**: `POST /api/upload`

**リクエスト**:
```
Content-Type: multipart/form-data

{
  "file": File,
  "studentId": "12345678",
  "date": "2025-12-04"
}
```

**レスポンス（成功時）**:
```json
{
  "success": true,
  "message": "ファイルが正常にアップロードされました",
  "fileName": "12345678_2025-12-04.txt",
  "fileId": "1ABC...xyz"
}
```

**レスポンス（エラー時）**:
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "errorCode": "ERROR_CODE"
}
```

## 5. セキュリティ考慮事項

### 5.1 認証・認可
- Google OAuth 2.0による安全な認証
- JWTトークンによるセッション管理
- HTTPSによる通信の暗号化

### 5.2 入力検証
- フロントエンド・バックエンド両方での入力検証
- ファイルタイプの厳密なチェック（MIMEタイプ検証）
- SQLインジェクション対策（パラメータ化クエリ使用）
- XSS対策（入力値のサニタイズ）

### 5.3 ファイルアップロード
- ファイルサイズ制限（10MB）
- ウイルススキャン（オプション）
- 一時ファイルの適切な削除

## 6. 環境設定

### 6.1 必要な環境変数

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=target_folder_id

# Session
SESSION_SECRET=your_session_secret

# App
PORT=3000
NODE_ENV=development
```

### 6.2 Google Cloud Console設定
1. プロジェクトを作成
2. Google Drive APIを有効化
3. OAuth 2.0クライアントIDを作成
4. 承認済みリダイレクトURIを設定
5. サービスアカウントを作成（オプション）

## 7. 開発フェーズ

### Phase 1: 基本機能実装（1-2週間）
- [ ] プロジェクトセットアップ
- [ ] Google OAuth認証実装
- [ ] 基本的なUI構築
- [ ] ファイルアップロードAPI実装

### Phase 2: Google Drive連携（1週間）
- [ ] Google Drive API連携
- [ ] ファイル保存処理実装
- [ ] エラーハンドリング実装

### Phase 3: テスト・改善（1週間）
- [ ] 単体テスト作成
- [ ] 統合テスト実施
- [ ] UI/UXの改善
- [ ] ドキュメント整備

## 8. テスト計画

### 8.1 単体テスト
- 認証バリデーション関数
- ファイル名生成ロジック
- API エンドポイント

### 8.2 統合テスト
- 認証フロー全体
- ファイルアップロード処理
- エラーハンドリング

### 8.3 負荷テスト
- 同時アップロード（10ユーザー）
- 大容量ファイル（10MB）のアップロード

## 9. 今後の拡張可能性

- 複数ファイル同時アップロード
- アップロード履歴の表示
- ファイル検索機能
- 管理者向けダッシュボード
- メール通知機能
- ファイル形式の拡張（CSV、PDFなど）

## 10. 参考資料

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API v3 Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
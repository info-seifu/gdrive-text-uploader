# システムアーキテクチャ概要図

## 全体構成

```mermaid
graph TB
    subgraph "クライアントサイド"
        A[Webブラウザ<br/>React Application]
    end

    subgraph "サーバーサイド"
        B[Express Server<br/>Node.js]
        C[認証ミドルウェア]
        D[ファイル処理モジュール]
    end

    subgraph "Google Cloud Services"
        E[Google OAuth 2.0]
        F[Google Drive API]
    end

    A -->|HTTPSリクエスト| B
    B --> C
    C -->|認証確認| E
    B --> D
    D -->|ファイルアップロード| F
    E -->|認証トークン| C
    F -->|保存結果| D
```

## 処理シーケンス

### 1. ログインシーケンス

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as フロントエンド
    participant B as バックエンド
    participant G as Google OAuth

    U->>F: アクセス
    F->>U: ログイン画面表示
    U->>F: Googleログインクリック
    F->>G: 認証リダイレクト
    G->>U: Google認証画面
    U->>G: ログイン情報入力
    G->>B: 認証コールバック
    B->>B: メールアドレス検証<br/>(@i-seifu.jp & 数字のみチェック)
    alt 認証成功
        B->>F: セッション作成・リダイレクト
        F->>U: ホーム画面表示
    else 認証失敗
        B->>F: エラーリダイレクト
        F->>U: エラーメッセージ表示
    end
```

### 2. ファイルアップロードシーケンス

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as フロントエンド
    participant B as バックエンド
    participant GD as Google Drive

    U->>F: ファイル選択・情報入力
    F->>F: クライアント側バリデーション
    F->>B: ファイルアップロード<br/>(multipart/form-data)
    B->>B: サーバー側バリデーション
    B->>B: ファイル名生成<br/>(重複チェック含む)
    B->>GD: ファイル保存リクエスト
    GD->>B: 保存結果
    alt アップロード成功
        B->>F: 成功レスポンス
        F->>U: 成功メッセージ表示
    else アップロード失敗
        B->>F: エラーレスポンス
        F->>U: エラーメッセージ表示
    end
```

## ディレクトリ構造

```
gdrive-text-uploader/
├── docs/                      # ドキュメント
│   ├── system-design.md      # システム設計書
│   └── architecture-overview.md # アーキテクチャ概要
├── frontend/                  # フロントエンド
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   ├── services/         # APIクライアント
│   │   ├── utils/            # ユーティリティ関数
│   │   └── App.tsx           # メインアプリケーション
│   └── package.json
├── backend/                   # バックエンド
│   ├── src/
│   │   ├── routes/           # APIルート
│   │   ├── middleware/       # ミドルウェア
│   │   ├── services/         # ビジネスロジック
│   │   ├── utils/            # ユーティリティ関数
│   │   └── server.ts         # サーバーエントリポイント
│   └── package.json
├── .env.example              # 環境変数サンプル
└── README.md                 # プロジェクト説明
```

## データフロー

```mermaid
graph LR
    subgraph "入力データ"
        A[学生番号<br/>8桁数字]
        B[日付<br/>YYYY-MM-DD]
        C[テキストファイル<br/>.txt]
    end

    subgraph "処理"
        D[バリデーション]
        E[ファイル名生成]
        F[Google Drive保存]
    end

    subgraph "出力"
        G[保存完了通知]
        H[エラー通知]
    end

    A --> D
    B --> D
    C --> D
    D -->|成功| E
    D -->|失敗| H
    E --> F
    F -->|成功| G
    F -->|失敗| H
```

## エラー処理フロー

```mermaid
flowchart TD
    A[エラー発生] --> B{エラー種別}
    B -->|認証エラー| C[再ログイン画面へ]
    B -->|バリデーションエラー| D[入力フォームに<br/>エラー表示]
    B -->|ネットワークエラー| E[再試行ボタン表示]
    B -->|Google Driveエラー| F[詳細エラー表示]
    B -->|その他| G[汎用エラー表示]

    C --> H[ユーザー対応待ち]
    D --> H
    E --> H
    F --> H
    G --> H
```
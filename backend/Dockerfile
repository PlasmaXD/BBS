# ベースイメージとして軽量な Python 3.10 スリム版を使用
FROM python:3.10-slim

# 作業ディレクトリの設定
WORKDIR /app

# 依存ライブラリをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY src/ .

# App Runner は通常ポート 8080 を利用するので、ポートを明示的に EXPOSE
EXPOSE 8080

# 本番用の WSGI サーバーとして Gunicorn を使用（必要なら requirements.txt に gunicorn を追加）
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]

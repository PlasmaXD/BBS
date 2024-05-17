対応している Ubuntu のバージョンを次のページで確認
https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

公開鍵のインポート
sudo apt -y install gnupg wget
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
リストファイルの作成
Ubuntu 20.04 の場合の実行手順例

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
MongoDB のインストール
sudo apt -y update
sudo apt -y install mongodb-org
MongoDB の実行開始
sudo systemctl start mongod
MongoDB の実行ができたかの確認
sudo systemctl status mongod
Ubuntu のシステム起動時にMongoDB を自動実行する設定
sudo systemctl enable mongod

mongo
use mydatabase
db.posts.find()
# BBS

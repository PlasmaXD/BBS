�Ή����Ă��� Ubuntu �̃o�[�W���������̃y�[�W�Ŋm�F
https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

���J���̃C���|�[�g
sudo apt -y install gnupg wget
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
���X�g�t�@�C���̍쐬
Ubuntu 20.04 �̏ꍇ�̎��s�菇��

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
MongoDB �̃C���X�g�[��
sudo apt -y update
sudo apt -y install mongodb-org
MongoDB �̎��s�J�n
sudo systemctl start mongod
MongoDB �̎��s���ł������̊m�F
sudo systemctl status mongod
Ubuntu �̃V�X�e���N������MongoDB ���������s����ݒ�
sudo systemctl enable mongod

mongo
use mydatabase
db.posts.find()
# BBS

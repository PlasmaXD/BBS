from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson import ObjectId
import datetime

from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # すべてのオリジンからのアクセスを許可
# MongoDBの接続設定
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)


@app.route('/threads', methods=['POST'])
def create_thread():
    data = request.get_json()
    thread = {
        'title': data['title'],
        'description': data.get('description', ''),
        'created_at': datetime.datetime.utcnow()
    }
    result = mongo.db.threads.insert_one(thread)
    thread['_id'] = result.inserted_id
    return jsonify({
        '_id': str(thread['_id']),
        'title': thread['title'],
        'description': thread['description'],
        'created_at': thread['created_at']
    }), 201



@app.route('/threads/<thread_id>/comments', methods=['POST'])
def add_comment(thread_id):
    data = request.get_json()
    comment = {
        'text': data['text'],
        'date': datetime.datetime.utcnow()
    }
    # コメントに一意のIDを割り当てる
    result = mongo.db.comments.insert_one(comment)
    if result.inserted_id:
        # スレッドにコメントIDを追加
        mongo.db.threads.update_one({'_id': ObjectId(thread_id)}, {'$push': {'comments': result.inserted_id}})
        return jsonify({
            '_id': str(result.inserted_id),
            'text': comment['text'],
            'date': comment['date']
        }), 201
    else:
        return jsonify({'error': 'Comment not added'}), 500

@app.route('/threads/<thread_id>/comments', methods=['GET'])
def get_comments(thread_id):
    thread = mongo.db.threads.find_one({'_id': ObjectId(thread_id)})
    if thread and 'comments' in thread:
        comments = [mongo.db.comments.find_one({'_id': comment_id}) for comment_id in thread['comments']]
        return jsonify([{'_id': str(comment['_id']), 'text': comment['text'], 'date': comment['date']} for comment in comments if comment])
    else:
        return jsonify({'error': 'No comments found'}), 404

@app.route('/threads/<thread_id>', methods=['DELETE'])
def delete_thread(thread_id):
    try:
        result = mongo.db.threads.delete_one({'_id': ObjectId(thread_id)})
        if result.deleted_count == 1:
            return jsonify({'status': 'success'}), 200
        else:
            return jsonify({'error': 'Thread not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/threads/<thread_id>/comments/<comment_id>', methods=['DELETE'])
def delete_comment(thread_id, comment_id):
    try:
        result = mongo.db.threads.update_one(
            {'_id': ObjectId(thread_id)},
            {'$pull': {'comments': ObjectId(comment_id)}}
        )
        if result.modified_count == 1:
            mongo.db.comments.delete_one({'_id': ObjectId(comment_id)})
            return jsonify({'status': 'success'}), 200
        else:
            return jsonify({'error': 'Comment not found or Thread not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# # コメントを追加するAPIエンドポイント
# @app.route('/posts/<post_id>/comments', methods=['POST'])
# def add_comment(post_id):
#     data = request.get_json()
#     comment = {
#         'text': data['text'],
#         'date': datetime.datetime.utcnow()
#     }
#     mongo.db.posts.update_one(
#         {'_id': ObjectId(post_id)},
#         {'$push': {'comments': comment}}
#     )
#     return jsonify({'status': 'success'})




@app.route('/threads', methods=['GET'])
def get_threads():
    threads = mongo.db.threads.find()
    return jsonify([{'_id': str(thread['_id']), 'title': thread['title'], 'description': thread['description']} for thread in threads])
# スレッドの詳細を取得するための新しいエンドポイント
@app.route('/threads/<thread_id>', methods=['GET'])
def get_thread(thread_id):
    thread = mongo.db.threads.find_one({'_id': ObjectId(thread_id)})
    if thread:
        return jsonify({
            '_id': str(thread['_id']),
            'title': thread['title'],
            'description': thread['description'],
            'created_at': thread['created_at']
        })
    else:
        return jsonify({'error': 'Thread not found'}), 404

# @app.route('/posts', methods=['GET'])
# def get_posts():
#     posts = mongo.db.posts.find()
#     return jsonify([{'_id': str(post['_id']), 'title': post['title'], 'content': post['content'], 'date': post['date']} for post in posts])

# # Flaskサーバーの投稿部分にコメントフィールドを追加
# @app.route('/posts/', methods=['POST'])
# def add_post():
#     data = request.get_json()
#     post_id = mongo.db.posts.insert_one({
#         'title': data['title'],
#         'content': data['content'],
#         'date': datetime.datetime.utcnow(),
#         'comments': []  # コメントを保持するための配列
#     }).inserted_id
#     return jsonify({'id': str(post_id)})

# # コメントを追加するAPIエンドポイント
# @app.route('/posts/<post_id>/comments', methods=['POST'])
# def add_comment(post_id):
#     data = request.get_json()
#     comment = {
#         'text': data['text'],
#         'date': datetime.datetime.utcnow()
#     }
#     mongo.db.posts.update_one(
#         {'_id': ObjectId(post_id)},
#         {'$push': {'comments': comment}}
#     )
#     return jsonify({'status': 'success'})



# @app.route('/posts/<id>', methods=['DELETE'])
# def delete_post(id):
#     result = mongo.db.posts.delete_one({'_id': ObjectId(id)})
#     if result.deleted_count == 1:
#         return jsonify({'status': 'success'})
#     else:
#         return jsonify({'status': 'error'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


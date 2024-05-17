from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson import ObjectId
import datetime

from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # �����鴻�������������吾�潟����������≪����祉�鴻��荐怨��
# MongoDB����･膓�荐㊤��
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
    # ��潟�＜�潟�����筝�������ID�����蚊��綵�������
    result = mongo.db.comments.insert_one(comment)
    if result.inserted_id:
        # ��鴻�������������潟�＜�潟��ID���菴遵��
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






@app.route('/threads', methods=['GET'])
def get_threads():
    threads = mongo.db.threads.find()
    return jsonify([{'_id': str(thread['_id']), 'title': thread['title'], 'description': thread['description']} for thread in threads])
# ��鴻�����������荅括完������緇������������������違����������潟�������ゃ�潟��
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

# # Flask��泣�若����若�����腮翠����������潟�＜�潟�������ｃ�若��������菴遵��
# @app.route('/posts/', methods=['POST'])
# def add_post():
#     data = request.get_json()
#     post_id = mongo.db.posts.insert_one({
#         'title': data['title'],
#         'content': data['content'],
#         'date': datetime.datetime.utcnow(),
#         'comments': []  # ��潟�＜�潟�����篆�������������������������
#     }).inserted_id
#     return jsonify({'id': str(post_id)})

# # ��潟�＜�潟�����菴遵��������API�����潟�������ゃ�潟��
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


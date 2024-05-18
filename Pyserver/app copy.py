# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify, session, send_from_directory
from flask_pymongo import PyMongo
from bson import ObjectId
import datetime
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
import bcrypt
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.secret_key = 'your_secret_key'

app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
app.config['UPLOAD_FOLDER'] = 'uploads/'
mongo = PyMongo(app)
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin123'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/threads', methods=['POST'])
def create_thread():
    title = request.form['title']
    description = request.form.get('description', '')
    image = request.files.get('image')
    image_url = None

    if image:
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)
        image_url = f"/uploads/{filename}"

    thread = {
        'title': title,
        'description': description,
        'imageUrl': image_url,
        'created_at': datetime.datetime.utcnow()
    }
    result = mongo.db.threads.insert_one(thread)
    thread['_id'] = result.inserted_id

    return jsonify({
        '_id': str(thread['_id']),
        'title': thread['title'],
        'description': thread['description'],
        'imageUrl': thread['imageUrl'],
        'created_at': thread['created_at']
    }), 201

# @app.route('/uploads/<filename>')
# def uploaded_file(filename):
#     return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
@app.route('/threads/<thread_id>/comments', methods=['POST'])
def add_comment(thread_id):
    text = request.form['text']
    image = request.files.get('image')
    image_url = None

    if image:
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)
        image_url = f"/uploads/{filename}"

    comment = {
        'text': text,
        'imageUrl': image_url,
        'date': datetime.datetime.utcnow()
    }
    result = mongo.db.comments.insert_one(comment)
    if result.inserted_id:
        mongo.db.threads.update_one({'_id': ObjectId(thread_id)}, {'$push': {'comments': result.inserted_id}})
        return jsonify({
            '_id': str(result.inserted_id),
            'text': comment['text'],
            'imageUrl': comment['imageUrl'],
            'date': comment['date']
        }), 201
    else:
        return jsonify({'error': 'Comment not added'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/threads/<thread_id>/comments', methods=['GET'])
def get_comments(thread_id):
    thread = mongo.db.threads.find_one({'_id': ObjectId(thread_id)})
    if thread and 'comments' in thread:
        comments = [mongo.db.comments.find_one({'_id': comment_id}) for comment_id in thread['comments']]
        return jsonify([{
            '_id': str(comment['_id']),
            'text': comment['text'],
            'imageUrl': comment.get('imageUrl'),
            'date': comment['date']
        } for comment in comments if comment])
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

@app.route('/threads/<thread_id>', methods=['GET'])
def get_thread(thread_id):
    thread = mongo.db.threads.find_one({'_id': ObjectId(thread_id)})
    if thread:
        return jsonify({
            '_id': str(thread['_id']),
            'title': thread['title'],
            'description': thread['description'],
            'imageUrl': thread.get('imageUrl'),
            'created_at': thread['created_at']
        })
    else:
        return jsonify({'error': 'Thread not found'}), 404
@app.route('/api/mystamps', methods=['GET'])
def get_my_stamps():
    user_id = request.headers.get('X-User-Id')
    stamps = mongo.db.stamps.find({'owner_id': user_id})
    return jsonify([{'_id': str(stamp['_id']), 'name': stamp['name'], 'imageUrl': stamp['imageUrl']} for stamp in stamps])

@app.route('/api/stamps', methods=['POST'])
def create_stamp():
    try:
        name = request.form['name']
        price = request.form['price']
        image = request.files['image']
        image_url = f"/uploads/{image.filename}"
        image.save(f"./uploads/{image.filename}")

        stamp = {
            'name': name,
            'imageUrl': image_url,
            'owner_id': request.headers.get('X-User-Id'),
            'price': price,
            'created_at': datetime.datetime.utcnow()
        }
        mongo.db.stamps.insert_one(stamp)
        return jsonify({'message': 'Stamp created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stamps', methods=['GET'])
def get_stamps():
    stamps = mongo.db.stamps.find()
    return jsonify([{'_id': str(stamp['_id']), 'name': stamp['name'], 'imageUrl': stamp['imageUrl'], 'price': stamp['price']} for stamp in stamps])

@app.route('/api/stamps/<stamp_id>/buy', methods=['POST'])
def buy_stamp(stamp_id):
    user_id = request.headers.get('X-User-Id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    stamp = mongo.db.stamps.find_one({'_id': ObjectId(stamp_id)})

    if not stamp:
        return jsonify({'error': 'Stamp not found'}), 404

    if stamp['owner_id'] == user_id:
        return jsonify({'error': 'You cannot buy your own stamp'}), 400

    # Implement your payment logic here

    mongo.db.stamps.update_one({'_id': ObjectId(stamp_id)}, {'$set': {'owner_id': user_id}})
    return jsonify({'message': 'Stamp purchased successfully'})

@app.route('/api/purchasedstamps', methods=['GET'])
def get_purchased_stamps():
    user_id = request.headers.get('X-User-Id')
    stamps = mongo.db.stamps.find({'owner_id': user_id})
    return jsonify([{'_id': str(stamp['_id']), 'name': stamp['name'], 'imageUrl': stamp['imageUrl']} for stamp in stamps])
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        'username': username,
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow()
    }
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

# @app.route('/api/login', methods=['POST'])
# def login_user():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     user = mongo.db.users.find_one({'username': username})
#     if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
#         return jsonify({'user_id': str(user['_id']), 'username': user['username']}), 200
#     else:
#         return jsonify({'error': 'Invalid username or password'}), 401
# ユーザーログイン
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({'username': data['username']})
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        session['user_id'] = str(user['_id'])
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/users', methods=['GET'])
def get_users():
    auth = request.authorization
    if auth and auth.username == ADMIN_USERNAME and auth.password == ADMIN_PASSWORD:
        users = mongo.db.users.find()
        users_list = []
        for user in users:
            users_list.append({
                'username': user['username'],
                'created_at': user['created_at']
            })
        return jsonify(users_list), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 401
    

# ログインチェック
@app.route('/api/check_login', methods=['GET'])
def check_login():
    if 'user_id' in session:
        user_id = session['user_id']
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if user:
            return jsonify({'username': user['username']}), 200
    return jsonify({'message': 'Not logged in'}), 401
# ログアウト
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

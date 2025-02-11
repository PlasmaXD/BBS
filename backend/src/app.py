import boto3
from boto3.dynamodb.conditions import Key
from flask import Flask, request, jsonify, session, send_from_directory
# from werkzeug.utils import secure_filename, quote
from werkzeug.utils import secure_filename
from urllib.parse import quote
import datetime
import os
from flask_cors import CORS
import bcrypt
import uuid
from werkzeug.middleware.proxy_fix import ProxyFix


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.secret_key = 'your_secret_key'
s3 = boto3.client('s3')
# dynamodb = boto3.resource('dynamodb')
dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
threads_table = dynamodb.Table('Threads')
comments_table = dynamodb.Table('Comments')
users_table = dynamodb.Table('Users')
stamps_table = dynamodb.Table('Stamps')
bucket_name = 'bbss3junxd'



@app.route('/threads', methods=['GET'])
def get_threads():
    try:
        response = threads_table.scan()
        threads = response.get('Items', [])
        return jsonify(threads), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # CloudWatch にエラーログを出力
        return jsonify({"error": str(e)}), 500  # エラーメッセージを返す





@app.route('/threads', methods=['POST'])
def create_thread():
    title = request.form['title']
    description = request.form.get('description', '')
    image = request.files.get('image')
    image_url = None

    if image:
        filename = secure_filename(image.filename)
        s3.upload_fileobj(image, bucket_name, filename)
        image_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"

    thread = {
        'ThreadID': str(uuid.uuid4()),
        'title': title,
        'description': description,
        'imageUrl': image_url,
        'created_at': datetime.datetime.utcnow().isoformat()
    }
    threads_table.put_item(Item=thread)

    return jsonify(thread), 201

@app.route('/threads/<thread_id>/comments', methods=['POST'])
def add_comment(thread_id):
    text = request.form['text']
    image = request.files.get('image')
    image_url = None

    if image:
        filename = secure_filename(image.filename)
        s3.upload_fileobj(image, bucket_name, filename)
        image_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"

    comment = {
        'CommentID': str(uuid.uuid4()),
        'ThreadID': thread_id,
        'text': text,
        'imageUrl': image_url,
        'date': datetime.datetime.utcnow().isoformat()
    }
    comments_table.put_item(Item=comment)
    return jsonify(comment), 201

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/threads/<thread_id>/comments', methods=['GET'])
def get_comments(thread_id):
    response = comments_table.query(
        KeyConditionExpression=Key('ThreadID').eq(thread_id)
    )
    comments = response['Items']
    return jsonify(comments)

@app.route('/threads/<thread_id>', methods=['DELETE'])
def delete_thread(thread_id):
    try:
        threads_table.delete_item(
            Key={'ThreadID': thread_id}
        )
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/threads/<thread_id>/comments/<comment_id>', methods=['DELETE'])
def delete_comment(thread_id, comment_id):
    try:
        comments_table.delete_item(
            Key={'CommentID': comment_id}
        )
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/threads/<thread_id>', methods=['GET'])
def get_thread(thread_id):
    response = threads_table.get_item(
        Key={'ThreadID': thread_id}
    )
    thread = response.get('Item')
    if thread:
        return jsonify(thread)
    else:
        return jsonify({'error': 'Thread not found'}), 404

@app.route('/api/mystamps', methods=['GET'])
def get_my_stamps():
    user_id = request.headers.get('X-User-Id')
    response = stamps_table.query(
        KeyConditionExpression=Key('owner_id').eq(user_id)
    )
    stamps = response['Items']
    return jsonify(stamps)

@app.route('/api/stamps', methods=['POST'])
def create_stamp():
    try:
        name = request.form['name']
        price = request.form['price']
        image = request.files['image']
        filename = secure_filename(image.filename)
        s3.upload_fileobj(image, bucket_name, filename)
        image_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"

        stamp = {
            'StampID': str(uuid.uuid4()),
            'name': name,
            'imageUrl': image_url,
            'owner_id': request.headers.get('X-User-Id'),
            'price': price,
            'created_at': datetime.datetime.utcnow().isoformat()
        }
        stamps_table.put_item(Item=stamp)
        return jsonify({'message': 'Stamp created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stamps', methods=['GET'])
def get_stamps():
    response = stamps_table.scan()
    stamps = response['Items']
    return jsonify(stamps)

@app.route('/api/stamps/<stamp_id>/buy', methods=['POST'])
def buy_stamp(stamp_id):
    user_id = request.headers.get('X-User-Id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    response = stamps_table.get_item(
        Key={'StampID': stamp_id}
    )
    stamp = response.get('Item')

    if not stamp:
        return jsonify({'error': 'Stamp not found'}), 404

    if stamp['owner_id'] == user_id:
        return jsonify({'error': 'You cannot buy your own stamp'}), 400

    response = stamps_table.query(
        KeyConditionExpression=Key('owner_id').eq(user_id)
    )
    user_stamps = response['Items']
    for user_stamp in user_stamps:
        if user_stamp['StampID'] == stamp_id:
            return jsonify({'error': 'You already own this stamp'}), 400

    stamps_table.update_item(
        Key={'StampID': stamp_id},
        UpdateExpression='SET owner_id = :owner_id',
        ExpressionAttributeValues={':owner_id': user_id}
    )
    return jsonify({'message': 'Stamp purchased successfully'})

@app.route('/api/purchasedstamps', methods=['GET'])
def get_purchased_stamps():
    user_id = request.headers.get('X-User-Id')
    response = stamps_table.query(
        KeyConditionExpression=Key('owner_id').eq(user_id)
    )
    stamps = response['Items']
    return jsonify(stamps)

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        'UserID': str(uuid.uuid4()),
        'username': username,
        'password': hashed_password.decode('utf-8'),
        'created_at': datetime.datetime.utcnow().isoformat()
    }
    users_table.put_item(Item=user)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    response = users_table.get_item(
        Key={'username': data['username']}
    )
    user = response.get('Item')
    if user:
        password_attempt = data['password'].encode('utf-8')
        stored_hashed_password = user['password'].encode('utf-8')
        if bcrypt.checkpw(password_attempt, stored_hashed_password):
            session['user_id'] = user['UserID']
            return jsonify({
                'message': 'Login successful',
                'user_id': user['UserID'],
                'username': user['username']
            }), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/users', methods=['GET'])
def get_users():
    auth = request.authorization
    if auth and auth.username == 'admin' and auth.password == 'admin123':
        response = users_table.scan()
        users = response['Items']
        return jsonify(users), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/check_login', methods=['GET'])
def check_login():
    if 'user_id' in session:
        user_id = session['user_id']
        response = users_table.get_item(
            Key={'UserID': user_id}
        )
        user = response.get('Item')
        if user:
            return jsonify({'username': user['username']}), 200
    return jsonify({'message': 'Not logged in'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/stamps/<stamp_id>/delete', methods=['DELETE'])
def delete_stamp(stamp_id):
    user_id = request.headers.get('X-User-Id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    response = stamps_table.get_item(
        Key={'StampID': stamp_id}
    )
    stamp = response.get('Item')

    if not stamp:
        return jsonify({'error': 'Stamp not found'}), 404

    stamps_table.delete_item(
        Key={'StampID': stamp_id}
    )
    return jsonify({'message': 'Stamp deleted successfully'})
@app.route('/')
def hello_world():
    return 'Hello, World!'
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)

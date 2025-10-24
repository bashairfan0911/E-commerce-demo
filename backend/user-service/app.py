from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'your-google-client-id.apps.googleusercontent.com')

def get_db():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'rootpassword'),
        database=os.getenv('DB_NAME', 'user_service_db')
    )

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not all([email, password, name]):
        return jsonify({'error': 'Missing fields'}), 400
    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO users (email, password, name) VALUES (%s, %s, %s)',
                      (email, hashed, name))
        db.commit()
        user_id = cursor.lastrowid
        cursor.close()
        db.close()
        
        return jsonify({'message': 'User created', 'userId': user_id}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        token = jwt.encode({
            'userId': user['id'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'])
        
        return jsonify({'token': token, 'userId': user['id'], 'name': user['name']}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token required'}), 400
    
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Get user info from Google
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        google_id = idinfo['sub']
        
        # Check if user exists
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        
        if not user:
            # Create new user with Google account
            # Use a random password since they login with Google
            random_password = bcrypt.hashpw(os.urandom(24), bcrypt.gensalt())
            cursor.execute(
                'INSERT INTO users (email, password, name) VALUES (%s, %s, %s)',
                (email, random_password, name)
            )
            db.commit()
            user_id = cursor.lastrowid
        else:
            user_id = user['id']
            name = user['name']
        
        cursor.close()
        db.close()
        
        # Generate JWT token
        jwt_token = jwt.encode({
            'userId': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': jwt_token,
            'userId': user_id,
            'name': name,
            'email': email
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT id, email, name, phone, address, city, state, zip, country, created_at FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    
    if user:
        return jsonify(user), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.json
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Update user profile
        cursor.execute(
            '''UPDATE users SET 
               name = %s, phone = %s, address = %s, city = %s, 
               state = %s, zip = %s, country = %s 
               WHERE id = %s''',
            (data.get('name'), data.get('phone'), data.get('address'), 
             data.get('city'), data.get('state'), data.get('zip'), 
             data.get('country'), user_id)
        )
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)

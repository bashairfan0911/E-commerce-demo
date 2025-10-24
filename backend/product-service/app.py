from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from urllib.parse import unquote

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'rootpassword'),
        database=os.getenv('DB_NAME', 'product_service_db')
    )

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    if category:
        # URL decode the category parameter
        decoded_category = unquote(category)
        print(f"Searching for category: {decoded_category}")
        cursor.execute('SELECT * FROM products WHERE category = %s', (decoded_category,))
    else:
        cursor.execute('SELECT * FROM products')
    
    products = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(products), 200

@app.route('/categories', methods=['GET'])
def get_categories():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT DISTINCT category FROM products ORDER BY category')
    categories = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify([cat['category'] for cat in categories]), 200

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM products WHERE id = %s', (product_id,))
    product = cursor.fetchone()
    cursor.close()
    db.close()
    
    if product:
        return jsonify(product), 200
    return jsonify({'error': 'Product not found'}), 404

@app.route('/products', methods=['POST'])
def create_product():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    stock = data.get('stock', 0)
    image_url = data.get('image_url')
    
    if not all([name, price]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'INSERT INTO products (name, description, price, stock, image_url) VALUES (%s, %s, %s, %s, %s)',
        (name, description, price, stock, image_url)
    )
    db.commit()
    product_id = cursor.lastrowid
    cursor.close()
    db.close()
    
    return jsonify({'message': 'Product created', 'productId': product_id}), 201

@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'UPDATE products SET stock = %s WHERE id = %s',
        (data.get('stock'), product_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({'message': 'Product updated'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002, debug=True)

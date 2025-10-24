from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
import requests

app = Flask(__name__)
CORS(app)

PRODUCT_SERVICE_URL = os.getenv('PRODUCT_SERVICE_URL', 'http://product-service:8002')

def get_db():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'rootpassword'),
        database=os.getenv('DB_NAME', 'order_service_db')
    )

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    print(f"Received order data: {data}")
    
    user_id = data.get('userId')
    items = data.get('items')  # [{'productId': 1, 'quantity': 2, 'price': 99.99}, ...]
    shipping = data.get('shipping', {})
    
    print(f"User ID: {user_id}, Items: {items}, Shipping: {shipping}")
    
    if not all([user_id, items]):
        error_msg = f'Missing required fields - userId: {user_id}, items: {items}'
        print(f"Error: {error_msg}")
        return jsonify({'error': error_msg}), 400
    
    # Validate shipping address
    required_shipping = ['name', 'address', 'city', 'state', 'zip', 'country', 'phone']
    for field in required_shipping:
        if not shipping.get(field):
            error_msg = f'Missing shipping field: {field}'
            print(f"Error: {error_msg}")
            return jsonify({'error': error_msg}), 400
    
    total_amount = 0.0
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Create order with shipping info
        cursor.execute(
            '''INSERT INTO orders (user_id, total_amount, status, 
               shipping_name, shipping_address, shipping_city, shipping_state, 
               shipping_zip, shipping_country, shipping_phone) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
            (user_id, 0, 'pending', 
             shipping['name'], shipping['address'], shipping['city'], 
             shipping['state'], shipping['zip'], shipping['country'], shipping['phone'])
        )
        order_id = cursor.lastrowid
        
        # Add order items
        for item in items:
            product_id = item['productId']
            quantity = int(item['quantity'])
            
            # Get product price (in production, use proper service communication)
            try:
                response = requests.get(f'{PRODUCT_SERVICE_URL}/products/{product_id}')
                product = response.json()
                price = float(product['price'])
            except:
                price = float(item.get('price', 0))
            
            cursor.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)',
                (order_id, product_id, quantity, price)
            )
            total_amount += float(price) * quantity
        
        # Update total amount
        cursor.execute('UPDATE orders SET total_amount = %s WHERE id = %s', (total_amount, order_id))
        db.commit()
        
        return jsonify({'message': 'Order created', 'orderId': order_id, 'totalAmount': float(total_amount)}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
    orders = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(orders), 200

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
    order = cursor.fetchone()
    
    if order:
        cursor.execute('SELECT * FROM order_items WHERE order_id = %s', (order_id,))
        order['items'] = cursor.fetchall()
    
    cursor.close()
    db.close()
    
    if order:
        return jsonify(order), 200
    return jsonify({'error': 'Order not found'}), 404

@app.route('/orders/<int:order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    try:
        # Check if order exists and get its status
        cursor.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
        order = cursor.fetchone()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Only allow cancellation of pending orders
        if order['status'] != 'pending':
            return jsonify({'error': f'Cannot cancel order with status: {order["status"]}'}), 400
        
        # Update order status to cancelled
        cursor.execute('UPDATE orders SET status = %s WHERE id = %s', ('cancelled', order_id))
        db.commit()
        
        return jsonify({'message': 'Order cancelled successfully', 'orderId': order_id}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003, debug=True)

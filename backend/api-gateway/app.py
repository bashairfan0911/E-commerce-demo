from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from urllib.parse import quote

app = Flask(__name__)
CORS(app)

USER_SERVICE = os.getenv('USER_SERVICE_URL', 'http://user-service:8001')
PRODUCT_SERVICE = os.getenv('PRODUCT_SERVICE_URL', 'http://product-service:8002')
ORDER_SERVICE = os.getenv('ORDER_SERVICE_URL', 'http://order-service:8003')

def forward_request(service_url, path, method='GET', data=None):
    url = f'{service_url}{path}'
    try:
        if method == 'GET':
            response = requests.get(url)
        elif method == 'POST':
            response = requests.post(url, json=data)
        elif method == 'PUT':
            response = requests.put(url, json=data)
        return response.json(), response.status_code
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/api/users/register', methods=['POST'])
def register():
    return forward_request(USER_SERVICE, '/register', 'POST', request.json)

@app.route('/api/users/login', methods=['POST'])
def login():
    return forward_request(USER_SERVICE, '/login', 'POST', request.json)

@app.route('/api/users/google-login', methods=['POST'])
def google_login():
    return forward_request(USER_SERVICE, '/google-login', 'POST', request.json)

@app.route('/api/users/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    return forward_request(USER_SERVICE, f'/profile/{user_id}')

@app.route('/api/users/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    return forward_request(USER_SERVICE, f'/profile/{user_id}', 'PUT', request.json)

@app.route('/api/products', methods=['GET', 'POST'])
def products():
    if request.method == 'GET':
        # Forward the entire query string to preserve URL encoding
        query_string = request.query_string.decode('utf-8')
        path = f'/products?{query_string}' if query_string else '/products'
        return forward_request(PRODUCT_SERVICE, path)
    return forward_request(PRODUCT_SERVICE, '/products', 'POST', request.json)

@app.route('/api/categories', methods=['GET'])
def categories():
    return forward_request(PRODUCT_SERVICE, '/categories')

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    return forward_request(PRODUCT_SERVICE, f'/products/{product_id}')

@app.route('/api/orders', methods=['POST'])
def create_order():
    return forward_request(ORDER_SERVICE, '/orders', 'POST', request.json)

@app.route('/api/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    return forward_request(ORDER_SERVICE, f'/orders/user/{user_id}')

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    return forward_request(ORDER_SERVICE, f'/orders/{order_id}')

@app.route('/api/orders/<int:order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    return forward_request(ORDER_SERVICE, f'/orders/{order_id}/cancel', 'PUT')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

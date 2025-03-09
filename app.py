from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import cv2
import numpy as np
from pyzbar.pyzbar import decode
import re
import requests
from bs4 import BeautifulSoup
import os

app = Flask(__name__)

# Load model and tokenizer once at startup
try:
    model = AutoModelForCausalLM.from_pretrained(
        'Empolean2640/food-model',
        token="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"
    )
    tokenizer = AutoTokenizer.from_pretrained(
        'Empolean2640/food-model',
        token="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"
    )
except Exception as e:
    print(f"Error loading model or tokenizer: {e}")
    exit()

def generate_recommendation(model, tokenizer, int_params, diseases, ingredients, max_length=200):
    """Generate food recommendation based on inputs"""
    input_text = (
        f"<INT_PARAMS>{','.join(map(str, int_params))}</INT_PARAMS> "
        f"<DISEASES>{diseases}</DISEASES> "
        f"<INGREDIENTS>{ingredients}</INGREDIENTS> "
        f"<RECOMMENDATION>"
    )
    inputs = tokenizer(input_text, return_tensors="pt", padding="longest")
    output = model.generate(
        inputs['input_ids'],
        max_length=max_length,
        num_return_sequences=1,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    full_output = tokenizer.decode(output[0], skip_special_tokens=False)
    try:
        recommendation = full_output.split("<RECOMMENDATION>")[1].split("</RECOMMENDATION>")[0].strip()
    except IndexError:
        recommendation = "Error: Recommendation tags not found in output."
    return recommendation

@app.route('/api/recommendation', methods=['POST'])
def get_recommendation():
    try:
        # Get JSON data from the request
        data = request.get_json()
        int_params = data.get('int_params', [])
        diseases = data.get('diseases', '')
        ingredients = data.get('ingredients', '')

        # Generate recommendation
        recommendation = generate_recommendation(model, tokenizer, int_params, diseases, ingredients)
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan', methods=['POST'])
def scan_qr():
    try:
        # Check if a file is included in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        # Check if a file was selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read the image file into memory
        img_array = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({"error": "Failed to decode image"}), 400

        # Convert to grayscale and decode barcode
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        barcodes = decode(gray)

        if not barcodes:
            return jsonify({"error": "No barcode detected"}), 400

        # Process the first barcode found
        barcode = barcodes[0]
        barcode_data = barcode.data.decode('utf-8')
        barcode_type = barcode.type
        text = f"{barcode_data} ({barcode_type})"
        code = text.split()[0]

        # Fetch product info from Open Food Facts API
        r = requests.get(f"https://world.openfoodfacts.org/api/v3/product/{code}.json")
        if r.status_code != 200:
            return jsonify({"error": f"Failed to fetch product data: HTTP {r.status_code}"}), 500
        
        data = r.json()
        product = data.get('product', {})
        
        if not product:
            return jsonify({"error": "Product not found in database"}), 404

        # Extract ingredients
        ingredients_text = product.get('ingredients_text', '')
        s = ""
        if ingredients_text:
            ingre = ingredients_text
            if ingre.count('[') > 0:
                ingre = ingre.replace('[', '(').replace(']', ')')
            if '(' in ingre:
                while '(' in ingre:
                    sub_items = ingre[ingre.find('(')+1:ingre.find(')')].split(', ')
                    s += ' '.join(sub_items) + ' '
                    ingre = ingre[ingre.find(')')+1:].strip()
            else:
                s = ingre
            s = re.sub(r"[\(\)\[\]\*]", "", s).strip()

        # Extract nutriments
        nutriments = product.get('nutriments', {})
        energy = float(nutriments.get('energy-kcal', 0) or 0)
        sugar = float(nutriments.get('sugars', 0) or 0)  # Corrected from 'sugar' to 'sugars'
        sodium = float(nutriments.get('sodium', 0) or 0)
        fat = float(nutriments.get('fat', 0) or 0)
        carbohydrate = float(nutriments.get('carbohydrates', 0) or 0)
        protein = float(nutriments.get('proteins', 0) or 0)  # Corrected from 'protein' to 'proteins'

        return jsonify({
            "barcode": code,
            "barcode_type": barcode_type,
            "nutriments": [energy, sugar, sodium, fat, carbohydrate, protein],
            "ingredients": s.upper()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
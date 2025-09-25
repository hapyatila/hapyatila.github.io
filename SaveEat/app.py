from flask import Flask, request, jsonify, render_template, send_file
import pandas as pd
import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import tempfile
import uuid

app = Flask(__name__)

# File paths
URL_RECIPES_FILE = 'URL_Recipes.csv'
RECIPES_FILE = 'Recipes.csv'

# Initialize CSV files if they don't exist
def init_csv_files():
    if not os.path.exists(URL_RECIPES_FILE):
        pd.DataFrame(columns=['URL', 'Date_Added']).to_csv(URL_RECIPES_FILE, index=False)
    
    if not os.path.exists(RECIPES_FILE):
        pd.DataFrame(columns=[
            'ID', 'Name', 'Ingredients', 'Instructions', 'Number_of_portions', 
            'Date_of_registered', 'URL', 'Status', 'Comment'
        ]).to_csv(RECIPES_FILE, index=False)

# Load recipes from CSV
def load_recipes():
    if os.path.exists(RECIPES_FILE):
        df = pd.read_csv(RECIPES_FILE)
        return df.to_dict('records')
    return []

# Save recipes to CSV
def save_recipes(recipes):
    df = pd.DataFrame(recipes)
    df.to_csv(RECIPES_FILE, index=False)

# Add URL to URL_Recipes.csv
def add_url_to_csv(url):
    df = pd.read_csv(URL_RECIPES_FILE) if os.path.exists(URL_RECIPES_FILE) else pd.DataFrame(columns=['URL', 'Date_Added'])
    new_row = pd.DataFrame({'URL': [url], 'Date_Added': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')]})
    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(URL_RECIPES_FILE, index=False)

# Extract recipe data from URL using web scraping
def extract_recipe_data(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to extract recipe data using common patterns
        recipe_data = {
            'name': '',
            'ingredients': '',
            'instructions': '',
            'portions': 4
        }
        
        # Extract recipe name
        name_selectors = [
            'h1[class*="recipe"]', 'h1[class*="title"]', 
            '.recipe-title', '.recipe-name', 'h1'
        ]
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                recipe_data['name'] = name_elem.get_text().strip()
                break
        
        # Extract ingredients
        ingredients_selectors = [
            '[class*="ingredient"]', '[class*="ingredients"]',
            '.recipe-ingredients', '.ingredients-list'
        ]
        for selector in ingredients_selectors:
            ingredients_elem = soup.select_one(selector)
            if ingredients_elem:
                ingredients_list = ingredients_elem.find_all(['li', 'p', 'span'])
                if ingredients_list:
                    recipe_data['ingredients'] = '\n'.join([item.get_text().strip() for item in ingredients_list])
                else:
                    recipe_data['ingredients'] = ingredients_elem.get_text().strip()
                break
        
        # Extract instructions
        instructions_selectors = [
            '[class*="instruction"]', '[class*="directions"]', '[class*="method"]',
            '.recipe-instructions', '.instructions', '.directions'
        ]
        for selector in instructions_selectors:
            instructions_elem = soup.select_one(selector)
            if instructions_elem:
                instructions_list = instructions_elem.find_all(['li', 'p', 'div'])
                if instructions_list:
                    recipe_data['instructions'] = '\n'.join([f"{i+1}. {item.get_text().strip()}" for i, item in enumerate(instructions_list)])
                else:
                    recipe_data['instructions'] = instructions_elem.get_text().strip()
                break
        
        # Extract portions
        portions_selectors = [
            '[class*="serving"]', '[class*="portion"]', '[class*="yield"]'
        ]
        for selector in portions_selectors:
            portions_elem = soup.select_one(selector)
            if portions_elem:
                text = portions_elem.get_text()
                import re
                numbers = re.findall(r'\d+', text)
                if numbers:
                    recipe_data['portions'] = int(numbers[0])
                break
        
        # If we couldn't extract much, try to get basic info from meta tags
        if not recipe_data['name']:
            title_tag = soup.find('title')
            if title_tag:
                recipe_data['name'] = title_tag.get_text().strip()
        
        if not recipe_data['ingredients'] and not recipe_data['instructions']:
            # Fallback: try to extract any text that might be recipe content
            content_selectors = ['main', 'article', '.content', '.post-content']
            for selector in content_selectors:
                content_elem = soup.select_one(selector)
                if content_elem:
                    text = content_elem.get_text()
                    if len(text) > 100:  # Only if there's substantial content
                        recipe_data['instructions'] = text[:500] + "..." if len(text) > 500 else text
                        break
        
        return recipe_data
        
    except Exception as e:
        print(f"Error extracting recipe data: {e}")
        return None

# Generate PDF book
def generate_pdf_book(recipes, book_name):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    
    doc = SimpleDocTemplate(temp_file.name, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    story.append(Paragraph(book_name, title_style))
    story.append(Spacer(1, 20))
    
    # Table of contents
    story.append(Paragraph("Table of Contents", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    for i, recipe in enumerate(recipes, 1):
        story.append(Paragraph(f"{i}. {recipe['name']}", styles['Normal']))
    
    story.append(PageBreak())
    
    # Recipes
    for i, recipe in enumerate(recipes, 1):
        # Recipe title
        story.append(Paragraph(f"{i}. {recipe['name']}", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        # Meta information
        meta_info = f"<b>Portions:</b> {recipe['portions']}<br/>"
        meta_info += f"<b>Date added:</b> {recipe['date']}<br/>"
        if recipe.get('url'):
            meta_info += f"<b>Source:</b> {recipe['url']}<br/>"
        story.append(Paragraph(meta_info, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Ingredients
        story.append(Paragraph("<b>Ingredients:</b>", styles['Heading3']))
        ingredients_text = recipe['ingredients'].replace('\n', '<br/>')
        story.append(Paragraph(ingredients_text, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Instructions
        story.append(Paragraph("<b>Instructions:</b>", styles['Heading3']))
        instructions_text = recipe['instructions'].replace('\n', '<br/>')
        story.append(Paragraph(instructions_text, styles['Normal']))
        
        if recipe.get('comment'):
            story.append(Spacer(1, 12))
            story.append(Paragraph(f"<b>Notes:</b> {recipe['comment']}", styles['Normal']))
        
        if i < len(recipes):  # Don't add page break after last recipe
            story.append(PageBreak())
    
    doc.build(story)
    return temp_file.name

# Send email with PDF attachment
def send_email_with_pdf(pdf_path, book_name, recipient_email="your-email@example.com"):
    try:
        # Email configuration (you'll need to set these up)
        smtp_server = "smtp.gmail.com"  # Change to your SMTP server
        smtp_port = 587
        sender_email = "your-email@gmail.com"  # Change to your email
        sender_password = "your-app-password"  # Change to your app password
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f"Your Recipe Book: {book_name}"
        
        body = f"""
        Hi!
        
        Here's your personalized recipe book: {book_name}
        
        The PDF contains {len(recipes)} recipes that you selected.
        
        Enjoy cooking!
        
        Best regards,
        SaveEat
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach PDF
        with open(pdf_path, "rb") as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
        
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename= {book_name}.pdf'
        )
        msg.attach(part)
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, recipient_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/newRecipe')
def new_recipe_form():
    url = request.args.get('url', '')
    return render_template('new_recipe.html', url=url)

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    recipes = load_recipes()
    return jsonify(recipes)

@app.route('/api/recipes/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    recipes = load_recipes()
    recipe_index = next((i for i, r in enumerate(recipes) if r['ID'] == recipe_id), None)
    
    if recipe_index is None:
        return jsonify({'error': 'Recipe not found'}), 404
    
    updated_recipe = request.json
    updated_recipe['ID'] = recipe_id
    recipes[recipe_index] = updated_recipe
    save_recipes(recipes)
    
    return jsonify(updated_recipe)

@app.route('/api/extract-recipe', methods=['POST'])
def extract_recipe():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Add URL to URL_Recipes.csv
    add_url_to_csv(url)
    
    # Extract recipe data
    recipe_data = extract_recipe_data(url)
    
    if not recipe_data:
        return jsonify({'error': 'Failed to extract recipe data'}), 400
    
    # Create new recipe
    recipes = load_recipes()
    new_id = max([r['ID'] for r in recipes], default=0) + 1
    
    new_recipe = {
        'ID': new_id,
        'Name': recipe_data['name'] or 'Untitled Recipe',
        'Ingredients': recipe_data['ingredients'] or 'Ingredients not found',
        'Instructions': recipe_data['instructions'] or 'Instructions not found',
        'Number_of_portions': recipe_data['portions'],
        'Date_of_registered': datetime.now().strftime('%Y-%m-%d'),
        'URL': url,
        'Status': 'To Cook',
        'Comment': ''
    }
    
    recipes.append(new_recipe)
    save_recipes(recipes)
    
    return jsonify(new_recipe)

@app.route('/api/generate-book', methods=['POST'])
def generate_book():
    data = request.json
    recipes = data.get('recipes', [])
    book_name = data.get('bookName', 'My Recipe Book')
    
    if not recipes:
        return jsonify({'error': 'No recipes selected'}), 400
    
    try:
        # Generate PDF
        pdf_path = generate_pdf_book(recipes, book_name)
        
        # Send email (you'll need to configure email settings)
        # send_email_with_pdf(pdf_path, book_name)
        
        # For now, just return success
        # In production, you might want to return the PDF file or send it via email
        
        return jsonify({'message': 'Recipe book generated successfully'})
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate book: {str(e)}'}), 500

if __name__ == '__main__':
    init_csv_files()
    app.run(debug=True, host='0.0.0.0', port=5000)

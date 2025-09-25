# SaveEat - Recipe Manager

A web application for managing recipes extracted from URLs, with features for organizing, editing, and generating recipe books.

## Features

- **Recipe Extraction**: Automatically extract recipe data from URLs using web scraping
- **Recipe Management**: View, edit, and organize recipes with status tracking
- **Search & Filter**: Find recipes by name, ingredients, or status
- **Shopping List**: Print ingredients from selected recipes
- **Recipe Book Generation**: Create PDF books with selected recipes and email them

## Setup

### Prerequisites

- Python 3.7+
- pip

### Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python app.py
   ```

4. Open your browser and go to `http://localhost:5000`

## Usage

### Adding Recipes

1. **Via Web Interface**: 
   - Click "Add Recipe" 
   - Paste the recipe URL
   - Click "Extract Recipe"

2. **Via iPhone Shortcut**:
   - Set up a shortcut that opens: `https://your-domain.com/newRecipe?url=[URL]`
   - Share recipe URLs from any app

### Managing Recipes

- **View**: Browse all recipes with search and filter options
- **Edit**: Click "Edit" on any recipe to modify details
- **Status**: Change status to "To Cook", "Validated", or "Rejected"
- **Comments**: Add personal notes to recipes

### Actions

- **Print Ingredients**: Select recipes and print shopping lists
- **Generate Book**: Create PDF books with selected recipes

## File Structure

```
SaveEat/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── index.html
│   └── new_recipe.html
├── static/               # CSS and JavaScript
│   ├── style.css
│   └── script.js
├── URL_Recipes.csv       # URLs to be processed
├── Recipes.csv           # Extracted recipe data
└── README.md
```

## Configuration

### Email Settings (for PDF generation)

Edit `app.py` and update the email configuration:

```python
smtp_server = "smtp.gmail.com"
smtp_port = 587
sender_email = "your-email@gmail.com"
sender_password = "your-app-password"
```

### iPhone Shortcut Setup

1. Open Shortcuts app
2. Create new shortcut
3. Add "Open URLs" action
4. Set URL to: `https://your-domain.com/newRecipe?url=[URL]`
5. Add to Share Sheet

## API Endpoints

- `GET /api/recipes` - Get all recipes
- `POST /api/extract-recipe` - Extract recipe from URL
- `PUT /api/recipes/<id>` - Update recipe
- `POST /api/generate-book` - Generate PDF book

## Data Storage

Recipes are stored in CSV files:
- `URL_Recipes.csv`: URLs to be processed
- `Recipes.csv`: Extracted recipe data with columns:
  - ID, Name, Ingredients, Instructions, Number_of_portions
  - Date_of_registered, URL, Status, Comment

## Troubleshooting

### Recipe Extraction Issues

- Some websites may block scraping
- Try different recipe URLs
- Check console for error messages

### Email Issues

- Verify SMTP settings
- Use app passwords for Gmail
- Check firewall settings

## Development

To extend the application:

1. **Add new recipe sources**: Modify `extract_recipe_data()` in `app.py`
2. **Customize UI**: Edit `static/style.css` and `static/script.js`
3. **Add features**: Extend the Flask routes in `app.py`

## License

This project is open source and available under the MIT License.

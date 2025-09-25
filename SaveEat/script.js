class RecipeManager {
    constructor() {
        this.recipes = [];
        this.selectedRecipes = new Set();
        this.currentFilter = '';
        this.currentSort = 'date';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecipes();
        this.showSection('viewRecipes');
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('viewRecipes').addEventListener('click', () => {
            this.showSection('viewRecipes');
        });

        document.getElementById('addRecipe').addEventListener('click', () => {
            this.showSection('addRecipe');
        });

        // Recipe form
        document.getElementById('recipeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRecipe();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilter = e.target.value;
            this.renderRecipes();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderRecipes();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderRecipes();
        });

        // Actions
        document.getElementById('printIngredients').addEventListener('click', () => {
            this.printIngredients();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editRecipeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecipe();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('recipeModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Handle URL parameters for new recipe
        this.handleUrlParams();
    }

    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeUrl = urlParams.get('url');
        
        if (recipeUrl) {
            // Pre-fill the form with the URL
            document.getElementById('recipeUrl').value = recipeUrl;
            this.showSection('addRecipe');
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        document.getElementById(sectionName + 'Section').classList.remove('hidden');

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
    }

    loadRecipes() {
        // Load from localStorage
        const saved = localStorage.getItem('saveEatRecipes');
        if (saved) {
            this.recipes = JSON.parse(saved);
        } else {
            // Load sample data
            this.loadSampleData();
        }
        this.renderRecipes();
    }

    saveRecipes() {
        localStorage.setItem('saveEatRecipes', JSON.stringify(this.recipes));
    }

    loadSampleData() {
        this.recipes = [
            {
                id: 1,
                name: "Spaghetti Carbonara",
                ingredients: "400g spaghetti, 200g pancetta, 4 eggs, 100g parmesan, black pepper",
                instructions: "1. Cook spaghetti according to package directions. 2. Fry pancetta until crispy. 3. Mix eggs with parmesan and black pepper. 4. Combine hot pasta with pancetta, then add egg mixture. 5. Toss quickly to create creamy sauce.",
                portions: 4,
                date: new Date().toISOString().split('T')[0],
                url: "https://example.com/carbonara",
                status: "To Cook",
                comment: ""
            },
            {
                id: 2,
                name: "Chocolate Chip Cookies",
                ingredients: "250g flour, 150g butter, 100g sugar, 1 egg, 200g chocolate chips, 1 tsp vanilla",
                instructions: "1. Preheat oven to 180°C. 2. Mix dry ingredients in a bowl. 3. Cream butter and sugar until fluffy. 4. Add egg and vanilla. 5. Combine wet and dry ingredients. 6. Fold in chocolate chips. 7. Bake for 12 minutes until golden.",
                portions: 24,
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                url: "https://example.com/cookies",
                status: "Validated",
                comment: "Perfect for kids! Store in airtight container."
            }
        ];
        this.saveRecipes();
    }

    addRecipe() {
        const formData = new FormData(document.getElementById('recipeForm'));
        
        const newRecipe = {
            id: Date.now(), // Simple ID generation
            name: formData.get('name'),
            ingredients: formData.get('ingredients'),
            instructions: formData.get('instructions'),
            portions: parseInt(formData.get('portions')),
            date: new Date().toISOString().split('T')[0],
            url: formData.get('url'),
            status: "To Cook",
            comment: ""
        };

        this.recipes.unshift(newRecipe);
        this.saveRecipes();
        this.renderRecipes();
        
        // Show success message
        const statusDiv = document.getElementById('extractionStatus');
        statusDiv.className = 'status success';
        statusDiv.textContent = 'Recipe added successfully!';
        statusDiv.classList.remove('hidden');
        
        // Clear form
        document.getElementById('recipeForm').reset();
        
        // Switch to recipes view
        setTimeout(() => {
            this.showSection('viewRecipes');
            statusDiv.classList.add('hidden');
        }, 2000);
    }

    renderRecipes() {
        const grid = document.getElementById('recipeGrid');
        let filteredRecipes = [...this.recipes];

        // Apply search filter
        if (this.currentFilter && this.currentFilter !== '') {
            const searchTerm = this.currentFilter.toLowerCase();
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.ingredients.toLowerCase().includes(searchTerm) ||
                recipe.status.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (document.getElementById('statusFilter').value) {
            const statusFilter = document.getElementById('statusFilter').value;
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.status === statusFilter
            );
        }

        // Apply sorting
        filteredRecipes.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'date':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        // Render recipes
        grid.innerHTML = filteredRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    createRecipeCard(recipe) {
        const isSelected = this.selectedRecipes.has(recipe.id);
        const statusClass = `status-${recipe.status.toLowerCase().replace(' ', '-')}`;
        
        return `
            <div class="recipe-card ${isSelected ? 'selected' : ''}" data-id="${recipe.id}">
                <input type="checkbox" class="checkbox" ${isSelected ? 'checked' : ''} 
                       onchange="recipeManager.toggleSelection(${recipe.id})">
                
                <div class="recipe-header">
                    <div>
                        <div class="recipe-name">${recipe.name}</div>
                        <div class="recipe-meta">
                            <span>📅 ${new Date(recipe.date).toLocaleDateString()}</span>
                            <span>👥 ${recipe.portions} portions</span>
                        </div>
                    </div>
                    <span class="recipe-status ${statusClass}">${recipe.status}</span>
                </div>

                <div class="recipe-ingredients">
                    <h4>Ingredients:</h4>
                    <p>${recipe.ingredients}</p>
                </div>

                <div class="recipe-actions">
                    <button class="btn btn-secondary" onclick="recipeManager.editRecipe(${recipe.id})">
                        Edit
                    </button>
                    <button class="btn btn-primary" onclick="recipeManager.viewRecipe(${recipe.id})">
                        View
                    </button>
                    <button class="btn btn-danger" onclick="recipeManager.deleteRecipe(${recipe.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    toggleSelection(recipeId) {
        if (this.selectedRecipes.has(recipeId)) {
            this.selectedRecipes.delete(recipeId);
        } else {
            this.selectedRecipes.add(recipeId);
        }
        this.renderRecipes();
    }

    editRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Populate form
        document.getElementById('editRecipeId').value = recipe.id;
        document.getElementById('editName').value = recipe.name;
        document.getElementById('editIngredients').value = recipe.ingredients;
        document.getElementById('editInstructions').value = recipe.instructions;
        document.getElementById('editPortions').value = recipe.portions;
        document.getElementById('editStatus').value = recipe.status;
        document.getElementById('editComment').value = recipe.comment || '';

        // Show modal
        document.getElementById('recipeModal').classList.remove('hidden');
    }

    viewRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Create a detailed view
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>${recipe.name}</h2>
                <div class="recipe-detail">
                    <p><strong>Date:</strong> ${new Date(recipe.date).toLocaleDateString()}</p>
                    <p><strong>Portions:</strong> ${recipe.portions}</p>
                    <p><strong>Status:</strong> ${recipe.status}</p>
                    ${recipe.url ? `<p><strong>Source:</strong> <a href="${recipe.url}" target="_blank">${recipe.url}</a></p>` : ''}
                    ${recipe.comment ? `<p><strong>Notes:</strong> ${recipe.comment}</p>` : ''}
                    
                    <h3>Ingredients:</h3>
                    <div class="ingredients-list">${recipe.ingredients.replace(/\n/g, '<br>')}</div>
                    
                    <h3>Instructions:</h3>
                    <div class="instructions-list">${recipe.instructions.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            this.selectedRecipes.delete(recipeId);
            this.saveRecipes();
            this.renderRecipes();
        }
    }

    async saveRecipe() {
        const recipeId = parseInt(document.getElementById('editRecipeId').value);
        const recipe = this.recipes.find(r => r.id === recipeId);
        
        if (!recipe) return;

        // Update recipe data
        recipe.name = document.getElementById('editName').value;
        recipe.ingredients = document.getElementById('editIngredients').value;
        recipe.instructions = document.getElementById('editInstructions').value;
        recipe.portions = parseInt(document.getElementById('editPortions').value);
        recipe.status = document.getElementById('editStatus').value;
        recipe.comment = document.getElementById('editComment').value;

        this.saveRecipes();
        this.renderRecipes();
        this.closeModal();
    }

    closeModal() {
        document.getElementById('recipeModal').classList.add('hidden');
    }

    printIngredients() {
        if (this.selectedRecipes.size === 0) {
            alert('Please select at least one recipe to print ingredients.');
            return;
        }

        const selectedRecipes = this.recipes.filter(r => this.selectedRecipes.has(r.id));
        
        let printContent = `
            <html>
            <head>
                <title>Shopping List</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #2c3e50; }
                    .recipe { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
                    .recipe h2 { color: #3498db; margin-bottom: 10px; }
                    .ingredients { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>🛒 Shopping List</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
        `;

        selectedRecipes.forEach(recipe => {
            printContent += `
                <div class="recipe">
                    <h2>${recipe.name}</h2>
                    <div class="ingredients">
                        <strong>Ingredients:</strong><br>
                        ${recipe.ingredients.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        });

        printContent += '</body></html>';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    exportData() {
        const dataStr = JSON.stringify(this.recipes, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `saveEat-recipes-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedRecipes = JSON.parse(e.target.result);
                if (Array.isArray(importedRecipes)) {
                    this.recipes = importedRecipes;
                    this.saveRecipes();
                    this.renderRecipes();
                    alert('Recipes imported successfully!');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                alert('Error importing recipes. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application
const recipeManager = new RecipeManager();

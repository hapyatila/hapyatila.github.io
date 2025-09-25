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

        document.getElementById('generateBook').addEventListener('click', () => {
            this.generateBook();
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

    async loadRecipes() {
        try {
            const response = await fetch('/api/recipes');
            if (response.ok) {
                this.recipes = await response.json();
                this.renderRecipes();
            } else {
                console.error('Failed to load recipes');
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            // Load sample data for demo
            this.loadSampleData();
        }
    }

    loadSampleData() {
        this.recipes = [
            {
                id: 1,
                name: "Spaghetti Carbonara",
                ingredients: "400g spaghetti, 200g pancetta, 4 eggs, 100g parmesan, black pepper",
                instructions: "1. Cook spaghetti. 2. Fry pancetta. 3. Mix eggs with parmesan. 4. Combine all ingredients.",
                portions: 4,
                date: "2024-01-15",
                url: "https://example.com/carbonara",
                status: "To Cook",
                comment: ""
            },
            {
                id: 2,
                name: "Chocolate Chip Cookies",
                ingredients: "250g flour, 150g butter, 100g sugar, 1 egg, 200g chocolate chips",
                instructions: "1. Mix dry ingredients. 2. Cream butter and sugar. 3. Add egg. 4. Combine and add chocolate chips. 5. Bake at 180°C for 12 minutes.",
                portions: 24,
                date: "2024-01-14",
                url: "https://example.com/cookies",
                status: "Validated",
                comment: "Perfect for kids!"
            }
        ];
        this.renderRecipes();
    }

    async addRecipe() {
        const url = document.getElementById('recipeUrl').value;
        const statusDiv = document.getElementById('extractionStatus');
        
        statusDiv.className = 'status loading';
        statusDiv.textContent = 'Extracting recipe data...';
        statusDiv.classList.remove('hidden');

        try {
            const response = await fetch('/api/extract-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            if (response.ok) {
                const newRecipe = await response.json();
                this.recipes.unshift(newRecipe);
                this.renderRecipes();
                
                statusDiv.className = 'status success';
                statusDiv.textContent = 'Recipe extracted successfully!';
                
                // Clear form
                document.getElementById('recipeForm').reset();
                
                // Switch to recipes view
                setTimeout(() => {
                    this.showSection('viewRecipes');
                    statusDiv.classList.add('hidden');
                }, 2000);
            } else {
                throw new Error('Failed to extract recipe');
            }
        } catch (error) {
            console.error('Error extracting recipe:', error);
            statusDiv.className = 'status error';
            statusDiv.textContent = 'Failed to extract recipe. Please try again.';
        }
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

        // Create a detailed view (could be a separate modal or page)
        alert(`Recipe: ${recipe.name}\n\nIngredients:\n${recipe.ingredients}\n\nInstructions:\n${recipe.instructions}`);
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

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe)
            });

            if (response.ok) {
                this.renderRecipes();
                this.closeModal();
            } else {
                throw new Error('Failed to save recipe');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Failed to save recipe. Please try again.');
        }
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

    async generateBook() {
        if (this.selectedRecipes.size === 0) {
            alert('Please select at least one recipe to generate a book.');
            return;
        }

        const selectedRecipes = this.recipes.filter(r => this.selectedRecipes.has(r.id));
        
        try {
            const response = await fetch('/api/generate-book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    recipes: selectedRecipes,
                    bookName: `My Recipe Book - ${new Date().toLocaleDateString()}`
                })
            });

            if (response.ok) {
                alert('Recipe book generated and sent to your email!');
            } else {
                throw new Error('Failed to generate book');
            }
        } catch (error) {
            console.error('Error generating book:', error);
            alert('Failed to generate recipe book. Please try again.');
        }
    }
}

// Initialize the application
const recipeManager = new RecipeManager();

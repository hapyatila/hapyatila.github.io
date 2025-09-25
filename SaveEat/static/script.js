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
                ID: 1,
                Name: "Spaghetti Carbonara",
                Ingredients: "400g spaghetti, 200g pancetta, 4 eggs, 100g parmesan, black pepper",
                Instructions: "1. Cook spaghetti. 2. Fry pancetta. 3. Mix eggs with parmesan. 4. Combine all ingredients.",
                Number_of_portions: 4,
                Date_of_registered: "2024-01-15",
                URL: "https://example.com/carbonara",
                Status: "To Cook",
                Comment: ""
            },
            {
                ID: 2,
                Name: "Chocolate Chip Cookies",
                Ingredients: "250g flour, 150g butter, 100g sugar, 1 egg, 200g chocolate chips",
                Instructions: "1. Mix dry ingredients. 2. Cream butter and sugar. 3. Add egg. 4. Combine and add chocolate chips. 5. Bake at 180°C for 12 minutes.",
                Number_of_portions: 24,
                Date_of_registered: "2024-01-14",
                URL: "https://example.com/cookies",
                Status: "Validated",
                Comment: "Perfect for kids!"
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
                recipe.Name.toLowerCase().includes(searchTerm) ||
                recipe.Ingredients.toLowerCase().includes(searchTerm) ||
                recipe.Status.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (document.getElementById('statusFilter').value) {
            const statusFilter = document.getElementById('statusFilter').value;
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.Status === statusFilter
            );
        }

        // Apply sorting
        filteredRecipes.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.Name.localeCompare(b.Name);
                case 'status':
                    return a.Status.localeCompare(b.Status);
                case 'date':
                default:
                    return new Date(b.Date_of_registered) - new Date(a.Date_of_registered);
            }
        });

        // Render recipes
        grid.innerHTML = filteredRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    createRecipeCard(recipe) {
        const isSelected = this.selectedRecipes.has(recipe.ID);
        const statusClass = `status-${recipe.Status.toLowerCase().replace(' ', '-')}`;
        
        return `
            <div class="recipe-card ${isSelected ? 'selected' : ''}" data-id="${recipe.ID}">
                <input type="checkbox" class="checkbox" ${isSelected ? 'checked' : ''} 
                       onchange="recipeManager.toggleSelection(${recipe.ID})">
                
                <div class="recipe-header">
                    <div>
                        <div class="recipe-name">${recipe.Name}</div>
                        <div class="recipe-meta">
                            <span>📅 ${new Date(recipe.Date_of_registered).toLocaleDateString()}</span>
                            <span>👥 ${recipe.Number_of_portions} portions</span>
                        </div>
                    </div>
                    <span class="recipe-status ${statusClass}">${recipe.Status}</span>
                </div>

                <div class="recipe-ingredients">
                    <h4>Ingredients:</h4>
                    <p>${recipe.Ingredients}</p>
                </div>

                <div class="recipe-actions">
                    <button class="btn btn-secondary" onclick="recipeManager.editRecipe(${recipe.ID})">
                        Edit
                    </button>
                    <button class="btn btn-primary" onclick="recipeManager.viewRecipe(${recipe.ID})">
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
        const recipe = this.recipes.find(r => r.ID === recipeId);
        if (!recipe) return;

        // Populate form
        document.getElementById('editRecipeId').value = recipe.ID;
        document.getElementById('editName').value = recipe.Name;
        document.getElementById('editIngredients').value = recipe.Ingredients;
        document.getElementById('editInstructions').value = recipe.Instructions;
        document.getElementById('editPortions').value = recipe.Number_of_portions;
        document.getElementById('editStatus').value = recipe.Status;
        document.getElementById('editComment').value = recipe.Comment || '';

        // Show modal
        document.getElementById('recipeModal').classList.remove('hidden');
    }

    viewRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.ID === recipeId);
        if (!recipe) return;

        // Create a detailed view (could be a separate modal or page)
        alert(`Recipe: ${recipe.Name}\n\nIngredients:\n${recipe.Ingredients}\n\nInstructions:\n${recipe.Instructions}`);
    }

    async saveRecipe() {
        const recipeId = parseInt(document.getElementById('editRecipeId').value);
        const recipe = this.recipes.find(r => r.ID === recipeId);
        
        if (!recipe) return;

        // Update recipe data
        recipe.Name = document.getElementById('editName').value;
        recipe.Ingredients = document.getElementById('editIngredients').value;
        recipe.Instructions = document.getElementById('editInstructions').value;
        recipe.Number_of_portions = parseInt(document.getElementById('editPortions').value);
        recipe.Status = document.getElementById('editStatus').value;
        recipe.Comment = document.getElementById('editComment').value;

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

        const selectedRecipes = this.recipes.filter(r => this.selectedRecipes.has(r.ID));
        
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
                    <h2>${recipe.Name}</h2>
                    <div class="ingredients">
                        <strong>Ingredients:</strong><br>
                        ${recipe.Ingredients.replace(/\n/g, '<br>')}
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

        const selectedRecipes = this.recipes.filter(r => this.selectedRecipes.has(r.ID));
        
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

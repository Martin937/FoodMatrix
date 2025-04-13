console.log('Cookbook page loaded');

document.addEventListener('DOMContentLoaded', () => {
	// Заглушка данных
	const recipes = [
		{ id: 1, name: 'Омлет', category: 'breakfast', time: '15 мин' },
		{ id: 2, name: 'Салат Цезарь', category: 'dinner', time: '25 мин' }
	];

	const renderRecipes = () => {
		const container = document.getElementById('recipeList');
		container.innerHTML = recipes.map(recipe => `
      <div class="recipe-card">
        <h3>${recipe.name}</h3>
        <p>Категория: ${recipe.category}</p>
        <p>Время приготовления: ${recipe.time}</p>
      </div>
    `).join('');
	};

	renderRecipes();
});
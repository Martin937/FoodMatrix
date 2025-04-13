console.log('Nutrition Table page loaded');

document.addEventListener('DOMContentLoaded', () => {
	// Заглушка данных
	const products = [
		{ name: 'Яблоко', category: 'fruits', calories: 52, proteins: 0.3, fats: 0.2, carbs: 14 },
		{ name: 'Морковь', category: 'vegetables', calories: 41, proteins: 0.9, fats: 0.2, carbs: 10 }
	];

	const renderProducts = () => {
		const tbody = document.getElementById('productTableBody');
		tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.calories}</td>
        <td>${product.proteins}</td>
        <td>${product.fats}</td>
        <td>${product.carbs}</td>
      </tr>
    `).join('');
	};

	renderProducts();
});
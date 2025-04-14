console.log('Nutrition Table page loaded');

document.addEventListener('DOMContentLoaded', () => {
	// Инициализация данных
	let products = [
		{
			name: 'Яблоко',
			category: 'Фрукты',
			calories: 52,
			proteins: 0.3,
			fats: 0.2,
			carbs: 14,
			vitamins: 'С, В1',
			minerals: 'Калий'
		},
		{
			name: 'Морковь',
			category: 'Овощи',
			calories: 41,
			proteins: 0.9,
			fats: 0.2,
			carbs: 10,
			vitamins: 'А, К',
			minerals: 'Калий, Магний'
		}
	];

	// Элементы DOM
	const tableBody = document.getElementById('productTableBody');
	const searchInput = document.getElementById('product-search');
	const modal = document.getElementById('product-modal');
	const modalTitle = document.getElementById('modal-title');
	const productForm = document.getElementById('product-form');
	const openModalBtn = document.getElementById('add-product');
	const closeModalBtn = document.querySelector('.close-modal');
	const cancelBtn = document.getElementById('cancel-btn');

	// Текущий редактируемый продукт
	let currentProductId = null;
	let sortState = { column: null, direction: 'asc' };

	// Рендер таблицы
	const renderProducts = (data = products) => {
		tableBody.innerHTML = data.map((product, index) => `
            <tr data-id="${index}">
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.calories}</td>
                <td>${product.proteins}</td>
                <td>${product.fats}</td>
                <td>${product.carbs}</td>
                <td>${product.vitamins}</td>
                <td>${product.minerals}</td>
                <td class="actions">
                    <span class="edit-btn" title="Редактировать">✏️</span>
                    <span class="delete-btn" title="Удалить">🗑️</span>
                </td>
            </tr>
        `).join('');
	};

	// Валидация числовых полей
	const validateNumberInput = (input, maxValue) => {
		let value = parseFloat(input.value);

		if (isNaN(value)) {
			input.value = '';
			return false;
		}

		if (value < 0) {
			input.value = '0';
			value = 0;
		} else if (value > maxValue) {
			input.value = maxValue.toString();
			value = maxValue;
		}

		// Округление до 1 знака
		const rounded = Math.round(value * 10) / 10;
		if (rounded !== value) {
			input.value = rounded.toFixed(1);
		}

		return true;
	};

	// Проверка всей формы
	const validateForm = () => {
		const fields = [
			{ id: 'modal-name', name: 'Название', type: 'text', min: 2, max: 100 },
			{ id: 'modal-category', name: 'Категория', type: 'select' },
			{ id: 'modal-calories', name: 'Калории', type: 'number', max: 1000 },
			{ id: 'modal-proteins', name: 'Белки', type: 'number', max: 100 },
			{ id: 'modal-fats', name: 'Жиры', type: 'number', max: 100 },
			{ id: 'modal-carbs', name: 'Углеводы', type: 'number', max: 150 }
		];

		for (const field of fields) {
			const element = document.getElementById(field.id);

			if (field.type === 'text') {
				if (element.value.length < field.min || element.value.length > field.max) {
					alert(`${field.name} должно содержать ${field.min}-${field.max} символов`);
					element.focus();
					return false;
				}
			} else if (field.type === 'select' && !element.value) {
				alert(`Выберите ${field.name.toLowerCase()}`);
				element.focus();
				return false;
			} else if (field.type === 'number') {
				const value = parseFloat(element.value);
				if (isNaN(value) || value < 0 || value > field.max) {
					alert(`${field.name} должно быть числом от 0 до ${field.max}`);
					element.focus();
					return false;
				}
			}
		}

		return true;
	};

	// Сортировка данных
	const sortData = (column) => {
		if (sortState.column === column) {
			sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortState.column = column;
			sortState.direction = 'asc';
		}

		products.sort((a, b) => {
			let valA = a[column];
			let valB = b[column];

			// Для числовых колонок
			const numericColumns = ['calories', 'proteins', 'fats', 'carbs'];
			if (numericColumns.includes(column)) {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
				return sortState.direction === 'asc' ? valA - valB : valB - valA;
			}

			// Для текстовых колонок
			if (typeof valA === 'string') valA = valA.toLowerCase();
			if (typeof valB === 'string') valB = valB.toLowerCase();

			return sortState.direction === 'asc'
				? String(valA).localeCompare(String(valB))
				: String(valB).localeCompare(String(valA));
		});

		// Обновление UI
		document.querySelectorAll('[data-sort]').forEach(th => {
			const icon = th.querySelector('.sort-icon');
			if (th.dataset.sort === column) {
				icon.textContent = sortState.direction === 'asc' ? '↑' : '↓';
				th.classList.add('active-sort');
			} else {
				icon.textContent = '';
				th.classList.remove('active-sort');
			}
		});

		renderProducts();
	};

	// Поиск продуктов
	const searchProducts = () => {
		const term = searchInput.value.toLowerCase();
		if (!term) {
			renderProducts(products);
			return;
		}

		const filtered = products.filter(p =>
			p.name.toLowerCase().includes(term) ||
			p.category.toLowerCase().includes(term) ||
			p.vitamins.toLowerCase().includes(term) ||
			p.minerals.toLowerCase().includes(term)
		);

		renderProducts(filtered);
	};

	// Управление модальным окном
	const openModal = (product = null) => {
		currentProductId = product ? products.indexOf(product) : null;

		modalTitle.textContent = product ? 'Редактировать продукт' : 'Добавить продукт';

		if (product) {
			document.getElementById('modal-name').value = product.name;
			document.getElementById('modal-category').value = product.category;
			document.getElementById('modal-calories').value = product.calories;
			document.getElementById('modal-proteins').value = product.proteins;
			document.getElementById('modal-fats').value = product.fats;
			document.getElementById('modal-carbs').value = product.carbs;
			document.getElementById('modal-vitamins').value = product.vitamins;
			document.getElementById('modal-minerals').value = product.minerals;
		} else {
			productForm.reset();
		}

		modal.classList.add('active');
	};

	const closeModal = () => {
		modal.classList.remove('active');
		currentProductId = null;
	};

	// Обработчики событий
	openModalBtn.addEventListener('click', () => openModal());
	closeModalBtn.addEventListener('click', closeModal);
	cancelBtn.addEventListener('click', closeModal);

	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});

	productForm.addEventListener('submit', (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		const product = {
			name: document.getElementById('modal-name').value.trim(),
			category: document.getElementById('modal-category').value,
			calories: parseFloat(document.getElementById('modal-calories').value),
			proteins: parseFloat(document.getElementById('modal-proteins').value),
			fats: parseFloat(document.getElementById('modal-fats').value),
			carbs: parseFloat(document.getElementById('modal-carbs').value),
			vitamins: document.getElementById('modal-vitamins').value.trim(),
			minerals: document.getElementById('modal-minerals').value.trim()
		};

		if (currentProductId !== null) {
			products[currentProductId] = product;
		} else {
			products.push(product);
		}

		renderProducts();
		closeModal();
	});

	// Редактирование/удаление
	tableBody.addEventListener('click', (e) => {
		const row = e.target.closest('tr');
		if (!row) return;

		const productId = parseInt(row.dataset.id);
		const product = products[productId];

		if (e.target.classList.contains('edit-btn')) {
			openModal(product);
		} else if (e.target.classList.contains('delete-btn')) {
			if (confirm(`Удалить "${product.name}"?`)) {
				products.splice(productId, 1);
				renderProducts();
			}
		}
	});

	// Сортировка
	document.querySelectorAll('[data-sort]').forEach(th => {
		th.addEventListener('click', () => sortData(th.dataset.sort));
	});

	// Поиск
	searchInput.addEventListener('input', searchProducts);

	// Валидация в реальном времени
	document.getElementById('modal-calories').addEventListener('input', () =>
		validateNumberInput(document.getElementById('modal-calories'), 1000));
	document.getElementById('modal-proteins').addEventListener('input', () =>
		validateNumberInput(document.getElementById('modal-proteins'), 100));
	document.getElementById('modal-fats').addEventListener('input', () =>
		validateNumberInput(document.getElementById('modal-fats'), 100));
	document.getElementById('modal-carbs').addEventListener('input', () =>
		validateNumberInput(document.getElementById('modal-carbs'), 150));

	// Инициализация
	renderProducts();
});
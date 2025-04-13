console.log('Dashboard page loaded');

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');

	window.electronAPI.on('app-ready', async () => {
		const products = await window.electronAPI.invoke('db-query', {
			sql: 'SELECT * FROM products'
		});
		console.log('Products:', products);
	});

	// Безопасный доступ к API
	const electronAPI = window.electronAPI || {
		invoke: () => console.warn('Electron API not available'),
		on: () => { }
	};

	// Навигация
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.addEventListener('click', async () => {
			const page = btn.dataset.page;
			try {
				const result = await window.electronAPI.createWindow(page);
				if (!result.success) {
					console.error('Failed to create window');
				}
			} catch (err) {
				console.error('IPC error:', err);
			}
		});
	});

	// Темы
	electronAPI.on('theme-changed', (theme) => {
		document.documentElement.setAttribute('data-theme', theme);
	});

	// Заглушка для данных клиентов
	const clients = [
		{ id: 1, name: 'Иван Петров', lastVisit: '2023-10-15' },
		{ id: 2, name: 'Мария Сидорова', lastVisit: '2023-10-14' },
	];

	// Рендер списка клиентов
	const renderClients = () => {
		const container = document.querySelector('.client-list');
		container.innerHTML = clients.map(client => `
      <div class="client-card">
        <h3>${client.name}</h3>
        <p>Последний визит: ${client.lastVisit}</p>
      </div>
    `).join('');
	};

	renderClients();


	// -----------------
});
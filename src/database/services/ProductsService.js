class ProductsService {
	constructor(db) {
		this.db = db;
	}

	async getAll() {
		return this.db.query('SELECT * FROM products ORDER BY name');
	}

	async add(product) {
		const { name, category, calories, proteins, fats, carbs } = product;
		const result = await this.db.run(
			`INSERT INTO products
       (name, category, calories, proteins, fats, carbs)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[name, category, calories, proteins, fats, carbs]
		);
		return this.getById(result.lastID);
	}

	async getById(id) {
		const [product] = await this.db.query(
			'SELECT * FROM products WHERE id = ?',
			[id]
		);
		return product || null;
	}

	async search(query) {
		return this.db.query(
			'SELECT * FROM products WHERE name LIKE ?',
			[`%${query}%`]
		);
	}
}

module.exports = ProductsService;
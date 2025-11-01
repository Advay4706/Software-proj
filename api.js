// Simple Backend API Simulation for SmartCart

class SmartCartAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api'; // Simulated API endpoint
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize database structure if not exists
        if (!localStorage.getItem('smartcart_api_db')) {
            const initialDB = {
                users: {},
                shoppingLists: {},
                orders: {},
                offers: this.getDefaultOffers(),
                items: this.getItemDatabase(),
                lastId: 0
            };
            localStorage.setItem('smartcart_api_db', JSON.stringify(initialDB));
        }
    }

    getDatabase() {
        return JSON.parse(localStorage.getItem('smartcart_api_db'));
    }

    saveDatabase(db) {
        localStorage.setItem('smartcart_api_db', JSON.stringify(db));
    }

    getItemDatabase() {
        return {
            // Groceries
            'rice': { name: 'Rice (1kg)', category: 'groceries', price: 60, unit: '1kg' },
            'wheat': { name: 'Wheat Flour (1kg)', category: 'groceries', price: 45, unit: '1kg' },
            'sugar': { name: 'Sugar (1kg)', category: 'groceries', price: 50, unit: '1kg' },
            'salt': { name: 'Salt (1kg)', category: 'groceries', price: 25, unit: '1kg' },
            'oil': { name: 'Cooking Oil (1L)', category: 'groceries', price: 120, unit: '1L' },
            'dal': { name: 'Dal/Lentils (1kg)', category: 'groceries', price: 80, unit: '1kg' },
            'tea': { name: 'Tea (250g)', category: 'groceries', price: 150, unit: '250g' },
            'coffee': { name: 'Coffee (200g)', category: 'groceries', price: 200, unit: '200g' },
            'biscuits': { name: 'Biscuits (200g)', category: 'groceries', price: 30, unit: '200g' },
            'bread': { name: 'Bread (400g)', category: 'groceries', price: 25, unit: '400g' },

            // Vegetables
            'onion': { name: 'Onion (1kg)', category: 'vegetables', price: 40, unit: '1kg' },
            'potato': { name: 'Potato (1kg)', category: 'vegetables', price: 30, unit: '1kg' },
            'tomato': { name: 'Tomato (1kg)', category: 'vegetables', price: 50, unit: '1kg' },
            'carrot': { name: 'Carrot (1kg)', category: 'vegetables', price: 60, unit: '1kg' },
            'cabbage': { name: 'Cabbage (1kg)', category: 'vegetables', price: 35, unit: '1kg' },
            'cauliflower': { name: 'Cauliflower (1kg)', category: 'vegetables', price: 45, unit: '1kg' },
            'beans': { name: 'Green Beans (1kg)', category: 'vegetables', price: 70, unit: '1kg' },
            'spinach': { name: 'Spinach (1kg)', category: 'vegetables', price: 40, unit: '1kg' },
            'pepper': { name: 'Bell Pepper (1kg)', category: 'vegetables', price: 80, unit: '1kg' },
            'cucumber': { name: 'Cucumber (1kg)', category: 'vegetables', price: 35, unit: '1kg' },

            // Fruits
            'apple': { name: 'Apple (1kg)', category: 'fruits', price: 150, unit: '1kg' },
            'banana': { name: 'Banana (1kg)', category: 'fruits', price: 50, unit: '1kg' },
            'orange': { name: 'Orange (1kg)', category: 'fruits', price: 80, unit: '1kg' },
            'mango': { name: 'Mango (1kg)', category: 'fruits', price: 120, unit: '1kg' },
            'grapes': { name: 'Grapes (1kg)', category: 'fruits', price: 100, unit: '1kg' },
            'pomegranate': { name: 'Pomegranate (1kg)', category: 'fruits', price: 200, unit: '1kg' },
            'watermelon': { name: 'Watermelon (1kg)', category: 'fruits', price: 25, unit: '1kg' },
            'papaya': { name: 'Papaya (1kg)', category: 'fruits', price: 40, unit: '1kg' },
            'pineapple': { name: 'Pineapple (1pc)', category: 'fruits', price: 60, unit: '1pc' },
            'coconut': { name: 'Coconut (1pc)', category: 'fruits', price: 30, unit: '1pc' },

            // Dairy & Meat
            'milk': { name: 'Milk (1L)', category: 'dairy', price: 55, unit: '1L' },
            'curd': { name: 'Curd (500g)', category: 'dairy', price: 40, unit: '500g' },
            'paneer': { name: 'Paneer (250g)', category: 'dairy', price: 80, unit: '250g' },
            'butter': { name: 'Butter (100g)', category: 'dairy', price: 60, unit: '100g' },
            'cheese': { name: 'Cheese (200g)', category: 'dairy', price: 120, unit: '200g' },
            'eggs': { name: 'Eggs (12pcs)', category: 'dairy', price: 70, unit: '12pcs' },
            'chicken': { name: 'Chicken (1kg)', category: 'meat', price: 200, unit: '1kg' },
            'mutton': { name: 'Mutton (1kg)', category: 'meat', price: 600, unit: '1kg' },
            'fish': { name: 'Fish (1kg)', category: 'meat', price: 300, unit: '1kg' },
            'prawns': { name: 'Prawns (1kg)', category: 'meat', price: 400, unit: '1kg' }
        };
    }

    getDefaultOffers() {
        return {
            dairy10: {
                id: 'dairy10',
                title: 'Dairy Products',
                description: 'Get 10% off on all dairy products',
                discount: 10,
                type: 'percentage',
                category: 'dairy',
                minAmount: 200,
                active: true
            },
            bulk500: {
                id: 'bulk500',
                title: 'Bulk Shopping',
                description: '₹500 off on orders above ₹5000',
                discount: 500,
                type: 'fixed',
                category: 'all',
                minAmount: 5000,
                active: true
            },
            vegetables15: {
                id: 'vegetables15',
                title: 'Fresh Vegetables',
                description: '15% off on fresh vegetables',
                discount: 15,
                type: 'percentage',
                category: 'vegetables',
                minAmount: 300,
                active: true
            },
            fruits20: {
                id: 'fruits20',
                title: 'Seasonal Fruits',
                description: '20% off on seasonal fruits',
                discount: 20,
                type: 'percentage',
                category: 'fruits',
                minAmount: 250,
                active: true
            }
        };
    }

    // Simulate API delay
    async delay(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // GET /api/items - Search items
    async searchItems(query, userId) {
        await this.delay();
        const db = this.getDatabase();
        const items = db.items;
        
        const results = Object.keys(items)
            .filter(key => 
                items[key].name.toLowerCase().includes(query.toLowerCase()) ||
                key.toLowerCase().includes(query.toLowerCase())
            )
            .map(key => ({
                id: key,
                ...items[key]
            }))
            .slice(0, 5); // Limit to 5 results

        return { success: true, data: results };
    }

    // GET /api/shopping-list/:userId - Get user's shopping list
    async getShoppingList(userId) {
        await this.delay();
        const db = this.getDatabase();
        const userList = db.shoppingLists[userId] || [];
        return { success: true, data: userList };
    }

    // POST /api/shopping-list - Add item to shopping list
    async addItemToList(userId, item) {
        await this.delay();
        const db = this.getDatabase();
        
        if (!db.shoppingLists[userId]) {
            db.shoppingLists[userId] = [];
        }

        const newItem = {
            id: ++db.lastId,
            ...item,
            dateAdded: new Date().toISOString(),
            userId: userId
        };

        db.shoppingLists[userId].push(newItem);
        this.saveDatabase(db);

        return { success: true, data: newItem };
    }

    // PUT /api/shopping-list/:id - Update item (mark as bought, edit)
    async updateItem(userId, itemId, updates) {
        await this.delay();
        const db = this.getDatabase();
        const userList = db.shoppingLists[userId] || [];
        
        const itemIndex = userList.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            return { success: false, message: 'Item not found' };
        }

        userList[itemIndex] = { ...userList[itemIndex], ...updates };
        this.saveDatabase(db);

        return { success: true, data: userList[itemIndex] };
    }

    // DELETE /api/shopping-list/:id - Remove item
    async removeItem(userId, itemId) {
        await this.delay();
        const db = this.getDatabase();
        const userList = db.shoppingLists[userId] || [];
        
        const filteredList = userList.filter(item => item.id !== itemId);
        db.shoppingLists[userId] = filteredList;
        this.saveDatabase(db);

        return { success: true, message: 'Item removed' };
    }

    // POST /api/orders - Create order (when items are purchased)
    async createOrder(userId, items) {
        await this.delay();
        const db = this.getDatabase();
        
        if (!db.orders[userId]) {
            db.orders[userId] = [];
        }

        const order = {
            id: ++db.lastId,
            userId: userId,
            items: items,
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'completed'
        };

        db.orders[userId].push(order);
        
        // Remove purchased items from shopping list
        const userList = db.shoppingLists[userId] || [];
        const purchasedIds = items.map(item => item.id);
        db.shoppingLists[userId] = userList.filter(item => !purchasedIds.includes(item.id));
        
        this.saveDatabase(db);

        return { success: true, data: order };
    }

    // GET /api/orders/:userId - Get user's order history
    async getOrders(userId, filter = 'all') {
        await this.delay();
        const db = this.getDatabase();
        let orders = db.orders[userId] || [];

        // Apply filter
        const now = new Date();
        switch (filter) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                orders = orders.filter(order => new Date(order.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                orders = orders.filter(order => new Date(order.date) >= monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                orders = orders.filter(order => new Date(order.date) >= yearAgo);
                break;
        }

        return { success: true, data: orders.reverse() }; // Most recent first
    }

    // GET /api/offers - Get active offers
    async getOffers() {
        await this.delay();
        const db = this.getDatabase();
        const activeOffers = Object.values(db.offers).filter(offer => offer.active);
        return { success: true, data: activeOffers };
    }

    // POST /api/offers/check - Check applicable offers for current cart
    async checkOffers(userId, cartItems) {
        await this.delay();
        const db = this.getDatabase();
        const offers = db.offers;
        const applicableOffers = [];

        for (const offer of Object.values(offers)) {
            if (!offer.active) continue;

            let categoryTotal = 0;
            let totalAmount = 0;

            cartItems.forEach(item => {
                totalAmount += item.price * item.quantity;
                if (offer.category === 'all' || item.category === offer.category) {
                    categoryTotal += item.price * item.quantity;
                }
            });

            const checkAmount = offer.category === 'all' ? totalAmount : categoryTotal;
            
            if (checkAmount >= offer.minAmount) {
                applicableOffers.push({
                    ...offer,
                    savings: offer.type === 'percentage' 
                        ? Math.round(categoryTotal * offer.discount / 100)
                        : offer.discount
                });
            }
        }

        return { success: true, data: applicableOffers };
    }

    // GET /api/analytics/:userId - Get user analytics
    async getAnalytics(userId) {
        await this.delay();
        const db = this.getDatabase();
        const orders = db.orders[userId] || [];
        
        const analytics = {
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
            favoriteCategory: this.getFavoriteCategory(orders),
            mostBoughtItem: this.getMostBoughtItem(orders),
            monthlySpending: this.getMonthlySpending(orders)
        };

        return { success: true, data: analytics };
    }

    getFavoriteCategory(orders) {
        const categoryCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
            });
        });

        return Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b, 'none'
        );
    }

    getMostBoughtItem(orders) {
        const itemCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity;
            });
        });

        return Object.keys(itemCount).reduce((a, b) => 
            itemCount[a] > itemCount[b] ? a : b, 'none'
        );
    }

    getMonthlySpending(orders) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return orders
            .filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            })
            .reduce((sum, order) => sum + order.total, 0);
    }

    // GET /api/frequent-items/:userId - Get frequently bought items
    async getFrequentItems(userId, limit = 6) {
        await this.delay();
        const db = this.getDatabase();
        const orders = db.orders[userId] || [];
        
        const itemCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const key = item.name;
                if (!itemCount[key]) {
                    itemCount[key] = { ...item, count: 0 };
                }
                itemCount[key].count += item.quantity;
            });
        });

        const frequentItems = Object.values(itemCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return { success: true, data: frequentItems };
    }
}
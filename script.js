// SmartCart JavaScript - Minimal Backend with Local Storage

// Price Database for Indian Market
const PRICE_DATABASE = {
    groceries: {
        'Rice (1kg)': 60,
        'Wheat Flour (1kg)': 45,
        'Sugar (1kg)': 50,
        'Salt (1kg)': 25,
        'Cooking Oil (1L)': 120,
        'Dal/Lentils (1kg)': 80,
        'Tea (250g)': 150,
        'Coffee (200g)': 200,
        'Biscuits (200g)': 30,
        'Bread (400g)': 25
    },
    vegetables: {
        'Onion (1kg)': 40,
        'Potato (1kg)': 30,
        'Tomato (1kg)': 50,
        'Carrot (1kg)': 60,
        'Cabbage (1kg)': 35,
        'Cauliflower (1kg)': 45,
        'Green Beans (1kg)': 70,
        'Spinach (1kg)': 40,
        'Bell Pepper (1kg)': 80,
        'Cucumber (1kg)': 35
    },
    fruits: {
        'Apple (1kg)': 150,
        'Banana (1kg)': 50,
        'Orange (1kg)': 80,
        'Mango (1kg)': 120,
        'Grapes (1kg)': 100,
        'Pomegranate (1kg)': 200,
        'Watermelon (1kg)': 25,
        'Papaya (1kg)': 40,
        'Pineapple (1pc)': 60,
        'Coconut (1pc)': 30
    },
    dairy: {
        'Milk (1L)': 55,
        'Curd (500g)': 40,
        'Paneer (250g)': 80,
        'Butter (100g)': 60,
        'Cheese (200g)': 120,
        'Eggs (12pcs)': 70,
        'Chicken (1kg)': 200,
        'Mutton (1kg)': 600,
        'Fish (1kg)': 300,
        'Prawns (1kg)': 400
    }
};

// Enhanced SmartCart with API Integration and New Features

class SmartCart {
    constructor(user, authSystem) {
        this.user = user;
        this.authSystem = authSystem;
        this.api = new SmartCartAPI();
        this.activeOffers = [];
        this.frequentItems = [];

        this.init();
    }

    async init() {
        await this.loadShoppingList();
        await this.loadOffers();
        await this.loadFrequentItems();
        await this.updateProfile();
        await this.loadReminders();
        await this.loadFamilyData();
        this.updateDisplay();
        this.updateDashboard();
        this.generateSuggestions();
        this.checkBudgetAlerts();
    }

    async loadShoppingList() {
        const result = await this.api.getShoppingList(this.user.id);
        if (result.success) {
            this.shoppingList = result.data;
        }
    }

    async loadOffers() {
        const result = await this.api.getOffers();
        if (result.success) {
            this.activeOffers = result.data;
        }
    }

    async loadFrequentItems() {
        const result = await this.api.getFrequentItems(this.user.id);
        if (result.success) {
            this.frequentItems = result.data;
            this.displayFrequentItems();
        }
    }

    async updateProfile() {
        const analytics = await this.api.getAnalytics(this.user.id);
        if (analytics.success) {
            const data = analytics.data;
            const userData = this.authSystem.getUserData() || {};

            document.getElementById('profile-name').textContent = this.user.name;
            document.getElementById('profile-email').textContent = this.user.email;
            document.getElementById('profile-budget').textContent = `₹${userData.monthlyBudget || 5000}`;
            document.getElementById('profile-allergies').textContent = userData.allergies || 'None';
            document.getElementById('profile-store').textContent = userData.preferredStore || 'Local Mart';
            document.getElementById('favorite-category').textContent = data.favoriteCategory;
            document.getElementById('avg-order-value').textContent = `₹${data.averageOrderValue.toFixed(2)}`;
            document.getElementById('most-bought-item').textContent = data.mostBoughtItem;

            // Update dashboard budget
            document.getElementById('monthly-budget').textContent = `₹${userData.monthlyBudget || 5000}`;
            document.getElementById('monthly-spent-dash').textContent = `₹${data.monthlySpending || 0}`;

            // Update budget progress
            const budgetProgress = ((data.monthlySpending || 0) / (userData.monthlyBudget || 5000)) * 100;
            document.getElementById('budget-progress-fill').style.width = `${Math.min(budgetProgress, 100)}%`;
        }
    }

    updateDashboard() {
        // Update dashboard stats
        document.getElementById('total-items-dash').textContent = this.shoppingList.length;

        // Update list preview
        const listPreview = document.getElementById('dashboard-list-preview');
        if (this.shoppingList.length === 0) {
            listPreview.innerHTML = '<p>Your shopping list is empty</p>';
        } else {
            listPreview.innerHTML = this.shoppingList.slice(0, 5).map(item => `
                <div class="list-preview-item">
                    <span>${item.name}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');

            if (this.shoppingList.length > 5) {
                listPreview.innerHTML += `<p>... and ${this.shoppingList.length - 5} more items</p>`;
            }
        }
    }

    async loadReminders() {
        const userData = this.authSystem.getUserData() || {};
        this.reminders = userData.reminders || [];
        this.updateRemindersDisplay();
    }

    async loadFamilyData() {
        const userData = this.authSystem.getUserData() || {};
        this.familyCode = userData.familyCode || this.generateFamilyCode();
        this.familyMembers = userData.familyMembers || [this.user.name];

        document.getElementById('user-family-code').textContent = this.familyCode.split('-')[1];
        this.updateFamilyMembersDisplay();
    }

    generateFamilyCode() {
        return 'SMART-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    async addItem() {
        const name = document.getElementById('item-name').value.trim();
        const category = document.getElementById('item-category').value;
        const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
        const price = parseFloat(document.getElementById('item-price').value) || 0;

        if (!name) {
            showNotification('Please enter an item name', 'error');
            return;
        }

        if (price === 0) {
            showNotification('Please select an item with price or enter price manually', 'error');
            return;
        }

        const item = {
            name,
            category,
            quantity,
            price
        };

        const result = await this.api.addItemToList(this.user.id, item);
        if (result.success) {
            this.shoppingList.push(result.data);
            this.updateDisplay();
            this.checkOffers();
            showNotification('Item added to shopping list!', 'success');

            // Clear form
            document.getElementById('item-name').value = '';
            document.getElementById('item-quantity').value = '1';
            document.getElementById('item-price').value = '';
            document.getElementById('search-suggestions').innerHTML = '';
        }
    }

    async removeItem(id) {
        const result = await this.api.removeItem(this.user.id, id);
        if (result.success) {
            this.shoppingList = this.shoppingList.filter(item => item.id !== id);
            this.updateDisplay();
            this.checkOffers();
            showNotification('Item removed from list', 'success');
        }
    }

    async purchaseItem(id) {
        const item = this.shoppingList.find(item => item.id === id);
        if (item) {
            const result = await this.api.createOrder(this.user.id, [item]);
            if (result.success) {
                this.shoppingList = this.shoppingList.filter(i => i.id !== id);
                this.updateDisplay();
                this.checkOffers();
                await this.loadFrequentItems();
                await this.updateProfile();
                showNotification('Item purchased successfully!', 'success');
            }
        }
    }

    async purchaseAll() {
        if (this.shoppingList.length === 0) {
            showNotification('Your shopping list is empty', 'error');
            return;
        }

        const result = await this.api.createOrder(this.user.id, this.shoppingList);
        if (result.success) {
            this.shoppingList = [];
            this.updateDisplay();
            await this.loadFrequentItems();
            await this.updateProfile();
            this.checkBudgetAlerts();
            showNotification(`Order placed successfully! Total: ₹${result.data.total.toFixed(2)}`, 'success');
        }
    }

    async markAsBought(id) {
        const result = await this.api.updateItem(this.user.id, id, { bought: true });
        if (result.success) {
            const item = this.shoppingList.find(i => i.id === id);
            if (item) {
                item.bought = true;
            }
            this.updateDisplay();
            showNotification('Item marked as bought', 'success');
        }
    }

    async unmarkBought(id) {
        const result = await this.api.updateItem(this.user.id, id, { bought: false });
        if (result.success) {
            const item = this.shoppingList.find(i => i.id === id);
            if (item) {
                item.bought = false;
            }
            this.updateDisplay();
            showNotification('Item unmarked', 'success');
        }
    }

    async clearList() {
        if (confirm('Are you sure you want to clear the entire shopping list?')) {
            // Remove all items via API
            for (const item of this.shoppingList) {
                await this.api.removeItem(this.user.id, item.id);
            }
            this.shoppingList = [];
            this.updateDisplay();
            showNotification('Shopping list cleared', 'success');
        }
    }

    // Auto-search and price filling
    async searchItems() {
        const query = document.getElementById('item-name').value.trim();
        const suggestionsDiv = document.getElementById('search-suggestions');

        if (query.length < 2) {
            suggestionsDiv.innerHTML = '';
            document.getElementById('item-price').value = '';
            return;
        }

        const result = await this.api.searchItems(query, this.user.id);
        if (result.success && result.data.length > 0) {
            suggestionsDiv.innerHTML = result.data.map(item => `
                <div class="search-suggestion" onclick="selectSearchItem('${item.id}', '${item.name}', ${item.price}, '${item.category}')">
                    <span class="suggestion-name">${item.name}</span>
                    <span class="suggestion-price">₹${item.price}</span>
                </div>
            `).join('');
        } else {
            suggestionsDiv.innerHTML = '';
            document.getElementById('item-price').value = '';
        }
    }

    selectSearchItem(id, name, price, category) {
        document.getElementById('item-name').value = name;
        document.getElementById('item-price').value = price;
        document.getElementById('item-category').value = category;
        document.getElementById('search-suggestions').innerHTML = '';
    }

    // Check and display applicable offers
    async checkOffers() {
        const result = await this.api.checkOffers(this.user.id, this.shoppingList);
        if (result.success) {
            const offersDiv = document.getElementById('active-offers');
            if (result.data.length > 0) {
                offersDiv.innerHTML = `
                    <div class="offers-banner">
                        <h4>🎉 Active Offers</h4>
                        ${result.data.map(offer => `
                            <div class="offer-banner">
                                <span>${offer.title}: Save ₹${offer.savings}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                offersDiv.innerHTML = '';
            }
        }
    }

    // Display frequently bought items
    displayFrequentItems() {
        const container = document.getElementById('frequent-items-list');
        if (this.frequentItems.length === 0) {
            container.innerHTML = '<p>Start shopping to see your frequently bought items!</p>';
            return;
        }

        container.innerHTML = this.frequentItems.map(item => `
            <div class="frequent-item" onclick="smartCart.selectSearchItem('${item.name}', '${item.name}', ${item.price}, '${item.category}')">
                <div class="frequent-item-name">${item.name}</div>
                <div class="frequent-item-details">₹${item.price} • Bought ${item.count} times</div>
            </div>
        `).join('');
    }

    // Load and display order history
    async loadOrderHistory(filter = 'all') {
        const result = await this.api.getOrders(this.user.id, filter);
        if (result.success) {
            const container = document.getElementById('orders-list');
            if (result.data.length === 0) {
                container.innerHTML = '<p>No orders found for the selected period.</p>';
                return;
            }

            container.innerHTML = result.data.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                        <span class="order-total">₹${order.total.toFixed(2)}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} x${item.quantity}</span>
                                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    updateDisplay() {
        const listElement = document.getElementById('current-list');
        const totalItems = document.getElementById('total-items');
        const totalCost = document.getElementById('total-cost');

        listElement.innerHTML = '';

        let total = 0;
        this.shoppingList.forEach(item => {
            total += item.price * item.quantity;

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info ${item.bought ? 'item-bought' : ''}">
                    <div class="item-name">
                        ${item.name}
                        ${item.bought ? '<span class="bought-badge">BOUGHT</span>' : ''}
                    </div>
                    <div class="item-details">
                        ${item.category} • Qty: ${item.quantity} • ₹${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
                <div class="item-actions">
                    ${!item.bought ? `
                        <button onclick="smartCart.markAsBought(${item.id})" style="background: #ffc107; color: #000;">✓ Mark Bought</button>
                        <button onclick="smartCart.purchaseItem(${item.id})" style="background: #28a745;">💳 Purchase</button>
                    ` : `
                        <button onclick="smartCart.unmarkBought(${item.id})" style="background: #6c757d;">↶ Unmark</button>
                    `}
                    <button onclick="smartCart.removeItem(${item.id})" class="delete-btn">✗ Remove</button>
                </div>
            `;
            listElement.appendChild(li);
        });

        totalItems.textContent = this.shoppingList.length;
        totalCost.textContent = total.toFixed(2);

        // Add "Buy All" button if there are items
        const existingBuyAll = document.getElementById('buy-all-btn');
        if (existingBuyAll) {
            existingBuyAll.remove();
        }

        if (this.shoppingList.length > 0) {
            const buyAllBtn = document.createElement('button');
            buyAllBtn.id = 'buy-all-btn';
            buyAllBtn.textContent = 'Buy All Items';
            buyAllBtn.style.cssText = 'background: #28a745; width: 100%; margin-top: 10px;';
            buyAllBtn.onclick = () => this.purchaseAll();
            document.querySelector('.list-section').appendChild(buyAllBtn);
        }

        // Update dashboard
        this.updateDashboard();
    }

    generateSuggestions() {
        const suggestionsElement = document.getElementById('suggestions');

        // Analyze purchase history for suggestions
        const categoryCount = {};
        const itemCount = {};

        this.purchaseHistory.forEach(item => {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            itemCount[item.name] = (itemCount[item.name] || 0) + 1;
        });

        // Get frequently bought items not in current list
        const currentItems = this.shoppingList.map(item => item.name.toLowerCase());
        const suggestions = Object.entries(itemCount)
            .filter(([name, count]) => count >= 2 && !currentItems.includes(name.toLowerCase()))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (suggestions.length === 0) {
            suggestionsElement.innerHTML = `
                <h4>💡 Smart Suggestions</h4>
                <p>Start shopping to get personalized suggestions based on your purchase patterns!</p>
            `;
            return;
        }

        suggestionsElement.innerHTML = `
            <h4>💡 Smart Suggestions</h4>
            ${suggestions.map(([name, count]) => `
                <div class="suggestion-item" onclick="smartCart.addSuggestion('${name}')">
                    <strong>${name}</strong> <small>(bought ${count} times)</small>
                </div>
            `).join('')}
        `;
    }

    addSuggestion(itemName) {
        document.getElementById('item-name').value = itemName;
        document.getElementById('item-name').focus();
    }

    updateAnalytics() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyPurchases = this.purchaseHistory.filter(item => {
            const purchaseDate = new Date(item.purchaseDate);
            return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
        });

        const monthlySpent = monthlyPurchases.reduce((total, item) => total + (item.price * item.quantity), 0);
        const avgShopping = this.purchaseHistory.length > 0 ? monthlySpent / Math.max(1, monthlyPurchases.length) : 0;

        // Category analysis
        const categorySpending = {};
        monthlyPurchases.forEach(item => {
            categorySpending[item.category] = (categorySpending[item.category] || 0) + (item.price * item.quantity);
        });

        const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];

        document.getElementById('monthly-spent').textContent = monthlySpent.toFixed(2);
        document.getElementById('avg-shopping').textContent = avgShopping.toFixed(2);
        document.getElementById('top-category').textContent = topCategory ? topCategory[0] : 'None';

        // Update category chart
        this.updateCategoryChart(categorySpending);
    }

    updateCategoryChart(categorySpending) {
        const chartElement = document.getElementById('category-chart');
        const total = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            chartElement.innerHTML = '<p>No spending data available for this month.</p>';
            return;
        }

        chartElement.innerHTML = Object.entries(categorySpending)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percentage = (amount / total * 100).toFixed(1);
                return `
                    <div class="category-item">
                        <span>${category}</span>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span>₹${amount.toFixed(2)} (${percentage}%)</span>
                    </div>
                `;
            }).join('');
    }

    addReminder() {
        const item = document.getElementById('reminder-item').value.trim();
        const frequency = document.getElementById('reminder-frequency').value;

        if (!item) {
            alert('Please enter an item name');
            return;
        }

        const reminder = {
            id: Date.now(),
            item,
            frequency,
            dateCreated: new Date().toISOString(),
            nextReminder: this.calculateNextReminder(frequency)
        };

        this.reminders.push(reminder);
        this.saveData();
        this.updateReminders();

        document.getElementById('reminder-item').value = '';
    }

    calculateNextReminder(frequency) {
        const now = new Date();
        switch (frequency) {
            case 'weekly':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            case 'biweekly':
                return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
            case 'monthly':
                return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return now.toISOString();
        }
    }

    removeReminder(id) {
        this.reminders = this.reminders.filter(reminder => reminder.id !== id);
        this.saveData();
        this.updateReminders();
    }

    updateReminders() {
        const remindersElement = document.getElementById('reminders-list');

        if (this.reminders.length === 0) {
            remindersElement.innerHTML = '<p>No reminders set. Add items you buy regularly!</p>';
            return;
        }

        remindersElement.innerHTML = this.reminders.map(reminder => {
            const nextDate = new Date(reminder.nextReminder).toLocaleDateString();
            const isOverdue = new Date(reminder.nextReminder) < new Date();

            return `
                <div class="reminder-card ${isOverdue ? 'overdue' : ''}">
                    <div class="reminder-header">
                        <span class="reminder-item">${reminder.item}</span>
                        <span class="reminder-frequency">${reminder.frequency}</span>
                    </div>
                    <p>Next reminder: ${nextDate} ${isOverdue ? '(Overdue!)' : ''}</p>
                    <button onclick="smartCart.removeReminder(${reminder.id})" class="delete-btn" style="margin-top: 10px;">Remove</button>
                </div>
            `;
        }).join('');
    }

    generateFamilyCode() {
        this.familyCode = this.generateCode();
        document.getElementById('user-code').textContent = this.familyCode.split('-')[1];
        this.saveData();
        alert('New family code generated!');
    }

    joinFamily() {
        const code = document.getElementById('join-code').value.trim().toUpperCase();
        if (!code) {
            alert('Please enter a family code');
            return;
        }

        // Simulate joining family (in real app, this would sync with server)
        if (!this.familyMembers.includes('Family Member')) {
            this.familyMembers.push('Family Member');
            this.saveData();
            this.updateFamily();
            alert('Successfully joined family!');
        } else {
            alert('Already part of a family group');
        }

        document.getElementById('join-code').value = '';
    }

    updateFamily() {
        const familyList = document.getElementById('family-list');

        familyList.innerHTML = this.familyMembers.map((member, index) => `
            <li>
                <span>${member}</span>
                <span class="member-status">${index === 0 ? 'Owner' : 'Member'}</span>
            </li>
        `).join('');
    }
}

// Tab functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Global functions for HTML onclick events
function addItem() {
    smartCart.addItem();
}

function clearList() {
    smartCart.clearList();
}

function searchItems() {
    smartCart.searchItems();
}

function selectSearchItem(id, name, price, category) {
    smartCart.selectSearchItem(id, name, price, category);
}

function filterOrders() {
    const filter = document.getElementById('order-filter').value;
    smartCart.loadOrderHistory(filter);
}

function showChangePassword() {
    // Implementation for change password modal
    showNotification('Change password feature coming soon!', 'info');
}

function exportData() {
    // Export user data
    showNotification('Data export feature coming soon!', 'info');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        showNotification('Account deletion feature coming soon!', 'info');
    }
}

// Price Helper Functions
function showPriceHelper() {
    const modal = document.getElementById('price-helper-modal');
    modal.style.display = 'flex';

    // Populate price categories
    Object.keys(PRICE_DATABASE).forEach(category => {
        const container = document.getElementById(`${category}-prices`);
        if (container) {
            container.innerHTML = Object.entries(PRICE_DATABASE[category])
                .map(([item, price]) => `
                    <div class="price-item" onclick="selectPriceItem('${item}', ${price})">
                        <span class="price-item-name">${item}</span>
                        <span class="price-item-price">₹${price}</span>
                    </div>
                `).join('');
        }
    });
}

function closePriceHelper() {
    document.getElementById('price-helper-modal').style.display = 'none';
}

function selectPriceItem(itemName, price) {
    document.getElementById('item-name').value = itemName.split(' (')[0]; // Remove unit from name
    document.getElementById('item-price').value = price;
    closePriceHelper();
}

// Authentication Functions
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
}

function showSignup() {
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

function login(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const result = authSystem.login(email, password);
    if (result.success) {
        showMainApp();
        showNotification('Login successful!', 'success');
    } else {
        showNotification(result.message, 'error');
    }
}

function signup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    const result = authSystem.signup(name, email, password, confirmPassword);
    if (result.success) {
        showMainApp();
        showNotification('Account created successfully!', 'success');
    } else {
        showNotification(result.message, 'error');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        const result = authSystem.logout();
        showAuthScreen();
        showNotification('Logged out successfully', 'success');
    }
}

async function showMainApp() {
    const user = authSystem.getCurrentUser();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('user-name').textContent = user.name;

    // Initialize SmartCart with user data and auth system
    smartCart = new SmartCart(user, authSystem);

    // Load initial data for orders tab
    await smartCart.loadOrderHistory();
}

function showAuthScreen() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('main-container').style.display = 'none';

    // Clear forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';

    showLogin();
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #00d2d3, #54a0ff)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #4834d4, #686de0)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize Application
let authSystem;
let smartCart;

document.addEventListener('DOMContentLoaded', () => {
    authSystem = new EnhancedAuthSystem();

    if (authSystem.isLoggedIn()) {
        showMainApp();
    } else {
        showAuthScreen();
    }
});

// Dashboard Functions
function quickSearch() {
    const query = document.getElementById('quick-item').value.trim();
    const btn = document.getElementById('quick-add-btn');

    if (query.length >= 2) {
        btn.disabled = false;
        smartCart.searchItems(query, 'quick-suggestions');
    } else {
        btn.disabled = true;
        document.getElementById('quick-suggestions').innerHTML = '';
    }
}

function quickAddItem() {
    const itemName = document.getElementById('quick-item').value.trim();
    if (itemName) {
        document.getElementById('item-name').value = itemName;
        showTab('shopping-list');
        document.getElementById('item-name').focus();
    }
}

// Voice Input Functions
let recognition;
let isListening = false;

function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('Voice recognition not supported in this browser', 'error');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        isListening = true;
        const voiceBtn = event.target;
        voiceBtn.classList.add('voice-active');
        voiceBtn.textContent = '🎤 Listening...';
        showNotification('Listening... Speak now!', 'info');
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('item-name').value = transcript;
        smartCart.searchItems();
        showNotification(`Heard: "${transcript}"`, 'success');
    };

    recognition.onerror = function (event) {
        showNotification('Voice recognition error: ' + event.error, 'error');
    };

    recognition.onend = function () {
        isListening = false;
        const voiceBtns = document.querySelectorAll('.voice-btn');
        voiceBtns.forEach(btn => {
            btn.classList.remove('voice-active');
            btn.textContent = '🎤 Voice';
        });
    };

    recognition.start();
}

// OCR Bill Processing
function processBill() {
    const fileInput = document.getElementById('bill-upload');
    const file = fileInput.files[0];

    if (!file) return;

    showNotification('Processing bill... This is a simulation', 'info');

    // Simulate OCR processing
    setTimeout(() => {
        const simulatedItems = [
            { name: 'Milk (1L)', price: 55, category: 'dairy' },
            { name: 'Bread (400g)', price: 25, category: 'groceries' },
            { name: 'Eggs (12pcs)', price: 70, category: 'dairy' },
            { name: 'Onion (1kg)', price: 40, category: 'vegetables' },
            { name: 'Rice (1kg)', price: 60, category: 'groceries' }
        ];

        const resultsDiv = document.getElementById('ocr-results');
        resultsDiv.innerHTML = `
            <h5>📄 Detected Items from Bill:</h5>
            ${simulatedItems.map(item => `
                <div class="ocr-item">
                    <span>${item.name} - ₹${item.price}</span>
                    <button onclick="addOCRItem('${item.name}', ${item.price}, '${item.category}')" class="add-ocr-btn">Add</button>
                </div>
            `).join('')}
        `;

        showNotification('Bill processed! Click "Add" to add items to your list', 'success');
    }, 2000);
}

function addOCRItem(name, price, category) {
    document.getElementById('item-name').value = name;
    document.getElementById('item-price').value = price;
    document.getElementById('item-category').value = category;
    smartCart.addItem();
}

// List Management Functions
async function clearBoughtItems() {
    const boughtItems = smartCart.shoppingList.filter(item => item.bought);
    if (boughtItems.length === 0) {
        showNotification('No bought items to clear', 'info');
        return;
    }

    if (confirm(`Clear ${boughtItems.length} bought items?`)) {
        for (const item of boughtItems) {
            await smartCart.api.removeItem(smartCart.user.id, item.id);
        }
        smartCart.shoppingList = smartCart.shoppingList.filter(item => !item.bought);
        smartCart.updateDisplay();
        showNotification('Bought items cleared', 'success');
    }
}

function exportShoppingList() {
    const data = {
        user: smartCart.user.name,
        date: new Date().toISOString(),
        items: smartCart.shoppingList,
        total: smartCart.shoppingList.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Shopping list exported successfully!', 'success');
}

// Family Functions
function generateFamilyCode() {
    const newCode = smartCart.generateFamilyCode();
    smartCart.familyCode = newCode;
    document.getElementById('user-family-code').textContent = newCode.split('-')[1];

    const userData = smartCart.authSystem.getUserData() || {};
    userData.familyCode = newCode;
    smartCart.authSystem.saveUserData(userData);

    showNotification('New family code generated!', 'success');
}

function joinFamilyGroup() {
    const code = document.getElementById('join-family-code').value.trim().toUpperCase();
    if (!code) {
        showNotification('Please enter a family code', 'error');
        return;
    }

    // Simulate joining family
    if (!smartCart.familyMembers.includes('Family Member')) {
        smartCart.familyMembers.push('Family Member');
        smartCart.updateFamilyMembersDisplay();

        const userData = smartCart.authSystem.getUserData() || {};
        userData.familyMembers = smartCart.familyMembers;
        smartCart.authSystem.saveUserData(userData);

        showNotification('Successfully joined family group!', 'success');
    } else {
        showNotification('Already part of a family group', 'info');
    }

    document.getElementById('join-family-code').value = '';
}

function addSharedReminder() {
    const text = document.getElementById('shared-reminder-text').value.trim();
    if (!text) {
        showNotification('Please enter reminder text', 'error');
        return;
    }

    const reminder = {
        id: Date.now(),
        text: text,
        type: 'shared',
        date: new Date().toISOString(),
        author: smartCart.user.name
    };

    // Add to shared reminders (simulated)
    const sharedReminders = JSON.parse(localStorage.getItem('shared_reminders') || '[]');
    sharedReminders.push(reminder);
    localStorage.setItem('shared_reminders', JSON.stringify(sharedReminders));

    updateSharedRemindersDisplay();
    document.getElementById('shared-reminder-text').value = '';
    showNotification('Shared reminder added!', 'success');
}

function updateSharedRemindersDisplay() {
    const sharedReminders = JSON.parse(localStorage.getItem('shared_reminders') || '[]');
    const container = document.getElementById('shared-reminders-list');

    if (sharedReminders.length === 0) {
        container.innerHTML = '<p>No shared reminders yet</p>';
        return;
    }

    container.innerHTML = sharedReminders.map(reminder => `
        <div class="shared-reminder-item">
            <div>${reminder.text}</div>
            <small>By ${reminder.author} on ${new Date(reminder.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Offers Functions
function updateStoreOffers() {
    const store = document.getElementById('preferred-store').value;

    // Update user preference
    const userData = smartCart.authSystem.getUserData() || {};
    userData.preferredStore = store;
    smartCart.authSystem.saveUserData(userData);

    showNotification(`Preferred store updated to ${store}`, 'success');
}

function saveLoyaltyCard() {
    const cardNumber = document.getElementById('loyalty-card').value.trim();
    if (!cardNumber) {
        showNotification('Please enter loyalty card number', 'error');
        return;
    }

    const userData = smartCart.authSystem.getUserData() || {};
    userData.loyaltyCard = cardNumber;
    smartCart.authSystem.saveUserData(userData);

    document.getElementById('loyalty-status').innerHTML = `
        <strong>Loyalty Card Saved:</strong> ${cardNumber}<br>
        <small>You'll receive personalized offers based on your loyalty status</small>
    `;

    showNotification('Loyalty card saved successfully!', 'success');
}

function activateOffer(offerId) {
    const savedOffers = JSON.parse(localStorage.getItem('saved_offers') || '[]');

    if (!savedOffers.includes(offerId)) {
        savedOffers.push(offerId);
        localStorage.setItem('saved_offers', JSON.stringify(savedOffers));
        updateSavedOffersDisplay();
        showNotification('Offer saved to your account!', 'success');
    } else {
        showNotification('Offer already saved', 'info');
    }
}

function updateSavedOffersDisplay() {
    const savedOffers = JSON.parse(localStorage.getItem('saved_offers') || '[]');
    const container = document.getElementById('saved-offers-list');

    if (savedOffers.length === 0) {
        container.innerHTML = '<p>No saved offers yet. Click on offers above to save them!</p>';
        return;
    }

    const offerDetails = {
        'dairy10': { title: 'Dairy Products 10% OFF', desc: 'Min purchase: ₹200' },
        'bulk500': { title: 'Bulk Shopping ₹500 OFF', desc: 'Min purchase: ₹5000' },
        'vegetables15': { title: 'Vegetables 15% OFF', desc: 'Min purchase: ₹300' },
        'fruits20': { title: 'Fruits 20% OFF', desc: 'Weekend special' }
    };

    container.innerHTML = savedOffers.map(offerId => {
        const offer = offerDetails[offerId];
        return `
            <div class="saved-offer-item">
                <strong>${offer.title}</strong><br>
                <small>${offer.desc}</small>
            </div>
        `;
    }).join('');
}

// Profile Functions
let currentEditField = '';

function editField(fieldName) {
    currentEditField = fieldName;
    const modal = document.getElementById('edit-modal');
    const input = document.getElementById('edit-field-input');
    const title = document.getElementById('edit-modal-title');

    const currentValue = document.getElementById(`profile-${fieldName}`).textContent;

    title.textContent = `Edit ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
    input.value = fieldName === 'budget' ? currentValue.replace('₹', '') : currentValue;

    modal.style.display = 'flex';
    input.focus();
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditField = '';
}

function saveFieldEdit() {
    const newValue = document.getElementById('edit-field-input').value.trim();
    if (!newValue) {
        showNotification('Please enter a value', 'error');
        return;
    }

    const userData = smartCart.authSystem.getUserData() || {};

    switch (currentEditField) {
        case 'name':
            smartCart.user.name = newValue;
            document.getElementById('profile-name').textContent = newValue;
            document.getElementById('user-name').textContent = newValue;
            break;
        case 'budget':
            userData.monthlyBudget = parseInt(newValue);
            document.getElementById('profile-budget').textContent = `₹${newValue}`;
            break;
        case 'allergies':
            userData.allergies = newValue;
            document.getElementById('profile-allergies').textContent = newValue;
            break;
        case 'store':
            userData.preferredStore = newValue;
            document.getElementById('profile-store').textContent = newValue;
            break;
    }

    smartCart.authSystem.saveUserData(userData);
    closeEditModal();
    smartCart.updateProfile();
    showNotification(`${currentEditField.charAt(0).toUpperCase() + currentEditField.slice(1)} updated successfully!`, 'success');
}

// Reminders Functions
function addReminder() {
    const text = document.getElementById('reminder-text').value.trim();
    const type = document.getElementById('reminder-type').value;
    const time = document.getElementById('reminder-time').value;

    if (!text) {
        showNotification('Please enter reminder text', 'error');
        return;
    }

    const reminder = {
        id: Date.now(),
        text: text,
        type: type,
        time: time,
        date: new Date().toISOString()
    };

    smartCart.reminders.push(reminder);

    const userData = smartCart.authSystem.getUserData() || {};
    userData.reminders = smartCart.reminders;
    smartCart.authSystem.saveUserData(userData);

    smartCart.updateRemindersDisplay();

    // Clear form
    document.getElementById('reminder-text').value = '';
    document.getElementById('reminder-time').value = '';

    showNotification('Reminder added successfully!', 'success');
}

function deleteReminder(id) {
    smartCart.reminders = smartCart.reminders.filter(r => r.id !== id);

    const userData = smartCart.authSystem.getUserData() || {};
    userData.reminders = smartCart.reminders;
    smartCart.authSystem.saveUserData(userData);

    smartCart.updateRemindersDisplay();
    showNotification('Reminder deleted', 'success');
}

function showReminders() {
    showTab('profile');
    document.querySelector('.reminders-section').scrollIntoView({ behavior: 'smooth' });
}

// Budget Functions
function checkBudgetAlerts() {
    const userData = smartCart.authSystem.getUserData() || {};
    const monthlyBudget = userData.monthlyBudget || 5000;

    smartCart.api.getAnalytics(smartCart.user.id).then(result => {
        if (result.success) {
            const monthlySpent = result.data.monthlySpending || 0;
            const percentage = (monthlySpent / monthlyBudget) * 100;

            const alertContainer = document.getElementById('budget-alert-container');

            if (percentage >= 100) {
                alertContainer.innerHTML = `
                    <div class="budget-alert alert-danger">
                        ⚠️ Budget Exceeded! You've spent ₹${monthlySpent.toFixed(2)} of your ₹${monthlyBudget} monthly budget.
                    </div>
                `;
            } else if (percentage >= 80) {
                alertContainer.innerHTML = `
                    <div class="budget-alert alert-warning">
                        ⚡ Budget Alert! You've used ${percentage.toFixed(1)}% of your monthly budget.
                    </div>
                `;
            } else {
                alertContainer.innerHTML = `
                    <div class="budget-alert">
                        ✅ You're within budget! ${percentage.toFixed(1)}% used this month.
                    </div>
                `;
            }
        }
    });
}

// Add these methods to SmartCart class
SmartCart.prototype.updateRemindersDisplay = function () {
    const container = document.getElementById('reminders-list');

    if (this.reminders.length === 0) {
        container.innerHTML = '<p>No reminders set</p>';
        return;
    }

    container.innerHTML = this.reminders.map(reminder => `
        <div class="reminder-item">
            <div class="reminder-text">
                <strong>${reminder.text}</strong><br>
                <span class="reminder-time">
                    ${reminder.type === 'time' ? 'Time-based' : 'Location-based'} - 
                    ${reminder.time ? new Date(reminder.time).toLocaleString() : 'No time set'}
                </span>
            </div>
            <button onclick="deleteReminder(${reminder.id})" class="delete-reminder-btn">Delete</button>
        </div>
    `).join('');

    // Update dashboard reminders preview
    const dashReminders = document.getElementById('dashboard-reminders');
    if (this.reminders.length === 0) {
        dashReminders.innerHTML = '<p>No upcoming reminders</p>';
    } else {
        dashReminders.innerHTML = this.reminders.slice(0, 3).map(reminder => `
            <div class="reminder-preview-item">
                <span>${reminder.text}</span>
            </div>
        `).join('');
    }
};

SmartCart.prototype.updateFamilyMembersDisplay = function () {
    const container = document.getElementById('family-members-list');

    container.innerHTML = this.familyMembers.map((member, index) => `
        <div class="member-item">
            <span class="member-name">${member}</span>
            <span class="member-role">${index === 0 ? 'Owner' : 'Member'}</span>
        </div>
    `).join('');
};

// Initialize additional features when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Update saved offers display
    updateSavedOffersDisplay();
    updateSharedRemindersDisplay();

    // Set default tab to dashboard
    setTimeout(() => {
        if (smartCart) {
            showTab('dashboard');
        }
    }, 100);
});
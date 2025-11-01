// Enhanced Authentication System with File Storage Simulation

class EnhancedAuthSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('smartcart_current_user') || 'null');
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize users storage if not exists
        if (!localStorage.getItem('smartcart_users_db')) {
            const initialDB = {
                users: {},
                userData: {},
                lastUserId: 0
            };
            localStorage.setItem('smartcart_users_db', JSON.stringify(initialDB));
        }
    }

    getDatabase() {
        return JSON.parse(localStorage.getItem('smartcart_users_db'));
    }

    saveDatabase(db) {
        localStorage.setItem('smartcart_users_db', JSON.stringify(db));
        // Also save to users.json simulation
        this.saveToFile(db);
    }

    saveToFile(db) {
        // Simulate saving to file (in real app, this would be server-side)
        try {
            const fileData = {
                users: db.users,
                userData: db.userData,
                lastUpdated: new Date().toISOString()
            };
            console.log('Saving to users.json:', fileData);
            // In a real application, this would make an API call to save data
        } catch (error) {
            console.error('Error saving to file:', error);
        }
    }

    hashPassword(password) {
        // Simple hash function (in production, use proper hashing like bcrypt)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // Password must be at least 6 characters
        return password.length >= 6;
    }

    signup(name, email, password, confirmPassword) {
        // Validation
        if (!name.trim()) {
            return { success: false, message: 'Name is required' };
        }

        if (!this.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!this.validatePassword(password)) {
            return { success: false, message: 'Password must be at least 6 characters long' };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        const db = this.getDatabase();

        // Check if user already exists
        if (db.users[email.toLowerCase()]) {
            return { success: false, message: 'An account with this email already exists' };
        }

        // Create new user
        const userId = ++db.lastUserId;
        const hashedPassword = this.hashPassword(password);
        
        db.users[email.toLowerCase()] = {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        // Initialize user data
        db.userData[userId] = {
            shoppingList: [],
            purchaseHistory: [],
            reminders: [],
            familyCode: this.generateFamilyCode(),
            familyMembers: [name.trim()],
            settings: {
                currency: 'INR',
                notifications: true
            }
        };

        this.saveDatabase(db);

        // Auto-login after signup
        this.currentUser = {
            id: userId,
            email: email.toLowerCase(),
            name: name.trim()
        };
        localStorage.setItem('smartcart_current_user', JSON.stringify(this.currentUser));

        return { success: true, message: 'Account created successfully!' };
    }

    login(email, password) {
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!password) {
            return { success: false, message: 'Password is required' };
        }

        const db = this.getDatabase();
        const user = db.users[email.toLowerCase()];

        if (!user) {
            return { success: false, message: 'No account found with this email address' };
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return { success: false, message: 'Incorrect password' };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveDatabase(db);

        // Set current user
        this.currentUser = {
            id: user.id,
            email: user.email,
            name: user.name
        };
        localStorage.setItem('smartcart_current_user', JSON.stringify(this.currentUser));

        return { success: true, message: 'Login successful!' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('smartcart_current_user');
        return { success: true, message: 'Logged out successfully' };
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserData() {
        if (!this.currentUser) return null;
        
        const db = this.getDatabase();
        return db.userData[this.currentUser.id] || null;
    }

    saveUserData(data) {
        if (!this.currentUser) return false;
        
        const db = this.getDatabase();
        db.userData[this.currentUser.id] = data;
        this.saveDatabase(db);
        return true;
    }

    generateFamilyCode() {
        return 'SMART-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    // Get all registered users (for admin purposes)
    getAllUsers() {
        const db = this.getDatabase();
        return Object.values(db.users).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));
    }

    // Delete user account
    deleteAccount(password) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }

        const db = this.getDatabase();
        const user = db.users[this.currentUser.email];
        
        if (!user || user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Incorrect password' };
        }

        // Delete user and their data
        delete db.users[this.currentUser.email];
        delete db.userData[this.currentUser.id];
        
        this.saveDatabase(db);
        this.logout();

        return { success: true, message: 'Account deleted successfully' };
    }

    // Change password
    changePassword(currentPassword, newPassword, confirmPassword) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, message: 'New passwords do not match' };
        }

        if (!this.validatePassword(newPassword)) {
            return { success: false, message: 'New password must be at least 6 characters long' };
        }

        const db = this.getDatabase();
        const user = db.users[this.currentUser.email];
        
        if (!user || user.password !== this.hashPassword(currentPassword)) {
            return { success: false, message: 'Current password is incorrect' };
        }

        user.password = this.hashPassword(newPassword);
        this.saveDatabase(db);

        return { success: true, message: 'Password changed successfully' };
    }
}
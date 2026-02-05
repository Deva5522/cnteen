import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ITEMS } from '../data/items';
import { TRANSLATIONS } from '../data/translations';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { user, updateLocalWallet, updateUserLoyalty } = useAuth();
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);

    // Accessibility State
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('en');

    // New States for Financials
    const [transactions, setTransactions] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [mockUsers, setMockUsers] = useState([
        { id: 'student', name: 'John Doe', wallet: 0 },
        { id: 'faculty', name: 'Dr. Smith', wallet: 0 },
        { id: 'guest', name: 'Guest User', wallet: 0 }
    ]);

    // Exam Mode State
    const [examMode, setExamMode] = useState(false);

    // Load data from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Items
                const itemsRes = await fetch('/api/items');
                const itemsData = await itemsRes.json();
                if (Array.isArray(itemsData) && itemsData.length > 0) {
                    setItems(itemsData);
                } else {
                    setItems(INITIAL_ITEMS); // Fallback if DB empty
                }

                // Fetch Orders (if logged in) - In real app, send token. Here we rely on public endpoint for demo or simple id query
                if (user) {
                    const ordersRes = await fetch(`/api/orders?userId=${user.id}`);
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData);
                }

            } catch (err) {
                console.error("API Load Error", err);
                setItems(INITIAL_ITEMS); // Fallback
            }
        };

        fetchData();

        // Polling for updates (Simple Real-time)
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);

    }, [user]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const clearCart = () => setCart([]);

    // Helper to log transactions
    const logTransaction = (userId, type, amount, desc) => {
        const newTrans = {
            id: Date.now() + Math.random(),
            date: new Date().toISOString(),
            userId,
            type, // 'Credit' or 'Debit'
            amount,
            desc
        };
        const updatedTrans = [newTrans, ...transactions];
        setTransactions(updatedTrans);
        localStorage.setItem('canteen_transactions', JSON.stringify(updatedTrans));
    };

    // Helper to sync user balance to Admin view
    const updateMockUsers = (userId, newBalance) => {
        setMockUsers(prev => {
            const exists = prev.find(u => u.id === userId);
            let updated;
            if (exists) {
                updated = prev.map(u => u.id === userId ? { ...u, wallet: newBalance } : u);
            } else {
                updated = [...prev, { id: userId, name: userId, wallet: newBalance }];
            }
            localStorage.setItem('canteen_mock_users', JSON.stringify(updated));
            return updated;
        });
    }

    const placeOrder = async (method, pickupTime) => {
        if (!user) return { success: false, message: 'Not logged in' };
        if (cart.length === 0) return { success: false, message: "Cart is empty" };

        // Calculate subtotal first to check balance
        const tempSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let tempDiscount = 0;
        if (user?.loyalty?.birthday && new Date().toISOString().slice(5, 10) === user.loyalty.birthday.slice(5, 10)) {
            tempDiscount = Math.floor(tempSubtotal * 0.15);
        }
        const tempTotal = tempSubtotal - tempDiscount;

        if (method === 'Wallet' && user.wallet < tempTotal) {
            return { success: false, message: 'Insufficient Wallet Balance!' };
        }

        // Calculate Totals & Discounts
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let discountAmount = 0;

        // Check for Birthday Discount (15%)
        if (user?.loyalty?.birthday) {
            const today = new Date().toISOString().slice(5, 10);
            const userBday = user.loyalty.birthday.slice(5, 10);
            if (today === userBday) {
                discountAmount += Math.floor(subtotal * 0.15); // Stack with other discounts? Or max? Let's stack for now or use separate logic.
                // Or better, let's keep them separate to track source.
            }
        }

        // LOYALTY POINTS DISCOUNT
        // Rules: > 500 points = 10%, > 200 points = 5%
        const currentPoints = user?.loyalty?.points || 0;
        let loyaltyDiscountPercent = 0;
        if (currentPoints >= 500) loyaltyDiscountPercent = 0.10; // Gold Tier
        else if (currentPoints >= 200) loyaltyDiscountPercent = 0.05; // Silver Tier

        const loyaltyDiscountAmount = Math.floor(subtotal * loyaltyDiscountPercent);
        discountAmount += loyaltyDiscountAmount;

        const finalTotal = subtotal - discountAmount;

        // Deduct money (allowing negative balance for Pay Later)
        if (method === 'Wallet' || method === 'Pay Later') {
            const newBalance = user.wallet - finalTotal;
            updateLocalWallet(newBalance);
            // Log Transaction
            const type = method === 'Wallet' ? 'Debit' : 'Debit (Credit)';
            logTransaction(user.id, type, finalTotal, 'Order Payment');
            updateMockUsers(user.id, newBalance);
        }

        // Deduct Stock
        const updatedItems = items.map(item => {
            const cartItem = cart.find(c => c.id === item.id);
            if (cartItem) {
                return { ...item, stock: (item.stock || 50) - cartItem.qty };
            }
            return item;
        });
        setItems(updatedItems);
        localStorage.setItem('canteen_items', JSON.stringify(updatedItems));


        // SERVER API CALL
        try {
            const apiRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    items: cart,
                    total: finalTotal,
                    paymentMethod: method
                })
            });
            const apiData = await apiRes.json();

            if (apiData.success) {
                clearCart();
                // Optimistic update done via Polling or manual set
                setOrders([apiData.order, ...orders]);

                // Update Wallet in UI
                if (method === 'Wallet') {
                    updateLocalWallet(user.wallet - finalTotal);
                }

                return { success: true, message: `Order Placed! #${apiData.order._id}` };
            } else {
                return { success: false, message: apiData.message || 'Order Failed' };
            }

        } catch (err) {
            return { success: false, message: 'Server Connection Failed' };
        }
    };

    const reorder = (orderItems) => {
        setCart(prev => {
            const newCart = [...prev];
            orderItems.forEach(item => {
                const existing = newCart.find(i => i.id === item.id);
                if (existing) {
                    existing.qty += item.qty;
                } else {
                    newCart.push({ ...item });
                }
            });
            return newCart;
        });
    };

    const cancelOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: 'Order not found' };

        // Allow Admin or Owner to cancel
        const isOwner = user?.id === order.userId;
        const isAdmin = user?.role === 'admin';

        if (!isOwner && !isAdmin) return { success: false, message: 'Unauthorized' };
        if (order.status !== 'Pending' && !isAdmin) return { success: false, message: 'Order cannot be cancelled now.' }; // Admin can force cancel? Let's say yes or stick to Pending?
        // Let's stick to Pending for safety unless Admin needs more power. For now, generally cancellation happens early.
        // But if user asks "Modify", they might need to cancel "Cooking" stats? No, usually once cooking starts, no cancel.
        // Let's keep it Pending only for now unless user complains.

        // 1. Refund logic
        // If payment was collected (Wallet, Pay Later settled, or even Cash marked as Paid), refund to Wallet (Store Credit)
        if (order.paymentCollected) {
            const refundAmount = order.total;

            // We need to update the ORDER OWNER's wallet, not necessarily the logged in user
            const targetUserId = order.userId;

            // Update "Server" State (MockUsers)
            // We need to find the current wallet balance of that user. 
            // MockUsers is the source of truth for "others".
            const targetUserMock = mockUsers.find(u => u.id === targetUserId);
            // If we can't find them in mock, we might rely on the order?
            // Fallback: assume 0 if not found (shouldn't happen for valid users)
            const currentWallet = targetUserMock ? targetUserMock.wallet : 0;
            const newBalance = currentWallet + refundAmount;

            updateMockUsers(targetUserId, newBalance);

            // Persist for their next session
            localStorage.setItem(`wallet_${targetUserId}`, newBalance);

            // If WE are that user, update our session too
            if (isOwner) {
                updateLocalWallet(newBalance);
            }

            logTransaction(targetUserId, 'Credit', refundAmount, `Refund for Order #${orderId}`);
        }

        // 2. Restore Stock
        const updatedItems = items.map(item => {
            const orderItem = order.items.find(i => i.id === item.id);
            if (orderItem) {
                return { ...item, stock: (item.stock || 0) + orderItem.qty };
            }
            return item;
        });
        setItems(updatedItems);
        localStorage.setItem('canteen_items', JSON.stringify(updatedItems));

        // 3. Update Order Status
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o);
        setOrders(updatedOrders);
        localStorage.setItem('canteen_orders', JSON.stringify(updatedOrders));

        // 4. Revert Loyalty Points
        if (updateUserLoyalty && isOwner) { // Only update live loyalty if owner is here? 
            // Ideally we should update storage for offline users too.
            // But loyalty is complex. Let's simple-revert for owner, ignore for offline users for now (Edge case)
            const pointsReversed = Math.floor(order.total / 10);
            const currentLoyalty = user.loyalty || { points: 0, totalSpent: 0 };
            updateUserLoyalty({
                ...currentLoyalty,
                points: Math.max(0, (currentLoyalty.points || 0) - pointsReversed),
                totalSpent: Math.max(0, (currentLoyalty.totalSpent || 0) - order.total)
            });
        }
        // TODO: Update loyalty in storage for offline users (`loyalty_${targetUserId}`)

        return { success: true, message: 'Order Cancelled & Refunded.' };
    };

    // Admin Functions
    const addItem = (item) => {
        const newItem = { ...item, id: Date.now(), stock: item.stock ? parseInt(item.stock) : 50 }; // Default stock 50
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        localStorage.setItem('canteen_items', JSON.stringify(updatedItems));
    };

    const updateItem = (id, updates) => {
        const updatedItems = items.map(i => i.id === id ? { ...i, ...updates } : i);
        setItems(updatedItems);
        localStorage.setItem('canteen_items', JSON.stringify(updatedItems));
    };

    const removeItem = (id) => {
        const updatedItems = items.filter(i => i.id !== id);
        setItems(updatedItems);
        localStorage.setItem('canteen_items', JSON.stringify(updatedItems));
    }

    // Wallet Top-up
    const addMoney = (amount) => {
        if (!user) return;
        const newBalance = user.wallet + parseFloat(amount);
        updateLocalWallet(newBalance);

        // Log Transaction & Update Admin View
        logTransaction(user.id, 'Credit', parseFloat(amount), 'Wallet Top-up');
        updateMockUsers(user.id, newBalance);
    };

    const updateOrderStatus = (orderId, status) => {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
        setOrders(updatedOrders);
        localStorage.setItem('canteen_orders', JSON.stringify(updatedOrders));
    };

    const togglePaymentStatus = (orderId) => {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, paymentCollected: !o.paymentCollected } : o);
        setOrders(updatedOrders);
        localStorage.setItem('canteen_orders', JSON.stringify(updatedOrders));
    };

    const settleOrder = (orderId, userId, amount) => {
        // 1. Mark Order as Paid
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, paymentCollected: true } : o);
        setOrders(updatedOrders);
        localStorage.setItem('canteen_orders', JSON.stringify(updatedOrders));

        // 2. Credit Admin/User Balance (Fix Debt)
        // We update the MockUsers directly since this is Admin side
        // And if the user is logged in, their local wallet needs sync.
        // updateMockUsers handles the persistent 'server' state.
        const userToUpdate = mockUsers.find(u => u.id === userId);
        if (userToUpdate) {
            const newBalance = userToUpdate.wallet + amount;
            updateMockUsers(userId, newBalance);

            // Also log transaction
            logTransaction(userId, 'Credit', amount, `Deft Settled for Order #${orderId}`);
        }
    };

    // Reviews State
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const storedReviews = localStorage.getItem('canteen_reviews');
        if (storedReviews) setReviews(JSON.parse(storedReviews));
    }, []);

    const addReview = (orderId, rating, suggestion) => {
        const newReview = {
            id: Date.now(),
            orderId,
            userId: user.id,
            userName: user.name,
            rating,
            suggestion,
            date: new Date().toISOString()
        };
        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem('canteen_reviews', JSON.stringify(updatedReviews));

        // Also mark order as rated to prevent double rating
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, isRated: true } : o);
        setOrders(updatedOrders);
        localStorage.setItem('canteen_orders', JSON.stringify(updatedOrders));
    };

    // Announcement Functions
    const addAnnouncement = (message, type = 'info') => {
        const newAnnouncement = {
            id: Date.now(),
            message,
            type, // 'info', 'warning', 'offer'
            date: new Date().toISOString()
        };
        const updated = [newAnnouncement, ...announcements];
        setAnnouncements(updated);
        localStorage.setItem('canteen_announcements', JSON.stringify(updated));
    };

    const removeAnnouncement = (id) => {
        const updated = announcements.filter(a => a.id !== id);
        setAnnouncements(updated);
        localStorage.setItem('canteen_announcements', JSON.stringify(updated));
    };

    // Accessibility Functions
    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            if (newTheme === 'light') document.documentElement.classList.add('light-mode');
            else document.documentElement.classList.remove('light-mode');
            return newTheme;
        });
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    const t = (key) => {
        return TRANSLATIONS[language][key] || key;
    };

    const toggleExamMode = () => {
        setExamMode(prev => {
            const newState = !prev;
            localStorage.setItem('canteen_exam_mode', newState);
            return newState;
        });
    };

    return (
        <AppContext.Provider value={{
            items, cart, orders, transactions, mockUsers, reviews, announcements,
            addToCart, removeFromCart, updateQuantity, clearCart,
            placeOrder, addItem, removeItem, updateItem, addMoney,
            updateOrderStatus, togglePaymentStatus, addReview, settleOrder, reorder,
            addAnnouncement, removeAnnouncement, cancelOrder,
            theme, toggleTheme, language, changeLanguage, t,
            examMode, toggleExamMode
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

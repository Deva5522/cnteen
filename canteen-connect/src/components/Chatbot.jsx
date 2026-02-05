import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Canteen AI. Ask me about the menu, your orders, or for food suggestions! 🍔", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const { items, orders, addToCart, placeOrder, cart } = useApp();
    const { user } = useAuth();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate thinking delay
        setTimeout(async () => {
            const botResponse = await generateResponse(userMsg.text);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 600);
    };

    const generateResponse = async (query) => {
        const lowerQ = query.toLowerCase();

        // 0. Ordering Logic
        if (lowerQ.startsWith('order ') || lowerQ.startsWith('buy ')) {
            const itemName = lowerQ.replace('order ', '').replace('buy ', '').trim();
            // Fuzzy search
            const item = items.find(i => i.name.toLowerCase().includes(itemName));

            if (item) {
                if ((item.stock || 0) <= 0) return `Sorry, ${item.name} is out of stock! 😔`;

                addToCart(item);
                return `✅ Added ${item.name} (₹${item.price}) to your cart! Type 'Checkout' to place the order.`;
            } else {
                return `I couldn't find "${itemName}" on the menu. Try asking "What's available?"`;
            }
        }

        if (lowerQ === 'checkout' || lowerQ === 'confirm' || lowerQ === 'place order') {
            if (cart.length === 0) return "Your cart is empty! Add some items first.";

            // Trigger Place Order
            const res = await placeOrder('Wallet', 'ASAP');
            if (res.success) {
                return `🎉 Order Placed Successfully! (ID: ${res.message.split('#')[1] || 'New'}). You can track it in 'Orders'.`;
            } else {
                return `❌ Order Failed: ${res.message}`;
            }
        }

        // 1. Menu / Availability
        if (lowerQ.includes('available') || lowerQ.includes('menu') || lowerQ.includes('have')) {
            const featured = items.slice(0, 3).map(i => i.name).join(', ');
            return `We have lots of goodies! Top items: ${featured}. You can search for specific items in the Menu tab.`;
        }

        // 2. Order Status
        if (lowerQ.includes('order') || lowerQ.includes('status') || lowerQ.includes('ready')) {
            const myOrders = orders.filter(o => o.userId === user?.id && ['Pending', 'Cooking', 'Ready'].includes(o.status));

            if (myOrders.length === 0) {
                return "You don't have any active orders right now.";
            }

            const statuses = myOrders.map(o => `Order #${o.id.toString().slice(-4)} is ${o.status}`).join('. ');
            return `Here is your status: ${statuses}`;
        }

        // 3. Recommendations / Health
        if (lowerQ.includes('suggest') || lowerQ.includes('recommend') || lowerQ.includes('best')) {
            const popular = items.filter(i => i.stock < 40); // Mock popularity by stock
            if (popular.length > 0) return `Highly recommended: ${popular[0].name} (Selling fast!)`;
            return `You can't go wrong with our classic ${items[0]?.name}!`;
        }

        if (lowerQ.includes('healthy') || lowerQ.includes('diet') || lowerQ.includes('veg')) {
            const healthy = items.filter(i => i.dietary === 'Veg' || i.tags?.includes('Healthy') || i.tags?.includes('Vegan'));
            if (healthy.length > 0) {
                return `For a healthy choice, try the ${healthy[0].name} or ${healthy[1]?.name || 'Fresh Juice'}.`;
            }
            return "We have several Veg options available in the menu.";
        }

        if (lowerQ.includes('hello') || lowerQ.includes('hi')) {
            return `Hello ${user?.name?.split(' ')[0] || 'there'}! Hungry?`;
        }

        return "I'm not sure about that. Try 'Order Samosa', 'What's available?', or 'Checkout'.";
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '5rem',
                        right: '1.5rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999,
                        animation: 'bounce 2s infinite'
                    }}
                >
                    <MessageSquare size={26} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '5rem',
                    right: '1.5rem',
                    width: '350px',
                    maxWidth: 'calc(100vw - 3rem)',
                    height: '500px',
                    maxHeight: '70vh',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bot size={20} />
                            <span style={{ fontWeight: 'bold' }}>Canteen AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        backgroundColor: 'var(--bg-dark)'
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                                color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                padding: '0.8rem',
                                borderRadius: '1rem',
                                borderBottomRightRadius: msg.sender === 'user' ? '0.2rem' : '1rem',
                                borderTopLeftRadius: msg.sender === 'bot' ? '0.2rem' : '1rem',
                                fontSize: '0.9rem',
                                lineHeight: '1.4',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '0.8rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask something..."
                            style={{
                                flex: 1,
                                padding: '0.8rem',
                                borderRadius: '2rem',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-dark)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </>
    );
};

export default Chatbot;

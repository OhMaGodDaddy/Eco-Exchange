import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Adjust this URL if your backend is running on a different port/url
                const response = await axios.get('https://eco-exchange-backend.onrender.com/api/messages/conversations', {
                    withCredentials: true
                });
                setConversations(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching inbox:", err);
                setError("Failed to load messages. Please try logging in again.");
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // --- INTERNAL STYLES ---
    const styles = {
        container: {
            maxWidth: '600px',
            margin: '40px auto',
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        header: {
            marginBottom: '20px',
            color: '#333',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px'
        },
        list: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        card: {
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            border: '1px solid #eee',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background 0.2s',
            background: '#fff'
        },
        avatar: {
            width: '50px',
            height: '50px',
            backgroundColor: '#2ecc71',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '15px',
            flexShrink: 0
        },
        details: {
            flexGrow: 1
        },
        name: {
            margin: 0,
            fontSize: '16px',
            color: '#2c3e50',
            fontWeight: '600'
        },
        msg: {
            margin: '5px 0 0',
            color: '#7f8c8d',
            fontSize: '14px'
        },
        time: {
            fontSize: '12px',
            color: '#bdc3c7',
            whiteSpace: 'nowrap',
            marginLeft: '10px'
        },
        empty: {
            textAlign: 'center',
            padding: '40px',
            color: '#777'
        },
        btn: {
            display: 'inline-block',
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#2ecc71',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
        },
        error: {
            color: 'red',
            textAlign: 'center',
            marginTop: '20px'
        }
    };

    if (loading) return <div style={styles.container}>Loading your chats...</div>;
    if (error) return <div style={{...styles.container, ...styles.error}}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>📬 My Messages</h2>
            
            {conversations.length === 0 ? (
                <div style={styles.empty}>
                    <p>No messages yet.</p>
                    <Link to="/items" style={styles.btn}>Browse Items</Link>
                </div>
            ) : (
                <div style={styles.list}>
                    {conversations.map((chat) => (
                        <Link 
                            to={chat.link} 
                            key={chat.conversationId} 
                            style={styles.card}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <div style={styles.avatar}>
                                {chat.otherUser.username ? chat.otherUser.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div style={styles.details}>
                                <h3 style={styles.name}>{chat.otherUser.username || "Unknown"}</h3>
                                <p style={styles.msg}>
                                    {chat.lastMessage.length > 50 
                                        ? chat.lastMessage.substring(0, 50) + '...' 
                                        : chat.lastMessage}
                                </p>
                            </div>
                            <span style={styles.time}>
                                {new Date(chat.timestamp).toLocaleDateString()}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Inbox;
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chat({ user }) {
  const { friendId } = useParams(); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); 

  // 1. Fetch Messages & Mark as Read
  const fetchMessages = async () => {
    try {
      // A. Get the conversation
      const res = await axios.get(`https://eco-exchange-api.onrender.com/api/messages/${friendId}`, {
         withCredentials: true 
      });
      setMessages(res.data);

      // B. 👇 NEW: Tell server we read these messages (Clears Red Dot)
      await axios.put(`https://eco-exchange-api.onrender.com/api/messages/read/${friendId}`, {}, {
         withCredentials: true 
      });

    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [friendId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post("https://eco-exchange-api.onrender.com/api/messages", {
        receiverId: friendId,
        text: newMessage
      }, { withCredentials: true });
      
      setNewMessage("");
      fetchMessages(); // Refresh immediately
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back to Inbox
      </button>

      <div style={styles.chatBox}>
        <div style={styles.header}>
            <h3>Chat Conversation</h3>
        </div>

        <div style={styles.messageList}>
          {messages.length === 0 ? (
            <div style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>Say hello! 👋</div>
          ) : (
            messages.map((msg, index) => {
              const isMe = user && msg.senderId === user._id;
              return (
                <div key={index} style={{
                    ...styles.messageBubble,
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    backgroundColor: isMe ? '#1B4332' : '#E2E8F0',
                    color: isMe ? 'white' : 'black'
                }}>
                  <div style={styles.senderName}>{isMe ? "You" : msg.senderName}</div>
                  {msg.text}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={styles.inputArea}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.sendButton}>Send</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '20px auto', padding: '0 20px', height: '85vh', display: 'flex', flexDirection: 'column' },
  backButton: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem', marginBottom: '10px', alignSelf: 'flex-start' },
  chatBox: { 
    flex: 1, display: 'flex', flexDirection: 'column', 
    backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden'
  },
  header: { padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', textAlign: 'center' },
  messageList: { 
    flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'
  },
  messageBubble: {
    maxWidth: '70%', padding: '10px 15px', borderRadius: '15px', fontSize: '15px', lineHeight: '1.4'
  },
  senderName: { fontSize: '10px', opacity: 0.7, marginBottom: '2px' },
  inputArea: { display: 'flex', padding: '15px', borderTop: '1px solid #eee', backgroundColor: '#fff' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', marginRight: '10px' },
  sendButton: { padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#1B4332', color: 'white', cursor: 'pointer' }
};

export default Chat;
import { FaSearch } from 'react-icons/fa';

function Messages() {
  // Mock data for conversations
  const conversations = [
    { id: 1, user: 'Emma Wilson', item: 'Vintage Lamp', lastMsg: 'Is this still available?', time: '2m ago', active: true },
    { id: 2, user: 'Mark Miguel', item: 'Drone', lastMsg: 'Great, see you at the hub!', time: '1h ago', active: false },
    { id: 3, user: 'Sarah J', item: 'Textbooks', lastMsg: 'Thanks for the exchange!', time: '1d ago', active: false },
  ];

  return (
    <div style={{ padding: '20px 20px 100px 20px' }}>
      <h1 style={{ color: '#1B4332', marginBottom: '20px' }}>Messages</h1>
      
      {/* Search Messages */}
      <div style={styles.searchBox}>
        <FaSearch color="#aaa" />
        <input placeholder="Search conversations..." style={styles.input} />
      </div>

      {/* Conversation List */}
      <div style={{ marginTop: '20px' }}>
        {conversations.map(c => (
            <div key={c.id} style={styles.chatCard}>
                <div style={styles.avatar}>{c.user[0]}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0 }}>{c.user}</h4>
                        <span style={styles.time}>{c.time}</span>
                    </div>
                    <div style={styles.itemTag}>re: {c.item}</div>
                    <p style={c.active ? styles.msgActive : styles.msg}>{c.lastMsg}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #ddd'
  },
  input: { border: 'none', outline: 'none', marginLeft: '10px', width: '100%' },
  chatCard: {
    display: 'flex',
    gap: '15px',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '16px',
    marginBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer'
  },
  avatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#52796F',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  time: { fontSize: '0.75rem', color: '#999' },
  itemTag: { fontSize: '0.75rem', color: '#1B4332', fontWeight: 'bold', marginBottom: '4px' },
  msg: { margin: 0, fontSize: '0.9rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  msgActive: { margin: 0, fontSize: '0.9rem', color: '#000', fontWeight: '600' }
};

export default Messages;
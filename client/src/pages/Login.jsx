import { FaLeaf, FaGoogle } from 'react-icons/fa'; // Make sure to install: npm install react-icons

function Login() {
  
  const handleGoogleLogin = () => {
    // 🚀 THIS IS THE KEY CHANGE!
    // We send the user to YOUR Render Backend to start the login process.
    // This forces the backend code (passport.js) to run and save the user.
    window.open("https://eco-exchange-api.onrender.com/auth/google", "_self");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo Section */}
        <div style={styles.iconBox}>
          <FaLeaf size={40} color="white" />
        </div>
        <h1 style={styles.title}>EcoExchange</h1>
        <p style={styles.subtitle}>
          Join the exclusive community marketplace.<br/>
          Buy, sell, and recycle within your hub.
        </p>

        {/* Custom Google Button that links to Backend */}
        <div style={styles.buttonContainer}>
          <button onClick={handleGoogleLogin} style={styles.googleButton}>
            <FaGoogle style={{ marginRight: '10px' }} />
            Sign in with Google
          </button>
        </div>
        
        <p style={styles.footer}>Safe • Secure • Sustainable</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #1B4332 0%, #40916C 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '50px 40px',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%'
  },
  iconBox: {
    backgroundColor: '#1B4332',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  title: {
    color: '#1B4332',
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  // New Style for the Custom Button
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4', // Google Blue
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '250px',
    transition: 'background 0.3s'
  },
  footer: {
    color: '#aaa',
    fontSize: '0.8rem',
    marginTop: '20px'
  }
};

export default Login;
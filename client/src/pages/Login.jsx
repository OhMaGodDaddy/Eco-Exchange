import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { FaLeaf } from 'react-icons/fa';

function Login({ onLogin }) {
  
  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Login Success:", decoded);
    onLogin(decoded); // Tell App.jsx we are logged in!
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

        {/* Google Button */}
        <div style={styles.buttonContainer}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
            size="large"
            theme="filled_black"
            text="signin_with"
            shape="pill"
          />
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
  footer: {
    color: '#aaa',
    fontSize: '0.8rem',
    marginTop: '20px'
  }
};

export default Login;
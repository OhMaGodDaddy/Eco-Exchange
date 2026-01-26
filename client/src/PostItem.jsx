import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    category: 'Furniture',
    image: '', 
    condition: 'Good'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
        alert("File is too big! Please choose an image under 4MB.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const itemPayload = {
        ...formData,
        title: formData.name, // Backend expects 'title'
        price: 0,             // Ensure price is a number
        hubLocation: 'Main Campus' // <--- ADDED: Required by your database!
    };

    // 1. Updated URL to your Render link
    // 2. Added { withCredentials: true } so it knows WHO is posting
    axios.post('https://eco-exchange-api.onrender.com/api/items', itemPayload, {
        withCredentials: true 
    })
      .then(res => {
        setLoading(false);
        alert('Gift posted successfully!');
        navigate('/');
      })
      .catch(err => {
        setLoading(false);
        console.error("FULL ERROR DETAILS:", err);
        
        if (err.response && err.response.data) {
            alert(`Server Error: ${JSON.stringify(err.response.data)}`);
        } else {
            alert('Error posting item. Check console.');
        }
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Give an Item Away</h2>
      <p style={styles.subtitle}>Upload a photo from your device.</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>What are you gifting?</label>
          <input type="text" name="name" placeholder="e.g. Vintage Lamp" value={formData.name} onChange={handleChange} style={styles.input} required />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Description</label>
          <textarea name="description" placeholder="Condition, pickup instructions, etc." value={formData.description} onChange={handleChange} style={styles.textarea} required />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={styles.select}>
            <option value="Furniture">Furniture</option>
            <option value="Plants">Plants</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Electronics">Electronics</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* --- BEAUTIFUL UPLOAD SECTION --- */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Item Photo</label>
          
          <label htmlFor="file-upload" style={styles.uploadBox}>
            {formData.image ? (
              <img src={formData.image} alt="Preview" style={styles.previewImage} />
            ) : (
              <div style={styles.uploadPlaceholder}>
                <span style={{fontSize: '2rem'}}>📷</span>
                <span>Click to Upload Photo</span>
              </div>
            )}
          </label>

          <input 
            id="file-upload"
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Uploading...' : 'Post Item'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' },
  title: { textAlign: 'center', color: '#1B4332', fontSize: '2rem', marginBottom: '10px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: 'bold', color: '#333' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' },
  textarea: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', height: '100px', resize: 'vertical' },
  select: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' },
  uploadBox: {
    border: '2px dashed #1B4332',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8fdfa',
    transition: '0.3s',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadPlaceholder: {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '10px', 
    color: '#1B4332',
    fontWeight: 'bold'
  },
  previewImage: { 
    maxWidth: '100%', 
    maxHeight: '200px', 
    objectFit: 'contain', 
    borderRadius: '4px' 
  },
  button: { padding: '15px', backgroundColor: '#1B4332', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', opacity: 1 }
};

export default PostItem;
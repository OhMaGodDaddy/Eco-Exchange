import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostItem({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    category: 'Furniture',
    image: '', 
    condition: 'Good'
  });
  const [loading, setLoading] = useState(false);
  
  // 🤖 AI LOADING STATE
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🤖 AI GENERATE FUNCTION
  const handleGenerateAI = async (e) => {
    e.preventDefault(); // Stop form submit

    if (!formData.name) {
        alert("Please enter an Item Name first so the AI knows what to write about!");
        return;
    }

    setIsGenerating(true);
    try {
        const res = await axios.post('https://eco-exchange-api.onrender.com/api/generate-description', {
            title: formData.name,
            category: formData.category
        });

        // Update the description with AI result
        setFormData(prev => ({ ...prev, description: res.data.description }));
    } catch (err) {
        console.error("AI Error:", err);
        alert("Could not generate description. Please try again.");
    } finally {
        setIsGenerating(false);
    }
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

    // 🛡️ SECURITY CHECK
    if (!user || !user._id) {
        alert("You must be logged in to post!");
        return;
    }

    setLoading(true);

    const itemPayload = {
        ...formData,
        title: formData.name, 
        price: 0,            
        hubLocation: 'Main Campus',
        userId: user._id    
    };

    axios.post('https://eco-exchange-api.onrender.com/api/items', itemPayload, {
        withCredentials: true 
    })
      .then(res => {
        setLoading(false);
        alert('Item posted successfully!');
        navigate('/profile'); 
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
      {/* 🔙 GO BACK BUTTON */}
      <button 
        onClick={() => navigate(-1)} 
        style={styles.backButton}
      >
        ← Back
      </button>

      <h2 style={styles.title}>Give an Item Away</h2>
      <p style={styles.subtitle}>Upload a photo from your device.</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>What are you gifting?</label>
          <input type="text" name="name" placeholder="e.g. Vintage Lamp" value={formData.name} onChange={handleChange} style={styles.input} required />
        </div>

        <div style={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Description</label>
                {/* 🤖 AI BUTTON */}
                <button 
                    onClick={handleGenerateAI} 
                    disabled={isGenerating}
                    style={styles.aiButton}
                    type="button" // Important: prevents form submit
                >
                    {isGenerating ? '✨ Writing...' : '✨ Write with AI'}
                </button>
            </div>
            
            <textarea 
                name="description" 
                placeholder="Condition, pickup instructions, etc." 
                value={formData.description} 
                onChange={handleChange} 
                style={styles.textarea} 
                required 
            />
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

        {/* --- UPLOAD SECTION --- */}
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
  backButton: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' },
  title: { textAlign: 'center', color: '#1B4332', fontSize: '2rem', marginBottom: '10px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: 'bold', color: '#333' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' },
  textarea: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', height: '100px', resize: 'vertical' },
  select: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' },
  
  // 🤖 New AI Button Style
  aiButton: {
      backgroundColor: '#e6fffa',
      color: '#2c7a7b',
      border: '1px solid #b2f5ea',
      borderRadius: '20px',
      padding: '5px 12px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: '0.2s'
  },

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
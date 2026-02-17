import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostItem({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    category: 'Furniture',
    images: [], // 📸 NEW: Now an array to hold multiple images
    condition: 'Good',
    lat: null,
    lng: null
  });
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault(); 
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
        setFormData(prev => ({ ...prev, description: res.data.description }));
    } catch (err) {
        console.error("AI Error:", err);
        alert("Could not generate description. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        alert("📍 Location captured successfully!");
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Could not get location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 📸 NEW: Handle multiple file uploads
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.images.length + files.length > 3) {
        alert("You can only upload up to 3 images total to save space!");
        return;
    }

    const newImages = [];
    
    for (const file of files) {
        if (file.size > 4 * 1024 * 1024) {
            alert(`File ${file.name} is too big! Skipping.`);
            continue;
        }

        // Convert each file to Base64
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => resolve(reader.result);
        });
        newImages.push(base64);
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  // 📸 NEW: Remove an image before posting
  const removeImage = (indexToRemove) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== indexToRemove)
      }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
        userId: user._id,
        // 📸 Fallback: Send the first image as the main 'image' so old code doesn't break
        image: formData.images.length > 0 ? formData.images[0] : ''
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
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <h2 style={styles.title}>Give an Item Away</h2>
      <p style={styles.subtitle}>Upload up to 3 photos of your item.</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>What are you gifting?</label>
          <input type="text" name="name" placeholder="e.g. Vintage Lamp" value={formData.name} onChange={handleChange} style={styles.input} required />
        </div>

        <div style={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Description</label>
                <button onClick={handleGenerateAI} disabled={isGenerating} style={styles.aiButton} type="button" >
                    {isGenerating ? '✨ Writing...' : '✨ Write with AI'}
                </button>
            </div>
            
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

        <div style={styles.inputGroup}>
          <label style={styles.label}>Item Location</label>
          <button type="button" onClick={handleGetLocation} style={{ padding: '12px', backgroundColor: formData.lat ? '#d1e7dd' : '#f8f9fa', color: formData.lat ? '#0f5132' : '#333', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
            {formData.lat ? '✅ Location Attached!' : '📍 Tag My Current Location'}
          </button>
        </div>

        {/* 📸 MULTIPLE UPLOAD SECTION */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Item Photos ({formData.images.length}/3)</label>
          
          <label htmlFor="file-upload" style={styles.uploadBox}>
            <div style={styles.uploadPlaceholder}>
                <span style={{fontSize: '2rem'}}>📷</span>
                <span>Click to Upload Photos</span>
            </div>
          </label>

          {/* Added 'multiple' attribute to input */}
          <input id="file-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} disabled={formData.images.length >= 3} />

          {/* Display a grid of selected images */}
          {formData.images.length > 0 && (
              <div style={styles.imageGrid}>
                  {formData.images.map((imgSrc, index) => (
                      <div key={index} style={styles.imagePreviewContainer}>
                          <img src={imgSrc} alt={`Preview ${index}`} style={styles.previewImage} />
                          <button type="button" onClick={() => removeImage(index)} style={styles.removeBtn}>✕</button>
                      </div>
                  ))}
              </div>
          )}
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
  
  aiButton: { backgroundColor: '#e6fffa', color: '#2c7a7b', border: '1px solid #b2f5ea', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },

  uploadBox: { border: '2px dashed #1B4332', borderRadius: '8px', padding: '15px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fdfa', transition: '0.3s' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#1B4332', fontWeight: 'bold' },
  
  // 📸 NEW STYLES FOR IMAGE GRID
  imageGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' },
  imagePreviewContainer: { position: 'relative', width: '100px', height: '100px' },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' },
  removeBtn: { position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  button: { padding: '15px', backgroundColor: '#1B4332', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
};

export default PostItem;
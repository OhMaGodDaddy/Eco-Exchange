import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CONDITION_OPTIONS = ['New', 'Like New', 'Used'];

function PostItem({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Furniture',
    images: [],
    condition: 'Used',
    lat: null,
    lng: null,
    locationText: ''
  });
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter an Item Name first so the AI knows what to write about!');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await axios.post('https://eco-exchange-api.onrender.com/api/generate-description', {
        title: formData.name,
        category: formData.category
      });
      setFormData((prev) => ({ ...prev, description: res.data.description }));
    } catch (err) {
      console.error('AI Error:', err);
      alert('Could not generate description. Please try again.');
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
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          locationText: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
        }));
        alert('📍 Location captured successfully!');
      },
      (error) => {
        console.error('GPS Error:', error);
        alert('Could not get location. Please check your browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.images.length + files.length > 3) {
      alert('You can only upload up to 3 images total to save space!');
      return;
    }

    const newImages = [];

    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`File ${file.name} is too big! Skipping.`);
        continue;
      }

      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => resolve(reader.result);
      });
      newImages.push(base64);
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      alert('You must be logged in to post!');
      return;
    }

    setLoading(true);

    const itemPayload = {
      ...formData,
      title: formData.name,
      price: 0,
      hubLocation: 'Main Campus',
      userId: user._id,
      image: formData.images.length > 0 ? formData.images[0] : ''
    };

    axios
      .post('https://eco-exchange-api.onrender.com/api/items', itemPayload, {
        withCredentials: true
      })
      .then(() => {
        setLoading(false);
        alert('Item posted successfully!');
        navigate('/profile');
      })
      .catch((err) => {
        setLoading(false);
        console.error('FULL ERROR DETAILS:', err);
        if (err.response && err.response.data) {
          alert(`Server Error: ${JSON.stringify(err.response.data)}`);
        } else {
          alert('Error posting item. Check console.');
        }
      });
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] px-4 py-8 md:px-8">
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-[#13ec37]"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">List Your Item</h1>
          <p className="mt-2 text-slate-500">Give your pre-loved items a second home and help the environment.</p>
        </div>

        <form className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12" onSubmit={handleSubmit}>
          <section className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-[#13ec37]/20 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Item Photos</h3>
              <label
                htmlFor="file-upload"
                className="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#13ec37]/40 bg-[#13ec37]/5 p-8 text-center transition hover:border-[#13ec37]"
              >
                <span className="mb-2 text-5xl">☁️</span>
                <p className="font-bold text-slate-900">Drag and drop photos here</p>
                <p className="mt-1 text-sm text-slate-500">Supports JPG, PNG, WEBP (Max 4MB each)</p>
                <span className="mt-5 rounded-lg border border-[#13ec37]/20 bg-white px-5 py-2 text-sm font-bold text-slate-800">
                  Select Files
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={formData.images.length >= 3}
              />

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[0, 1, 2].map((slot) => {
                  const currentImage = formData.images[slot];
                  return (
                    <div
                      key={slot}
                      className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      {currentImage ? (
                        <>
                          <img src={currentImage} alt={`Preview ${slot + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(slot)}
                            className="absolute right-1 top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-slate-400">📷</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#13ec37]/20 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Pickup Location</h3>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-sm font-semibold text-[#16a34a] transition hover:opacity-80"
                >
                  📍 Detect Location
                </button>
              </div>
              <div className="relative h-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#bbf7d0_0,transparent_40%),radial-gradient(circle_at_70%_70%,#bae6fd_0,transparent_45%)]" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">📍</div>
              </div>
              <input
                className="mt-4 w-full rounded-lg border border-[#13ec37]/25 bg-[#13ec37]/5 px-4 py-3 text-sm outline-none focus:border-[#13ec37]"
                placeholder="Enter address or landmark"
                name="locationText"
                value={formData.locationText}
                onChange={handleChange}
                type="text"
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#13ec37]/20 bg-white p-6 shadow-sm md:p-8 lg:col-span-7">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Item Title</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Vintage Road Bike, 10-speed"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#13ec37]/25 bg-[#13ec37]/5 px-4 py-3 outline-none focus:border-[#13ec37]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#13ec37]/25 bg-[#13ec37]/5 px-4 py-3 outline-none focus:border-[#13ec37]"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Plants">Plants</option>
                    <option value="Books">Books</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Condition</label>
                  <div className="flex gap-2">
                    {CONDITION_OPTIONS.map((condition) => {
                      const selected = formData.condition === condition;
                      return (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, condition }))}
                          className={`flex-1 rounded-lg border-2 px-2 py-3 text-xs font-bold transition ${
                            selected
                              ? 'border-[#13ec37] bg-[#13ec37]/15 text-slate-900'
                              : 'border-[#13ec37]/15 text-slate-600 hover:border-[#13ec37]/50'
                          }`}
                        >
                          {condition}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="rounded-full border border-[#13ec37]/30 bg-[#13ec37]/10 px-3 py-1 text-xs font-bold text-emerald-700 transition hover:bg-[#13ec37]/20 disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                  >
                    {isGenerating ? '✨ Writing...' : '✨ Write with AI'}
                  </button>
                </div>
                <textarea
                  name="description"
                  placeholder="Describe your item's condition, dimensions, and any unique features..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full resize-none rounded-lg border border-[#13ec37]/25 bg-[#13ec37]/5 px-4 py-3 outline-none focus:border-[#13ec37]"
                  required
                />
              </div>

              <div className="rounded-lg border border-[#13ec37]/30 bg-[#13ec37]/5 p-4">
                <p className="text-sm font-bold text-slate-900">🌱 Earn 50 Eco-Points</p>
                <p className="mt-1 text-xs text-slate-500">
                  By listing this item, you contribute to a circular economy. Points can be redeemed for local store
                  discounts.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-lg border-2 border-slate-200 px-8 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-[#13ec37] py-3 font-bold text-slate-900 shadow-lg shadow-[#13ec37]/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Uploading...' : 'Post Item Now'}
                </button>
              </div>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

export default PostItem;
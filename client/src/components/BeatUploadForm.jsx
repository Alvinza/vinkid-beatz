import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function BeatUploadForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    price: '',
    genre: '',
  });
  const [files, setFiles] = useState({ picture: null, audio: null });
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({ picture: '', audio: '' });

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!token || isAdmin !== 'true') {
      toast.error('Admin access required');
      navigate('/login');
    }
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.type === 'number' 
      ? Math.max(0, parseFloat(e.target.value)) // Ensure non-negative numbers
      : e.target.value;
      
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  // Handle file input changes with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;

    if (file) {
      // Validate file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        e.target.value = ''; // Reset input
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [fieldName]: previewUrl
      }));

      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke object URLs to avoid memory leaks
      Object.values(previewUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Validate price is a positive number
    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      setLoading(false);
      return;
    }

    // Validate BPM is a positive number
    if (parseFloat(formData.bpm) <= 0) {
      toast.error('BPM must be greater than 0');
      setLoading(false);
      return;
    }

    // Append form data
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    // Append files
    if (files.picture) data.append('picture', files.picture);
    if (files.audio) data.append('audio', files.audio);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login as admin first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'https://vinkid-beatz-backend.onrender.com/api/upload-beat', 
        data, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      toast.success("Beat uploaded successfully!");
      
      // Reset form
      setFormData({
        title: '',
        bpm: '',
        price: '',
        genre: '',
      });
      setFiles({ picture: null, audio: null });
      setPreviewUrls({ picture: '', audio: '' });
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.error || "Failed to upload beat");
      }
    } finally {
      setLoading(false);
    }
  };
return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Upload New Beat</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-white mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Enter beat title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* BPM Input */}
            <div>
              <label className="block text-white mb-2" htmlFor="bpm">
                BPM
              </label>
              <input
                id="bpm"
                type="number"
                name="bpm"
                placeholder="Enter beats per minute"
                value={formData.bpm}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-white mb-2" htmlFor="price">
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                name="price"
                placeholder="Enter price in USD"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Genre Input */}
            <div>
              <label className="block text-white mb-2" htmlFor="genre">
                Genre
              </label>
              <input
                id="genre"
                type="text"
                name="genre"
                placeholder="Enter beat genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-white mb-2" htmlFor="picture">
                Cover Image
              </label>
              <input
                id="picture"
                type="file"
                name="picture"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                required
              />
              {previewUrls.picture && (
                <img
                  src={previewUrls.picture}
                  alt="Cover preview"
                  className="mt-2 w-32 h-32 object-cover rounded"
                />
              )}
            </div>

            {/* Audio File Upload */}
            <div>
              <label className="block text-white mb-2" htmlFor="audio">
                Audio File
              </label>
              <input
                id="audio"
                type="file"
                name="audio"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                required
              />
              {previewUrls.audio && (
                <audio
                  controls
                  src={previewUrls.audio}
                  className="mt-2 w-full"
                >
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Beat'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BeatUploadForm;

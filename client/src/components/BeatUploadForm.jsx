import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function BeatUploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    price: '',
    genre: '',
  });
  const [files, setFiles] = useState({ picture: null, audio: null });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ picture: 0, audio: 0 });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        e.target.value = '';
        return;
      }
      
      // Validate file types
      if (e.target.name === 'picture' && !file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        e.target.value = '';
        return;
      }
      
      if (e.target.name === 'audio' && !file.type.startsWith('audio/')) {
        toast.error('Please select a valid audio file');
        e.target.value = '';
        return;
      }
      
      setFiles({ ...files, [e.target.name]: file });
    }
  };

  const uploadToCloudinary = async (file, type) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'beats_upload');
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxqqv0srw/${type === 'picture' ? 'image' : 'video'}/upload`,
        data,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [type]: progress }));
          }
        }
      );
      
      if (!response.data || !response.data.secure_url) {
        throw new Error(`Failed to get upload URL for ${type}`);
      }
      
      return response.data.secure_url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Failed to upload ${type}: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress({ picture: 0, audio: 0 });

    try {
      if (!files.picture || !files.audio) {
        throw new Error('Both picture and audio files are required');
      }

      // Upload files to Cloudinary
      const [pictureUrl, audioUrl] = await Promise.all([
        uploadToCloudinary(files.picture, 'picture'),
        uploadToCloudinary(files.audio, 'audio')
      ]);

      // Prepare beat data
      const beatData = {
        ...formData,
        picture: pictureUrl,
        audio: audioUrl
      };
      // Send beat data to backend
      const response = await axios.post(
        'https://vinkid-beatz-backend.onrender.com/api/upload-beat',
        beatData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Beat uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        bpm: '',
        price: '',
        genre: '',
      });
      setFiles({ picture: null, audio: null });
      setUploadProgress({ picture: 0, audio: 0 });
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        input.value = '';
      });

    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload beat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="beat-upload-container text-gray-600">
        <h2 className="text-white text-2xl font-bold mb-6">Upload Beat</h2>
        <form onSubmit={handleSubmit} className="beat-upload-form space-y-4">
          <div className="form-group">
            {/* title input  */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            {/* bpm input */}
            <input
              type="number"
              name="bpm"
              placeholder="BPM"
              value={formData.bpm}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            {/* price input */}
            <input
              type="number"
              name="price"
              placeholder="Price ($)"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            // genre input
            <input
              type="text"
              name="genre"
              placeholder="Genre"
              value={formData.genre}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="form-group">
            {/* picture input field */}
            <label className="block text-white mb-2">
              Cover Image {uploadProgress.picture > 0 && `(${uploadProgress.picture}%)`}
            </label>
            <input
              type="file"
              name="picture"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <div className="form-group">
            {/* audio/ beat input field */}
            <label className="block text-white mb-2">
              Audio File {uploadProgress.audio > 0 && `(${uploadProgress.audio}%)`}
            </label>
            <input
              type="file"
              name="audio"
              accept="audio/*"
              onChange={handleFileChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Beat'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BeatUploadForm;

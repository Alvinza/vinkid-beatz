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
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const uploadToCloudinary = async (file, type) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'beats_upload');
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxqqv0srw/${type}/upload`,
        data,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [type]: progress }));
          }
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Failed to upload ${type}`);
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

      const pictureUrl = await uploadToCloudinary(files.picture, 'image');
      const audioUrl = await uploadToCloudinary(files.audio, 'video');

      const beatData = {
        ...formData,
        picture: pictureUrl,
        audio: audioUrl
      };
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
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const uploadToCloudinary = async (file, type) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'beats_upload');
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${type}/upload`,
        data,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [type]: progress }));
          }
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Failed to upload ${type}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress({ picture: 0, audio: 0 });

    try {
      // Validate files
      if (!files.picture || !files.audio) {
        throw new Error('Both picture and audio files are required');
      }

      // Upload files to Cloudinary
      const pictureUrl = await uploadToCloudinary(files.picture, 'image');
      const audioUrl = await uploadToCloudinary(files.audio, 'video');

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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        <h2 className="text-white">Upload Beat</h2>
        <form onSubmit={handleSubmit} className="beat-upload-form">
          {/* ... existing form inputs ... */}
          
          <div className="mb-4">
            <label className="block text-white mb-2">
              Cover Image {uploadProgress.picture > 0 && `(${uploadProgress.picture}%)`}
            </label>
            <input
              type="file"
              name="picture"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full p-2 rounded bg-white"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">
              Audio File {uploadProgress.audio > 0 && `(${uploadProgress.audio}%)`}
            </label>
            <input
              type="file"
              name="audio"
              accept="audio/*"
              onChange={handleFileChange}
              required
              className="w-full p-2 rounded bg-white"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload Beat'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BeatUploadForm;

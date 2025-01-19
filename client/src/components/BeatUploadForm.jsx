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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload files to Cloudinary first
      const uploadPromises = [];
      let pictureUrl = '';
      let audioUrl = '';

      if (files.picture) {
        const pictureData = new FormData();
        pictureData.append('file', files.picture);
        pictureData.append('upload_preset', 'your_cloudinary_upload_preset'); // Replace with your upload preset
        const pictureUpload = axios.post(
          `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, // Replace with your cloud name
          pictureData
        );
        uploadPromises.push(pictureUpload);
      }

      if (files.audio) {
        const audioData = new FormData();
        audioData.append('file', files.audio);
        audioData.append('upload_preset', 'your_cloudinary_upload_preset'); // Replace with your upload preset
        const audioUpload = axios.post(
          `https://api.cloudinary.com/v1_1/your_cloud_name/video/upload`, // Replace with your cloud name
          audioData
        );
        uploadPromises.push(audioUpload);
      }

      const uploadResponses = await Promise.all(uploadPromises);
      
      if (uploadResponses[0]) {
        pictureUrl = uploadResponses[0].data.secure_url;
      }
      if (uploadResponses[1]) {
        audioUrl = uploadResponses[1].data.secure_url;
      }

      // Send beat data to your backend
      const beatData = {
        ...formData,
        picture: pictureUrl,
        audio: audioUrl
      };

      const response = await axios.post('https://vinkid-beatz-backend.onrender.com/api/upload-beat', beatData);
      
      toast.success("Beat uploaded successfully!");
      
      // Clear form after successful upload
      setFormData({
        title: '',
        bpm: '',
        price: '',
        genre: '',
      });
      setFiles({ picture: null, audio: null });
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        input.value = '';
      });

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to upload beat");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard">
      <div className="beat-upload-container text-gray-600">
        <h2 className='text-white'>Upload Beat</h2>
        <form onSubmit={handleSubmit} className="beat-upload-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 mb-4 rounded"
          />
          <input
            type="number"
            name="bpm"
            placeholder="BPM"
            value={formData.bpm}
            onChange={handleChange}
            required
            className="w-full p-2 mb-4 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full p-2 mb-4 rounded"
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={formData.genre}
            onChange={handleChange}
            required
            className="w-full p-2 mb-4 rounded"
          />
          <div className="mb-4">
            <label className="block text-white mb-2">Cover Image</label>
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
            <label className="block text-white mb-2">Audio File</label>
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

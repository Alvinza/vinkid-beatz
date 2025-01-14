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
  // const [uploadedBeat, setUploadedBeat] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('bpm', formData.bpm);
    data.append('price', formData.price);
    data.append('genre', formData.genre);
    data.append('picture', files.picture);
    data.append('audio', files.audio);

    try {
      const response = await axios.post('https://vinkid-beatz-backend.onrender.com/api/upload-beat', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Beat uploaded successfully!");
      // setUploadedBeat(response.data); // Assuming backend returns the beat data
      console.log(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload beat");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="dashboard">
      <div className="beat-upload-container  text-gray-600">
      <h2 className='text-white'>Upload</h2>
      <form onSubmit={handleSubmit} className="beat-upload-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="bpm"
          placeholder="BPM"
          value={formData.bpm}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="genre"
          placeholder="Genre"
          value={formData.genre}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="picture"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <input
          type="file"
          name="audio"
          accept="audio/*"
          onChange={handleFileChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Beat'}
        </button>
      </form>
    </div>
  </div>
  );
}

export default BeatUploadForm;

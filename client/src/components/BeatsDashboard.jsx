import React, { useState, useEffect } from 'react';

const BeatsDashboard = () => {
  const [beats, setBeats] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch beats when component mounts
  useEffect(() => {
    fetchBeats();
  }, []);

  // Retrieve stored authentication token for API requests
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all beats from backend
  const fetchBeats = async () => {
    try {
      const response = await fetch('https://vinkid-beatz-backend.onrender.com/api/beats');
      const data = await response.json();
      setBeats(data);
    } catch (error) {
      console.error('Error fetching beats:', error);
    }
  };

  // Enable edit mode for a specific beat
  const handleEdit = (beat) => {
    setEditingId(beat._id);
    setEditForm({ ...beat });
  };

   // Save updated beat details to backend
  const handleUpdate = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`https://vinkid-beatz-backend.onrender.com/api/beats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        setEditingId(null);
        fetchBeats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update beat');
      }
    } catch (error) {
      console.error('Error updating beat:', error);
      alert('Failed to update beat');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this beat?')) {
      try {
        const token = getAuthToken();
        const response = await fetch(`https://vinkid-beatz-backend.onrender.com/api/beats/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchBeats();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to delete beat');
        }
      } catch (error) {
        console.error('Error deleting beat:', error);
        alert('Failed to delete beat');
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-amber-100">Beats Management</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {beats.map((beat) => (
          <div key={beat._id} className="border rounded-lg p-3 bg-white shadow">
            {editingId === beat._id ? (
              // Edit Form
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={editForm.bpm}
                    onChange={(e) => setEditForm({ ...editForm, bpm: Number(e.target.value) })}
                    placeholder="BPM"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    placeholder="Price"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editForm.genre}
                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                    placeholder="Genre"
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdate(beat._id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Beat
              <>
                <div className="h-32 relative mb-2">
                  <img
                    src={beat.picture} // Direct Cloudinary URL
                    alt={beat.title}
                    className="object-cover w-full h-full rounded"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{beat.title}</h3>
                  <div className="text-xs text-gray-600">
                    <p>Genre: {beat.genre}</p>
                    <p>BPM: {beat.bpm}</p>
                    <p>Price: ${beat.price}</p>
                  </div>
                  <audio controls className="w-full mt-1 h-8">
                    <source src={beat.audio} type="audio/mpeg" /> {/* Direct Cloudinary URL */}
                    Your browser does not support the audio element.
                  </audio>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(beat)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(beat._id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeatsDashboard;

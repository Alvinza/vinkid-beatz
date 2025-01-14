import React from "react";

import BeatUploadForm from "./BeatUploadForm";
import BeatsDashboard from "./BeatsDashboard";


const AdminPanel = () => {

  return (
    <div className="adminPanel bg-black">
      <div className="beatManagment container pt-5">
      <h1 className="text-center text-yellow-50">Admin Panel</h1>
      <p className='text-gray-300 text-center'>Welcome, Admin! You can manage your beats here.</p>
      <BeatUploadForm />
      <BeatsDashboard />
      </div>
    </div>
  );
};

export default AdminPanel;

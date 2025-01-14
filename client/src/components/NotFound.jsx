import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    const homePage = () => {
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#1e62b0] text-white text-center font-poppins">
            <h1 className="text-[10rem] font-bold text-[#ffffff] animate-pulse">
                404
            </h1>
            <h2 className="text-2xl font-medium mb-4 shadow-md">
                Oops! Page Not Found
            </h2>
            <p className="text-lg max-w-xl mb-6 leading-relaxed">
                The page you're looking for doesn't exist or might have been removed. 
                But don't worry, you can always find your way back home.
            </p>
            <button
                onClick={homePage}
                className="bg-white text-[#1e62b0] py-3 px-8 rounded-full font-bold text-lg hover:scale-105 hover:shadow-lg transition-transform duration-200"
            >
                Go Home
            </button>
        </div>
    );
};

export default NotFound;

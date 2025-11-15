import React, { useEffect, useState } from "react";

const YoutubePlayer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const videoId = "XlNYAadtV68";

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );

        if (!res.ok) throw new Error("Video not found");

        setIsLoading(false);
      } catch (err) {
        setError("Unable to load video.");
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 rounded-lg shadow-lg bg-white">
      <div className="w-full h-[350px] mb-4">
        <iframe
          className="w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube Video"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      {isLoading && (
        <p className="text-gray-600 text-center">Loading Video...</p>
      )}

      {error && (
        <p className="text-red-500 text-center font-medium">{error}</p>
      )}
    </div>
  );
};

export default YoutubePlayer;

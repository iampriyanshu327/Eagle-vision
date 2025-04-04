import { useRef } from "react";

const Testing = () => {
  const videoRef = useRef(null);

  const seekToTime = (timeInSeconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <video ref={videoRef} src="video.mp4" controls className="w-3/4 max-w-2xl rounded-lg shadow-lg" />
      <p className="mt-4 text-lg">
        There is a car at
        <span 
          className="text-blue-400 cursor-pointer ml-2 hover:underline" 
          onClick={() => seekToTime(5)}
        >
          00:05
        </span>
      </p>
    </div>
  );
};

export default Testing;
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";

function ChatBotPage() {
  const flask_url="http://192.168.46.53:5010"; //The flask URL goes here!
  const [isLoading, setIsLoading] = useState(false); // Add state
  const [isTyping, setIsTyping] = useState(true); // Add state
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [place, setPlace] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserMessage(transcript); // Set the speech text into the input box
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };


  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${flask_url}/getCameras`);
      setCameras(response.data.cameras);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      alert("Failed to fetch cameras. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCameraSelect = async (event) => {
    const selectedPlace = event.target.value;
    setSelectedCamera(selectedPlace);
    setIsDropdownOpen(false);

    if (selectedPlace) {
      try {
        const videoSrc = `${selectedPlace}.mp4`;
        videoRef.current.src = videoSrc;
        videoRef.current.load();
        await axios.post(`${flask_url}/updateVectorStore`, { place: selectedPlace });
      } catch (error) {
        console.error("Error updating vector store:", error);
        alert("Failed to update vector store. Please try again.");
      }
    }
  };

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!videoFile || !place) {
      alert("Please enter a place and select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("place", place);

    try {
      const response = await axios.post(`${flask_url}/createFlorenceDocument`, formData);

      if (response.status === 200) {
        alert("CCTV registered successfully!");
        setIsPopupOpen(false);
        setPlace("");
        setVideoFile(null);
      } else {
        alert("Failed to register CCTV.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while registering CCTV.");
    }
  };

  const handleMessageChange = (e) => setUserMessage(e.target.value);



  const handleSendMessage = async () => {
    setIsTyping(true); // Show typing animation

    {isTyping && (
      <div className="self-start bg-gray-300 text-gray-800 p-3 rounded-lg w-fit max-w-[75%] shadow-md">
        <span className="animate-pulse">Zen is typing...</span>
      </div>
    )}

    if (!userMessage.trim()) return;

    
  
    setChatHistory((prev) => [...prev, { sender: "user", message: userMessage }]);
    setUserMessage("");

  
    try {
      const response = await axios.post(`${flask_url}/getResponse`, {
        query: userMessage,
      });
  
      let chatbotMessage = response.data.response;
      let readabletext = response.data.response;
      const timestampRegex = /\d{2}:\d{2}/g;
      const matches = chatbotMessage.match(timestampRegex);


  
      if (matches) {
        matches.forEach((timestamp) => {
          const [minutes, seconds] = timestamp.split(":").map(Number);
          const timeInSeconds = minutes * 60 + seconds;
          chatbotMessage = chatbotMessage.replace(
            timestamp,
            `<span class='text-blue-400 cursor-pointer hover:underline' data-time='${timeInSeconds}'>${timestamp}</span>`
          );
        });
      }
  
      setChatHistory((prev) => [...prev, { sender: "chatbot", message: chatbotMessage }]);
      speakMessage(readabletext);

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsTyping(false); // Hide typing animation
    }
  };
  
  // const handleSendMessage = async () => {
  //   if (!userMessage.trim()) return;

  //   setChatHistory((prev) => [...prev, { sender: "user", message: userMessage }]);

  //   try {
  //     const response = await axios.post(`${flask_url}/getResponse`, {
  //       query: userMessage,
  //     });
  //     let chatbotMessage = response.data.response;
  //     let readabletext = response.data.response;
  //     const timestampRegex = /\d{2}:\d{2}/g;
  //     const matches = chatbotMessage.match(timestampRegex);

  //     if (matches) {
  //       matches.forEach((timestamp) => {
  //         const [minutes, seconds] = timestamp.split(":").map(Number);
  //         const timeInSeconds = minutes * 60 + seconds;
  //         chatbotMessage = chatbotMessage.replace(
  //           timestamp,
  //           `<span class='text-blue-400 cursor-pointer hover:underline' data-time='${timeInSeconds}'>${timestamp}</span>`
  //         );
  //       });
  //     }
  //     setChatHistory((prev) => [...prev, { sender: "chatbot", message: chatbotMessage }]);
  //     setUserMessage("");

  //     // Speak the chatbot's message
  //     speakMessage(readabletext);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Failed to send message. Please try again.");
  //   }
  // };

  const speakMessage = (message) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-speech is not supported in this browser.");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTimestampClick = (event) => {
    const timeElement = event.target.closest("[data-time]");
    if (timeElement) {
      const timeInSeconds = parseInt(timeElement.getAttribute("data-time"), 10);
      if (videoRef.current) {
        videoRef.current.currentTime = timeInSeconds;
      }
    }
  };

  useEffect(() => {
    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      chatContainer.addEventListener("click", handleTimestampClick);
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("click", handleTimestampClick);
      }
    };
  }, [chatHistory]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-900 p-6 space-y-6 lg:space-y-0 lg:space-x-8">
      <div className="flex flex-col items-center flex-1">
        <img src="etherium.png" alt="ZenSafe Logo" className="w-24 h-auto object-contain mb-2" />
        <div className="text-4xl font-extrabold tracking-wide text-center">
          <span className="bg-gradient-to-t from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">ZEN</span>{" "}
          <span className="bg-gradient-to-b from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">SAFE</span>
        </div>

        <Player autoplay loop src="Chatbot.json" className="w-48 h-48 my-4" />
        <p className="text-gray-300 text-lg max-w-md text-center">Hey! I'm Zen, How can I help you?</p>
        <div className="flex space-x-4 mt-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow" onClick={fetchCameras}>View CCTV Camera</button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow" onClick={() => setIsPopupOpen(true)}>Register CCTV Camera</button>
        </div>

        {/* CCTV Registration Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white">
              <h2 className="text-lg font-bold mb-4 text-gray-200">Register CCTV</h2>

              {/* Input for Place */}
              <input
                type="text"
                placeholder="Enter Place"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white p-2 rounded mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />

              {/* File Upload */}
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full bg-gray-700 border border-gray-600 text-white p-2 rounded mb-3 cursor-pointer focus:ring-2 focus:ring-green-500 focus:outline-none"
              />

              {/* Buttons */}
              <div className="flex justify-between">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  onClick={() => setIsPopupOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown for selecting cameras */}
        {isDropdownOpen && cameras.length > 0 && (
          <select className="bg-gray-800 text-white px-4 py-2 rounded-lg mb-4" onChange={handleCameraSelect} value={selectedCamera}>
            <option value="">Select a Camera</option>
            {cameras.map((camera, index) => (
              <option key={index} value={camera}>{camera}</option>
            ))}
          </select>
        )}

        <div className={`mt-6 bg-gray-800 w-full max-w-md ${isChatExpanded ? "h-[500px]" : "h-16"} rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 cursor-pointer chat-container`} onClick={!isChatExpanded ? () => setIsChatExpanded(true) : undefined}>
          {isChatExpanded ? (
            <>
              <div className="bg-gray-900 p-3 flex justify-between items-center">
                <p className="text-gray-300 text-sm">Eagle Vision Chatbot</p>
                <button className="text-gray-300 hover:text-white text-lg" onClick={() => setIsChatExpanded(false)}>×</button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`p-3 rounded-lg text-sm w-fit max-w-[75%] shadow-md ${chat.sender === "user" ? "bg-green-500 text-white self-end" : "bg-gray-300 text-gray-800 self-start"}`}>
                    <p dangerouslySetInnerHTML={{ __html: chat.message }}></p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-700 p-3 flex items-center">
                <input className="flex-1 p-3 rounded-lg bg-gray-900 text-gray-200 placeholder-gray-500" type="text" value={userMessage} onChange={handleMessageChange} placeholder="Type your message..." />
                <button className="ml-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg" onClick={handleSendMessage}>Send</button>
                <button
                  className={`ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ${isListening ? "opacity-50" : ""}`}
                  onClick={startListening}
                  disabled={isListening}
                >
                  🎤
                </button>
                <button
                  className="ml-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  onClick={stopSpeaking}
                >
                  Stop
                </button>
              </div>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-300 text-sm">Click to Chat</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <video ref={videoRef} src="video.mp4" controls className="w-4/5 h-auto rounded-lg shadow-lg"></video>
      </div>
    </div>
  );
}

export default ChatBotPage;

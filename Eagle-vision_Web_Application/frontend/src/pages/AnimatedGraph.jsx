import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./AnimatedGraph.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AnimatedGraph = () => {
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const videoRef = useRef(null);
  const [threshold, setThreshold] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Local video file path
  const videoSrc = "video.mp4"; // Update this path based on your file location

  useEffect(() => {
    const frames = 100; // Number of frames (X-axis labels)
    const minScore = 0.2;
    const maxScore = 0.8;
    const smoothingWindow = 5;
    const thresholdMultiplier = 2;

    // Generate random scores within range
    const scores = Array.from({ length: frames }, () => Math.random() * (maxScore - minScore) + minScore);

    // Compute smoothened scores using moving average
    const smoothenedScores = scores.map((score, index) => {
      return (
        scores
          .slice(Math.max(0, index - Math.floor(smoothingWindow / 2)), index + Math.ceil(smoothingWindow / 2))
          .reduce((acc, val) => acc + val, 0) / smoothingWindow
      );
    });

    // Statistical calculations
    const mean = smoothenedScores.reduce((acc, score) => acc + score, 0) / smoothenedScores.length;
    const variance = smoothenedScores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / smoothenedScores.length;
    const stdDev = Math.sqrt(variance);

    // Compute threshold
    const thresholdValue = mean + thresholdMultiplier * stdDev;
    setThreshold(thresholdValue);

    // Labels for X-axis
    const labels = Array.from({ length: frames }, (_, index) => index);

    // Construct chart data
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Original",
          data: scores,
          borderColor: "#4a9eff",
          backgroundColor: "rgba(74, 158, 255, 0.3)",
          fill: false,
          borderDash: [5, 5],
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: "Smoothened",
          data: smoothenedScores,
          borderColor: "#50fa7b",
          backgroundColor: "rgba(80, 250, 123, 0.3)",
          fill: true,
          borderWidth: 3,
          tension: 0.4,
        },
        {
          label: `Threshold (${thresholdValue.toFixed(3)})`,
          data: Array(frames).fill(thresholdValue),
          borderColor: "rgba(255, 0, 0, 1)",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    };

    setData(chartData);
  }, []);

  // Sync video and graph when the video plays
  useEffect(() => {
    if (videoRef.current && isPlaying) {
      const interval = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const frame = Math.min(Math.floor(currentTime), 99);
          setCurrentFrame(frame);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Sync graph when the current frame changes
  useEffect(() => {
    if (chartRef.current?.chart && data) {
      chartRef.current.chart.update();
    }
  }, [currentFrame, data]);

  // Handle play/pause, forward/backward buttons
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      videoRef.current.pause();
    } else {
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 1, videoRef.current.duration);
      videoRef.current.currentTime = newTime;
      setCurrentFrame(Math.min(Math.floor(newTime), 99));
    }
  };

  const handleBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 1, 0);
      videoRef.current.currentTime = newTime;
      setCurrentFrame(Math.max(Math.floor(newTime), 0));
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container">
      {/* Video at the top */}
      <video ref={videoRef} controls className="video-player">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Custom Video Controls */}
      <div className="video-controls">
        <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
        <button onClick={handleBackward}>Backward</button>
        <button onClick={handleForward}>Forward</button>
      </div>

      {/* Graph at the bottom */}
      <div className="chart-container">
      <Line
        ref={chartRef}
        data={{
          ...data,
          datasets: data.datasets.map((dataset) => {
            if (dataset.label === "Original" || dataset.label === "Smoothened") {
              return {
                ...dataset,
                data: dataset.data.slice(0, currentFrame + 1),
              };
            }
            return dataset;
          }),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                title: (context) => `Frame: ${context[0].label}`,
                label: (context) => `Score: ${context.raw.toFixed(3)}`,
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: "Frame Index", color: "white" },
              ticks: { display: false, color: "white" },
            },
            y: {
              title: { display: true, text: "Anomaly Score", color: "white" },
              ticks: { color: "white" },
              min: 0,
              max: 1,
            },
          },
          layout: { padding: 20 },
        }}
      />

      </div>
    </div>
  );
};

export default AnimatedGraph;

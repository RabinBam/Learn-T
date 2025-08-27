"use client";
import { useEffect, useState } from "react";

interface CharacterProps {
  mood: "idle" | "happy" | "error" | "correctcode";
  message?: string;
}

const Character: React.FC<CharacterProps> = ({ mood, message }) => {
  const [showMessage, setShowMessage] = useState(!!message);

  useEffect(() => {
    setShowMessage(!!message);
  }, [message]);

  // Map moods to images
  const getImageSrc = () => {
    switch (mood) {
      case "happy":
        return "/characters/happy_face.png";
      case "error":
        return "/characters/error_face.png";
      case "correctcode":
        return "/characters/correctcode_face.png";
      default:
        return "/characters/idle_face.png";
    }
  };

  return (
    <div className="fixed bottom-6 left-6 flex flex-col items-center z-50">
      <img
        src={getImageSrc()}
        alt={mood}
        className="w-24 h-24 rounded-full shadow-lg"
      />
      {showMessage && (
        <div className="mt-2 px-3 py-2 bg-white rounded-lg shadow text-sm max-w-xs text-gray-800 transition-opacity duration-500 ease-in-out">
          {message}
        </div>
      )}
    </div>
  );
};

export default Character;

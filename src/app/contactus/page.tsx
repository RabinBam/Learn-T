"use client";
import { saveContactMessage } from "@/services/contact";
import React, { useState, FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await saveContactMessage(formData); // send data to Firestore
      alert("✅ Thank you! Your message has been submitted.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error saving message:", error);
      alert("❌ Something went wrong. Please try again.");
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Waves */}
      <div className="wave-wrapper">
        <svg
          className="wave wave1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C200,80 400,240 600,160 C800,80 1000,240 1200,160 L1200,300 L0,300 Z"
            fill="#4338ca"
            opacity="0.5"
          />
        </svg>
        <svg
          className="wave wave2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 C250,120 500,240 750,160 C1000,80 1250,240 1500,160 L1500,300 L0,300 Z"
            fill="#4f46e5"
            opacity="0.35"
          />
        </svg>
        <svg
          className="wave wave3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,180 C300,100 600,260 900,180 C1200,100 1500,260 1800,180 L1800,300 L0,300 Z"
            fill="#6366f1"
            opacity="0.25"
          />
        </svg>
      </div>

      <main className="main">
        <section className="contactSection">
          <div
            className="contactContainer"
            style={{
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            {/* Left Info */}
            <div className="contactMessage">
              <h2 className="contactTitle">Get in Touch with us:</h2>
              <h3 className="contactSubtitle">
                Out-of-hours call answering for the property sector
              </h3>
              <ul className="contactList">
                <li>✔ Real people answering your phones out-of-hours</li>
                <li>✔ Specific services for property sector pain-points</li>
                <li>✔ 24 hour emergency contractor call outs</li>
              </ul>
              <div>
                <span>Phone: 📞 0161 510 5600</span>
                <br />
                <span>Email: example@example.com</span>
                <br />
                <span>Location: Kamal Pokhari, Kathmandu</span>
              </div>
            </div>

            {/* Right Form */}
            <div className="contactFormWrapper">
              <form onSubmit={handleSubmit}>
                <div className="formGroup">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Write your message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit" className="submitBtn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Styles */}
      <style jsx global>{`
        body {
          background: linear-gradient(
            180deg,
            #312e81 0%,
            #4338ca 40%,
            #4f46e5 70%,
            #6366f1 100%
          );
          color: #e5e7eb;
          font-family: "Oxanium", sans-serif;
          margin: 0;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .main {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 100vh;
          position: relative;
          z-index: 2;
        }

        .contactSection {
          position: relative;
          z-index: 20;
          width: 100%;
          padding: 2rem;
          border-radius: 1rem;
        }

        .contactContainer {
          display: grid;
          gap: 2rem;
          align-items: stretch;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .contactMessage {
          color: #fff;
          padding: 2rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .contactFormWrapper {
          color: #fff;
          padding: 2rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .formGroup {
          margin-bottom: 1.25rem;
        }

        label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #334155;
          background-color: #f9fafb;
          color: #111;
          font-size: 1rem;
        }

        .submitBtn {
          width: 100%;
          background: linear-gradient(135deg, #22d3ee, #3b82f6);
          color: white;
          font-weight: 700;
          padding: 0.75rem;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }

        .submitBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.5);
        }

        /* Waves */
        .wave-wrapper {
          position: fixed;
          bottom: 0; /* keep it grounded */
          left: 0;
          width: 100%;
          height: 400px;
          overflow: hidden;
          z-index: 1;
        }

        .wave {
          position: absolute;
          left: 0;
          width: 200%;
          height: 100%;
          animation: waveMove 20s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
        }

        .wave2 {
          animation-duration: 28s;
          animation-direction: reverse;
        }

        .wave3 {
          animation-duration: 35s;
        }

        @keyframes waveMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
};

export default ContactPage;

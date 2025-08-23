"use client";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Thank you! Your message has been submitted.");

    // Reset form
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  // CSS-in-JS styles
  const styles = {
    main: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      minHeight: "100vh",
      position: "relative" as const,
      zIndex: 2,
    },
    contactSection: {
      position: "relative" as const,
      zIndex: 20,
      width: "100%",
      padding: "2rem",
      background: "transparent",
      borderRadius: "1rem",
    },
    contactContainer: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "2rem",
      alignItems: "stretch",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
    },
    contactMessage: {
      color: "#fff",
      padding: "2rem",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      background: "transparent",
    },
    contactFormWrapper: {
      color: "#fff",
      padding: "2rem",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      background: "rgba(30, 41, 59, 0.8)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    contactTitle: {
      textAlign: "left" as const,
      fontSize: "2rem",
      fontWeight: 700,
      color: "#38bdf8",
      marginBottom: "1rem",
      margin: "0 0 1rem 0",
    },
    contactSubtitle: {
      fontSize: "1.8rem",
      marginBottom: "1rem",
      margin: "0 0 1rem 0",
    },
    contactList: {
      listStyle: "none",
      padding: 0,
      margin: "1rem 0",
    },
    contactListItem: {
      marginBottom: "0.8rem",
      fontSize: "1rem",
    },
    formGroup: {
      marginBottom: "1.25rem",
    },
    label: {
      display: "block",
      fontWeight: 600,
      marginBottom: "0.5rem",
      color: "#e2e8f0",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #334155",
      backgroundColor: "#f9fafb",
      color: "#111",
      fontSize: "1rem",
      boxSizing: "border-box" as const,
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #334155",
      backgroundColor: "#f9fafb",
      color: "#111",
      fontSize: "1rem",
      resize: "vertical" as const,
      boxSizing: "border-box" as const,
    },
    submitBtn: {
      width: "100%",
      background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
      color: "white",
      fontWeight: 700,
      padding: "0.75rem",
      border: "none",
      borderRadius: "0.75rem",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "transform 0.2s ease, box-shadow 0.3s ease",
    },
    backgroundOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300'%3E%3Cpath d='M0,150 C300,75 600,225 1200,150 L1200,300 L0,300 Z' fill='%23312e81' opacity='0.4'/%3E%3Cpath d='M0,200 C400,125 800,275 1200,200 L1200,300 L0,300 Z' fill='%234338ca' opacity='0.3'/%3E%3C/svg%3E") no-repeat bottom center`,
      backgroundSize: "cover",
      pointerEvents: "none" as const,
      zIndex: 1,
    },
  };

  // Media query handling (safe for server-side)
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveContactContainer = {
    ...styles.contactContainer,
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  };

  return (
    <>
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Background overlay */}
      <div style={styles.backgroundOverlay}></div>

      <main style={styles.main}>
        <section style={styles.contactSection}>
          <div style={responsiveContactContainer}>
            {/* Left: Message */}
            <div style={styles.contactMessage}>
              <h2 style={styles.contactTitle}>Get in Touch with us:</h2>
              <h3 style={styles.contactSubtitle}>
                Out-of-hours call answering for the property sector
              </h3>
              <ul style={styles.contactList}>
                <li style={styles.contactListItem}>
                  ✔ Real people answering your phones out-of-hours
                </li>
                <li style={styles.contactListItem}>
                  ✔ Specific services for property sector pain-points
                </li>
                <li style={styles.contactListItem}>
                  ✔ 24 hour emergency contractor call outs
                </li>
              </ul>
              <div>
                <span>Phone: 📞 0161 510 5600</span>
                <br />
                <span>Email: example@example.com</span>
                <br />
                <span>Location: Kamal Pokhari, Kathmandu</span>
              </div>
            </div>

            {/* Right: Form */}
            <div style={styles.contactFormWrapper}>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label htmlFor="name" style={styles.label}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="message" style={styles.label}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Write your message"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 5px 15px rgba(59,130,246,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Global body styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(
            180deg,
            #2d1b69 0%,
            #3730a3 30%,
            #4338ca 50%,
            #7c3aed 70%,
            #a855f7 85%,
            #c084fc 100%
          );
          color: #e5e7eb;
          font-family: "Oxanium", sans-serif;
          margin: 0;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
};

export default ContactPage;

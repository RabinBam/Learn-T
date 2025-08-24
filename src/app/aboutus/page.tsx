"use client";
import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";

const AboutUs = () => {
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [dropIndex, setDropIndex] = useState(0);

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dropCardsRef = useRef<HTMLDivElement[]>([]);
  const connectionLinesRef = useRef<any[]>([]);

  const members = [
    {
      name: "Rabin Bam",
      role: "Leader",
      img: "/assets/img/Rabin.jpg",
      bio: "There's only one way to live life, and that's without regrets. So I don't want regret not learning it.",
    },
    {
      name: "Sachin",
      role: "Lead Designer",
      img: "/assets/img/Sachin.jpg",
      bio: "Learning is boaring without a challenge. So I will change the way how you look at learning.",
    },
    {
      name: "Roshit Lamichanne",
      role: "Animation and Creative Director",
      img: "/assets/img/Roshit.jpg",
      bio: "It does not feel real when its not moving. So I will make it move.",
    },
    {
      name: "Oscar",
      role: "Tester and Developer",
      img: "/assets/img/Oscar.jpg",
      bio: "I hate bug and I will squash them all. So I will make sure everything works as expected.",
    },
    {
      name: "Sanskar",
      role: "Logic and Asset creator",
      img: "/assets/img/Sanskar.jpg",
      bio: "I prefer logic over design and Asset over woman. So I will make sure everything is logical and assets are ready.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!dropZoneRef.current || started) return;

      const triggerPoint =
        dropZoneRef.current.offsetTop - window.innerHeight / 2;

      if (window.scrollY > triggerPoint) {
        setStarted(true);
      }

      if (started && dropIndex < members.length) {
        const nextTrigger = triggerPoint + dropIndex * 280 * 0.7;
        if (window.scrollY > nextTrigger) {
          dropCard(members[dropIndex], dropIndex);
          setDropIndex((prev) => prev + 1);
        }
      }

      updateLineDrawing();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [started, dropIndex, members]);

  useEffect(() => {
    // Initial check on load in case user reloads scrolled
    if (
      dropZoneRef.current &&
      window.scrollY > dropZoneRef.current.offsetTop - window.innerHeight / 2
    ) {
      setStarted(true);
    }
    updateLineDrawing();
  }, []);

  const dropCard = (member: (typeof members)[0], index: number) => {
    if (!dropZoneRef.current || !svgRef.current) return;

    const cardWidth = 520;
    const verticalSpacing = 280;
    const sideMargin = 80;

    // Determine side (left/right)
    const side = index % 2 === 0 ? "left" : "right";
    // x position depends on side
    const xPos =
      side === "left" ? sideMargin : window.innerWidth - cardWidth - sideMargin;
    // y position grows with index
    const yPos = index * verticalSpacing + 50;

    // Create card element
    const card = document.createElement("div");
    card.className = "drop-card";
    card.style.left = `${xPos}px`;
    card.style.top = `${yPos}px`;
    card.dataset.index = index.toString();

    card.innerHTML = `
      <div class="content">
        <div class="profile">
          <img src="${member.img}" alt="${member.name}" />
          <div>
            <h3>${member.name}</h3>
            <p class="role">${member.role}</p>
          </div>
        </div>
        <p class="bio">${member.bio}</p>
      </div>
    `;

    dropZoneRef.current.appendChild(card);
    dropCardsRef.current[index] = card;

    // Animate drop with bounce
    setTimeout(() => {
      card.classList.add("show");
      // Expand content after drop animation
      setTimeout(() => {
        card.classList.add("expanded");
      }, 1100);
    }, 50);

    // Create connection line if not the first card
    if (index > 0) {
      const prevCard = dropCardsRef.current[index - 1];
      if (!prevCard) return;

      // Use getBoundingClientRect for precise positioning relative to viewport + scroll offset
      const prevRect = prevCard.getBoundingClientRect();
      const currRect = card.getBoundingClientRect();

      // Calculate line start (bottom center of previous card, relative to svg container)
      const svgRect = svgRef.current.getBoundingClientRect();
      const prevX = prevRect.left + prevRect.width / 2 - svgRect.left;
      const prevY = prevRect.top + prevRect.height - svgRect.top;

      // Calculate line end (top center of current card)
      const currX = currRect.left + currRect.width / 2 - svgRect.left;
      const currY = currRect.top - svgRect.top;

      // Create cubic bezier path for smooth curve
      const controlYOffset = 80;
      const d = `M${prevX},${prevY} C${prevX},${
        prevY + controlYOffset
      } ${currX},${currY - controlYOffset} ${currX},${currY}`;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", d);
      path.classList.add("connection-line");
      path.style.strokeDashoffset = path.getTotalLength().toString(); // Hide initially

      svgRef.current.appendChild(path);
      connectionLinesRef.current.push({
        path,
        length: path.getTotalLength(),
        startY: prevY + svgRect.top,
        endY: currY + svgRect.top,
      });
    }
  };

  const updateLineDrawing = () => {
    if (!connectionLinesRef.current.length) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    connectionLinesRef.current.forEach(({ path, length, startY, endY }) => {
      // Animate line drawing between startY-windowHeight and endY-100
      const startScroll = startY - windowHeight + 100;
      const endScroll = endY - 100;

      let progress = (scrollY - startScroll) / (endScroll - startScroll);
      progress = Math.min(Math.max(progress, 0), 1);

      path.style.strokeDashoffset = (length * (1 - progress)).toString();
    });
  };

  const handleReadMore = () => {
    alert(
      "More about our values and history will be added here soon! In the meantime, feel free to contact us for more information."
    );
  };

  return (
    <>
      <Head>
        <title>TailSpark - About Us</title>
        <style>
          {`
            @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

            body {
              margin: 0;
              font-family: "Poppins", sans-serif;
              background-color: #f0f9ff;
              color: #333;
              padding-top: 0;
              overflow-x: hidden;
            }

            /* Header section */
            .page-header {
              background: linear-gradient(120deg, #0284c7, #06b6d4);
              color: white;
              text-align: center;
              padding: 5rem 1rem;
              position: relative;
              overflow: hidden;
            }

            .page-header::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: radial-gradient(
                circle at 20% 30%,
                rgba(255, 255, 255, 0.1) 0%,
                transparent 60%
              );
            }

            .tagline {
              font-style: italic;
              opacity: 0.85;
              font-size: 1.2rem;
              max-width: 600px;
              margin: 1rem auto 0;
            }

            /* Main content */
            .about-container {
              display: flex;
              flex-wrap: wrap;
              gap: 3rem;
              padding: 4rem 2rem;
              background: white;
              align-items: center;
              justify-content: center;
              max-width: 1200px;
              margin: -3rem auto 0;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
              position: relative;
              z-index: 2;
            }

            .about-text {
              flex: 1 1 300px;
              max-width: 500px;
            }

            .about-text h2 {
              color: #0284c7;
              font-size: 2rem;
              margin-bottom: 1.5rem;
              position: relative;
              display: inline-block;
            }

            .about-text h2::after {
              content: "";
              position: absolute;
              bottom: -10px;
              left: 0;
              width: 70px;
              height: 4px;
              background: linear-gradient(90deg, #06b6d4, #0284c7);
              border-radius: 2px;
            }

            .about-text p {
              line-height: 1.8;
              margin-bottom: 1.5rem;
              color: #444;
            }

            .about-text button {
              background: linear-gradient(90deg, #06b6d4, #0284c7);
              color: white;
              padding: 12px 30px;
              border: none;
              border-radius: 6px;
              font-size: 1rem;
              margin-top: 1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              font-weight: 500;
              box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
            }

            .about-text button:hover {
              transform: translateY(-3px);
              box-shadow: 0 6px 15px rgba(2, 132, 199, 0.4);
            }

            .about-image img {
              width: 100%;
              max-width: 500px;
              border-radius: 12px;
              box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
              transition: transform 0.5s ease;
            }

            .about-image:hover img {
              transform: scale(1.03);
            }

            /* Team section */
            .team-section {
              position: relative;
              min-height: 100vh;
              background: #f0f9ff;
              padding: 4rem 2rem 0;
              overflow: hidden;
            }

            .section-title {
              text-align: center;
              color: #0284c7;
              font-size: 2.5rem;
              margin-bottom: 3rem;
              position: relative;
            }

            .section-title::after {
              content: "";
              position: absolute;
              bottom: -15px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 5px;
              background: linear-gradient(90deg, #06b6d4, #0284c7);
              border-radius: 3px;
            }

            /* Mission section */
            .mission {
              padding: 6rem 2rem;
              background: linear-gradient(135deg, #0284c7, #06b6d4);
              color: white;
              text-align: center;
              position: relative;
            }

            .mission::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230284c7' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
              opacity: 0.3;
            }

            .mission h2 {
              font-size: 2.5rem;
              margin-bottom: 1.5rem;
              position: relative;
              display: inline-block;
            }

            .mission h2::after {
              content: "";
              position: absolute;
              bottom: -15px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 4px;
              background: white;
              border-radius: 2px;
            }

            .mission p {
              font-size: 1.3rem;
              max-width: 700px;
              margin: 2rem auto 0;
              line-height: 1.8;
              font-weight: 300;
            }

            footer {
              background: #0c4a6e;
              color: white;
              text-align: center;
              padding: 2rem;
            }

            /* Animation background for team section */
            .team-section::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: radial-gradient(
                  circle at 10% 20%,
                  rgba(2, 132, 199, 0.05) 0%,
                  transparent 20%
                ),
                radial-gradient(
                  circle at 90% 80%,
                  rgba(6, 182, 212, 0.05) 0%,
                  transparent 20%
                );
            }

            /* Responsive Design */
            @media (max-width: 768px) {
              .about-container {
                flex-direction: column;
                text-align: center;
                padding: 3rem 1.5rem;
                margin-top: -2rem;
              }

              .about-text h2::after {
                left: 50%;
                transform: translateX(-50%);
              }

              .about-text button {
                width: 100%;
              }

              .page-header {
                padding: 4rem 1rem;
              }

              .section-title {
                font-size: 2rem;
              }
            }

            /* Drop cards */
            .drop-card {
              position: absolute;
              width: 520px;
              min-height: 260px;
              background: linear-gradient(135deg, #ffffff, #f0f9ff);
              border-radius: 1.5rem;
              box-shadow: 0 10px 30px rgba(2, 132, 199, 0.3);
              color: #0c4a6e;
              font-family: "Poppins", sans-serif;
              opacity: 0;
              transform-origin: center top;
              transform: translateY(-160px) scale(0.6);
              overflow: hidden;
              cursor: pointer;
              transition: box-shadow 0.3s ease;
              /* Animate transform & opacity only */
              will-change: transform, opacity;
            }
            .drop-card.show {
              animation: waterDrop 1.1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            }
            .drop-card.expanded > .content {
              opacity: 1;
              transform: translateX(0);
              transition: opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s;
            }

            /* Content inside drop cards */
            .drop-card > div.content {
              padding: 1.5rem 2rem;
              height: 100%;
              box-sizing: border-box;
              opacity: 0;
              transform: translateX(40px);
              display: flex;
              flex-direction: column;
              gap: 1.25rem;
              transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .drop-card .profile {
              display: flex;
              gap: 1.5rem;
              align-items: center;
            }
            .drop-card img {
              width: 104px;
              height: 104px;
              border-radius: 9999px;
              flex-shrink: 0;
              object-fit: cover;
              box-shadow: 0 0 18px rgba(2, 132, 199, 0.3);
              border: 3px solid #06b6d4;
              background: white;
            }
            .drop-card h3 {
              font-size: 1.8rem;
              font-weight: 700;
              margin: 0;
              color: #0c4a6e;
            }
            .drop-card p.role {
              color: #0284c7;
              margin: 0.3rem 0 1rem 0;
              font-weight: 600;
              font-size: 1.1rem;
              font-style: italic;
            }
            .drop-card p.bio {
              color: #334155;
              font-size: 1rem;
              line-height: 1.4;
              margin: 0;
              max-width: 420px;
            }
            .drop-card:hover {
              transform: scale(1.07);
              transition: transform 0.3s ease;
              z-index: 20;
              box-shadow: 0 15px 40px rgba(2, 132, 199, 0.4);
            }

            /* Connection lines */
            svg {
              overflow: visible;
              pointer-events: none;
            }
            .connection-line {
              stroke: #06b6d4;
              stroke-width: 3;
              stroke-dasharray: 200;
              stroke-dashoffset: 200; /* hide initially */
              fill: none;
              opacity: 1;
              transition: opacity 0.3s ease;
              filter: drop-shadow(0 0 3px rgba(2, 132, 199, 0.2));
            }

            /* Keyframes */
            @keyframes waterDrop {
              0% {
                transform: translateY(-160px) scale(0.6);
                opacity: 0;
              }
              60% {
                transform: translateY(20px) scale(1.1);
                opacity: 1;
              }
              80% {
                transform: translateY(-10px) scale(0.95);
              }
              100% {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
            }

            /* Responsive tweaks */
            @media (max-width: 650px) {
              .drop-card {
                width: 90vw !important;
                min-height: auto !important;
                left: 5% !important; /* Override to center in mobile */
                right: auto !important;
              }
              .drop-card > div.content {
                flex-direction: column;
                align-items: center;
                text-align: center;
              }
              .drop-card .profile {
                justify-content: center;
              }
              .drop-card img {
                width: 80px;
                height: 80px;
              }
            }
          `}
        </style>
      </Head>

      {/* Page Header */}
      <header className="page-header">
        <h1 className="text-4xl md:text-5xl font-bold">Our Amazing Team</h1>
        <p className="tagline">Dedicated to excellence and innovation</p>
      </header>

      <main>
        <section className="about-container">
          <div className="about-text">
            <h2>About Us</h2>
            <p>
              TailSpark is a passionate team of five creators, united by a
              shared vision: to make learning Tailwind CSS as smooth, engaging,
              and accessible as possible. We're not just teaching a framework —
              we're redefining how developers experience it.
            </p>
            <p>
              Each member of our team brings a unique spark to the table — from
              design and animation to testing, logic, and leadership. Together,
              we blend creativity, precision, and a touch of fun to ensure that
              Tailwind isn't just learned — it's enjoyed.
            </p>
            <p>
              Whether you're just starting out or brushing up your skills,
              TailSpark is here to guide you with clarity, challenge, and
              community. It's Tailwind, the TailSpark way — for everyone.
            </p>
            <button
              id="readMoreBtn"
              aria-label="Read more about the team"
              onClick={handleReadMore}
            >
              Read More
            </button>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop"
              alt="Our team working together"
            />
          </div>
        </section>

        {/* Team reveal section */}
        <section className="team-section" id="team-section">
          <h2 className="section-title">Meet Our Team</h2>
          {/* Drop Zone */}
          <section
            id="team"
            className="relative min-h-[1500px]"
            ref={dropZoneRef}
          >
            <svg
              id="connection-svg"
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              ref={svgRef}
            ></svg>
          </section>
        </section>

        <section className="mission">
          <h2>Our Mission</h2>
          <p>
            At TailSpark, our mission is to make learning Tailwind CSS simple,
            accessible, and enjoyable for everyone — from beginners to seasoned
            developers. We believe that clean, efficient design should be within
            everyone's reach, and we're here to spark that journey with clear
            guidance, hands-on practice, and a community that grows together.
            It's Tailwind, made smooth — for everyone.
          </p>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 TailSpark. All rights reserved.</p>
        <p className="mt-2 text-blue-100">
          Creating digital excellence since 2025
        </p>
      </footer>
    </>
  );
};

export default AboutUs;

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  img: string;
  bio: string;
}

export default function AboutPage() {
  const [started, setStarted] = useState(false);
  const [dropIndex, setDropIndex] = useState(0);
  const dropCardsRef = useRef<HTMLDivElement[]>([]);
  const connectionLinesRef = useRef<SVGPathElement[]>([]);
  const teamSectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [particles, setParticles] = useState<{top:string, left:string, duration:string, delay:string}[]>([]);

  useEffect(() => {
    // Only generate particles on the client
    const generated = Array.from({ length: 25 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 5}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(generated);
  }, []);
  const lineOffsetRef = useRef(0); // keeps current offset

  const members: TeamMember[] = [
    {
      name: "Rabin Bam",
      role: "Leader",
      img: "/icons/Rabin.jpg",
      bio: "There's only one way to live life, and that's without regrets. So I don't want regret not learning it.",
    },
    {
      name: "Sachin",
      role: "Lead Designer",
      img: "/icons/Sachin.jpg",
      bio: "Learning is boaring without a challenge. So I will change the way how you look at learning.",
    },
    {
      name: "Roshit Lamichanne",
      role: "Animation and Creative Director",
      img: "/icons/Roshit.jpg",
      bio: "It does not feel real when its not moving. So I will make it move.",
    },
    {
      name: "Oscar",
      role: "Tester and Developer",
      img: "/icons/oscar.jpg",
      bio: "I hate bug and I will squash them all. So I will make sure everything works as expected.",
    },
    {
      name: "Sanskar",
      role: "Logic and Asset creator",
      img: "/icons/Sanskar.jpg",
      bio: "I prefer logic over design and Asset over woman. So I will make sure everything is logical and assets are ready.",
    },
  ];

  const handleReadMore = () => {
    alert(
      "More about our values and history will be added here soon! In the meantime, feel free to contact us for more information."
    );
  };

  useEffect(() => {
    requestAnimationFrame(updateLineDrawing);
    const handleScroll = () => {
      if (!teamSectionRef.current) return;

      const triggerPoint = teamSectionRef.current.offsetTop - window.innerHeight / 2;

      if (!started && window.scrollY > triggerPoint) {
        setStarted(true);
      }

      if (started && dropIndex < members.length) {
        const nextTrigger = triggerPoint + dropIndex * 280 * 0.7;
        if (window.scrollY > nextTrigger) {
          dropCard(members[dropIndex], dropIndex);
          setDropIndex(prev => prev + 1);
        }
      }

      updateLineDrawing();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [started, dropIndex, members.length]);

  useEffect(() => {
    // Initial check on load in case user reloads scrolled
    if (teamSectionRef.current && window.scrollY > teamSectionRef.current.offsetTop - window.innerHeight / 2) {
      setStarted(true);
    }
    updateLineDrawing();
  }, []);

  const dropCard = (member: TeamMember, index: number) => {
    if (!teamSectionRef.current || !svgRef.current) return;

    const cardWidth = 520;
    const verticalSpacing = 280;
    const sideMargin = 80;

    // Determine side (left/right)
    const side = index % 2 === 0 ? "left" : "right";
    const xPos = side === "left"
      ? sideMargin
      : window.innerWidth - cardWidth - sideMargin;
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

    teamSectionRef.current.appendChild(card);
    dropCardsRef.current[index] = card;

    // Animate drop with bounce
    setTimeout(() => {
      card.classList.add("show");

      // Expand content after drop animation
      setTimeout(() => {
        card.classList.add("expanded");

        // Create straight dotted connection line after animation
        if (index > 0) {
          const prevCard = dropCardsRef.current[index - 1];
          if (!prevCard || !svgRef.current) return;

          const prevRect = prevCard.getBoundingClientRect();
          const currRect = card.getBoundingClientRect();
          const svgRect = svgRef.current.getBoundingClientRect();

          // Use vertical center of each card for line alignment
          const centerOffsetYPrev = prevRect.height / 2;
          const centerOffsetYCurr = currRect.height / 2;

          const x1 = prevRect.left + prevRect.width / 2 - svgRect.left;
          const y1 = prevRect.top + centerOffsetYPrev - svgRect.top;
          const x2 = currRect.left + currRect.width / 2 - svgRect.left;
          const y2 = currRect.top + centerOffsetYCurr - svgRect.top;

          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", x1.toString());
          line.setAttribute("y1", y1.toString());
          line.setAttribute("x2", x2.toString());
          line.setAttribute("y2", y2.toString());
          line.classList.add("connection-line"); // uses flowing dotted CSS

          svgRef.current.appendChild(line);
          connectionLinesRef.current.push(line);
        }
      }, 600);
    }, 50);
  };

  const updateLineDrawing = () => {
    if (!connectionLinesRef.current.length) return;

    const scrollY = window.scrollY;

    // Target offset based on scroll
    const targetOffset = scrollY % 16; // 16 = dash + gap
    // Smoothly interpolate
    lineOffsetRef.current += (targetOffset - lineOffsetRef.current) * 0.1;

    connectionLinesRef.current.forEach((line) => {
      line.style.strokeDashoffset = lineOffsetRef.current.toString();
    });

    requestAnimationFrame(updateLineDrawing); // continue animation
  };

  return (
    <div className="min-h-screen">
      {/* Particle background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float"
            style={{
              top: p.top,
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
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
              TailSpark is a passionate team of five creators, united by a shared
              vision: to make learning Tailwind CSS as smooth, engaging, and
              accessible as possible. We&apos;re not just teaching a framework — we&apos;re
              redefining how developers experience it.
            </p>
            <p>
              Each member of our team brings a unique spark to the table — from
              design and animation to testing, logic, and leadership. Together, we
              blend creativity, precision, and a touch of fun to ensure that
              Tailwind isn&apos;t just learned — it&apos;s enjoyed.
            </p>
            <p>
              Whether you&apos;re just starting out or brushing up your skills,
              TailSpark is here to guide you with clarity, challenge, and
              community. It&apos;s Tailwind, the TailSpark way — for everyone.
            </p>
            <button 
              id="readMoreBtn" 
              aria-label="Read more about the team"
              onClick={handleReadMore}
              className="read-more-btn"
            >
              Read More
            </button>
          </div>
          <div className="about-image">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop"
              alt="Our team working together"
              width={500}
              height={300}
              className="w-full max-w-[500px] rounded-xl shadow-lg transition-transform duration-500 hover:scale-105"
            />
          </div>
        </section>

        {/* Team reveal section */}
          <h2 className="section-title">Meet Our Team</h2>
        <section className="team-section" ref={teamSectionRef}>
          {/* Drop Zone */}
          <div id="team" className="relative min-h-[1400px]">
            <svg
              ref={svgRef}
              id="connection-svg"
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <defs>
                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        <section className="mission">
          <h2>Our Mission</h2>
          <p>
            At TailSpark, our mission is to make learning Tailwind CSS simple,
            accessible, and enjoyable for everyone — from beginners to seasoned
            developers. We believe that clean, efficient design should be within
            everyone&apos;s reach, and we&apos;re here to spark that journey with clear
            guidance, hands-on practice, and a community that grows together. It&apos;s
            Tailwind, made smooth — for everyone.
          </p>
        </section>
      </main>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

        body {
          margin: 0;
          font-family: "Poppins", sans-serif;
          background: linear-gradient(
            to bottom right, 
            #4c1d95,   /* purple-900 */
            #1e3a8a,   /* blue-900 */
            #3730a3    /* indigo-900 */
          );
          color: #333;
          overflow-x: hidden;
        }

        /* particles background */
        @keyframes float {
          0% {
            transform: translateY(0px);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.3;
          }
          100% {
            transform: translateY(0px);
            opacity: 0.7;
          }
        }

        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        /* Header section */
        .page-header {
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
          background: rgba(30, 41, 59, 0.8);
          align-items: center;
          justify-content: center;
          max-width: 1300px;
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
          color: white;
        }

        .read-more-btn {
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

        .read-more-btn:hover {
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
          padding: 4rem 2rem 0;
          overflow: hidden;
        }

        .section-title {
          text-align: center;
          color: white;
          font-size: 2.5rem;
          margin: 3rem;
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
          display: flex;
          flex-wrap: wrap;
          gap: 3rem;
          padding: 4rem 2rem;
          background: rgba(30, 41, 59, 0.8);
          align-items: center;
          justify-content: center;
          max-width: 1300px;
          margin: 4rem auto 0; /* place at end with some spacing */
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          position: relative;
          z-index: 2;
          text-align: center; /* optional for content */
          flex-direction: column; /* stack content vertically */
        }
        .mission h2 {
          width: 100%;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: white;
        }
        .mission p {
          max-width: 800px;
          line-height: 1.8;
          font-size: 1.2rem;
          color: white;
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

        /* Drop cards */
        .drop-card {
          position: absolute;
          width: 520px;
          min-height: 260px;
          background: rgba(30, 41, 59, 1);
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(2, 132, 199, 0.3);
          color: #ffffffff;
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
          color: #ffffffff;
        }
        .drop-card p.role {
          color: #ffffffff;
          margin: 0.3rem 0 1rem 0;
          font-weight: 600;
          font-size: 1.1rem;
          font-style: italic;
        }
        .drop-card p.bio {
          color: #ffffffff;
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
        .connection-line {
          stroke: #06b6d4;
          stroke-width: 3;
          fill: none;
          stroke-dasharray: 8 8; /* makes it dotted */
          stroke-dashoffset: 0; /* initial offset */
          transition: stroke-dashoffset 0.1s linear; /* smooth update on scroll */
          filter: drop-shadow(0 0 3px rgba(2, 132, 199, 0.3));
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

          .read-more-btn {
            width: 100%;
          }

          .page-header {
            padding: 4rem 1rem;
          }

          .section-title {
            font-size: 2rem;
          }
          
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
      `}</style>
    </div>
  );
}
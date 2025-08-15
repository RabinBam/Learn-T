document.getElementById("readMoreBtn").addEventListener("click", function() {
    alert("Here you can add more details about your team, company history, and values.");
});

const card = document.getElementById("card-container");
const pic1 = document.getElementById("profile-pic1");
const pic2 = document.getElementById("profile-pic2");
const profileName = document.getElementById("profile-name");
const profileText = document.getElementById("profile-text");

const person1 = {
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Person 1",
    text: "Expert in design and innovation. Loves creating beautiful and functional solutions."
};

const person2 = {
    img: "https://randomuser.me/api/portraits/women/45.jpg",
    name: "Person 2",
    text: "Specialist in marketing and outreach. Dedicated to connecting with our audience."
};

window.addEventListener("scroll", () => {
    const section = document.getElementById("merge-section");
    const rect = section.getBoundingClientRect();
    const startScroll = window.innerHeight / 2;
    let fraction = Math.min(Math.max((startScroll - rect.top) / startScroll, 0), 1);

    // Diagonal slope
    const startX = 50;
    const endX = window.innerWidth - 550;
    const startY = 50;
    const endY = 400;
    const x = startX + (endX - startX) * fraction;
    const y = startY + (endY - startY) * fraction;
    card.style.transform = `translate(${x}px, ${y}px)`;

    // Image blending
    pic1.style.opacity = 1 - fraction;
    pic2.style.opacity = fraction;

    // Text fade
    card.style.opacity = 1;
    if (fraction < 0.5) {
        profileName.textContent = person1.name;
        profileText.textContent = person1.text;
        card.classList.remove("right");
        card.classList.add("left");
    } else {
        profileName.textContent = person2.name;
        profileText.textContent = person2.text;
        card.classList.remove("left");
        card.classList.add("right");
    }
});

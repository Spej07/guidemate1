const locationData = [
    { name: "Bohol", image: "bohol.jpg" },
    { name: "Siargao", image: "siargao.jpg" },
    { name: "Cebu", image: "cebu.jpg" },
    { name: "Baguio", image: "baguio.webp" },
    { name: "Palawan", image: "palawan.jpg" }
];

const guideData = [
    { name: "Vince", image: "vince.jfif" },
    { name: "Christian", image: "christian.avif" },
    { name: "John", image: "john.webp" },
    { name: "Mark", image: "mark.webp" },
    { name: "Mark", image: "mark.webp" }
];

const container = document.getElementById("cardsContainer");
const buttons = document.querySelectorAll(".tab-btn");
const sectionTitle = document.getElementById("sectionTitle");
const searchInput = document.getElementById("searchInput");

function loadCards(data) {
    container.innerHTML = "";
    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${item.image}">
            <h3>${item.name}</h3>
        `;

        container.appendChild(card);
    });
}

loadCards(locationData);

buttons.forEach(button => {
    button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        if (button.dataset.type === "locations") {
            sectionTitle.textContent = "Popular Locations";
            searchInput.placeholder = "Search locations...";
            loadCards(locationData);
        } else {
            sectionTitle.textContent = "Top Tour Guides";
            searchInput.placeholder = "Search tour guides...";
            loadCards(guideData);
        }

        const reviews = [
    {
        name: "Mark D.",
        rating: 5,
        comment: "Amazing experience! The tour guide was very friendly and knowledgeable."
    },
    {
        name: "Anna L.",
        rating: 4,
        comment: "Beautiful location and smooth booking process. Highly recommend!"
    },
    {
        name: "Carlos M.",
        rating: 5,
        comment: "Best travel platform I’ve used. Everything was easy and clear."
    },

    {
        name: "Carlos M.",
        rating: 5,
        comment: "Best travel platform I’ve used. Everything was easy and clear."
    }
];

const reviewContainer = document.getElementById("reviewContainer");

function generateStars(count) {
    let stars = "";
    for (let i = 0; i < count; i++) {
        stars += "★";
    }
    return stars;
}

reviews.forEach(review => {
    const card = document.createElement("div");
    card.classList.add("review-card");

    card.innerHTML = `
        <h4>${review.name}</h4>
        <div class="stars">${generateStars(review.rating)}</div>
        <p>${review.comment}</p>
    `;

    reviewContainer.appendChild(card);
});

    });
});

// Login/Logout functionality
function initializeAuthButtons() {
    const loginBtn = document.getElementById("loginBtn");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    
    if (isLoggedIn) {
        loginLink.style.display = "none";
        loginBtn.classList.add("fade-out");
        logoutBtn.style.display = "inline-block";
        logoutBtn.classList.remove("fade-out");
    }
}

function handleLogout() {
    localStorage.removeItem("userLoggedIn");
    const loginBtn = document.getElementById("loginBtn");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    
    logoutBtn.classList.add("fade-out");
    setTimeout(() => {
        logoutBtn.style.display = "none";
        loginLink.style.display = "inline-block";
        loginBtn.classList.remove("fade-out");
    }, 300);
}

function setUserLoggedIn() {
    localStorage.setItem("userLoggedIn", "true");
    const loginBtn = document.getElementById("loginBtn");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    
    loginBtn.classList.add("fade-out");
    setTimeout(() => {
        loginLink.style.display = "none";
        logoutBtn.style.display = "inline-block";
        logoutBtn.classList.remove("fade-out");
    }, 300);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeAuthButtons);

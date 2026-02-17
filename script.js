const locationData = [
    { name: "Sirao Garden", image: "photos/Sirao.jpeg" }, 
    { name: "TOPS", image: "photos/tops.jpeg" },
    { name: "Taoist Temple", image: "photos/taoist.jpeg" },
    { name: "Magellan's Cross", image: "photos/mag.jpeg" },
    { name: "Temple of Leah", image: "photos/temp.jpeg" }
];

const guideData = [
    { name: "Vince", image: "photos/vince.jfif" },
    { name: "Christian", image: "photos/christian.avif" },
    { name: "Vince", image: "photos/vince.jfif" },
    { name: "Christian", image: "photos/christian.avif" },
    { name: "Vince", image: "photos/vince.jfif" }
];

const reviews = [
    { name: "Mark D.", rating: 5, comment: "Amazing experience!" },
    { name: "Anna L.", rating: 4, comment: "Beautiful location and smooth booking." },
    { name: "Carlos M.", rating: 5, comment: "Best travel platform I’ve used." }
];

const container = document.getElementById("cardsContainer");
const buttons = document.querySelectorAll(".tab-btn");
const sectionTitle = document.getElementById("sectionTitle");
const searchInput = document.getElementById("searchInput");
const reviewContainer = document.getElementById("reviewContainer");

// --- UI LOADING FUNCTIONS ---

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

function loadReviews() {
    reviewContainer.innerHTML = ""; // Clear first to prevent duplicates
    reviews.forEach(review => {
        const card = document.createElement("div");
        card.classList.add("review-card");
        card.innerHTML = `
            <h4>${review.name}</h4>
            <div class="stars">${"★".repeat(review.rating)}</div>
            <p>${review.comment}</p>
        `;
        reviewContainer.appendChild(card);
    });
}


function initializeAuthButtons() {
    const loginLink = document.getElementById("loginLink");
    const profileContainer = document.getElementById("profileContainer");
    
    // FIX: Use the same key consistently
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    
    if (isLoggedIn === "true") {
        loginLink.style.display = "none";
        profileContainer.style.display = "block";
    } else {
        loginLink.style.display = "block";
        profileContainer.style.display = "none";
    }
}

function handleLogout() {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("username");
    window.location.href = "landingpage.html"; 
}



document.addEventListener("DOMContentLoaded", () => {
    loadCards(locationData);
    loadReviews();
    initializeAuthButtons();
});

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
    });
});

document.getElementById("profilePic").addEventListener("click", (e) => {
    document.getElementById("dropdownMenu").classList.toggle("show");
    e.stopPropagation();
});

window.onclick = (event) => {
    if (!event.target.matches('.profile-pic')) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            menu.classList.remove('show');
        });
    }
};
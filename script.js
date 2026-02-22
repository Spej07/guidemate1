// --- DATA SOURCE ---
const locationData = [
    { name: "Kawasan Falls", description: "Famous turquoise waterfalls in Badian.", image: "photos/kaws.jpg" },
    { name: "Osmeña Peak", description: "The highest point in Cebu with 360-degree views.", image: "photos/osm.jpg" },
    { name: "Magellan's Cross", description: "A historical landmark from the Spanish era.", image: "photos/mag.jpeg" },
    { name: "Temple of Leah", description: "A grand symbol of undying love.", image: "photos/temp.jpeg" },
    { name: "Sirao Garden", description: "The Little Amsterdam of Cebu.", image: "photos/Sirao.jpeg" },
    { name: "Taoist Temple", description: "A colorful ritual center for devotees.", image: "photos/taoist.jpeg" }
];

const guideData = [
    { name: "Vince", description: "Expert in mountain trekking and photography.", image: "photos/vince.jfif" },
    { name: "Christian", description: "Local food and history specialist.", image: "photos/christian.avif" }
];

const reviews = [
    { name: "Mark D.", rating: 5, comment: "Amazing experience!" },
    { name: "Anna L.", rating: 4, comment: "Beautiful location and smooth booking." },
    { name: "Carlos M.", rating: 5, comment: "Best travel platform I’ve used." }
];

// --- SELECTORS ---
const container = document.getElementById("cardsContainer");
const tabButtons = document.querySelectorAll(".tab-btn");
const sectionTitle = document.getElementById("sectionTitle");
const searchInput = document.getElementById("searchInput");
const reviewContainer = document.getElementById("reviewContainer");

let currentType = "locations"; // Tracks if we are looking at locations or guides

// --- UI FUNCTIONS ---

/**
 * Renders cards based on filtered data and current tab
 */
function displayCards(items) {
    container.innerHTML = "";
    
    if (items.length === 0) {
        container.innerHTML = `<p class="no-results">No ${currentType} found matching your search.</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function loadReviews() {
    reviewContainer.innerHTML = "";
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

// --- AUTHENTICATION LOGIC ---

function initializeAuthButtons() {
    const loginLink = document.getElementById("loginLink");
    const profileContainer = document.getElementById("profileContainer");
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
    window.location.reload(); 
}

// --- EVENT LISTENERS ---

// Tab Switching Logic
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        // UI Updates
        tabButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        currentType = button.dataset.type; // "locations" or "guides"
        sectionTitle.textContent = currentType === "locations" ? "Popular Cebu Spots" : "Top Tour Guides";
        searchInput.placeholder = `Search ${currentType}...`;
        searchInput.value = ""; // Clear search on tab switch
        
        // Data Update
        const data = currentType === "locations" ? locationData : guideData;
        displayCards(data);
    });
});

// Search Logic (Works for both Tabs)
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const dataPool = currentType === "locations" ? locationData : guideData;
    
    const filtered = dataPool.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term))
    );
    
    displayCards(filtered);
});

// Profile Dropdown Toggle
document.getElementById("profilePic").addEventListener("click", (e) => {
    document.getElementById("dropdownMenu").classList.toggle("show");
    e.stopPropagation();
});

// Close dropdown when clicking outside
window.onclick = (event) => {
    if (!event.target.matches('.profile-pic')) {
        document.getElementById("dropdownMenu").classList.remove('show');
    }
};

// --- INITIALIZE PAGE ---
document.addEventListener("DOMContentLoaded", () => {
    displayCards(locationData);
    loadReviews();
    initializeAuthButtons();
});
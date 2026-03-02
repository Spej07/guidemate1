// --- 1. DATA SOURCES ---
const locationData = [
    { name: "Kawasan Falls", description: "Famous turquoise waterfalls in Badian.", image: "photos/kaws.jpg" },
    { name: "Osmeña Peak", description: "The highest point in Cebu with 360-degree views.", image: "photos/osm.jpg" },
    { name: "Magellan's Cross", description: "A historical landmark from the Spanish era.", image: "photos/mag.jpeg" },
    { name: "Temple of Leah", description: "A grand symbol of undying love.", image: "photos/temp.jpeg" },
    { name: "Sirao Garden", description: "The Little Amsterdam of Cebu.", image: "photos/Sirao.jpeg" },
    { name: "Taoist Temple", description: "A colorful ritual center for devotees.", image: "photos/taoist.jpeg" }
];

let guideData = [];

const reviews = JSON.parse(localStorage.getItem('userReviews')) || [
    { name: "Mark D.", rating: 5, comment: "Amazing experience!" },
    { name: "Anna L.", rating: 4, comment: "Beautiful location and smooth booking." },
    { name: "Carlos M.", rating: 5, comment: "Best travel platform I’ve used." }
];

// --- 2. SELECTORS ---
const container = document.getElementById("cardsContainer");
const tabButtons = document.querySelectorAll(".tab-btn");
const sectionTitle = document.getElementById("sectionTitle");
const searchInput = document.getElementById("searchInput");
const reviewContainer = document.getElementById("reviewContainer");
// Combined all possible profile image selectors across pages
const profilePics = document.querySelectorAll(".profile-pic, .large-avatar, #profilePic, #profileDropdownBtn");

let currentType = "locations"; 

// --- 3. PROFILE SYNC LOGIC ---
/**
 * Loads saved user data (Name & Photo) from localStorage 
 * and applies it to all relevant elements on the current page.
 */
function syncProfileData() {
    const savedName = localStorage.getItem("fullName") || "Guest Traveler";
    const savedPic = localStorage.getItem("profileImage");

    // 1. Update Name elements (Targets #profileName on both pages)
    const nameEl = document.getElementById("profileName");
    if (nameEl) {
        nameEl.textContent = savedName;
    }

    // 2. Update Handle (Targets #profileHandle on Profile page)
    const handleEl = document.getElementById("profileHandle");
    if (handleEl) {
        handleEl.textContent = `@${savedName.split(" ")[0].toLowerCase()}`;
    }

    // 3. Update ALL profile images (Navbar, Dropdown, and Large Header Avatar)
    // Uses a combined selector to find every instance of a profile image
    const profileElements = document.querySelectorAll('.profile-pic, .large-avatar, #profilePic, #profileDropdownBtn');
    
    if (savedPic) {
        profileElements.forEach(img => {
            img.src = savedPic;
        });
    }
}

// --- 4. UI RENDERING FUNCTIONS ---

function displayCards(items) {
    if (!container) return;
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
    if (!reviewContainer) return;
    reviewContainer.innerHTML = "";
    reviews.forEach(review => {
        const displayName = review.subject || review.name || "Anonymous";
        const card = document.createElement("div");
        card.classList.add("review-card");
        card.innerHTML = `
            <h4>${displayName}</h4>
            <div class="stars">${"★".repeat(review.rating)}</div>
            <p>${review.comment}</p>
        `;
        reviewContainer.appendChild(card);
    });
}

// --- 5. AUTHENTICATION & NAVIGATION ---

function initializeAuthButtons() {
    const loginLink = document.getElementById("loginLink");
    const profileContainer = document.getElementById("profileContainer");
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    
    if (isLoggedIn === "true") {
        if (loginLink) loginLink.style.display = "none";
        if (profileContainer) profileContainer.style.display = "block";
    } else {
        if (loginLink) loginLink.style.display = "block";
        if (profileContainer) profileContainer.style.display = "none";
    }
}

function handleLogout() {
    localStorage.removeItem("userLoggedIn");
    window.location.reload(); 
}

// --- 6. EVENT LISTENERS ---

// Tab Switching
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        currentType = button.dataset.type; 
        if (sectionTitle) sectionTitle.textContent = currentType === "locations" ? "Popular Cebu Spots" : "Top Tour Guides";
        if (searchInput) {
            searchInput.placeholder = `Search ${currentType}...`;
            searchInput.value = ""; 
        }
        
        const data = currentType === "locations" ? locationData : guideData;
        displayCards(data);
    });
});

// Search Logic
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const dataPool = currentType === "locations" ? locationData : guideData;
        const filtered = dataPool.filter(item => 
            item.name.toLowerCase().includes(term) || 
            (item.description && item.description.toLowerCase().includes(term))
        );
        displayCards(filtered);
    });
}

// Profile Dropdown Toggle
const profilePicBtn = document.getElementById("profilePic");
if (profilePicBtn) {
    profilePicBtn.addEventListener("click", (e) => {
        const menu = document.getElementById("dropdownMenu");
        if (menu) menu.classList.toggle("show");
        e.stopPropagation();
    });
}

// Close dropdown when clicking outside
window.onclick = (event) => {
    if (!event.target.matches('.profile-pic')) {
        const menu = document.getElementById("dropdownMenu");
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
};

// --- 7. INITIALIZATION ---

async function loadGuideData() {
    try {
        const response = await fetch('get_guides.php');
        guideData = await response.json();
    } catch (error) {
        console.error('Error loading guides:', error);
        guideData = [
            { name: "Vince", description: "Expert in mountain trekking and photography.", image: "photos/vince.jfif" },
            { name: "Christian", description: "Local food and history specialist.", image: "photos/christian.avif" }
        ];
    }
}

// Single DOMContentLoaded listener for the whole app
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Sync Profile Data (Name and Image) immediately on load
    syncProfileData(); 
    
    // 2. Initialize UI states (Login/Profile container visibility)
    initializeAuthButtons();

    // 3. Load dynamic content (Only if the containers exist on the page)
    if (container) {
        await loadGuideData();
        displayCards(locationData);
    }
    
    if (reviewContainer) {
        loadReviews();
    }
});
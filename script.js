// --- 1. DATA SOURCES ---
const defaultLocationData = [
    { name: "Kawasan Falls", description: "Famous turquoise waterfalls in Badian.", image: "photos/kaws.jpg", rating: 4.8, reviewCount: 80 },
    { name: "Osmeña Peak", description: "The highest point in Cebu with 360-degree views.", image: "photos/osm.jpg", rating: 4.5, reviewCount: 62 },
    { name: "Magellan's Cross", description: "A historical landmark from the Spanish era.", image: "photos/mag.jpeg", rating: 4.6, reviewCount: 120 },
    { name: "Temple of Leah", description: "A grand symbol of undying love.", image: "photos/temp.jpeg", rating: 4.7, reviewCount: 95 },
    { name: "Sirao Garden", description: "The Little Amsterdam of Cebu.", image: "photos/Sirao.jpeg", rating: 4.4, reviewCount: 74 },
    { name: "Taoist Temple", description: "A colorful ritual center for devotees.", image: "photos/taoist.jpeg", rating: 4.5, reviewCount: 88 }
];

let locationData = [...defaultLocationData];
let guideData = []; // Will be populated from the database

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

let currentType = "locations"; 

// #region agent log
fetch('http://127.0.0.1:7921/ingest/b62290be-ce23-4956-ad93-971fb215c8cf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e8c76a'},body:JSON.stringify({sessionId:'e8c76a',runId:'pre-fix',hypothesisId:'A,B',location:'script.js:top',message:'script.js loaded',data:{scriptVersion:'2026-03-06_price_removed_v2',href:(typeof window!=='undefined'&&window.location?window.location.href:null)},timestamp:Date.now()})}).catch(()=>{});
// #endregion

// --- 3. PROFILE SYNC LOGIC ---
function syncProfileData() {
    const savedName = localStorage.getItem("fullName") || "Guest Traveler";
    const role = localStorage.getItem("role") || "";
    const userId = localStorage.getItem("userId") || "";
    const roleKey = (role && userId) ? `profileImage:${role}:${userId}` : "";
    const savedPic = (roleKey ? localStorage.getItem(roleKey) : null) || localStorage.getItem("profileImage");

    const nameEl = document.getElementById("profileName");
    if (nameEl) nameEl.textContent = savedName;

    const handleEl = document.getElementById("profileHandle");
    if (handleEl) handleEl.textContent = `@${savedName.split(" ")[0].toLowerCase()}`;

    const profileElements = document.querySelectorAll('.profile-pic, .large-avatar, #profilePic, #profileDropdownBtn');
    if (savedPic) {
        profileElements.forEach(img => { img.src = savedPic; });
    }
}

// --- 4. UI RENDERING FUNCTIONS ---

function renderRating(rating, reviewCount) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<span class="star filled">●</span>';
    if (hasHalf) stars += '<span class="star half">○</span>';
    for (let i = full + (hasHalf ? 1 : 0); i < 5; i++) stars += '<span class="star">○</span>';
    return `<span class="card-rating">${stars} <span class="review-count">(${reviewCount || 0})</span></span>`;
}

function displayCards(items) {
    if (!container) return;
    container.innerHTML = "";
    // #region agent log
    fetch('http://127.0.0.1:7921/ingest/b62290be-ce23-4956-ad93-971fb215c8cf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e8c76a'},body:JSON.stringify({sessionId:'e8c76a',runId:'pre-fix',hypothesisId:'A,B,C',location:'script.js:displayCards',message:'displayCards called',data:{currentType,currentItemsCount:Array.isArray(items)?items.length:null,hasContainer:!!container},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    if (items.length === 0) {
        container.innerHTML = `<p class="no-results">No ${currentType} found matching your search.</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");
        
        const title = item.name || `${item.first_name} ${item.last_name}`;
        let desc = item.description || `@${item.username}`;
        const imgUrl = item.image || "photos/default-avatar.png";
        const rating = item.rating != null ? item.rating : 4.5;
        const reviewCount = (item.reviewCount != null) ? item.reviewCount : (item.review_count != null ? item.review_count : 0);

        // For locations: never show price/payment text; show only description (or fallback)
        if (currentType === "locations") {
            const looksLikePrice = /from\s*P?\s*[\d,]+(\s*per\s*adult)?/i.test(desc) || (item.price && String(desc).trim() === String(item.price).trim());
            if (looksLikePrice || !desc || desc === "—") {
                desc = item.description && !/from\s*P?\s*[\d,]+/i.test(item.description) ? item.description : `Discover ${title}.`;
            }
        }

        if (currentType === "locations") {
            // #region agent log
            fetch('http://127.0.0.1:7921/ingest/b62290be-ce23-4956-ad93-971fb215c8cf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e8c76a'},body:JSON.stringify({sessionId:'e8c76a',runId:'pre-fix',hypothesisId:'B,C',location:'script.js:displayCards:locations',message:'rendering location card',data:{title:(title||'').slice(0,40),hasPriceField:item&&('price'in item),descPreview:(String(desc||'').slice(0,40))},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            card.innerHTML = `
                <div class="card-image-wrap">
                    <img src="${imgUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <button type="button" class="card-fav" aria-label="Save">♡</button>
                </div>
                <div class="card-content">
                    <div class="card-title-row">
                        <h3>${title}</h3>
                        <button type="button" class="card-next-btn" aria-label="Next">→</button>
                    </div>
                    ${renderRating(rating, reviewCount)}
                    <p class="card-desc">${desc}</p>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="card-image-wrap">
                    <img src="${imgUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                </div>
                <div class="card-content">
                    <div class="card-title-row">
                        <h3>${title}</h3>
                        <button type="button" class="card-next-btn" aria-label="Next">→</button>
                    </div>
                    <p class="card-desc">${desc}</p>
                    <button class="book-btn" data-guide-id="${item.guide_id || ''}">Book Now</button>
                </div>
            `;
        }
        container.appendChild(card);
    });
}

function handleGuideBooking(button) {
    const guideId = parseInt(button.getAttribute("data-guide-id") || "0", 10);
    const card = button.closest(".card");
    const guideName = card && card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "this guide";
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const role = localStorage.getItem("role") || "";

    if (!guideId) {
        alert("This guide is not available for booking right now.");
        return;
    }

    if (!isLoggedIn || role !== "tourist") {
        alert("Please sign in as a tourist to book a guide.");
        window.location.href = "signinTouristAdmin.html";
        return;
    }

    if (!window.confirm(`Send a booking request to ${guideName}?`)) {
        return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Sending...";

    const form = new FormData();
    form.append("guide_id", guideId);

    fetch("book_guide.php", { method: "POST", credentials: "same-origin", body: form })
        .then(async (response) => {
            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                data = {};
            }
            return { status: response.status, data };
        })
        .then(({ status, data }) => {
            if (status === 403) {
                alert(data.error || "Please sign in as a tourist first.");
                window.location.href = "signinTouristAdmin.html";
                return;
            }

            if (!data.ok) {
                throw new Error(data.error || "Booking request failed.");
            }

            button.textContent = "Requested";
            alert(data.message || "Booking request sent. Waiting for admin approval.");
        })
        .catch((error) => {
            alert(error.message || "Could not send booking request.");
            button.disabled = false;
            button.textContent = originalText;
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
    if (typeof showLogoutConfirm === 'function') {
        showLogoutConfirm(function() {
            localStorage.removeItem("userLoggedIn");
            window.location.reload();
        }, 'Sign out? Yes or No');
    } else {
        localStorage.removeItem("userLoggedIn");
        window.location.reload();
    }
}

// --- 6. EVENT LISTENERS ---

// Tab Switching logic
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        currentType = button.dataset.type; 
        
        // Update Titles and Placeholders
        if (sectionTitle) {
            sectionTitle.textContent = currentType === "locations" ? "Explore experiences near Cebu City" : "Available Tour Guides";
        }
        const subtitle = document.querySelector(".explore-subtitle");
        if (subtitle) subtitle.textContent = currentType === "locations" ? "Can't-miss picks near you" : "Book a guide for your trip";
        if (searchInput) {
            searchInput.placeholder = `Search ${currentType}...`;
            searchInput.value = ""; 
        }
        
        // Show correct data
        const data = currentType === "locations" ? locationData : guideData;
        displayCards(data);
    });
});

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const dataPool = currentType === "locations" ? locationData : guideData;
        
        const filtered = dataPool.filter(item => {
            const name = (item.name || `${item.first_name} ${item.last_name}`).toLowerCase();
            const desc = (item.description || item.username || "").toLowerCase();
            return name.includes(term) || desc.includes(term);
        });
        
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
        const data = await response.json();
        // Set the global guideData variable
        guideData = data;
    } catch (error) {
        console.error('Error loading guides from DB, using defaults:', error);
        guideData = [
            { first_name: "Vince", last_name: "", username: "vince_trek", image: "photos/vince.jfif" },
            { first_name: "Christian", last_name: "", username: "xtian_eats", image: "photos/christian.avif" }
        ];
    }
}

async function loadSpotData() {
    try {
        const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
        const endpoint = isFile ? 'http://localhost/guidemate1/get_spots.php' : 'get_spots.php';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(endpoint, { credentials: 'same-origin', signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`get_spots failed: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            locationData = data;
        } else {
            locationData = [...defaultLocationData];
        }
    } catch (error) {
        console.error('Error loading spots from DB, using defaults:', error);
        locationData = [...defaultLocationData];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // #region agent log
    fetch('http://127.0.0.1:7921/ingest/b62290be-ce23-4956-ad93-971fb215c8cf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e8c76a'},body:JSON.stringify({sessionId:'e8c76a',runId:'pre-fix',hypothesisId:'A,B',location:'script.js:DOMContentLoaded',message:'DOMContentLoaded fired',data:{hasCardsContainer:!!document.getElementById('cardsContainer')},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    syncProfileData(); 
    initializeAuthButtons();

    if (container) {
        // Render immediately (fast), then replace with DB spots when loaded
        displayCards(locationData);

        loadSpotData().then(() => {
            if (currentType === 'locations') displayCards(locationData);
        });

        await loadGuideData();
    }
    
    var scrollAmount = 300;
    var scrollLeftBtn = document.getElementById("scrollLeft");
    var scrollRightBtn = document.getElementById("scrollRight");
    if (scrollLeftBtn && container) {
        scrollLeftBtn.addEventListener("click", function() {
            container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });
    }
    if (scrollRightBtn && container) {
        scrollRightBtn.addEventListener("click", function() {
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    }

    if (container) {
        container.addEventListener("click", function(e) {
            var bookBtn = e.target.closest(".book-btn");
            if (bookBtn) {
                handleGuideBooking(bookBtn);
                return;
            }
            var nextBtn = e.target.closest(".card-next-btn");
            if (nextBtn) {
                var card = nextBtn.closest(".card");
                if (card && card.nextElementSibling) {
                    card.nextElementSibling.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
                }
            }
        });
    }
    
    if (reviewContainer) loadReviews();
});
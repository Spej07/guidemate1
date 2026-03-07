document.addEventListener("DOMContentLoaded", () => {
    // 1. INITIAL SYNC & SELECTORS
    let fullName = localStorage.getItem("fullName") || "Guest Traveler";
    
    const profileName = document.getElementById("profileName");
    const profileHandle = document.getElementById("profileHandle");
    const profilePics = document.querySelectorAll(".profile-pic, .large-avatar, #profilePic, #profileDropdownBtn");
    const editBtn = document.getElementById("editProfileBtn");
    const imageInput = document.getElementById("imageInput");

    function updateDisplay(name) {
        if (profileName) profileName.textContent = name;
        if (profileHandle) {
            const handle = name.split(" ")[0].toLowerCase();
            profileHandle.textContent = `@${handle}`;
        }
    }

    function syncImages() {
        const role = localStorage.getItem("role") || "";
        const userId = localStorage.getItem("userId") || "";
        const roleKey = (role && userId) ? `profileImage:${role}:${userId}` : "";
        const savedImage = (roleKey ? localStorage.getItem(roleKey) : null) || localStorage.getItem("profileImage");
        if (savedImage && profilePics) {
            profilePics.forEach(img => img.src = savedImage);
        }
    }

    // Run initial display sync
    updateDisplay(fullName);
    syncImages();

    // 2. PROFILE EDITING LOGIC
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            const currentName = profileName.textContent;
            const newName = prompt("Enter your new full name:", currentName);
            
            if (newName && newName.trim() !== "") {
                localStorage.setItem("fullName", newName);
                updateDisplay(newName);
                if (typeof syncProfileData === "function") syncProfileData();

                if(confirm("Would you also like to change your profile picture?")) {
                    imageInput.click();
                }
            }
        });
    }

    if (imageInput) {
        imageInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const result = e.target.result;
                    const role = localStorage.getItem("role") || "";
                    const userId = localStorage.getItem("userId") || "";
                    if (role && userId) localStorage.setItem(`profileImage:${role}:${userId}`, result);
                    localStorage.setItem("profileImage", result);
                    profilePics.forEach(img => img.src = result);
                    if (typeof syncProfileData === "function") syncProfileData();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. TAB SWITCHING LOGIC
    const profileTabs = document.querySelectorAll('.profile-tabs a');
    const activityContent = document.getElementById('activityContent');
    const reviewsContent = document.getElementById('reviewsContent');

    profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.textContent.trim() === 'Reviews') {
                if (activityContent) activityContent.style.display = 'none';
                if (reviewsContent) {
                    reviewsContent.style.display = 'block';
                    loadUserReviews();
                }
            } else {
                if (activityContent) activityContent.style.display = 'block';
                if (reviewsContent) reviewsContent.style.display = 'none';
            }
        });
    });

    // Logout (Sign out)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof showLogoutConfirm === 'function') {
                showLogoutConfirm(function() {
                    localStorage.removeItem("userLoggedIn");
                    window.location.href = "landingpage.html";
                }, 'Sign out? Yes or No');
            } else {
                localStorage.removeItem("userLoggedIn");
                window.location.href = "landingpage.html";
            }
        });
    }

    // 4. INITIALIZE REVIEW SYSTEM
    initializeReviewDropdowns();
    initializeProfileReviewForm();
});

// --- 5. REVIEW SYSTEM FUNCTIONS ---

async function initializeReviewDropdowns() {
    const locationSelect = document.getElementById('reviewLocation');
    const guideSelect = document.getElementById('reviewGuide');
    if (!locationSelect || !guideSelect) return;

    let locations = Array.isArray(window.locationData) ? window.locationData : [];
    let guides = Array.isArray(window.guideData) ? window.guideData : [];

    if (locations.length === 0) {
        try {
            const res = await fetch('get_spots.php', { credentials: 'same-origin' });
            const data = await res.json();
            if (Array.isArray(data)) locations = data;
        } catch (_) {}
    }

    if (guides.length === 0) {
        try {
            const res = await fetch('get_guides.php', { credentials: 'same-origin' });
            const data = await res.json();
            if (Array.isArray(data)) guides = data;
        } catch (_) {}
    }

    populateDropdown(locationSelect, locations, 'Select a location');
    populateDropdown(guideSelect, guides, 'Select a tour guide');
}

function populateDropdown(selectElement, dataPool, placeholderText) {
    selectElement.innerHTML = `<option value="">${placeholderText}</option>`;
    (dataPool || []).forEach(item => {
        const name = (item && item.name) ? item.name : [item?.first_name, item?.last_name].filter(Boolean).join(' ');
        if (!name) return;
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
    });
}

function initializeProfileReviewForm() {
    const form = document.getElementById('profileReviewForm');
    const messageDiv = document.getElementById('profileReviewMessage');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const reviewType = document.getElementById('reviewType').value.trim();
        const locationName = document.getElementById('reviewLocation').value.trim();
        const guideName = document.getElementById('reviewGuide').value.trim();
        const rating = document.querySelector('input[name="tourRating"]:checked')?.value;
        const comment = document.getElementById('tourReviewComment').value.trim();

        if (!reviewType || !locationName || !guideName || !rating || !comment) {
            showProfileMessage('Please fill in all fields.', 'error', messageDiv);
            return;
        }

        const currentFullName = localStorage.getItem("fullName") || "Guest Traveler";

        fetch('submit_review.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                review_type: reviewType,
                location_name: locationName,
                guide_name: guideName,
                rating: parseInt(rating, 10),
                comment: comment
            })
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    showProfileMessage(data.message || 'Could not submit review.', 'error', messageDiv);
                    return;
                }

                const newReview = {
                    id: Date.now(),
                    name: currentFullName,
                    review_type: reviewType,
                    location_name: locationName,
                    guide_name: guideName,
                    rating: parseInt(rating, 10),
                    comment: comment,
                    date: new Date().toLocaleDateString()
                };

                let userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
                userReviews.unshift(newReview);
                localStorage.setItem('userReviews', JSON.stringify(userReviews));

                showProfileMessage('Review submitted successfully! It is now visible to the guide and admin.', 'success', messageDiv);
                form.reset();
                loadUserReviews();

                setTimeout(() => {
                    if (messageDiv) {
                        messageDiv.textContent = '';
                        messageDiv.classList.remove('success', 'error');
                    }
                }, 3000);
            })
            .catch(() => {
                showProfileMessage('Request failed. Please try again.', 'error', messageDiv);
            });
    });
}

function loadUserReviews() {
    const reviewsList = document.getElementById('yourReviewsList');
    if (!reviewsList) return;

    const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
    if (userReviews.length === 0) {
        reviewsList.innerHTML = '<p>You haven\'t submitted any reviews yet.</p>';
        return;
    }

    reviewsList.innerHTML = '';
    userReviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review-item');
        const reviewType = review.review_type || 'location';
        const locationName = review.location_name || review.subject || 'Unknown location';
        const guideName = review.guide_name || 'Unknown guide';
        reviewElement.innerHTML = `
            <div class="review-item-header">
                <div class="review-item-title">${locationName}</div>
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px;">Type: ${reviewType.toUpperCase()} · Guide: ${guideName}</div>
            <div class="review-item-rating" style="color: #fcc419; margin: 4px 0;">${'★'.repeat(review.rating)}</div>
            <div class="review-item-text" style="margin-bottom: 5px;">${review.comment}</div>
            <small style="color: #999;">Submitted on ${review.date}</small>
        `;
        reviewsList.appendChild(reviewElement);
    });
}

function showProfileMessage(message, type, element) {
    if (!element) return;
    element.textContent = message;
    element.className = ''; // Reset classes
    element.classList.add(type);
}
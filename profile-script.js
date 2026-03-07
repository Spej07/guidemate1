document.addEventListener("DOMContentLoaded", () => {
    // 1. INITIAL SYNC & SELECTORS
    const role = localStorage.getItem("role") || "";
    const userId = localStorage.getItem("userId") || "";
    const scopedNameKey = (role && userId) ? `profileName:${role}:${userId}` : "";
    const scopedImageKey = (role && userId) ? `profileImage:${role}:${userId}` : "";
    let fullName = (scopedNameKey ? localStorage.getItem(scopedNameKey) : null) || localStorage.getItem("fullName") || "Guest Traveler";
    
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
        const savedImage = (scopedImageKey ? localStorage.getItem(scopedImageKey) : null) || localStorage.getItem("profileImage");
        if (savedImage && profilePics) {
            profilePics.forEach(img => img.src = savedImage);
        }
    }

    async function hydrateProfileFromSession() {
        try {
            const response = await fetch("get_user.php", { credentials: "same-origin" });
            if (!response.ok) return;

            const data = await response.json();
            if (!data || !data.success) return;

            const sessionRole = String(data.role || role);
            const sessionUserId = String(data.user_id || userId);
            const sessionFullName = String(data.full_name || "").trim() || "Guest Traveler";
            const sessionFirstName = String(data.first_name || "");
            const sessionLastName = String(data.last_name || "");
            const sessionImage = String(data.profile_image || "");

            localStorage.setItem("role", sessionRole);
            localStorage.setItem("userId", sessionUserId);
            localStorage.setItem("firstName", sessionFirstName);
            localStorage.setItem("lastName", sessionLastName);
            localStorage.setItem("fullName", sessionFullName);
            localStorage.setItem(`firstName:${sessionRole}:${sessionUserId}`, sessionFirstName);
            localStorage.setItem(`lastName:${sessionRole}:${sessionUserId}`, sessionLastName);
            localStorage.setItem(`profileName:${sessionRole}:${sessionUserId}`, sessionFullName);
            if (sessionImage) {
                localStorage.setItem(`profileImage:${sessionRole}:${sessionUserId}`, sessionImage);
                localStorage.setItem("profileImage", sessionImage);
            }

            fullName = sessionFullName;
            updateDisplay(sessionFullName);
            syncImages();
            if (typeof syncProfileData === "function") syncProfileData();
        } catch (_) {}
    }

    // Run initial display sync
    updateDisplay(fullName);
    syncImages();
    hydrateProfileFromSession();

    // 2. PROFILE EDITING LOGIC
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            const currentName = profileName.textContent;
            const newName = prompt("Enter your new full name:", currentName);
            
            if (newName && newName.trim() !== "") {
                fullName = newName.trim();
                const nameParts = fullName.split(/\s+/);
                const firstName = nameParts.shift() || "";
                const lastName = nameParts.join(" ");
                if (scopedNameKey) localStorage.setItem(scopedNameKey, fullName);
                if (role && userId) {
                    localStorage.setItem(`firstName:${role}:${userId}`, firstName);
                    localStorage.setItem(`lastName:${role}:${userId}`, lastName);
                }
                localStorage.setItem("firstName", firstName);
                localStorage.setItem("lastName", lastName);
                localStorage.setItem("fullName", fullName);
                updateDisplay(fullName);
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
                    if (scopedImageKey) localStorage.setItem(scopedImageKey, result);
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
            const performLogout = () => {
                const activeRole = localStorage.getItem("role") || "";
                const activeUserId = localStorage.getItem("userId") || "";

                localStorage.removeItem("userLoggedIn");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                localStorage.removeItem("touristId");
                localStorage.removeItem("guideId");
                localStorage.removeItem("firstName");
                localStorage.removeItem("lastName");
                localStorage.removeItem("fullName");
                localStorage.removeItem("profileImage");
                localStorage.removeItem("userReviews");

                if (activeRole && activeUserId) {
                    localStorage.removeItem(`firstName:${activeRole}:${activeUserId}`);
                    localStorage.removeItem(`lastName:${activeRole}:${activeUserId}`);
                    localStorage.removeItem(`profileName:${activeRole}:${activeUserId}`);
                    localStorage.removeItem(`profileImage:${activeRole}:${activeUserId}`);
                }

                window.location.href = "logout.php";
            };

            if (typeof showLogoutConfirm === 'function') {
                showLogoutConfirm(performLogout, 'Sign out? Yes or No');
            } else {
                performLogout();
            }
        });
    }

    // 4. INITIALIZE REVIEW SYSTEM
    initializeReviewDropdowns();
    initializeProfileReviewForm();
});

// --- 5. REVIEW SYSTEM FUNCTIONS ---

async function fetchMyReviewData() {
    try {
        const response = await fetch('get_my_reviews.php', { credentials: 'same-origin' });
        let data = {};
        try {
            data = await response.json();
        } catch (_) {}
        if (!response.ok && !data.error) {
            data.error = 'Could not load your review data.';
        }
        return data;
    } catch (_) {
        return { reviews: [], eligible_guides: [], error: 'Could not load your review data.' };
    }
}

function updateReviewFormAvailability(canSubmit, customMessage) {
    const form = document.getElementById('profileReviewForm');
    const messageDiv = document.getElementById('profileReviewMessage');
    if (!form) return;

    form.querySelectorAll('select, textarea, input[type="radio"], button[type="submit"]').forEach((field) => {
        field.disabled = !canSubmit;
    });

    if (!canSubmit) {
        showProfileMessage(
            customMessage || 'You can only submit a review for guides that you have booked.',
            'error',
            messageDiv
        );
        return;
    }

    if (messageDiv && messageDiv.classList.contains('error')) {
        messageDiv.textContent = '';
        messageDiv.classList.remove('success', 'error');
    }
}

async function initializeReviewDropdowns() {
    const locationSelect = document.getElementById('reviewLocation');
    const guideSelect = document.getElementById('reviewGuide');
    if (!locationSelect || !guideSelect) return;

    let locations = Array.isArray(window.locationData) ? window.locationData : [];
    if (locations.length === 0) {
        try {
            const res = await fetch('get_spots.php', { credentials: 'same-origin' });
            const data = await res.json();
            if (Array.isArray(data)) locations = data;
        } catch (_) {}
    }

    populateDropdown(locationSelect, locations, 'Select a location');

    const reviewData = await fetchMyReviewData();
    const eligibleGuides = Array.isArray(reviewData.eligible_guides) ? reviewData.eligible_guides : [];
    populateDropdown(
        guideSelect,
        eligibleGuides,
        eligibleGuides.length > 0 ? 'Select a tour guide' : 'No booked guides yet'
    );
    if (eligibleGuides.length === 1) {
        guideSelect.value = String(eligibleGuides[0].guide_id);
    }
    updateReviewFormAvailability(eligibleGuides.length > 0, reviewData.error);
}

function populateDropdown(selectElement, dataPool, placeholderText) {
    selectElement.innerHTML = `<option value="">${placeholderText}</option>`;
    (dataPool || []).forEach(item => {
        const name = (item && item.name) ? item.name : [item?.first_name, item?.last_name].filter(Boolean).join(' ');
        if (!name) return;
        const option = document.createElement('option');
        if (Object.prototype.hasOwnProperty.call(item || {}, 'guide_id') && item.guide_id) {
            option.value = String(item.guide_id);
            option.dataset.name = name;
        } else {
            option.value = name;
        }
        option.textContent = name;
        selectElement.appendChild(option);
    });
}

function initializeProfileReviewForm() {
    const form = document.getElementById('profileReviewForm');
    const messageDiv = document.getElementById('profileReviewMessage');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const reviewType = document.getElementById('reviewType').value.trim();
        const locationName = document.getElementById('reviewLocation').value.trim();
        const guideSelect = document.getElementById('reviewGuide');
        const guideId = guideSelect ? parseInt(guideSelect.value, 10) || 0 : 0;
        const guideName = guideSelect
            ? ((guideSelect.options[guideSelect.selectedIndex]?.dataset.name || guideSelect.options[guideSelect.selectedIndex]?.textContent || '').trim())
            : '';
        const rating = document.querySelector('input[name="tourRating"]:checked')?.value;
        const comment = document.getElementById('tourReviewComment').value.trim();

        if (!reviewType || !locationName || !guideName || !rating || !comment) {
            showProfileMessage('Please fill in all fields.', 'error', messageDiv);
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        fetch('submit_review.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                review_type: reviewType,
                location_name: locationName,
                guide_id: guideId,
                guide_name: guideName,
                rating: parseInt(rating, 10),
                comment: comment
            })
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    showProfileMessage(data.message || 'Could not submit review.', 'error', messageDiv);
                    if (submitBtn) submitBtn.disabled = false;
                    return;
                }

                showProfileMessage('Review submitted successfully! It is now visible to the guide and admin.', 'success', messageDiv);
                form.reset();
                initializeReviewDropdowns();
                loadUserReviews();

                setTimeout(() => {
                    if (messageDiv) {
                        messageDiv.textContent = '';
                        messageDiv.classList.remove('success', 'error');
                    }
                }, 3000);
                if (submitBtn) submitBtn.disabled = false;
            })
            .catch(() => {
                showProfileMessage('Request failed. Please try again.', 'error', messageDiv);
                if (submitBtn) submitBtn.disabled = false;
            });
    });
}

function formatReviewDate(rawDate) {
    if (!rawDate) return 'Unknown date';
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) return String(rawDate);
    return parsedDate.toLocaleDateString();
}

async function loadUserReviews() {
    const reviewsList = document.getElementById('yourReviewsList');
    if (!reviewsList) return;

    const reviewData = await fetchMyReviewData();
    const userReviews = Array.isArray(reviewData.reviews) ? reviewData.reviews : [];
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
            <small style="color: #999;">Submitted on ${formatReviewDate(review.created_at)}</small>
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
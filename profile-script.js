document.addEventListener("DOMContentLoaded", () => {
    // Standardize naming: Use 'fullName' to match landing page sync
    let fullName = localStorage.getItem("fullName") || "Guest Traveler";
    
    // Selectors
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
        const savedImage = localStorage.getItem("profileImage");
        if (savedImage && profilePics) {
            profilePics.forEach(img => img.src = savedImage);
        }
    }

    // Run initial sync
    updateDisplay(fullName);
    syncImages();

    // EDIT PROFILE LOGIC
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            const currentName = profileName.textContent;
            const newName = prompt("Enter your new full name:", currentName);
            
            if (newName && newName.trim() !== "") {
                localStorage.setItem("fullName", newName);
                updateDisplay(newName);
                
                // Call landing page sync if available
                if (typeof syncProfileData === "function") syncProfileData();

                if(confirm("Would you also like to change your profile picture?")) {
                    imageInput.click();
                }
            }
        });
    }

    // IMAGE UPLOAD LOGIC
    if (imageInput) {
        imageInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const result = e.target.result;
                    localStorage.setItem("profileImage", result);
                    profilePics.forEach(img => img.src = result);
                    if (typeof syncProfileData === "function") syncProfileData();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // TAB SWITCHING LOGIC
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

    initializeProfileReviewForm();
    initializeReviewTypeDropdown();
});

// --- 6. REVIEW SYSTEM FUNCTIONS ---

function initializeReviewTypeDropdown() {
    const reviewTypeSelect = document.getElementById('reviewType');
    const reviewSubjectSelect = document.getElementById('reviewSubject');
    if (!reviewTypeSelect || !reviewSubjectSelect) return;

    reviewTypeSelect.addEventListener('change', () => {
        populateSubjectDropdown(reviewTypeSelect.value, reviewSubjectSelect);
    });
}

function populateSubjectDropdown(reviewType, selectElement) {
    selectElement.innerHTML = '<option value="">Select a location or guide</option>';
    
    // Uses global arrays defined in script.js
    const dataPool = (reviewType === 'location') ? locationData : (reviewType === 'guide' ? guideData : []);
    
    dataPool.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });
}

function initializeProfileReviewForm() {
    const form = document.getElementById('profileReviewForm');
    const messageDiv = document.getElementById('profileReviewMessage');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const reviewType = document.getElementById('reviewType').value;
        const reviewSubject = document.getElementById('reviewSubject').value.trim();
        const rating = document.querySelector('input[name="tourRating"]:checked')?.value;
        const comment = document.getElementById('tourReviewComment').value.trim();

        if (!reviewType || !reviewSubject || !rating || !comment) {
            showProfileMessage('Please fill in all fields.', 'error', messageDiv);
            return;
        }

        const fullName = localStorage.getItem("fullName") || "Guest Traveler";

        const newReview = {
            id: Date.now(),
            name: fullName,
            type: reviewType,
            subject: reviewSubject,
            rating: parseInt(rating),
            comment: comment,
            date: new Date().toLocaleDateString()
        };

        let userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        userReviews.push(newReview);
        localStorage.setItem('userReviews', JSON.stringify(userReviews));

        showProfileMessage('Review submitted successfully!', 'success', messageDiv);
        form.reset();
        loadUserReviews();

        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.remove('success', 'error');
        }, 3000);
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
        reviewElement.innerHTML = `
            <div class="review-item-header">
                <div class="review-item-title">${review.subject}</div>
                <span class="review-item-type">${review.type.charAt(0).toUpperCase() + review.type.slice(1)}</span>
            </div>
            <div class="review-item-rating">${'★'.repeat(review.rating)}</div>
            <div class="review-item-text">${review.comment}</div>
            <small style="color: #999;">Submitted on ${review.date}</small>
        `;
        reviewsList.appendChild(reviewElement);
    });
}

function showProfileMessage(message, type, element) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('success', 'error');
    element.classList.add(type);
}
document.addEventListener("DOMContentLoaded", () => {
    let firstName = localStorage.getItem("firstName") || "Guest";
    let lastName = localStorage.getItem("lastName") || "Traveler";
    
    const profileName = document.getElementById("profileName");
    const profileHandle = document.getElementById("profileHandle");
    const profilePics = document.querySelectorAll(".profile-pic, .large-avatar"); // Targets both small and large icons

    function updateDisplay(fName, lName) {
        profileName.textContent = `${fName} ${lName}`;
        profileHandle.textContent = `@${fName.toLowerCase()}`;
    }

    updateDisplay(firstName, lastName);

    
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
        profilePics.forEach(img => img.src = savedImage);
    }

    const editBtn = document.getElementById("editProfileBtn");
    const imageInput = document.getElementById("imageInput");

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            
            const newFullName = prompt("Enter your new full name (First Last):", `${firstName} ${lastName}`);
            
            if (newFullName) {
                const names = newFullName.split(" ");
                const newFirst = names[0];
                const newLast = names.slice(1).join(" ") || ""; // Handles cases with no last name

                localStorage.setItem("firstName", newFirst);
                localStorage.setItem("lastName", newLast);
                updateDisplay(newFirst, newLast);
            }

            
            if(confirm("Would you also like to change your profile picture?")) {
                imageInput.click();
            }
        });
    }

    
    imageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const result = e.target.result;
                
                localStorage.setItem("profileImage", result);
                
                profilePics.forEach(img => img.src = result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Tab Switching
    const profileTabs = document.querySelectorAll('.profile-tabs a');
    const activityContent = document.getElementById('activityContent');
    const reviewsContent = document.getElementById('reviewsContent');

    profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show/hide content based on tab
            if (tab.textContent.trim() === 'Reviews') {
                activityContent.style.display = 'none';
                reviewsContent.style.display = 'block';
                loadUserReviews();
            } else {
                activityContent.style.display = 'block';
                reviewsContent.style.display = 'none';
            }
        });
    });

    // Initialize review form
    initializeProfileReviewForm();
    initializeReviewTypeDropdown();
});

/**
 * Initialize review type dropdown to populate subject dropdown
 */
function initializeReviewTypeDropdown() {
    const reviewTypeSelect = document.getElementById('reviewType');
    const reviewSubjectSelect = document.getElementById('reviewSubject');

    if (!reviewTypeSelect || !reviewSubjectSelect) return;

    reviewTypeSelect.addEventListener('change', () => {
        populateSubjectDropdown(reviewTypeSelect.value, reviewSubjectSelect);
    });
}

/**
 * Populate the subject dropdown based on review type
 */
function populateSubjectDropdown(reviewType, selectElement) {
    selectElement.innerHTML = '<option value="">Select a location or guide</option>';

    if (reviewType === 'location') {
        locationData.forEach(location => {
            const option = document.createElement('option');
            option.value = location.name;
            option.textContent = location.name;
            selectElement.appendChild(option);
        });
    } else if (reviewType === 'guide') {
        guideData.forEach(guide => {
            const option = document.createElement('option');
            option.value = guide.name;
            option.textContent = guide.name;
            selectElement.appendChild(option);
        });
    }
}

/**
 * Initialize review form submission on profile page
 */
function initializeProfileReviewForm() {
    const form = document.getElementById('profileReviewForm');
    const messageDiv = document.getElementById('profileReviewMessage');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const reviewType = document.getElementById('reviewType').value;
        const reviewSubject = document.getElementById('reviewSubject').value.trim();
        const rating = document.querySelector('input[name="tourRating"]:checked').value;
        const comment = document.getElementById('tourReviewComment').value.trim();

        // Validate inputs
        if (!reviewType || !reviewSubject || !rating || !comment) {
            showProfileMessage('Please fill in all fields.', 'error', messageDiv);
            return;
        }

        // Get user info
        const userName = localStorage.getItem("firstName") || "Guest";
        const lastName = localStorage.getItem("lastName") || "Traveler";
        const fullName = `${userName} ${lastName}`;

        // Create review object
        const newReview = {
            id: Date.now(),
            name: fullName,
            type: reviewType,
            subject: reviewSubject,
            rating: parseInt(rating),
            comment: comment,
            date: new Date().toLocaleDateString()
        };

        // Get existing user reviews from localStorage or create new array
        let userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        userReviews.push(newReview);
        localStorage.setItem('userReviews', JSON.stringify(userReviews));

        // Also add to global reviews array
        reviews.push({
            name: fullName,
            rating: parseInt(rating),
            comment: comment
        });

        // Show success message
        showProfileMessage('Thank you! Your review has been submitted successfully.', 'success', messageDiv);

        // Reset form
        form.reset();

        // Reload reviews display
        loadUserReviews();

        // Auto-hide message after 3 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.remove('success', 'error');
        }, 3000);
    });
}

/**
 * Load and display user's reviews
 */
function loadUserReviews() {
    const reviewsList = document.getElementById('yourReviewsList');
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

/**
 * Display success or error message on profile
 */
function showProfileMessage(message, type, element) {
    element.textContent = message;
    element.classList.remove('success', 'error');
    element.classList.add(type);
}
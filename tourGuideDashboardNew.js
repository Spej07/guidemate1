feather.replace();

    function handleLogout() {
        if (confirm("Are you sure you want to log out, John Lloyd?")) {
            window.location.href = "signinTouristAdmin.html"; 
        }
    }

    function updateGuideDashboard() {
        // Sync with userReviews key from profiletourist.html
        const allReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        const guideReviews = allReviews.filter(r => r.type === 'guide');

        const avgDisplay = document.getElementById('avgRating');
        const countDisplay = document.getElementById('totalReviews');
        const feedbackContainer = document.getElementById('recentFeedbackList');
        const starContainer = document.getElementById('starContainer');
        const ratingText = document.getElementById('ratingText');

        if (guideReviews.length > 0) {
            const totalRating = guideReviews.reduce((acc, rev) => acc + rev.rating, 0);
            const average = (totalRating / guideReviews.length).toFixed(1);
            
            if (avgDisplay) avgDisplay.innerText = average;
            if (countDisplay) countDisplay.innerText = guideReviews.length;
            if (ratingText) ratingText.innerText = average;

            if (starContainer) {
                starContainer.innerHTML = '★'.repeat(Math.round(average));
            }

            if (feedbackContainer) {
                feedbackContainer.innerHTML = ''; 
                guideReviews.slice(0, 2).forEach(rev => {
                    const reviewDiv = document.createElement('div');
                    reviewDiv.className = 'review-item';
                    reviewDiv.innerHTML = `
                        <p style="font-size: 0.85rem; margin: 0;"><b>"${rev.comment}"</b></p>
                        <small style="color: #888;">- ${rev.name} (${rev.subject})</small>
                    `;
                    feedbackContainer.appendChild(reviewDiv);
                });
            }
        }
    }

    window.addEventListener('load', updateGuideDashboard);
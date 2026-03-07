feather.replace();

    function handleLogout() {
        if (typeof showLogoutConfirm === 'function') {
            showLogoutConfirm(function() {
                window.location.href = "signinTouristAdmin.html";
            });
        } else {
            window.location.href = "signinTouristAdmin.html";
        }
    }

    function setDashboardStats(avgRating, reviewCount) {
        var avgDisplay = document.getElementById('avgRating');
        var countDisplay = document.getElementById('totalReviews');
        var starContainer = document.getElementById('starContainer');
        var ratingText = document.getElementById('ratingText');
        var ratingCountText = document.getElementById('ratingCountText');
        var avg = avgRating != null ? Number(avgRating) : 0;
        var count = reviewCount != null ? parseInt(reviewCount, 10) : 0;
        if (avgDisplay) avgDisplay.textContent = avg > 0 ? avg.toFixed(1) : '0.0';
        if (countDisplay) countDisplay.textContent = count;
        if (starContainer) starContainer.innerHTML = avg > 0 ? '★'.repeat(Math.round(avg)) : '';
        if (ratingText) ratingText.textContent = avg > 0 ? avg.toFixed(1) : '—';
        if (ratingCountText) ratingCountText.textContent = count === 1 ? '(1 review)' : '(' + count + ' reviews)';
    }

    function loadGuideProfile() {
        var guideId = localStorage.getItem('guideId');
        var url = 'get_guide_profile.php';
        if (guideId) url += '?guide_id=' + encodeURIComponent(guideId);
        fetch(url, { credentials: 'same-origin' })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.error) return;
                var yearsEl = document.getElementById('experienceYears');
                var areasEl = document.getElementById('serviceAreas');
                var specEl = document.getElementById('specialization');
                var nameEl = document.getElementById('guideName');
                if (yearsEl && data.experience_years !== undefined) yearsEl.value = data.experience_years;
                if (areasEl && data.service_areas !== undefined) areasEl.value = data.service_areas || '';
                if (specEl && data.specialization !== undefined) specEl.value = data.specialization || '';
                if (nameEl) nameEl.textContent = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Guide';
                setDashboardStats(data.avg_rating, data.review_count);
            })
            .catch(function() {});
    }

    function loadTouristReviews() {
        var container = document.getElementById('recentFeedbackList');
        if (!container) return;
        fetch('get_guide_reviews.php', { credentials: 'same-origin' })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                var reviews = data.reviews || [];
                if (reviews.length === 0) {
                    container.innerHTML = '<p style="color: #888; font-size: 0.85rem;">No reviews yet.</p>';
                    return;
                }
                container.innerHTML = reviews.slice(0, 3).map(function(rev) {
                    var name = rev.tourist_name || 'Tourist';
                    var stars = '★'.repeat(rev.rating || 0);
                    var type = (rev.review_type || 'location').toUpperCase();
                    var location = (rev.location_name || '').replace(/</g, '&lt;');
                    var locationMeta = location ? (' · ' + location) : '';
                    return '<div class="review-item"><p style="font-size: 0.85rem; margin: 0;"><b>"' + (rev.comment || '').replace(/</g, '&lt;') + '"</b></p><small style="color: #888;">— ' + name.replace(/</g, '&lt;') + ' · ' + stars + ' · ' + type + locationMeta + '</small></div>';
                }).join('');
            })
            .catch(function() {
                container.innerHTML = '<p style="color: #888; font-size: 0.85rem;">No reviews yet.</p>';
            });
    }

function loadApprovedBooking() {
    var labelEl = document.getElementById('bookingHeroLabel');
    var titleEl = document.getElementById('bookingHeroTitle');
    var textEl = document.getElementById('bookingHeroText');
    var metaEl = document.getElementById('bookingHeroMeta');
    var actionsEl = document.getElementById('bookingHeroActions');

    fetch('get_guide_booking_status.php', { credentials: 'same-origin' })
        .then(function(r) {
            if (r.status === 403) {
                throw new Error('Unauthorized');
            }
            return r.json();
        })
        .then(function(data) {
            if (!data.booked) {
                if (labelEl) labelEl.textContent = 'Current Assignment';
                if (titleEl) titleEl.textContent = 'No approved booking yet';
                if (textEl) textEl.textContent = "When an admin approves a tourist's booking request, the tourist name will appear here.";
                if (metaEl) metaEl.textContent = '';
                if (actionsEl) actionsEl.style.display = 'none';
                return;
            }

            if (labelEl) labelEl.textContent = 'Approved Booking';
            if (titleEl) titleEl.textContent = 'Booked by ' + (data.tourist_name || 'Tourist');
            if (textEl) textEl.textContent = 'A tourist booking has been approved for you. Coordinate with the assigned tourist and prepare for the trip.';
            if (metaEl) {
                metaEl.textContent = data.approved_at
                    ? ('Approved on ' + data.approved_at)
                    : 'Booking approved by admin.';
            }
            if (actionsEl) actionsEl.style.display = 'none';
        })
        .catch(function() {
            if (titleEl) titleEl.textContent = 'No approved booking yet';
            if (textEl) textEl.textContent = 'Booking status could not be loaded right now.';
            if (metaEl) metaEl.textContent = '';
            if (actionsEl) actionsEl.style.display = 'none';
        });
}

    function saveGuideProfile() {
        var yearsEl = document.getElementById('experienceYears');
        var areasEl = document.getElementById('serviceAreas');
        var specEl = document.getElementById('specialization');
        var btn = document.getElementById('saveProfileBtn');
        var msgEl = document.getElementById('profileSaveMessage');
        if (!yearsEl || !areasEl) return;
        var years = parseInt(yearsEl.value, 10) || 0;
        var areas = (areasEl.value || '').trim();
        var spec = (specEl && specEl.value) ? specEl.value.trim() : '';
        if (years < 0) years = 0;
        if (years > 70) years = 70;
        if (btn) btn.disabled = true;
        if (msgEl) { msgEl.style.display = 'none'; msgEl.textContent = ''; }
        var form = new FormData();
        form.append('experience_years', years);
        form.append('service_areas', areas);
        form.append('specialization', spec);
        fetch('update_guide_profile.php', { method: 'POST', credentials: 'same-origin', body: form })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (msgEl) {
                    msgEl.style.display = 'block';
                    msgEl.style.color = data.ok ? '#40c057' : '#e03131';
                    msgEl.textContent = data.ok ? 'Saved.' : (data.error || 'Save failed.');
                }
                if (data.ok) {
                    yearsEl.value = years;
                    areasEl.value = areas;
                    if (specEl) specEl.value = spec;
                }
            })
            .catch(function() {
                if (msgEl) { msgEl.style.display = 'block'; msgEl.style.color = '#e03131'; msgEl.textContent = 'Save failed.'; }
            })
            .finally(function() { if (btn) btn.disabled = false; });
    }

    window.addEventListener('load', function() {
        loadGuideProfile();
        loadTouristReviews();
        loadApprovedBooking();
        var saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) saveBtn.addEventListener('click', saveGuideProfile);
    });
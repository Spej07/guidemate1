// ===== BROWSE PAGE FUNCTIONALITY =====

/**
 * Display locations in the locations container
 */
function displayLocations() {
    const locationsContainer = document.getElementById('locationsContainer');
    if (!locationsContainer) return;
    locationsContainer.innerHTML = '';

    (locationData || []).forEach(location => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        card.innerHTML = `
            <img src="${location.image}" alt="${location.name}" class="item-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="item-content">
                <h4>${location.name}</h4>
                <p>${location.description}</p>
            </div>
        `;
        locationsContainer.appendChild(card);
    });
}

/**
 * Display tour guides in the guides container
 */
function displayGuides() {
    const guidesContainer = document.getElementById('guidesContainer');
    if (!guidesContainer) return;
    guidesContainer.innerHTML = '';

    (guideData || []).forEach(guide => {
        const name = (guide.first_name || guide.last_name) ? `${guide.first_name || ''} ${guide.last_name || ''}`.trim() : (guide.name || 'Tour Guide');
        const desc = guide.specialization || guide.service_areas || guide.description || '';
        const img = guide.image || guide.profile_image || 'photos/default.jpg';
        const card = document.createElement('div');
        card.classList.add('item-card');
        card.innerHTML = `
            <img src="${img}" alt="${name}" class="item-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="item-content">
                <h4>${name}</h4>
                <p>${desc}</p>
            </div>
        `;
        guidesContainer.appendChild(card);
    });
}

async function loadLocationsFromDb() {
    try {
        const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
        const endpoint = isFile ? 'http://localhost/guidemate1/get_spots.php' : 'get_spots.php';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(endpoint, { credentials: 'same-origin', signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (Array.isArray(data)) {
            locationData = data;
        }
    } catch (e) {
        // Fallback: keep whatever locationData is (script.js defaults)
    }
}

/**
 * Initialize the browse page: load guides (and rely on script.js locationData) then display
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('get_guides.php');
        const data = await res.json();
        if (Array.isArray(data)) guideData = data;
    } catch (e) {}
    displayLocations();
    displayGuides();

    // Replace locations with DB version when loaded
    loadLocationsFromDb().then(displayLocations);
});

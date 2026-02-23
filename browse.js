// ===== BROWSE PAGE FUNCTIONALITY =====

/**
 * Display locations in the locations container
 */
function displayLocations() {
    const locationsContainer = document.getElementById('locationsContainer');
    locationsContainer.innerHTML = '';

    locationData.forEach(location => {
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
    guidesContainer.innerHTML = '';

    guideData.forEach(guide => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        card.innerHTML = `
            <img src="${guide.image}" alt="${guide.name}" class="item-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="item-content">
                <h4>${guide.name}</h4>
                <p>${guide.description}</p>
            </div>
        `;
        guidesContainer.appendChild(card);
    });
}

/**
 * Initialize the browse page
 */
document.addEventListener('DOMContentLoaded', () => {
    displayLocations();
    displayGuides();
});

/**
 * My Trips Dashboard Controller
 * Handles user data fetching, trip rendering, and filtering.
 */
(function() {
    // --- State Management ---
    let tripsData = [
        { id: 't1', name: 'Simala Church Pilgrimage', destination: 'Simala, Cebu', date: '2025-05-12', status: 'planned', spots: ['Simala Shrine', 'Carcara Falls'], imageDesc: 'simala' },
        { id: 't2', name: 'Osmeña Peak & Kawasan', destination: 'Mantalongon, Badian', date: '2025-03-04', status: 'completed', spots: ['Osmeña Peak', 'Kawasan Falls'], imageDesc: 'kawasan' },
        { id: 't3', name: 'Cebu City Heritage Tour', destination: 'Cebu City', date: '2025-07-20', status: 'planned', spots: ['Magellan\'s Cross', 'Fort San Pedro', 'Basilica'], imageDesc: 'heritage' },
        { id: 't4', name: 'Moalboal Sardines Run', destination: 'Moalboal', date: '2025-02-10', status: 'completed', spots: ['Panagsama Beach', 'Pescador Island'], imageDesc: 'moalboal' },
        { id: 't5', name: 'North Coast Escape', destination: 'Bantayan Island', date: '2025-09-05', status: 'planned', spots: ['Santa Fe', 'Ogtong Cave'], imageDesc: 'bantayan' }
    ];
    let currentFilter = 'all';

    // --- DOM Elements ---
    const grid = document.getElementById('tripsGridContainer');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const toast = document.getElementById('toastMessage');
    const profileNameEl = document.getElementById('navProfileName');
    const profileAvatarEl = document.querySelector('.nav-avatar');

    // --- 1. User Data Initialization ---
    function initUserData() {
        if (!profileNameEl && !profileAvatarEl) {
            return;
        }

        const role = localStorage.getItem('role') || '';
        const userId = localStorage.getItem('userId') || '';
        const scopedFullName = (role && userId) ? localStorage.getItem(`profileName:${role}:${userId}`) : '';
        const scopedFirstName = (role && userId) ? localStorage.getItem(`firstName:${role}:${userId}`) : '';
        const scopedLastName = (role && userId) ? localStorage.getItem(`lastName:${role}:${userId}`) : '';
        profileNameEl.textContent = scopedFullName || [scopedFirstName, scopedLastName].filter(Boolean).join(' ').trim() || localStorage.getItem('fullName') || 'Guest Traveler';

        const scopedProfileImage = (role && userId) ? localStorage.getItem(`profileImage:${role}:${userId}`) : '';
        if (profileAvatarEl && (scopedProfileImage || localStorage.getItem('profileImage'))) {
            profileAvatarEl.src = scopedProfileImage || localStorage.getItem('profileImage');
        }
    }

    async function hydrateUserDataFromSession() {
        try {
            const response = await fetch('get_user.php', { credentials: 'same-origin' });
            if (!response.ok) {
                return;
            }

            const data = await response.json();
            if (!data || !data.success || !data.role || !data.user_id) {
                return;
            }

            const role = String(data.role);
            const userId = String(data.user_id);
            const firstName = String(data.first_name || '');
            const lastName = String(data.last_name || '');
            const fullName = String(data.full_name || '').trim() || 'Guest Traveler';
            const profileImage = String(data.profile_image || '');

            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);
            localStorage.setItem('firstName', firstName);
            localStorage.setItem('lastName', lastName);
            localStorage.setItem('fullName', fullName);
            localStorage.setItem(`firstName:${role}:${userId}`, firstName);
            localStorage.setItem(`lastName:${role}:${userId}`, lastName);
            localStorage.setItem(`profileName:${role}:${userId}`, fullName);
            if (profileImage) {
                localStorage.setItem(`profileImage:${role}:${userId}`, profileImage);
                localStorage.setItem('profileImage', profileImage);
            }

            initUserData();
        } catch (_) {}
    }

    // --- 2. Helper Functions ---
    function showToast(text) {
        toast.textContent = text || '✨ Trip updated';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function getTripImageStyle(desc) {
        const colors = {
            simala: 'linear-gradient(145deg, #9e7e57, #6d4f33)',
            kawasan: 'linear-gradient(145deg, #1f7a4d, #2aa86b)',
            heritage: 'linear-gradient(145deg, #7a5d3c, #ab8b67)',
            moalboal: 'linear-gradient(145deg, #17678c, #39a0ca)',
            bantayan: 'linear-gradient(145deg, #f5b042, #d18d2c)',
        };
        return colors[desc] || 'linear-gradient(145deg, #3f6b9c, #1e4a7a)';
    }

    // --- 3. Core Rendering ---
    function renderTrips() {
        const filtered = tripsData.filter(t => currentFilter === 'all' || t.status === currentFilter);

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-compass' style="font-size:3rem;"></i>
                    <p>No ${currentFilter === 'all' ? '' : currentFilter} trips yet. Start planning!</p>
                </div>`;
            return;
        }

        grid.innerHTML = filtered.map(trip => {
            const statusClass = trip.status === 'planned' ? 'planned' : 'completed';
            const statusText = trip.status === 'planned' ? '🕊️ Planned' : '✓ Completed';
            const formattedDate = new Date(trip.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric' 
            });

            return `
                <div class="trip-card" data-id="${trip.id}">
                    <div class="trip-img" style="background-image: ${getTripImageStyle(trip.imageDesc)};">
                        <span class="trip-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="trip-info">
                        <div class="trip-title">
                            <i class='bx bx-map-pin'></i>
                            <h3>${trip.name}</h3>
                        </div>
                        <div class="trip-details">
                            <span><i class='bx bx-current-location'></i> ${trip.destination}</span>
                            <span><i class='bx bx-calendar'></i> ${formattedDate}</span>
                            <span><i class='bx bx-camera'></i> ${trip.spots.length} spots</span>
                        </div>
                        <div class="trip-actions">
                            <button class="btn-outline view-trip"><i class='bx bx-show'></i> Details</button>
                            <button class="btn-outline edit-trip"><i class='bx bx-pencil'></i> Status</button>
                            <button class="btn-text delete-trip"><i class='bx bx-trash'></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- 4. Event Listeners ---
    function setupEventListeners() {
        // Card Actions (View, Edit, Delete)
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.trip-card');
            if (!card) return;
            const tripId = card.dataset.id;
            const trip = tripsData.find(t => t.id === tripId);

            if (e.target.closest('.view-trip')) {
                showToast(`🔍 Viewing: ${trip.name}`);
            } 
            else if (e.target.closest('.edit-trip')) {
                trip.status = trip.status === 'planned' ? 'completed' : 'planned';
                renderTrips();
                showToast(`✅ Updated ${trip.name} to ${trip.status}`);
            } 
            else if (e.target.closest('.delete-trip')) {
                if (confirm('Delete this trip?')) {
                    tripsData = tripsData.filter(t => t.id !== tripId);
                    renderTrips();
                    showToast('🗑️ Trip removed');
                }
            }
        });

        // Filter Tab Toggling
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.getAttribute('data-filter');
                renderTrips();
            });
        });

        // Add New Trip
        document.getElementById('addNewTripBtn').addEventListener('click', () => {
            const newTrip = {
                id: 't' + Date.now(),
                name: 'New Adventure',
                destination: 'Cebu Province',
                date: new Date().toISOString().slice(0, 10),
                status: 'planned',
                spots: ['Custom spot'],
                imageDesc: 'heritage'
            };
            tripsData.push(newTrip);
            renderTrips();
            showToast('✨ New trip added!');
        });

    
    }

    // --- Initialize Page ---
    initUserData();
    hydrateUserDataFromSession();
    renderTrips();
    setupEventListeners();

})();
document.addEventListener("DOMContentLoaded", () => {
    // --- 1. User Profile Setup ---
    const navName = document.getElementById("navProfileName");
    if (navName) {
        const firstName = localStorage.getItem("firstName") || "Guest";
        const lastName = localStorage.getItem("lastName") || "Traveler";
        navName.textContent = `${firstName} ${lastName}`;
    }

    // --- 2. Map & Routing Initialization ---
    const map = L.map('map').setView([10.2936, 123.9019], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const routingControl = L.Routing.control({
        waypoints: [],
        lineOptions: {
            styles: [{ color: '#2d76f9', weight: 6 }]
        },
        routeWhileDragging: false,
        addWaypoints: false,
        show: false 
    }).addTo(map);

    // --- 3. Data & Markers ---
    const spots = [
        { name: "Magellan's Cross", coords: [10.2936, 123.9019], image: "photos/magellans-cross.jpg" },
        { name: "Taoist Temple", coords: [10.3344, 123.8884], image: "photos/taoist-temple.jpg" },
        { name: "Fort San Pedro", coords: [10.2923, 123.9059], image: "photos/fort-san-pedro.jpg" },
        { name: "10,000 Roses", coords: [10.3526, 123.9531], image: "photos/10k-roses.jpg" }
    ];

    const markers = {};

    // Create markers and store them in an object for easy access
    spots.forEach(spot => {
        const popupContent = `
            <div style="text-align: center; width: 150px;">
                <b style="font-size: 14px;">${spot.name}</b><br>
                <img src="${spot.image}" 
                     alt="${spot.name}" 
                     onerror="this.src='https://via.placeholder.com/150?text=No+Image'" 
                     style="width: 100%; border-radius: 8px; margin-top: 5px;">
            </div>
        `;
        const marker = L.marker(spot.coords).addTo(map).bindPopup(popupContent);
        markers[spot.name.toLowerCase()] = marker;
    });

    // --- 4. Search & History Logic ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const historyDropdown = document.getElementById('searchHistory');

    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

    const performSearch = (query = searchInput.value) => {
        if (!query.trim()) return;
        
        const lowerQuery = query.toLowerCase().trim();
        const found = spots.find(s => s.name.toLowerCase().includes(lowerQuery));

        if (found) {
            // Move map and open the popup
            map.flyTo(found.coords, 15);
            
            setTimeout(() => {
                markers[found.name.toLowerCase()].openPopup();
            }, 300);

            // Update search history UI and LocalStorage
            updateHistory(found.name);
            historyDropdown.style.display = 'none';
            searchInput.value = found.name;
        } else {
            alert("Location not found. Try 'Magellan' or 'Temple'.");
        }
    };

    const updateHistory = (name) => {
        // Keeps the last 5 unique searches
        history = [name, ...history.filter(item => item !== name)].slice(0, 5);
        localStorage.setItem("searchHistory", JSON.stringify(history));
        renderHistory();
    };

    const renderHistory = () => {
        if (history.length === 0) {
            historyDropdown.style.display = 'none';
            return;
        }
        historyDropdown.innerHTML = history.map(item => `
            <div class="history-item"><i class='bx bx-history'></i><span>${item}</span></div>
        `).join('');

        // Attach clicks to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.onclick = () => performSearch(item.querySelector('span').innerText);
        });
    };

    // Event Listeners
    if (searchBtn) searchBtn.addEventListener('click', () => performSearch());

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') performSearch(); 
        });
        
        searchInput.addEventListener('focus', () => { 
            if (history.length > 0) historyDropdown.style.display = 'block'; 
        });
    }

    // Close history when clicking outside
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.search-box-container');
        if (container && !container.contains(e.target)) {
            historyDropdown.style.display = 'none';
        }
    });

    // --- 5. Navigation & Helper Functions ---
    window.getLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                map.flyTo([lat, lng], 16);
                L.marker([lat, lng]).addTo(map).bindPopup("You are here").openPopup();
            }, () => alert("Please enable GPS to find your location."));
        }
    };

    window.getRouteTo = function(destLat, destLng) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                routingControl.setWaypoints([
                    L.latLng(pos.coords.latitude, pos.coords.longitude),
                    L.latLng(destLat, destLng)
                ]);

                map.flyTo([destLat, destLng], 14);

                // Auto-open destination popup
                setTimeout(() => {
                    const key = Object.keys(markers).find(k => {
                        const m = markers[k].getLatLng();
                        return m.lat === destLat && m.lng === destLng;
                    });
                    if (key) markers[key].openPopup();
                }, 1000);
            }, () => alert("Please enable GPS for routing."));
        }
    };

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "landingpage.html";
        });
    }

    renderHistory();
});
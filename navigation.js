document.addEventListener("DOMContentLoaded", () => {
    const navName = document.getElementById("navProfileName");
    if (navName) {
        const firstName = localStorage.getItem("firstName") || "Guest";
        const lastName = localStorage.getItem("lastName") || "Traveler";
        navName.textContent = `${firstName} ${lastName}`;
    }

    
    
    const map = L.map('map').setView([10.2936, 123.9019], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

   
    const routingControl = L.Routing.control({
        waypoints: [],
        lineOptions: {
            styles: [{ color: '#2424ab', weight: 6 }]
        },
        routeWhileDragging: false,
        addWaypoints: false,
        show: true 
    }).addTo(map);

    
    const spots = [
        { 
            name: "Magellan's Cross", 
            coords: [10.2936, 123.9019], 
            image: "photos/magellans-cross.jpg" 
        },
        { 
            name: "Taoist Temple", 
            coords: [10.3344, 123.8884], 
            image: "photos/taoist-temple.jpg" 
        },
        { 
            name: "Fort San Pedro", 
            coords: [10.2923, 123.9059], 
            image: "photos/fort-san-pedro.jpg" 
        },
        { 
            name: "10,000 Roses", 
            coords: [10.3526, 123.9531], 
            image: "photos/10k-roses.jpg" 
        }
    ];

    // Create markers for each spot with image popups
    spots.forEach(spot => {
        const popupContent = `
            <div style="text-align: center; min-width: 150px;">
                <b style="font-size: 14px;">${spot.name}</b><br>
                <img src="${spot.image}" alt="${spot.name}" 
                     style="width: 100%; height: auto; border-radius: 8px; margin-top: 8px;"
                     onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            </div>
        `;

        L.marker(spot.coords)
            .addTo(map)
            .bindPopup(popupContent);
    });

   
    window.getRouteTo = function(destLat, destLng) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

               
                routingControl.setWaypoints([
                    L.latLng(userLat, userLng),
                    L.latLng(destLat, destLng)
                ]);

                
                map.flyTo([destLat, destLng], 15);
                
                
                setTimeout(() => {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            const latLng = layer.getLatLng();
                            if (latLng.lat === destLat && latLng.lng === destLng) {
                                layer.openPopup();
                            }
                        }
                    });
                }, 500);

            }, () => {
                alert("Please enable GPS to use the routing feature.");
            });
        }
    };

    window.getLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.flyTo([lat, lng], 16);
                L.marker([lat, lng]).addTo(map).bindPopup("You are here").openPopup();
            });
        }
    };

    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "landingpage.html";
        });
    }
});
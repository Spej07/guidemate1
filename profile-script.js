document.addEventListener("DOMContentLoaded", () => {
    // 1. DATABASE CONNECTION (Simulated via localStorage)
    // Ensure your login page sets 'firstName' and 'lastName' upon successful login
    const firstName = localStorage.getItem("firstName") || "Guest";
    const lastName = localStorage.getItem("lastName") || "Traveler";
    
    const profileName = document.getElementById("profileName");
    const profileHandle = document.getElementById("profileHandle");

    if (profileName) {
        // Combines first and last name from your SQL table structure
        profileName.textContent = `${firstName} ${lastName}`;
    }

    if (profileHandle) {
        // Creates a handle based on the first name (e.g., @lloyd)
        profileHandle.textContent = `@${firstName.toLowerCase()}`;
    }

    // 2. DROPDOWN LOGIC
    const profileBtn = document.getElementById("profileDropdownBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            dropdownMenu.classList.toggle("show");
        });

        window.addEventListener("click", () => {
            dropdownMenu.classList.remove("show");
        });
    }

    // 3. LOGOUT FUNCTIONALITY
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear(); // Clears all tourist data
            window.location.href = "landingpage.html";
        });
    }
});
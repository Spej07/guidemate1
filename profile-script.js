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

    // ... (Keep your existing Dropdown and Logout logic below) ...
});
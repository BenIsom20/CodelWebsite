// Open the popup when clicking the user icon
document.getElementById("user").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default action for <a>
    document.getElementById("mainPopup").style.display = "flex";

    // Default to Login form
    document.querySelector(".tab-link[data-target='loginForm']").click();
});

// Close the popup when clicking the close button
document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("mainPopup").style.display = "none";
});

// Close the popup when clicking outside the content
document.getElementById("mainPopup").addEventListener("click", (event) => {
    const popupContent = document.querySelector(".popup-content");
    if (!popupContent.contains(event.target)) {
        document.getElementById("mainPopup").style.display = "none";
    }
});

// Tab switching logic
const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

tabLinks.forEach(link => {
    link.addEventListener("click", event => {
        const targetId = event.target.getAttribute("data-target");

        // Remove active class and hide all tab contents
        tabLinks.forEach(link => link.classList.remove("active"));
        tabContents.forEach(content => {
            content.classList.remove("active");
            content.style.display = "none";
        });

        // Add active class and show the selected tab content
        event.target.classList.add("active");
        const targetContent = document.getElementById(targetId);
        targetContent.classList.add("active");
        targetContent.style.display = "block";
    });
});

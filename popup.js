// Open the popup with animation
document.getElementById("user").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default action for <a>
    const popup = document.getElementById("mainPopup");
    popup.style.display = "flex";
    setTimeout(() => {
        popup.style.opacity = "1";
        popup.style.transform = "scale(1)";
    }, 10); // Allow a slight delay for transition to apply

    // Default to Login form
    document.querySelector(".tab-link[data-target='loginForm']").click();
});

// Close the popup with animation
document.getElementById("closePopup").addEventListener("click", () => {
    const popup = document.getElementById("mainPopup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.8)";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300); // Match the transition duration
});

// Close the popup when clicking outside the content
document.getElementById("mainPopup").addEventListener("click", (event) => {
    const popupContent = document.querySelector(".popup-content");
    if (!popupContent.contains(event.target)) {
        const popup = document.getElementById("mainPopup");
        popup.style.opacity = "0";
        popup.style.transform = "scale(0.8)";
        setTimeout(() => {
            popup.style.display = "none";
        }, 300); // Match the transition duration
    }
});

// Tab switching logic with animation
const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

tabLinks.forEach(link => {
    link.addEventListener("click", event => {
        const targetId = event.target.getAttribute("data-target");

        // Remove active class and hide current tab with animation
        const currentTab = document.querySelector(".tab-content.active");
        currentTab.style.opacity = "0";
        currentTab.style.transform = "translateX(-100%)";
        setTimeout(() => {
            currentTab.style.display = "none";
            currentTab.classList.remove("active");

            // Show target tab with animation
            const targetContent = document.getElementById(targetId);
            targetContent.style.display = "block";
            setTimeout(() => {
                targetContent.style.opacity = "1";
                targetContent.style.transform = "translateX(0)";
                targetContent.classList.add("active");
            }, 10);
        }, 300); // Match the transition duration
    });
});

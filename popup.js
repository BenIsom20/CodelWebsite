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

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600); // Calculate hours
    const mins = Math.floor((seconds % 3600) / 60); // Calculate remaining minutes
    const secs = seconds % 60; // Calculate remaining seconds

    // Format as HH:MM:SS with leading zeros
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function to fetch stats
async function fetchStats() {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        return null; // Indicate no stats are available
    }
    try {
        const response = await fetch("http://localhost:5000/stats", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            const createdDate = new Date(data.stats.created);
            const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Format options
            const formattedDate = createdDate.toLocaleDateString(undefined, options); // Format date based on locale

            // Update the HTML with a better sentence
            document.getElementById("nameStats").innerHTML =
                `${data.stats.username}, joined on ${formattedDate}`; // Return stats if the response is successful
            document.getElementById("statsWins").innerHTML = "🏆 total wins: " + data.stats.wins;
            document.getElementById("statsStreak").innerHTML = "🔥 current streak: " + data.stats.streak;
            document.getElementById("statsAllStreak").innerHTML = "🌟 highest streak: " + data.stats.allStreak;
            document.getElementById("statsTotal").innerHTML = "⏳ total time on CODEL: " + formatTime(data.stats.allTime);
            return data.stats;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Event listener for stats button
document.getElementById("stats").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent default action for <a>
    const stats = await fetchStats(); // Wait for fetchStats to resolve
    if (!stats) {
        // Show the main popup if no stats are available
        const popup = document.getElementById("mainPopup");
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 10); // Allow a slight delay for transition to apply

        // Default to Login form
        document.querySelector(".tab-link[data-target='loginForm']").click();
    } else {
        const popup = document.getElementById("statsPopup");
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 10); // Slight delay for smooth transition
    }
});


function closePopup() {
    const popup = document.getElementById("statsPopup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.8)";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300); // Match transition duration
}

document.addEventListener("click", (event) => {
    const popup = document.getElementById("statsPopup");
    const popupContent = document.getElementById("popupContent");
    if (popup.style.display === "flex" && !popupContent.contains(event.target)) {
        closePopup();
    }
});

document.getElementById("closeStatsPopup").addEventListener("click", closePopup);

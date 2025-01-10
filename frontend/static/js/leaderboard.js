// import the publicIp from static to be referenced for backend calls
import { publicIp } from './static/js/main.js';

var username = ""; // Global var storing the username of currently logged in player
let offset = 0; // Start offset
const limit = 10; // Number of entries to fetch per request

// Function to get the username of the currently logged in user to store
async function getUsername() {
    const token = localStorage.getItem('jwt_token');
    if (!token) { return; } // Exit if user not logged in 

    // Send a GET request to the protected endpoint with the token in the Authorization header
    const response = await fetch(`http://${publicIp}/protected`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Parse the response 
    const data = await response.json();
    if (response.ok) {
        username = data.username; // Store the username
    }
}
getUsername(); // calls this right away 

// Function to load leaderboard entries
async function loadLeaderboard() {
    // Calls to the backend to get the info needed to populate the leaderboard
    const loadMoreButton = document.getElementById("load-more");
    loadMoreButton.classList.add("hidden");
    const response = await fetch(`http://${publicIp}/getLeaderboard?offset=${offset}&limit=${limit}`);

    // Parse the response
    const data = await response.json();
    if (response.ok) {
        const leaderboardData = data.leaderboard;
        const leaderboardEntries = document.getElementById("leaderboard-entries");

        // Adds each entry in the returned list to the leaderboard with an animation
        leaderboardData.forEach((entry, index) => {
            const row = document.createElement("div");
            var user = entry.username;
            let rank = offset + index + 1;
            if (entry.username.length > 13) {
                user = user.substring(0, 13) + "..."; // chops username if too long
            }

            if (rank == 1) {
                rank += " 🥇" // gives rank one a gold medal
            }
            if (rank == 2) {
                rank += " 🥈" // gives rank two a slver medal
            }
            if (rank == 3) {
                rank += " 🥉" // gives rank three a bronze medal
            }

            if (entry.username == username) { // different addition if the person logged in is getting added to leaderboard
                rank += "  YOU ";
                row.classList.add("user-row");
                row.style.animationDelay = `${index * 0.07}s`;
                row.innerHTML = `
                            <span>${rank}</span>
                            <span>${user}</span>
                            <span>${entry.attempts}</span>
                            <span>${entry.time}s</span>
                            <span>${entry.streak}</span>
                            <span>${entry.wins}</span>
                             `;
                leaderboardEntries.appendChild(row); // adds row to leaderboard
            } else { // normal additions if not user logged in
                row.classList.add("leaderboard-row");
                row.style.animationDelay = `${index * 0.07}s`;
                row.innerHTML = `
                            <span>${rank}</span>
                            <span>${user}</span>
                            <span>${entry.attempts}</span>
                            <span>${entry.time}s</span>
                            <span>${entry.streak}</span>
                            <span>${entry.wins}</span>
                             `;
                leaderboardEntries.appendChild(row); // adds row to leaderboard
            }
        });

        // Increment offset for the next batch to get the next ten from backend
        offset += limit;

        // Hide the "Load More" button if no more data
        if (leaderboardData.length < limit) {
            document.getElementById("load-more").style.display = "none";
        } else {
            // Wait for the last row's animation to finish, then fade in the button
            const lastRowDelay = 1;
            setTimeout(() => {
                loadMoreButton.classList.add("show");
            }, lastRowDelay * 1000);
        }
    }
}

// Load initial leaderboard data on page load
window.onload = function () {
    // Checks if user is returning from the stats page
    if (sessionStorage.getItem("cameFrom") === "true") {
        sessionStorage.setItem("cameFrom", "false");
        document.getElementById("stats").click();
    }
    loadLeaderboard();
    document.body.classList.add('fade-in');

}

// Attach click event to the "Load More" button
document.getElementById("load-more").addEventListener("click", loadLeaderboard);

// Event listener for navigating away from the page 
document.getElementById('how').addEventListener('click', function (event) {
    smoothTransition(event);
});
// Event listener for navigating away from the page 
document.getElementById('backtocode').addEventListener('click', function (event) {
    smoothTransition(event);
});

// Function called by leaving the page that creates an animation
function smoothTransition(event) {
    event.preventDefault();
    const href = event.currentTarget.href;
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = href;
    }, 300);
}

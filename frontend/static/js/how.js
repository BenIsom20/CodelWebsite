// Add an event listener for the 'leader' link to have animation
document.getElementById("leader").addEventListener('click', function (event) {
    smoothTransition(event); 
});


// Add an event listener for the 'backtocode' link to have animation
document.getElementById("backtocode").addEventListener('click', function (event) {
    smoothTransition(event); 
});

// Function for smooth transition to the next page
function smoothTransition(event) {
    event.preventDefault(); 
    const href = event.currentTarget.href; 
    document.body.classList.remove('fade-in'); 
    document.body.classList.add('fade-out'); 
    setTimeout(() => {
        window.location.href = href;
    }, 300); 
}

// Add the 'fade-in' class to the body when the page loads
window.onload = async function () {
    document.body.classList.add('fade-in'); // Trigger the fade-in animation when the page is loaded
    if(localStorage.getItem("jwt_token")){
        await populateForm();
    }
    // Check if the user is returning from stats page
    if (sessionStorage.getItem("cameFrom") === "true") {
        sessionStorage.setItem("cameFrom", "false"); 
        document.getElementById("stats").click(); 
    }
};

  // On pageshow (especially when coming back from the bfcache)
  window.addEventListener('pageshow', (event) => {
    // We can choose to run it only if the page is from bfcache
    document.body.classList.remove('fade-out'); // Remove fade-out effect
    document.body.classList.add('fade-in'); // Add fade-in effect
  });

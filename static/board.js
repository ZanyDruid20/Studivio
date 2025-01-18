// Function to toggle the sidebar visibility
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Function to toggle the theme (dark mode/light mode)
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
}

// Optional: Search functionality for the sidebar
const searchInput = document.querySelector('.sidebar input[type="search"]');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        const navLinks = document.querySelectorAll('.menu-links .nav-link');
        
        navLinks.forEach(link => {
            const text = link.querySelector('.nav-text').textContent.toLowerCase();
            if (text.includes(filter)) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    });
}

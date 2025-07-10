/**
 * Header loader utility - loads global header into game pages
 */
async function loadGlobalHeader() {
    try {
        const response = await fetch('../../src/includes/header.html');
        const headerHTML = await response.text();
        
        // Find existing navbar and replace it
        const existingNavbar = document.querySelector('.navbar');
        if (existingNavbar) {
            existingNavbar.outerHTML = headerHTML;
        } else {
            // If no navbar exists, insert after body opening tag
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
        
        // Initialize header functionality
        const headerScript = document.createElement('script');
        headerScript.src = '../../src/js/utils/header.js';
        document.head.appendChild(headerScript);
        
    } catch (error) {
        console.error('Failed to load global header:', error);
    }
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGlobalHeader);
} else {
    loadGlobalHeader();
}
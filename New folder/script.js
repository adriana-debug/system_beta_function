// Hiring Knowledge System - Main JavaScript

/**
 * Display a specific section and update the page title
 * @param {string} sectionId - The ID of the section to display
 */
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.sop-section');
    sections.forEach(s => s.classList.remove('active'));

    // Remove active state from all links
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => l.classList.remove('active'));

    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');

    // Update page title
    const titles = {
        'overview': 'Technical Support Representative – Role Overview',
        'requirements': 'Technical Support Representative – Requirements',
        'process': 'Technical Support Hiring Process',
        'assessment': 'Practical Technical Assessment: Assessor\'s Packet',
        'candidate-assessment': 'Candidate Assessment Rubric',
        'interview-assessment': 'Interview Assessment (Behavioral & Technical)'
    };

    document.getElementById('pageTitle').textContent = titles[sectionId];
}

/**
 * Toggle the sidebar collapse/expand state
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

/**
 * Toggle category expansion in the sidebar navigation
 * @param {Event} event - The click event
 */
function toggleCategory(event) {
    event.preventDefault();
    event.stopPropagation();
    const navItem = event.target.closest('.nav-item');
    navItem.classList.toggle('expanded');
}

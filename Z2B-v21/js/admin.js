// Z2B Admin Panel JavaScript
// Handles tab switching, data loading, and admin functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Z2B Admin Panel Initialized');

    // Initialize tab switching
    initTabSwitching();

    // Initialize other admin features
    initAdminFeatures();
});

// Tab Switching Functionality
function initTabSwitching() {
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Hide all tab contents
            const allTabs = document.querySelectorAll('.tab-content');
            allTabs.forEach(tab => tab.classList.remove('active'));

            // Show target tab
            const targetTabElement = document.getElementById(`${targetTab}-tab`);
            if (targetTabElement) {
                targetTabElement.classList.add('active');
                console.log(`Switched to ${targetTab} tab`);
            } else {
                console.warn(`Tab element not found: ${targetTab}-tab`);
            }
        });
    });

    console.log(`Initialized ${menuItems.length} tab menu items`);
}

// Initialize Admin Features
function initAdminFeatures() {
    // Demo Config Save Button
    const saveDemoConfigBtn = document.getElementById('saveDemoConfigBtn');
    if (saveDemoConfigBtn) {
        saveDemoConfigBtn.addEventListener('click', function() {
            alert('Demo configuration saved successfully!');
            // In production, this would send data to the server
        });
    }

    // Add Member Button
    const saveMemberBtn = document.getElementById('saveMemberBtn');
    if (saveMemberBtn) {
        saveMemberBtn.addEventListener('click', function() {
            const form = document.getElementById('addMemberForm');
            if (form.checkValidity()) {
                const formData = new FormData(form);
                console.log('Adding new member:', Object.fromEntries(formData));

                // In production, send to API
                alert('Member added successfully!');

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addMemberModal'));
                if (modal) modal.hide();

                // Reset form
                form.reset();
            } else {
                form.reportValidity();
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchMember');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // In production, filter the member table
        });
    }

    console.log('Admin features initialized');
}

// Helper function to show loading spinner
function showLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

// Helper function to hide loading spinner
function hideLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Export functions for use in other scripts
window.adminPanel = {
    showLoading,
    hideLoading
};

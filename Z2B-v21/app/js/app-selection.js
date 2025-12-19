// ============================================================================
// APP SELECTION LOGIC
// ============================================================================
// Handles tier-based app selection after user registration

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://z2b-backend.up.railway.app';

const ALL_APPS = [
    { id: 'mydigitaltwin', name: 'MyDigitalTwin', icon: '🎬' },
    { id: 'coach-manlaw', name: 'Coach Manlaw', icon: '🧠' },
    { id: 'glowie', name: 'GLOWIE', icon: '✨' },
    { id: 'vidzie', name: 'VIDZIE', icon: '🎥' },
    { id: 'captionpro', name: 'CaptionPro', icon: '📝' },
    { id: 'zyro', name: 'ZYRO', icon: '🎨' },
    { id: 'zyra', name: 'ZYRA', icon: '🎭' },
    { id: 'benown', name: 'BENOWN', icon: '💼' },
    { id: 'zynect', name: 'ZYNECT', icon: '🔗' },
    { id: 'zynth', name: 'ZYNTH', icon: '🎤' },
    { id: 'mavula', name: 'MAVULA', icon: '🤖' },
    { id: 'shepherdstaff', name: 'Shepherd Staff', icon: '🐑' }
];

let selectedApps = [];
let requiredCount = 0;
let unlockedApps = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAppSelectionStatus();
});

// Load app selection status from backend
async function loadAppSelectionStatus() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            // No token, redirect to login
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_URL}/api/app-selection/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load app selection status');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load status');
        }

        // Check if user needs to select apps
        if (!data.needsSelection) {
            // Already completed selection or no selection needed, redirect to dashboard
            alert('✅ App selection already completed! Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
            return;
        }

        // Setup UI with data
        requiredCount = data.availableSlots;
        unlockedApps = data.unlockedApps || [];

        document.getElementById('slotsNeeded').textContent = requiredCount;
        document.getElementById('slotsNeededInline').textContent = requiredCount;
        document.getElementById('tierName').textContent = data.tier;
        document.getElementById('requiredCount').textContent = requiredCount;

        // Render apps
        if (unlockedApps.length > 0) {
            renderMandatoryApps(unlockedApps);
            document.getElementById('mandatorySection').style.display = 'block';
        }

        renderSelectableApps(unlockedApps);

        // Show selection screen, hide loading
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('selectionScreen').style.display = 'block';

    } catch (error) {
        console.error('Error loading app selection status:', error);
        alert(`❌ Error: ${error.message}\n\nPlease try again or contact support.`);
        document.getElementById('loadingScreen').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #FF6B35;"></i>
            <p>Failed to load app selection. Please refresh the page.</p>
        `;
    }
}

// Render already unlocked (mandatory) apps
function renderMandatoryApps(unlockedApps) {
    const container = document.getElementById('mandatoryAppsList');
    const mandatoryAppsData = ALL_APPS.filter(app => unlockedApps.includes(app.id));

    container.innerHTML = mandatoryAppsData.map(app => `
        <div class="app-card mandatory">
            <span class="app-icon">${app.icon}</span>
            <span class="app-name">${app.name}</span>
            <span class="badge unlocked">✅ Unlocked</span>
        </div>
    `).join('');
}

// Render selectable apps (exclude already unlocked)
function renderSelectableApps(unlockedApps) {
    const container = document.getElementById('selectableAppsList');
    const selectableAppsData = ALL_APPS.filter(app => !unlockedApps.includes(app.id));

    container.innerHTML = selectableAppsData.map(app => `
        <div class="app-card selectable" data-app-id="${app.id}" onclick="toggleAppSelection('${app.id}')">
            <span class="app-icon">${app.icon}</span>
            <span class="app-name">${app.name}</span>
            <span class="selection-indicator">⭕</span>
        </div>
    `).join('');
}

// Toggle app selection
function toggleAppSelection(appId) {
    const appCard = document.querySelector(`[data-app-id="${appId}"]`);

    if (selectedApps.includes(appId)) {
        // Deselect
        selectedApps = selectedApps.filter(id => id !== appId);
        appCard.classList.remove('selected');
    } else {
        // Select (if not at limit)
        if (selectedApps.length < requiredCount) {
            selectedApps.push(appId);
            appCard.classList.add('selected');
        } else {
            alert(`⚠️ You can only select ${requiredCount} app(s).\n\nDeselect an app first if you want to choose a different one.`);
            return;
        }
    }

    updateSelectionStatus();
}

// Update selection counter and button state
function updateSelectionStatus() {
    document.getElementById('selectedCount').textContent = selectedApps.length;

    const confirmBtn = document.getElementById('confirmSelection');
    confirmBtn.disabled = selectedApps.length !== requiredCount;

    // Update button text
    if (selectedApps.length === requiredCount) {
        confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm My Selection (Permanent)';
    } else {
        confirmBtn.innerHTML = `<i class="fas fa-check-circle"></i> Select ${requiredCount - selectedApps.length} More App(s)`;
    }
}

// Confirm selection and submit to backend
document.getElementById('confirmSelection').addEventListener('click', async function() {
    if (selectedApps.length !== requiredCount) {
        alert(`⚠️ Please select exactly ${requiredCount} app(s) before confirming.`);
        return;
    }

    // Double confirmation
    const appNames = selectedApps.map(id => {
        const app = ALL_APPS.find(a => a.id === id);
        return app ? app.name : id;
    }).join(', ');

    const confirmed = confirm(
        `🔒 PERMANENT SELECTION\n\n` +
        `You have selected: ${appNames}\n\n` +
        `⚠️ This selection is PERMANENT and cannot be changed.\n\n` +
        `Are you sure you want to proceed?`
    );

    if (!confirmed) {
        return;
    }

    // Disable button and show loading
    const confirmBtn = this;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming...';

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/api/app-selection/select`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ selectedApps })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to confirm selection');
        }

        // Success!
        alert(
            `✅ SUCCESS!\n\n` +
            `Your apps have been unlocked successfully!\n\n` +
            `Redirecting to your dashboard...`
        );

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error confirming selection:', error);
        alert(`❌ Error: ${error.message}\n\nPlease try again or contact support.`);

        // Re-enable button
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm My Selection (Permanent)';
    }
});

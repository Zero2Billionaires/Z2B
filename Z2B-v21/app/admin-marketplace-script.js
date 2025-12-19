// ============================================================================
// MARKETPLACE PRODUCT ACCESS MANAGEMENT JAVASCRIPT
// Handles ALL marketplace products: MAVULA, ZYRO, ZYRA, BENOWN, GLOWIE, VIDZIE, ZYNTH, ZYNECT
// ============================================================================

const PRODUCTS = {
    mavula: { name: 'MAVULA', icon: '🤖', color: '#9333EA' },
    zyro: { name: 'ZYRO', icon: '🎯', color: '#3B82F6' },
    zyra: { name: 'ZYRA', icon: '💼', color: '#10B981' },
    benown: { name: 'BENOWN', icon: '📊', color: '#F59E0B' },
    glowie: { name: 'GLOWIE', icon: '✨', color: '#EC4899' },
    vidzie: { name: 'VIDZIE', icon: '🎬', color: '#EF4444' },
    zynth: { name: 'ZYNTH', icon: '🎵', color: '#8B5CF6' },
    zynect: { name: 'ZYNECT', icon: '🔗', color: '#06B6D4' },
    shepherdstaff: { name: 'Shepherd Staff', icon: '🐑', color: '#22c55e' }
};

// Tab Switching for User Management
document.addEventListener('DOMContentLoaded', function() {
    // User Management Tab Switching
    const userTabs = document.querySelectorAll('.user-tab');
    userTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            // Update tab buttons
            userTabs.forEach(t => {
                t.style.borderBottom = '3px solid transparent';
                t.style.color = '#666';
                t.style.fontWeight = 'normal';
            });
            this.style.borderBottom = '3px solid var(--gold)';
            this.style.color = 'var(--navy-blue)';
            this.style.fontWeight = 'bold';

            // Update tab content
            document.querySelectorAll('.user-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tabName + '-content').style.display = 'block';

            // Load tab-specific data
            if (tabName === 'all-users') {
                loadAllUsers();
            } else if (tabName === 'product-users') {
                const productId = document.getElementById('productSelector').value;
                loadProductUsers(productId);
            } else if (tabName === 'pending-payments') {
                loadPendingPayments();
            } else if (tabName === 'grant-access') {
                loadUserDropdown();
            }
        });
    });

    // Product selector change handler
    const productSelector = document.getElementById('productSelector');
    if (productSelector) {
        productSelector.addEventListener('change', function() {
            loadProductUsers(this.value);
        });
    }

    // Access Type change handler
    const accessTypeSelect = document.getElementById('grantAccessType');
    if (accessTypeSelect) {
        accessTypeSelect.addEventListener('change', function() {
            const planGroup = document.getElementById('subscriptionPlanGroup');
            if (this.value === 'PAID') {
                planGroup.style.display = 'block';
            } else {
                planGroup.style.display = 'none';
            }
        });
    }

    // Initialize - load all users by default
    setTimeout(() => {
        loadAllUsers();
    }, 1000);
});

// Load All Users
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        const data = await response.json();
        const tbody = document.getElementById('allUsersTableBody');

        if (data.success && data.users) {
            if (data.users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
                            No users found
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.users.map(user => {
                // Count how many products user has access to
                let productAccess = [];
                if (user.marketplaceAccess) {
                    for (const [productId, access] of Object.entries(user.marketplaceAccess)) {
                        if (access && access.hasAccess) {
                            const product = PRODUCTS[productId];
                            if (product) {
                                productAccess.push(`
                                    <span style="display: inline-block; padding: 0.3rem 0.6rem; background: ${product.color}; color: white; border-radius: 5px; font-size: 0.85rem; margin: 0.2rem;">
                                        ${product.icon} ${product.name}
                                    </span>
                                `);
                            }
                        }
                    }
                }

                const accessDisplay = productAccess.length > 0
                    ? productAccess.join(' ')
                    : '<span style="color: #999; font-style: italic;">No Access</span>';

                return `
                    <tr>
                        <td><strong>${user.z2bId || user.memberId || 'N/A'}</strong></td>
                        <td>${user.fullName || `${user.firstName} ${user.lastName}`}</td>
                        <td>${user.email}</td>
                        <td><span style="padding: 0.3rem 0.8rem; background: ${getTierColor(user.tier)}; color: white; border-radius: 5px; font-weight: 600;">${user.tier}</span></td>
                        <td>${accessDisplay}</td>
                        <td>
                            <button onclick="viewUserDetails('${user._id}')" style="padding: 0.5rem 1rem; background: var(--light-blue); border: none; border-radius: 5px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = document.getElementById('allUsersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">
                    Error loading users. Please try again.
                </td>
            </tr>
        `;
    }
}

// Load Product Users
async function loadProductUsers(productId) {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_URL}/api/users/marketplace-stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const statsData = await statsResponse.json();

        if (statsData.success && statsData.stats[productId]) {
            const stats = statsData.stats[productId];
            const product = PRODUCTS[productId];

            document.getElementById('productStats').innerHTML = `
                <div class="stat-card" style="background: linear-gradient(135deg, ${product.color}, ${product.color}DD); padding: 1.5rem; border-radius: 10px; color: white;">
                    <div style="font-size: 2.5rem; font-weight: bold;">${stats.total}</div>
                    <div style="opacity: 0.9;">Total ${product.name} Users</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 1.5rem; border-radius: 10px; color: white;">
                    <div style="font-size: 2.5rem; font-weight: bold;">${stats.paid}</div>
                    <div style="opacity: 0.9;">Paid Subscriptions</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 1.5rem; border-radius: 10px; color: white;">
                    <div style="font-size: 2.5rem; font-weight: bold;">${stats.free}</div>
                    <div style="opacity: 0.9;">Free/Gift/Beta</div>
                </div>
            `;
        }

        // Load users
        const usersResponse = await fetch(`${API_URL}/api/users/product-access/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const usersData = await usersResponse.json();
        const tbody = document.getElementById('productUsersTableBody');

        if (usersData.success && usersData.users) {
            if (usersData.users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
                            No users with ${PRODUCTS[productId].name} access yet
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = usersData.users.map(user => {
                const access = user.marketplaceAccess[productId];
                return `
                    <tr>
                        <td><strong>${user.z2bId || user.memberId || 'N/A'}</strong></td>
                        <td>${user.fullName || `${user.firstName} ${user.lastName}`}</td>
                        <td><span style="padding: 0.3rem 0.8rem; background: ${getAccessTypeColor(access.accessType)}; color: white; border-radius: 5px; font-weight: 600;">${getAccessTypeIcon(access.accessType)} ${access.accessType}</span></td>
                        <td>${formatDate(access.grantedDate)}</td>
                        <td>${access.expiryDate ? formatDate(access.expiryDate) : '<span style="color: #999;">No Expiry</span>'}</td>
                        <td>
                            <button onclick="revokeProductAccess('${user._id}', '${productId}')" style="padding: 0.5rem 1rem; background: var(--danger); border: none; border-radius: 5px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                                <i class="fas fa-times"></i> Revoke
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading product users:', error);
    }
}

// Load Pending Payments
async function loadPendingPayments() {
    try {
        const response = await fetch(`${API_URL}/api/payments/pending-marketplace`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        const data = await response.json();
        // TODO: Display pending payments when payment model is implemented
        console.log('Pending payments:', data);
    } catch (error) {
        console.error('Error loading pending payments:', error);
    }
}

// Load User Dropdown
async function loadUserDropdown() {
    try {
        const response = await fetch(`${API_URL}/api/users/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        const data = await response.json();
        const select = document.getElementById('grantUserId');

        if (data.success && data.users) {
            select.innerHTML = '<option value="">-- Select User --</option>' + data.users.map(user => {
                return `<option value="${user._id}">${user.fullName || `${user.firstName} ${user.lastName}`} (${user.email})</option>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Grant Product Access
async function grantProductAccess(event) {
    event.preventDefault();

    const userId = document.getElementById('grantUserId').value;
    const productId = document.getElementById('grantProductId').value;
    const accessType = document.getElementById('grantAccessType').value;
    const subscriptionPlan = document.getElementById('grantSubscriptionPlan').value;
    const expiryDate = document.getElementById('grantExpiryDate').value;
    const notes = document.getElementById('grantNotes').value;
    const sendCredentials = document.getElementById('grantSendCredentials').checked;

    try {
        const response = await fetch(`${API_URL}/api/users/grant-product-access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                userId,
                productId,
                accessType,
                subscriptionPlan,
                expiryDate: expiryDate || null,
                notes,
                sendCredentials
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ ${PRODUCTS[productId].name} access granted successfully!`);
            resetGrantForm();
            loadAllUsers();
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error granting access:', error);
        alert('❌ Error granting access. Please try again.');
    }
}

// Revoke Product Access
async function revokeProductAccess(userId, productId) {
    const reason = prompt(`Enter reason for revoking ${PRODUCTS[productId].name} access:`);
    if (!reason) return;

    try {
        const response = await fetch(`${API_URL}/api/users/revoke-product-access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                userId,
                productId,
                reason
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ ${PRODUCTS[productId].name} access revoked successfully.`);
            loadProductUsers(productId);
            loadAllUsers();
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error revoking access:', error);
        alert('❌ Error revoking access. Please try again.');
    }
}

// View User Details
function viewUserDetails(userId) {
    // TODO: Implement user details modal
    console.log('View user details:', userId);
    alert('User details view coming soon!');
}

// Refresh User List
function refreshUserList() {
    loadAllUsers();
}

// Reset Grant Form
function resetGrantForm() {
    document.getElementById('grantAccessForm').reset();
    document.getElementById('subscriptionPlanGroup').style.display = 'none';
}

// Helper Functions
function getTierColor(tier) {
    const colors = {
        'FAM': '#94A3B8',
        'BRONZE': '#CD7F32',
        'COPPER': '#B87333',
        'SILVER': '#C0C0C0',
        'GOLD': '#FFD700',
        'PLATINUM': '#E5E4E2',
        'LIFETIME': '#9333EA'
    };
    return colors[tier] || '#6B7280';
}

function getAccessTypeColor(type) {
    const colors = {
        'PAID': '#10B981',
        'GIFT': '#F59E0B',
        'BETA': '#3B82F6',
        'ADMIN': '#9333EA',
        'FREE': '#6B7280'
    };
    return colors[type] || '#6B7280';
}

function getAccessTypeIcon(type) {
    const icons = {
        'PAID': '💳',
        'GIFT': '🎁',
        'BETA': '🧪',
        'ADMIN': '👑',
        'FREE': '🆓'
    };
    return icons[type] || '📦';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

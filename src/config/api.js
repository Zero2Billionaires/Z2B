// API Configuration for Z2B Legacy Builders
// This file centralizes all API endpoint configurations

const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://www.z2blegacybuilders.co.za/api',
  PAYMENT_API_URL: process.env.REACT_APP_PAYMENT_API_URL || 'https://www.z2blegacybuilders.co.za/payment-api',
  RAILWAY_API_URL: process.env.REACT_APP_RAILWAY_API_URL || 'https://www.z2blegacybuilders.co.za/api',

  // API Endpoints
  ENDPOINTS: {
    // User & Auth
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER_PROFILE: '/user/profile',

    // Milestones
    SAVE_MILESTONE_1: '/milestones/vision-board',
    SAVE_MILESTONE_2: '/milestones/skills-assessment',
    SAVE_MILESTONE_3: '/milestones/revenue-streams',
    SAVE_MILESTONE_4: '/milestones/action-plan',
    SAVE_MILESTONE_5: '/milestones/market-research',
    SAVE_MILESTONE_6: '/milestones/personal-brand',
    SAVE_MILESTONE_7: '/milestones/launch-ready',
    GET_USER_MILESTONES: '/milestones',

    // Membership & Payments
    CREATE_PAYMENT: '/payment-api/create-app-checkout.php', // PHP backend
    VERIFY_PAYMENT: '/payment-api/verify-payment.php',
    GET_MEMBERSHIP_STATUS: '/membership/status',
    UPGRADE_TIER: '/membership/upgrade',

    // TLI & Earnings
    GET_TLI_STATUS: '/tli/status',
    GET_EARNINGS: '/tli/earnings',
    GET_TEAM: '/tli/team',

    // Coach Manlaw (AI)
    CHAT_WITH_COACH: '/coach/chat',
    GET_DAILY_GUIDANCE: '/coach/daily-guidance',
    GET_ACTION_PLAN: '/coach/action-plan',

    // Analytics
    TRACK_EVENT: '/analytics/track',
    GET_PROGRESS: '/analytics/progress',
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint, usePaymentApi = false) => {
  const baseUrl = usePaymentApi ? API_CONFIG.PAYMENT_API_URL : API_CONFIG.BASE_URL;

  // If endpoint already includes the base path, return as is
  if (endpoint.startsWith('/payment-api/')) {
    return `${API_CONFIG.PAYMENT_API_URL}${endpoint.replace('/payment-api', '')}`;
  }

  return `${baseUrl}${endpoint}`;
};

// Helper function for API calls with error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};

export default API_CONFIG;

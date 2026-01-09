===============================================
PROSPECT SALES FUNNEL - CPANEL UPLOAD FILES
===============================================

This folder contains ONLY the files you need to upload to cPanel for the new prospect sales funnel.

===============================================
FILES IN THIS FOLDER:
===============================================

1. start-milestone-1.html
   - Landing page for free prospects
   - Provocative title: "Before You Upgrade Your Life by resigning from the Job you hate, Clarify Your Foundation"
   - Captures prospect with referral tracking
   - Redirects to milestone1-welcome.html

2. milestone1-welcome.html
   - Interactive Milestone 1 page
   - 3-Level SWOT Analysis
   - THREE Vision Boards (Individual, Family, Group)
   - Brown & gold luxury design
   - After completion, shows upsell with all 7 milestones
   - Redirects to https://www.z2blegacybuilders.co.za/tiers with builder referral ID

3. referral-tracker.js
   - JavaScript referral tracking system
   - Triple redundancy (localStorage + sessionStorage + cookies)
   - Ensures builders never lose commission credit
   - Automatically tracks builder ID from URL parameter (?ref=BUILDER_ID)

===============================================
HOW TO UPLOAD TO CPANEL:
===============================================

1. Login to your cPanel
2. Go to File Manager
3. Navigate to your public_html folder (or wherever your website root is)
4. Create a new folder called "milestones" (if it doesn't exist)
5. Upload ALL 3 files to the milestones folder:
   - start-milestone-1.html
   - milestone1-welcome.html
   - referral-tracker.js

===============================================
BUILDER SHARING LINK:
===============================================

Builders should share this link with prospects:
https://yourdomain.com/milestones/start-milestone-1.html?ref=BUILDER_ID

Replace:
- yourdomain.com with your actual domain
- BUILDER_ID with the builder's unique ID

Example:
https://z2blegacybuilders.co.za/milestones/start-milestone-1.html?ref=12345

===============================================
USER JOURNEY FLOW:
===============================================

1. Builder shares link with prospect (?ref=BUILDER_ID)
2. Prospect lands on start-milestone-1.html
   - Referral ID stored in triple redundancy
3. Prospect clicks "Start Milestone 1"
4. Redirects to milestone1-welcome.html
   - Referral ID maintained
5. Prospect completes interactive M1 work
   - Form saves with builder attribution
6. Upsell appears showing all 7 milestones
7. Prospect clicks "View 4 Membership Tiers & Complete Offer"
8. Redirects to https://www.z2blegacybuilders.co.za/tiers?ref=BUILDER_ID
9. Prospect sees 4 tier options
10. Builder gets commission credit when prospect purchases

===============================================
IMPORTANT NOTES:
===============================================

- These files work together as a system
- ALL 3 files must be in the same folder
- referral-tracker.js MUST be in the same directory as the HTML files
- The tiers page must exist at: https://www.z2blegacybuilders.co.za/tiers
- Backend API endpoints must be set up for form submission:
  - /api/milestone1-save-progress
  - /api/milestone1-complete
  - /api/milestone1-progress/:email

===============================================
TESTING:
===============================================

After upload, test the funnel:
1. Visit: https://yourdomain.com/milestones/start-milestone-1.html?ref=TEST123
2. Click "Start Milestone 1"
3. Fill out some fields (they auto-save)
4. Complete the form
5. Check that upsell appears
6. Click "View 4 Membership Tiers"
7. Verify redirect to tiers page with ?ref=TEST123

===============================================
THAT'S IT!
===============================================

Just upload these 3 files to cPanel and the funnel is ready.
No other files needed.
No confusion.
Clean and simple.

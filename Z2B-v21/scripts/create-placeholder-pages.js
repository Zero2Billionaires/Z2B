/**
 * Script to create placeholder React pages
 * Run with: node scripts/create-placeholder-pages.js
 */

const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'Dashboard', path: 'pages' },
  { name: 'Team', path: 'pages' },
  { name: 'Income', path: 'pages' },
  { name: 'Marketplace', path: 'pages' },
  { name: 'CoachManlaw', path: 'pages' },
  { name: 'Tiers', path: 'pages' },
  { name: 'Profile', path: 'pages' },
  { name: 'Settings', path: 'pages' },
  { name: 'AdminDashboard', path: 'pages/admin' },
  { name: 'Benown', path: 'pages/apps' },
  { name: 'Zyra', path: 'pages/apps' },
  { name: 'Vidzie', path: 'pages/apps' },
  { name: 'Glowie', path: 'pages/apps' },
  { name: 'Zynect', path: 'pages/apps' },
  { name: 'Zyro', path: 'pages/apps' },
];

const createPlaceholderPage = (name, folderPath) => {
  const template = `/**
 * ${name} Page
 * TODO: Implement full functionality
 */

import { useAuth } from '${folderPath.includes('admin') || folderPath.includes('apps') ? '../../' : '../'}context/AuthContext';

const ${name} = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4" style={{ color: 'var(--primary-gold)' }}>
            ${name.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <div className="card">
            <div className="card-body">
              <p>Welcome, {user?.firstName || 'User'}!</p>
              <p className="text-muted">
                This page is under development. The full ${name.toLowerCase()} functionality
                will be implemented here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${name};
`;

  const filePath = path.join(__dirname, '..', 'frontend', 'src', folderPath, `${name}.jsx`);
  const dir = path.dirname(filePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, template);
  console.log(`Created: ${filePath}`);
};

// Create all pages
pages.forEach(({ name, path: folderPath }) => {
  createPlaceholderPage(name, folderPath);
});

console.log('\n✅ All placeholder pages created successfully!');

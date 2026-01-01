/**
 * Settings Page
 * TODO: Implement full functionality
 */

import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4" style={{ color: 'var(--primary-gold)' }}>
            Settings
          </h1>
          <div className="card">
            <div className="card-body">
              <p>Welcome, {user?.firstName || 'User'}!</p>
              <p className="text-muted">
                This page is under development. The full settings functionality
                will be implemented here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

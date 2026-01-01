import '../shared/SharedStyles.css'

function DashboardSection() {
  return (
    <>
      <div className="header-banner">
        <h2>Welcome to Z2B LEGACY BUILDERS APP</h2>
        <p>Manage your network marketing ecosystem with ease</p>
        <button className="btn" style={{background: 'white', color: '#000', marginTop: '15px'}}>
          Quick Start Guide
        </button>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <select style={{padding: '8px 15px', border: '1px solid #ddd', borderRadius: '8px'}}>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>This Quarter</option>
        </select>
        <button className="btn" style={{background: '#f3f4f6', color: '#333'}}>
          📥 Export Report
        </button>
      </div>

      <div className="grid">
        <div className="card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Active Members</div>
          <span style={{color: '#10b981', fontSize: '12px'}}>+0%</span>
        </div>
        <div className="card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Qualified Members</div>
          <span style={{color: '#10b981', fontSize: '12px'}}>+0%</span>
        </div>
        <div className="card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">R0</div>
          <div className="stat-label">Total Commissions</div>
          <span style={{color: '#10b981', fontSize: '12px'}}>+0%</span>
        </div>
        <div className="card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">R0</div>
          <div className="stat-label">Total Sales</div>
          <span style={{color: '#10b981', fontSize: '12px'}}>+0%</span>
        </div>
        <div className="card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">0</div>
          <div className="stat-label">AI Credits Used</div>
          <span style={{color: '#10b981', fontSize: '12px'}}>+0%</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{marginBottom: '20px'}}>Recent Activity</h3>
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>No recent activity</p>
          </div>
        </div>
        <div className="card">
          <h3 style={{marginBottom: '20px'}}>Top Performers</h3>
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <p>No data available</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardSection

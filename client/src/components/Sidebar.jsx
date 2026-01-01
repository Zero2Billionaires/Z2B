import './Sidebar.css'

const menuItems = [
  {
    title: 'Core Management',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard' },
      { id: 'members', icon: '👥', label: 'Members' },
      { id: 'tiers', icon: '📈', label: 'Tier System' },
      { id: 'qpb', icon: '⚡', label: 'QPB Monitoring' },
      { id: 'beta', icon: '⭐', label: 'First 100 Beta' }
    ]
  },
  {
    title: 'Rules & Qualifications',
    items: [
      { id: 'rules', icon: '⚖️', label: 'Rules Builder' }
    ]
  },
  {
    title: 'Revenue & Commissions',
    items: [
      { id: 'tsc', icon: '💰', label: 'TSC' },
      { id: 'tpb', icon: '🏆', label: 'TPB' },
      { id: 'ceo', icon: '🎯', label: 'CEO Targets' },
      { id: 'tli', icon: '🏅', label: 'TLI' }
    ]
  },
  {
    title: 'Marketplace',
    items: [
      { id: 'marketplace', icon: '🛍️', label: 'Marketplace' },
      { id: 'pricing', icon: '💳', label: 'Pricing Rules' }
    ]
  },
  {
    title: 'AI & Credits',
    items: [
      { id: 'ai', icon: '🤖', label: 'AI Credits' },
      { id: 'refuel', icon: '⛽', label: 'Monthly Refuel' }
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'platform', icon: '⚙️', label: 'Platform' },
      { id: 'analytics', icon: '📊', label: 'Analytics' }
    ]
  }
]

function Sidebar({ activeSection, setActiveSection, collapsed, setCollapsed }) {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1>Z2B LEGACY</h1>
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          ☰
        </button>
      </div>

      {menuItems.map((section, idx) => (
        <div key={idx} className="menu-section">
          <div className="menu-title">{section.title}</div>
          {section.items.map(item => (
            <div
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Sidebar

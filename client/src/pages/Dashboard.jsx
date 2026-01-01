import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import DashboardSection from '../components/sections/DashboardSection'
import MembersSection from '../components/sections/MembersSection'
import TiersSection from '../components/sections/TiersSection'
import QPBSection from '../components/sections/QPBSection'
import BetaSection from '../components/sections/BetaSection'
import RulesSection from '../components/sections/RulesSection'
import TSCSection from '../components/sections/TSCSection'
import TPBSection from '../components/sections/TPBSection'
import CEOSection from '../components/sections/CEOSection'
import TLISection from '../components/sections/TLISection'
import MarketplaceSection from '../components/sections/MarketplaceSection'
import PricingSection from '../components/sections/PricingSection'
import AISection from '../components/sections/AISection'
import RefuelSection from '../components/sections/RefuelSection'
import PlatformSection from '../components/sections/PlatformSection'
import AnalyticsSection from '../components/sections/AnalyticsSection'
import './Dashboard.css'

function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': return <DashboardSection />
      case 'members': return <MembersSection />
      case 'tiers': return <TiersSection />
      case 'qpb': return <QPBSection />
      case 'beta': return <BetaSection />
      case 'rules': return <RulesSection />
      case 'tsc': return <TSCSection />
      case 'tpb': return <TPBSection />
      case 'ceo': return <CEOSection />
      case 'tli': return <TLISection />
      case 'marketplace': return <MarketplaceSection />
      case 'pricing': return <PricingSection />
      case 'ai': return <AISection />
      case 'refuel': return <RefuelSection />
      case 'platform': return <PlatformSection />
      case 'analytics': return <AnalyticsSection />
      default: return <DashboardSection />
    }
  }

  return (
    <div className="container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="main-content">
        {renderSection()}
      </div>
    </div>
  )
}

export default Dashboard

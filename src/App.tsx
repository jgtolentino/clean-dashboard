import React, { useState, Suspense, lazy } from 'react'
import Sidebar from './components/layout/Sidebar'
import AIPanel from './components/layout/AIPanel'
import { CascadingFilterPanel, CascadingFilterState } from './components/filters/CascadingFilterPanel'

// Eager load lightweight components (fast initial paint)
import {
  EnhancedTransactionTrends,
  EnhancedProductMix,
  EnhancedConsumerBehavior,
  EnhancedConsumerProfiling,
  EnhancedCompetitiveAnalysis
} from './components/enhanced/EnhancedDashboard'

// Lazy load heavy components (maps, large data views)
const EnhancedGeographicalIntelligence = lazy(() =>
  import('./components/enhanced/EnhancedDashboard').then(module => ({
    default: module.EnhancedGeographicalIntelligence
  }))
)
const DatabankPage = lazy(() =>
  import('./components/databank').then(module => ({
    default: module.DatabankPage
  }))
)

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
)

function App() {
  const [activeSection, setActiveSection] = useState('transaction-trends')
  const [showEnhanced, setShowEnhanced] = useState(true) // Toggle between enhanced and basic views
  
  // Panel states
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Cascading filter state
  const [cascadingFilters, setCascadingFilters] = useState<CascadingFilterState>({
    comparisonMode: 'single',
    selectedBrands: [],
    brandComparison: 'vs',
    selectedCategories: [],
    categoryComparison: 'vs',
    selectedRegions: [],
    selectedStores: [],
    locationComparison: 'vs',
    timePeriod: 'daily',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    temporalComparison: 'current',
    customerSegment: [],
    transactionType: [],
    priceRange: [0, 10000],
    showTrends: true,
    showDeltas: false,
    showPercentages: true
  })

  const handleRefresh = () => {
    console.log('Refreshing dashboard data...', cascadingFilters)
    // In a real implementation, this would trigger data refresh with filters
  }

  const handleFilterApply = () => {
    console.log('Applying filters:', cascadingFilters)
    handleRefresh()
  }

  const handleFilterReset = () => {
    setCascadingFilters({
      comparisonMode: 'single',
      selectedBrands: [],
      brandComparison: 'vs',
      selectedCategories: [],
      categoryComparison: 'vs',
      selectedRegions: [],
      selectedStores: [],
      locationComparison: 'vs',
      timePeriod: 'daily',
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      temporalComparison: 'current',
      customerSegment: [],
      transactionType: [],
      priceRange: [0, 10000],
      showTrends: true,
      showDeltas: false,
      showPercentages: true
    })
  }

  const renderActiveSection = () => {
    // Lazy-loaded pages wrapped in Suspense
    if (activeSection === 'databank') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <DatabankPage />
        </Suspense>
      )
    }

    if (activeSection === 'geographical-intelligence') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <EnhancedGeographicalIntelligence />
        </Suspense>
      )
    }

    // Eager-loaded components (no Suspense needed)
    switch (activeSection) {
      case 'transaction-trends':
        return <EnhancedTransactionTrends />
      case 'product-mix':
        return <EnhancedProductMix />
      case 'consumer-behavior':
        return <EnhancedConsumerBehavior />
      case 'consumer-profiling':
        return <EnhancedConsumerProfiling />
      case 'competitive-analysis':
        return <EnhancedCompetitiveAnalysis />
      default:
        return <EnhancedTransactionTrends />
    }
  }

  return (
    <div className="min-h-screen bg-scout-light">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        {/* Main Content Area */}
        <div 
          className="flex-1 flex transition-all duration-300"
          style={{ marginLeft: isSidebarCollapsed ? '64px' : '256px' }}
        >
          {/* Dashboard Content */}
          <div className="flex-1 p-6">
            {/* Check if this is the databank page for different layout */}
            {activeSection === 'databank' ? (
              <div className="w-full">
                {renderActiveSection()}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Dashboard Content */}
                <div className="xl:col-span-3">
                  {renderActiveSection()}
                </div>
                
                {/* AI Recommendations Panel */}
                <div className="xl:col-span-1">
                  <AIPanel section={activeSection} />
                </div>
              </div>
            )}
          </div>
          
          {/* Cascading Filter Panel - hide for databank */}
          {activeSection !== 'databank' && (
            <CascadingFilterPanel
              isCollapsed={isFilterCollapsed}
              onToggle={() => setIsFilterCollapsed(!isFilterCollapsed)}
              filters={cascadingFilters}
              onFilterChange={setCascadingFilters}
              onReset={handleFilterReset}
              onApply={handleFilterApply}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
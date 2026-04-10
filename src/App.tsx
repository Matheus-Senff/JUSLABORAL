import React from 'react'
import { Layout } from './components/Layout'
import { Agenda } from './components/Agenda'
import { ProcessTable } from './components/ProcessTable'
import { CanonIndex } from './components/CanonIndex'
import Calculo from './components/Calculo'
import { PastaIndex } from './components/PastaIndex'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

function AppContent() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [activePage, setActivePage] = React.useState<'agenda' | 'estadual' | 'federal' | 'pasta' | 'canon' | 'calculo'>('agenda')

  const handlePageChange = (page: string) => {
    if (
      page === 'agenda' ||
      page === 'estadual' ||
      page === 'federal' ||
      page === 'pasta' ||
      page === 'canon' ||
      page === 'calculo'
    ) {
      setActivePage(page)
    }
  }

  return (
    <Layout activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} onDarkModeToggle={toggleDarkMode}>
      {activePage === 'agenda' && <Agenda darkMode={darkMode} />}
      {activePage === 'estadual' && <ProcessTable darkMode={darkMode} type="estadual" />}
      {activePage === 'federal' && <ProcessTable darkMode={darkMode} type="federal" />}
      {activePage === 'pasta' && <PastaIndex darkMode={darkMode} />}
      {activePage === 'canon' && <CanonIndex darkMode={darkMode} />}
      {activePage === 'calculo' && <Calculo />}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App

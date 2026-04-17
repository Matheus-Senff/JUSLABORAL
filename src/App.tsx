import React from 'react'
import { Layout } from './components/Layout'
import { Agenda } from './components/Agenda'
import { ProcessTable } from './components/ProcessTable'
import { ClientsTable } from './components/ClientsTable'
import { CanonIndex } from './components/CanonIndex'
import { Settings } from './components/Settings'
import Calculo from './components/Calculo'
import { PastaIndex } from './components/PastaIndex'
import { CalendarView } from './components/pasta/CalendarView'
import { AuthPage } from './components/AuthPage'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { useSupabaseCompromissos } from './hooks/useSupabaseCompromissos'

function AppContent() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, isAuthenticated, loading: authLoading } = useSupabaseAuth()
  const { compromissos, saveCompromisso, deleteCompromisso, loading: compromissosLoading } = useSupabaseCompromissos(user?.id)
  const [activePage, setActivePage] = React.useState<'agenda' | 'clientes' | 'estadual' | 'federal' | 'pasta' | 'canon' | 'calculo' | 'configuracoes' | 'estadual-status' | 'federal-status' | 'compromissos'>('compromissos')
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null)

  const handlePageChange = (page: string, status?: string) => {
    if (
      page === 'agenda' ||
      page === 'clientes' ||
      page === 'estadual' ||
      page === 'federal' ||
      page === 'pasta' ||
      page === 'canon' ||
      page === 'calculo' ||
      page === 'configuracoes' ||
      page === 'estadual-status' ||
      page === 'federal-status' ||
      page === 'compromissos'
    ) {
      setActivePage(page as any)
      if (status) {
        setSelectedStatus(status)
      }
    }
  }

  // Show loading screen
  if (authLoading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${darkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>JusLaboral</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Carregando...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage darkMode={darkMode} />
  }

  return (
    <Layout activePage={activePage} selectedStatus={selectedStatus} onPageChange={handlePageChange} darkMode={darkMode} onDarkModeToggle={toggleDarkMode}>
      {activePage === 'agenda' && <Agenda darkMode={darkMode} />}
      {activePage === 'clientes' && <ClientsTable darkMode={darkMode} />}
      {activePage === 'estadual' && <ProcessTable darkMode={darkMode} type="estadual" />}
      {activePage === 'federal' && <ProcessTable darkMode={darkMode} type="federal" />}
      {(activePage === 'estadual-status' || activePage === 'federal-status') && selectedStatus && (
        <ProcessTable darkMode={darkMode} type={activePage === 'estadual-status' ? 'estadual' : 'federal'} statusFilter={selectedStatus} />
      )}
      {activePage === 'pasta' && <PastaIndex darkMode={darkMode} />}
      {activePage === 'compromissos' && <CalendarView darkMode={darkMode} compromissos={compromissos} onSaveCompromisso={saveCompromisso} onDeleteCompromisso={deleteCompromisso} />}
      {activePage === 'canon' && <CanonIndex darkMode={darkMode} />}
      {activePage === 'calculo' && <Calculo />}
      {activePage === 'configuracoes' && <Settings darkMode={darkMode} />}
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

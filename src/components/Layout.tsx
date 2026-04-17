import React, { useState } from 'react'
import { Calendar, Scale, Gavel, Cpu, Calculator, Folder, Moon, Sun, Users, Settings } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activePage: string
  selectedStatus?: string | null
  onPageChange: (page: string, status?: string) => void
  darkMode: boolean
  onDarkModeToggle: () => void
}

interface SidebarProps {
  activePage: string
  selectedStatus?: string | null
  onPageChange: (page: string, status?: string) => void
  darkMode: boolean
  onDarkModeToggle: () => void
}

interface HeaderProps {
  darkMode: boolean
  onDarkModeToggle: () => void
  title: string
  onPageChange: (page: string) => void
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  selectedStatus,
  onPageChange,
  darkMode,
  onDarkModeToggle
}: LayoutProps) => {
  return (
    <div className={`flex h-screen ${darkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar activePage={activePage} selectedStatus={selectedStatus} onPageChange={onPageChange} darkMode={darkMode} onDarkModeToggle={onDarkModeToggle} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header
          darkMode={darkMode}
          onDarkModeToggle={onDarkModeToggle}
          onPageChange={onPageChange}
          title={
            activePage === 'agenda'
              ? 'Agenda'
              : activePage === 'clientes'
                ? 'Clientes'
                : activePage === 'compromissos'
                  ? 'Compromissos'
                  : activePage === 'estadual'
                    ? 'Processo Estadual'
                    : activePage === 'federal'
                      ? 'Processo Federal'
                      : activePage === 'estadual-status'
                        ? `Processo Estadual - ${selectedStatus}`
                        : activePage === 'federal-status'
                          ? `Processo Federal - ${selectedStatus}`
                          : activePage === 'configuracoes'
                            ? 'Configurações'
                            : activePage === 'canon'
                              ? 'Canon'
                              : activePage === 'pasta'
                                ? 'Documentos'
                                : 'Cálculo'
          }
        />
        <main className="flex-1 overflow-auto h-full">
          {children}
        </main>
      </div>
    </div>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, selectedStatus, onPageChange, darkMode, onDarkModeToggle }: SidebarProps) => {
  const [showEstadualDropdown, setShowEstadualDropdown] = React.useState(false)
  const [showFederalDropdown, setShowFederalDropdown] = React.useState(false)

  const statusOptions = [
    { label: 'Não Ajuizado', count: 3214 },
    { label: 'Ajuizado', count: 8756 },
    { label: 'Pendência', count: 4521 },
    { label: 'Aguardando Documento', count: 2847 },
    { label: 'Pendência Cumprida', count: 3691 },
    { label: 'Aguardando Ajuizamento', count: 2145 },
    { label: 'Arquivado', count: 929 },
  ]
  return (
    <div className={`w-64 flex flex-col border-r ${darkMode ? 'bg-dark-700 text-white border-dark-600' : 'bg-gray-100 text-gray-900 border-gray-200'}`}>
      {/* Logo/Title */}
      <div className="p-6 border-b border-dark-600">
        <h1 className="text-xl font-bold">JusLaboral</h1>
        <p className="text-xs text-gray-400 mt-1">Gestão Corporativa</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 flex flex-col">
        {/* Secondary Navigation - Top (Larger) */}
        <div className="space-y-2 mb-4">
          <button
            onClick={() => onPageChange('canon')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
              ? (activePage === 'canon'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              : (activePage === 'canon'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              }`}
          >
            <Cpu size={20} />
            <span className="font-semibold">Canon</span>
          </button>

          <button
            onClick={() => onPageChange('calculo')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
              ? (activePage === 'calculo'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              : (activePage === 'calculo'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              }`}
          >
            <Calculator size={20} />
            <span className="font-semibold">Cálculo</span>
          </button>
        </div>

        {/* Divider */}
        <div className={`my-2 border-t ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}></div>

        {/* Primary Navigation */}
        <div className="space-y-2">
          <button
            onClick={() => onPageChange('compromissos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
              ? (activePage === 'compromissos'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              : (activePage === 'compromissos'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              }`}
          >
            <Calendar size={20} />
            <span>Compromissos</span>
          </button>

          <button
            onClick={() => onPageChange('pasta')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
              ? (activePage === 'pasta'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              : (activePage === 'pasta'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              }`}
          >
            <Folder size={20} />
            <span>Documentos</span>
          </button>

          <button
            onClick={() => onPageChange('agenda')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
              ? (activePage === 'agenda'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              : (activePage === 'agenda'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              }`}
          >
            <div className="relative">
              <Calendar size={20} />
              {activePage === 'agenda' && (
                <span className="absolute -top-2 -right-2 bg-green-400 text-dark-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">50</span>
              )}
            </div>
            <span>Agenda</span>
          </button>

          <div
            onMouseEnter={() => setShowEstadualDropdown(true)}
            onMouseLeave={() => setShowEstadualDropdown(false)}
            className="relative w-full"
          >
            <button
              onClick={() => onPageChange('estadual')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
                ? (activePage === 'estadual' || activePage === 'estadual-status'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700')
                : (activePage === 'estadual' || activePage === 'estadual-status'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700')
                }`}
            >
              <Scale size={20} />
              <span>Processo Estadual</span>
            </button>
            {showEstadualDropdown && (
              <div className={`absolute left-0 top-full w-full rounded-b-lg shadow-2xl z-50 ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'} border border-t-0 flex flex-col`}>
                {statusOptions.map((status) => (
                  <button
                    key={status.label}
                    onClick={() => {
                      onPageChange('estadual-status', status.label)
                      setShowEstadualDropdown(false)
                    }}
                    className={`px-4 py-2 text-sm text-left transition flex justify-between items-center ${darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      } border-b ${darkMode ? 'border-dark-600' : 'border-gray-200'} last:border-b-0`}
                  >
                    <span>{status.label}</span>
                    <span className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>({status.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            onMouseEnter={() => setShowFederalDropdown(true)}
            onMouseLeave={() => setShowFederalDropdown(false)}
            className="relative w-full"
          >
            <button
              onClick={() => onPageChange('federal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
                ? (activePage === 'federal' || activePage === 'federal-status'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700')
                : (activePage === 'federal' || activePage === 'federal-status'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700')
                }`}
            >
              <Gavel size={20} />
              <span>Processo Federal</span>
            </button>
            {showFederalDropdown && (
              <div className={`absolute left-0 top-full w-full rounded-b-lg shadow-2xl z-50 ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'} border border-t-0 flex flex-col`}>
                {statusOptions.map((status) => (
                  <button
                    key={status.label}
                    onClick={() => {
                      onPageChange('federal-status', status.label)
                      setShowFederalDropdown(false)
                    }}
                    className={`px-4 py-2 text-sm text-left transition flex justify-between items-center ${darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      } border-b ${darkMode ? 'border-dark-600' : 'border-gray-200'} last:border-b-0`}
                  >
                    <span>{status.label}</span>
                    <span className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>({status.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onPageChange('clientes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${darkMode
              ? (activePage === 'clientes'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              : (activePage === 'clientes'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700')
              }`}
          >
            <Users size={20} />
            <span>Clientes</span>
          </button>
        </div>
      </nav>


    </div>
  )
}

const Header: React.FC<HeaderProps> = ({ darkMode, onDarkModeToggle, title, onPageChange }: HeaderProps) => {
  return (
    <div className={`${darkMode ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange('configuracoes')}
          className={`p-2 rounded-lg transition ${darkMode
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          <Settings size={20} />
        </button>
        <button
          onClick={onDarkModeToggle}
          className={`p-2 rounded-lg transition ${darkMode
            ? 'bg-dark-600 text-yellow-400 hover:bg-dark-500'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  )
}

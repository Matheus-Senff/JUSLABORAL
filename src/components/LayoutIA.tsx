import React from "react";

// Componente de layout fixo para a página de Documentação IA do CanonIA
// Usa Tailwind CSS para garantir layout 100% fixo, sem scroll global

interface LayoutIAProps {
  header?: React.ReactNode;
  uploadArea: React.ReactNode;
  editorArea: React.ReactNode;
  promptBar: React.ReactNode;
}

export default function LayoutIA({ header, uploadArea, editorArea, promptBar }: LayoutIAProps) {
  return (
    <div className="h-screen w-full bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header opcional */}
      {header && (
        <header className="h-14 min-h-[3.5rem] border-b border-[#212529] flex items-center px-6 bg-[#1a1a1a]">
          {header}
        </header>
      )}
      {/* Corpo principal: Upload + Editor */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
        {/* Área de Upload/Arraste de Arquivos */}
        <section className="flex flex-col w-[32%] min-w-[320px] max-w-[420px] border-r border-[#212529] bg-[#1a1a1a] h-full">
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {uploadArea}
          </div>
        </section>
        {/* Editor/Visualizador */}
        <section className="flex-1 flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {editorArea}
          </div>
        </section>
      </div>
      {/* Prompt fixo no rodapé */}
      <footer className="h-24 min-h-[5.5rem] border-t border-[#212529] bg-[#1a1a1a] flex items-center px-8">
        <div className="w-full">
          {promptBar}
        </div>
      </footer>
    </div>
  );
}

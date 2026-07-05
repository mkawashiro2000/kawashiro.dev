import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Terminal, ShieldCheck, Sprout, Truck } from 'lucide-react';

export const BusinessUI: React.FC = () => {
  const toggleMode = useAppStore((state) => state.toggleMode);

  const handleTransition = () => {
    // Inyectamos la clase raíz para mutar las variables CSS nativas (@theme)
    document.documentElement.classList.add('pro-theme');
    toggleMode();
  };

  const projects = [
    {
      title: "Lex32 e-CF (DGII)",
      description: "Sistema Fiscal de Facturación Electrónica en cumplimiento con la Ley 32-23. Integración de criptografía X.509 y canonicalización XML para la emisión de comprobantes fiscales de alta concurrencia.",
      icon: <ShieldCheck className="w-6 h-6 text-[var(--color-text-accent)]" />,
      tags: ["Python", "FastAPI", "XML-DSig", "Arquitectura Fiscal"]
    },
    {
      title: "AgroBalance",
      description: "Plataforma B2B de gestión y contabilidad agrícola. Diseñada para rastrear ciclos de cultivo, calcular proyecciones de rentabilidad y automatizar la liquidación financiera entre socios productores.",
      icon: <Sprout className="w-6 h-6 text-green-600" />,
      tags: ["Next.js", "PostgreSQL", "Fintech Agrícola"]
    },
    {
      title: "Batista Hub & Cargo",
      description: "Dirección de Operaciones. Red de logística, courier y distribución perimetral, gestionando la cadena de suministro y puntos de servicio B2C/B2B en el territorio nacional.",
      icon: <Truck className="w-6 h-6 text-orange-500" />,
      tags: ["Logística", "Dirección Operativa", "Supply Chain"]
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--color-bg-primary)] border border-gray-200 rounded-xl shadow-sm text-left flex flex-col min-h-[450px] overflow-hidden">
      
      {/* Cabecera Ejecutiva */}
      <div className="p-8 md:p-10 border-b border-gray-100 bg-[var(--color-bg-secondary)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-main)] font-sans tracking-tight mb-2">
            Mitsunori Kawashiro Batista
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] font-sans">
            Software Engineer & Operations Director
          </p>
        </div>
        
        {/* El interruptor de paradigma: Call to Action (CTA) al Modo PRO */}
        <button 
          onClick={handleTransition}
          className="group relative px-6 py-3 bg-gray-900 text-white font-medium rounded-lg transition-all hover:bg-gray-800 hover:shadow-lg flex items-center gap-3 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>Inicializar Terminal PRO</span>
          </span>
          <div className="absolute inset-0 h-full w-0 bg-[var(--color-text-accent)] transition-all duration-300 ease-out group-hover:w-full z-0 opacity-20"></div>
        </button>
      </div>

      {/* Grid de Proyectos / Estudios de Caso */}
      <div className="p-8 md:p-10 bg-[var(--color-bg-primary)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 font-sans">
          Estudios de Caso & Operaciones
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <div key={idx} className="flex flex-col p-6 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 rounded-full bg-gray-50 w-fit">
                {project.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 font-sans">{project.title}</h4>
              <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed font-sans">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map((tag, tagIdx) => (
                  <span key={tagIdx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

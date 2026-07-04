import React, { useEffect } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { TerminalApp } from '../pro/TerminalApp';

// Un componente dummy temporal para el Modo Casual hasta que lo desarrollemos a fondo
const CasualApp: React.FC = () => {
  const toggleMode = useAppStore((state) => state.toggleMode);
  
  const handleTransition = () => {
    document.documentElement.classList.add('pro-theme');
    toggleMode();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-12 bg-white border border-gray-200 rounded-xl shadow-sm text-center flex flex-col items-center justify-center min-h-[450px]">
      <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans tracking-tight">
        Visión Ejecutiva y Resultados
      </h2>
      <p className="text-gray-500 mb-8 max-w-lg">
        Arquitectura de software orientada a métricas de negocio. Diseño minimalista y alta conversión para reclutamiento corporativo.
      </p>
      <button 
        onClick={handleTransition}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Inicializar Entorno Técnico (PRO)
      </button>
    </div>
  );
};

export const PortfolioEcosystem: React.FC = () => {
  const isProMode = useAppStore((state) => state.isProMode);
  const _hasHydrated = useAppStore((state) => state._hasHydrated);

  // Evitar Mismatches de Hidratación: No renderizamos la geometría compleja 
  // hasta que Zustand haya leído el localStorage en el montaje del cliente.
  if (!_hasHydrated) {
    return <div className="min-h-[450px] w-full max-w-4xl mx-auto" />; 
  }

  // Parámetros físicos del resorte (Oscilador Armónico Amortiguado)
  const springPhysics = {
    type: "spring",
    stiffness: 70,
    damping: 15,
    mass: 1.2
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* Contenedor de perspectiva tridimensional para el 3D Fold */}
      <div style={{ perspective: '1200px' }} className="w-full">
        <AnimatePresence mode="wait">
          {!isProMode ? (
            <m.div
              key="casual"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={springPhysics}
              style={{ transformOrigin: "top center" }}
            >
              <CasualApp />
            </m.div>
          ) : (
            <m.div
              key="pro"
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={springPhysics}
              style={{ transformOrigin: "bottom center" }}
            >
              <TerminalApp />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
};

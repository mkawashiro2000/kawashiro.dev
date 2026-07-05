import React from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { TerminalApp } from '../pro/TerminalApp';
import { BusinessUI } from '../casual/BusinessUI';

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
              <BusinessUI />
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

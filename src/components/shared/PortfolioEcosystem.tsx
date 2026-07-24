import React from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useHydratedProMode } from '../../store/useAppStore';
import { TerminalApp } from '../pro/TerminalApp';
import { BusinessUI } from '../casual/BusinessUI';

export const PortfolioEcosystem: React.FC = () => {
  // useHydratedProMode devuelve false durante el render inicial, de modo que
  // el HTML generado en build contiene la Business UI completa (indexable por
  // buscadores) y el cliente hidrata sobre ella sin mismatch. Antes se devolvía
  // un <div> vacío y la página principal no tenía contenido para rastreadores.
  const isProMode = useHydratedProMode();

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
              className="w-full"
            >
              <TerminalApp />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
};

// src/components/PageTransition.tsx

import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function PageTransition({ children }: Props) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        style={{
          width: "100%",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Fades a destination page up over the card that expanded to fill the frame.
 *
 * Kept as a thin client wrapper so the pages themselves stay server components:
 * a client boundary here costs one small component, not the whole route's copy.
 *
 * The duration is coupled to the disarm delay in ScrollProvider — the armed card
 * must not snap back to its orbit until this fade has covered it.
 */
export function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

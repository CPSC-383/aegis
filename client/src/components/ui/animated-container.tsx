import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedContainer({
  children,
  className = "",
  delay = 0,
}: AnimatedContainerProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

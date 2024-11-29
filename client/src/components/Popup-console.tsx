import { motion, AnimatePresence } from 'framer-motion'

interface Props {
    output: string[]
    isPopupOpen: boolean
    setIsPopupOpen: (isOpen: boolean) => void
}

function PopoutConsole({ output, isPopupOpen, setIsPopupOpen }: Props) {
    return (
        <AnimatePresence>
            {isPopupOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center"
                    onClick={() => setIsPopupOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-[95vw] h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col"
                    >
                        <div className="flex justify-between items-center p-4 border-b border-accent-light">
                            <h2 className="text-xl font-bold">Console</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm">Press ESC to close</span>
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    className="hover:bg-red-100 hover:text-red-600 transition-colors bg-red-50 text-red-500 px-2 py-1 rounded"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-auto p-4 font-mono text-sm scrollbar">
                            {output.map((line, index) => (
                                <div key={index} className="whitespace-pre-wrap break-words">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PopoutConsole

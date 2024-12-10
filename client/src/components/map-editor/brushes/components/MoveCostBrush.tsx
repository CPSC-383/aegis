import { motion } from 'framer-motion'

interface Props {
    moveCost: number
    setMoveCost: (cost: number) => void
}

function MoveCostBrush({ moveCost, setMoveCost }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 p-3 bg-white border border-gray-300 rounded-md"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Move Cost</span>
                <div className="flex space-x-2">
                    {[2, 3, 4, 5].map((cost) => (
                        <motion.button
                            key={cost}
                            onClick={() => setMoveCost(cost)}
                            whileTap={{ scale: 0.9 }}
                            className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${moveCost === cost ? 'bg-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
                        >
                            {cost}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Custom:</span>
                <motion.input
                    type="text"
                    value={moveCost === 0 ? '' : moveCost}
                    onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || (/^\d+$/.test(value) && Number(value) > 1)) {
                            setMoveCost(value === '' ? 0 : Number(value))
                        }
                    }}
                    whileFocus={{ scale: 1.02 }}
                    className="px-3 py-1 border border-gray-300 rounded-md w-20 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                />
            </div>
        </motion.div>
    )
}

export default MoveCostBrush

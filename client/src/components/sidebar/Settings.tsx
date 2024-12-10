import { Folder } from 'lucide-react'
import Button from '../Button'
import { motion } from 'framer-motion'

type Props = {
    isOpen: boolean
    setupAegisPath: () => void
    aegisPath: string
}

function Settings({ isOpen, setupAegisPath, aegisPath }: Props) {
    if (!isOpen) return null

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                        <Folder className="w-6 h-6 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-800">Aegis Path</h2>
                    </div>
                    <p className="text-sm border-gray-400 border p-2 rounded break-words">
                        {aegisPath || 'No path configured'}
                    </p>
                    <Button
                        onClick={setupAegisPath}
                        label="Reconfigure Aegis Path"
                        styles="bg-primary text-sm px-4 py-2 rounded"
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default Settings

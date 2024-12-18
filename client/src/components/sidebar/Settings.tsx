import { motion } from 'framer-motion'

import { Scaffold } from '@/scaffold'
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'

type Props = {
    scaffold: Scaffold
}

function Settings({ scaffold }: Props) {
    const { aegisPath, setupAegisPath } = scaffold

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Folder className="w-6 h-6" />
                        <h2 className="text-lg font-semibold">Aegis Path</h2>
                    </div>

                    <p className="text-sm border-gray-400 border p-2 rounded break-words">
                        {aegisPath || 'No path configured'}
                    </p>

                    <Button onClick={setupAegisPath} className="w-full">
                        Reconfigure Aegis Path
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

export default Settings

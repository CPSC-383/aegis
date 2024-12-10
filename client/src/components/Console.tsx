import { useEffect } from 'react'
import { Maximize2 } from 'lucide-react'
import { ConsoleLine } from '@/utils/types'

interface ConsoleProps {
    output: ConsoleLine[]
    isPopupOpen: boolean
    setIsPopupOpen: (isOpen: boolean) => void
}

function Console({ output, isPopupOpen, setIsPopupOpen }: ConsoleProps) {
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isPopupOpen) {
                setIsPopupOpen(false)
                // Remove focus from the expand button if we use the ESC key
                const button = document.activeElement as HTMLElement
                button.blur()
            }
        }

        document.addEventListener('keydown', handleEscapeKey)
        return () => {
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isPopupOpen])

    return (
        <div className="w-full h-full mt-4 flex flex-col overflow-auto">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-accent">Console</h2>
                <button onClick={() => setIsPopupOpen(true)} className="outline-none">
                    <Maximize2 />
                </button>
            </div>
            <div className="h-full p-2 border-2 border-accent-light rounded-md text-xs overflow-auto whitespace-nowrap scrollbar">
                {output.map((line, id) => (
                    <div key={id} className={line.has_error ? 'text-secondary' : ''}>
                        {line.message}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Console

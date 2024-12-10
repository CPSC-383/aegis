import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Tag } from 'lucide-react'

interface DropdownItem {
    value: string
    icon: React.ComponentType<{ className?: string }>
}

interface Props {
    items: string[] | DropdownItem[]
    selectedItem: string
    onSelect: (item: string) => void
    placeholder?: string
    icon?: React.ComponentType<{ className?: string }>
    label?: string
}

function Dropdown({
    items,
    selectedItem,
    onSelect,
    placeholder = 'Select an option',
    icon: ProvidedIcon = Tag,
    label
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [])

    const normalizedItems: DropdownItem[] = items.map((item) =>
        typeof item === 'string' ? { value: item, icon: ProvidedIcon } : item
    )

    const SelectedIcon = normalizedItems.find((item) => item.value === selectedItem)?.icon || ProvidedIcon

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                whileTap={{ scale: 0.95 }}
            >
                <div className="flex items-center space-x-2">
                    <SelectedIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">{selectedItem || placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto scrollbar"
                    >
                        {normalizedItems.map((item) => {
                            const Icon = item.icon || ProvidedIcon
                            return (
                                <motion.div
                                    key={item.value}
                                    onClick={() => {
                                        onSelect(item.value)
                                        setIsOpen(false)
                                    }}
                                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                                >
                                    <Icon className="w-5 h-5 mr-2 text-gray-600" />
                                    <span className="text-sm">{item.value}</span>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Dropdown

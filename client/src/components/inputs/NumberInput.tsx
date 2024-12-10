import React, { useState } from 'react'

interface NumberInputProps {
    value: number
    onChange: (value: number) => void
    max?: number
    min?: number
    placeholder?: string
    extraStyles?: string
    disabled?: boolean
    label?: string
}

export default function NumberInput({
    value,
    onChange,
    placeholder,
    max,
    min,
    extraStyles,
    disabled,
    label
}: NumberInputProps) {
    const [internalNum, setInternalNum] = useState<string>(value === 0 ? '' : value.toString())

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value)
        if (!isNaN(newValue)) {
            if ((max === undefined || newValue <= max) && (min === undefined || newValue >= min)) {
                onChange(newValue)
            }
        }
    }

    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                type="number"
                className={`p-2 focus:ring-accent-light focus:ring-2 focus:outline-none border border-gray-300 rounded-md ${extraStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={internalNum}
                onInput={handleChange}
                onChange={(e) => setInternalNum(e.target.value)}
                onBlur={() => setInternalNum(value === 0 ? '' : value.toString())}
                placeholder={value === 0 ? placeholder : undefined}
                disabled={disabled}
            />
        </div>
    )
}

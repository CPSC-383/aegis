import React, { useState } from 'react'

interface NumberInputProps {
    value: number
    onChange: (value: number) => void
    max?: number
    min?: number
    placeholder?: string
    extraStyles?: string
    disabled?: boolean
}

export default function NumberInput({
    value,
    onChange,
    placeholder,
    max,
    min,
    extraStyles,
    disabled
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
        <input
            type="number"
            className={`p-2 my-1 focus:border-accent-light focus:outline-none border-2 border-gray-300 rounded-md ${extraStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={internalNum}
            onInput={handleChange}
            onChange={(e) => setInternalNum(e.target.value)}
            onBlur={() => setInternalNum(value === 0 ? '' : value.toString())}
            placeholder={value === 0 ? placeholder : undefined}
            disabled={disabled}
        />
    )
}

interface InputFieldProps {
    value: string | number
    onChange: (value: string) => void
    placeholder?: string
}

export default function Input({ value, onChange, placeholder }: InputFieldProps) {
    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                type="text"
                className="p-2 focus:ring-accent-light focus:ring-2 focus:outline-none border border-gray-300 rounded-md w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    )
}

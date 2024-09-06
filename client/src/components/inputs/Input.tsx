interface InputFieldProps {
    value: string | number
    onChange: (value: string) => void
    placeholder?: string
}

export default function Input({ value, onChange, placeholder }: InputFieldProps) {
    return (
        <input
            type="text"
            className="w-full p-2 border-2 border-gray-300 rounded-md my-1 focus:border-accent-light focus:outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    )
}

interface ButtonProps {
    onClick: () => void
    label: string
    styles: string
    disabled?: boolean
}

export default function Button({ onClick, label, styles, disabled }: ButtonProps) {
    return (
        <button
            className={`w-full p-2 ${styles} font-semibold rounded-md ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    )
}

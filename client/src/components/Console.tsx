interface ConsoleProps {
    output: string[]
}

function Console({ output }: ConsoleProps) {
    return (
        <div className="w-full h-64 mt-4 flex flex-col">
            <h2 className="font-bold text-accent">Console</h2>
            <div className="h-full p-2 border-2 border-accent-light rounded-md text-xs overflow-auto whitespace-nowrap scrollbar">
                {output.map((line, id) => (
                    <div key={id}>{line}</div>
                ))}
            </div>
        </div>
    )
}

export default Console

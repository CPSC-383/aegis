import NumberInput from '@/components/inputs/NumberInput'

interface Props {
    moveCost: number
    setMoveCost: (cost: number) => void
}

function MoveCostBrush({ moveCost, setMoveCost }: Props) {
    return (
        <>
            <select
                value={moveCost}
                onChange={(e) => setMoveCost(parseInt(e.target.value))}
                className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
            >
                {[2, 3, 4, 5].map((cost) => (
                    <option key={cost} value={cost}>
                        {cost}
                    </option>
                ))}
            </select>
            <div className="flex mt-4 items-center justify-center">
                <p className="mr-2">Custom Move Cost:</p>
                <NumberInput value={moveCost} onChange={(newCost) => setMoveCost(newCost)} min={2} extraStyles="w-16" />
            </div>
        </>
    )
}

export default MoveCostBrush

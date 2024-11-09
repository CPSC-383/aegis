import { RubbleInfo, StackContentBrushTypes, SurvivorInfo } from '@/utils/types'
import RubbleSettings from './RubbleSettings'
import SurvivorSettings from './SurvivorSettings'

interface Props {
    stackType: StackContentBrushTypes
    setStackType: (type: StackContentBrushTypes) => void
    rubbleInfo: RubbleInfo
    setRubbleInfo: (info: RubbleInfo) => void
    survivorInfo: SurvivorInfo
    setSurvivorInfo: (info: SurvivorInfo) => void
}

function StackContentBrush({
    stackType,
    setStackType,
    rubbleInfo,
    setRubbleInfo,
    survivorInfo,
    setSurvivorInfo
}: Props) {
    return (
        <>
            <select
                value={stackType}
                onChange={(e) => setStackType(e.target.value as StackContentBrushTypes)}
                className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
            >
                <option value={StackContentBrushTypes.Survivor}>Survivor Brush</option>
                <option value={StackContentBrushTypes.Rubble}>Rubble Brush</option>
            </select>
            {stackType === StackContentBrushTypes.Rubble ? (
                <RubbleSettings rubbleInfo={rubbleInfo} setRubbleInfo={setRubbleInfo} />
            ) : (
                <SurvivorSettings survivorInfo={survivorInfo} setSurvivorInfo={setSurvivorInfo} />
            )}
        </>
    )
}

export default StackContentBrush

import { RubbleInfo, StackContentBrushTypes, SurvivorInfo } from '@/utils/types'
import RubbleSettings from './RubbleSettings'
import SurvivorSettings from './SurvivorSettings'
import { Mountain, PlusSquare } from 'lucide-react'
import Dropdown from '@/components/Dropdown'

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
    const stackItems = Object.values(StackContentBrushTypes).map((type) => ({
        value: type,
        icon: {
            [StackContentBrushTypes.Survivor]: PlusSquare,
            [StackContentBrushTypes.Rubble]: Mountain
        }[type]
    }))
    return (
        <>
            <Dropdown
                items={stackItems}
                selectedItem={stackType}
                onSelect={(item) => setStackType(item as StackContentBrushTypes)}
            />
            {stackType === StackContentBrushTypes.Rubble && (
                <RubbleSettings rubbleInfo={rubbleInfo} setRubbleInfo={setRubbleInfo} />
            )}
        </>
    )
}

export default StackContentBrush

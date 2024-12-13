import { RubbleInfo, StackContentBrushTypes } from '@/utils/types'
import RubbleSettings from './RubbleSettings'
import { Mountain, User } from 'lucide-react'
import Dropdown from '@/components/Dropdown'

interface Props {
    stackType: StackContentBrushTypes
    setStackType: (type: StackContentBrushTypes) => void
    rubbleInfo: RubbleInfo
    setRubbleInfo: (info: RubbleInfo) => void
}

function StackContentBrush({ stackType, setStackType, rubbleInfo, setRubbleInfo }: Props) {
    const stackItems = Object.values(StackContentBrushTypes).map((type) => ({
        value: type,
        icon: {
            [StackContentBrushTypes.Survivor]: User,
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

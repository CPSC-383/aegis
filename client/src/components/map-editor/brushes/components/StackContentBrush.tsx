import { RubbleInfo, StackContentBrushTypes } from '@/utils/types'
import RubbleSettings from './RubbleSettings'
import { Mountain, User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
    stackType: StackContentBrushTypes
    setStackType: (type: StackContentBrushTypes) => void
    rubbleInfo: RubbleInfo
    setRubbleInfo: (info: RubbleInfo) => void
}

function StackContentBrush({ stackType, setStackType, rubbleInfo, setRubbleInfo }: Props) {
    return (
        <>
            <Select value={stackType} onValueChange={(value) => setStackType(value as StackContentBrushTypes)}>
                <SelectTrigger>
                    <SelectValue placeholder="Choose stack item" />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(StackContentBrushTypes).map((type) => (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center space-x-2">
                                {type === StackContentBrushTypes.Survivor && <User className="w-4 h-4" />}
                                {type === StackContentBrushTypes.Rubble && <Mountain className="w-4 h-4" />}
                                <span>{type}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {stackType === StackContentBrushTypes.Rubble && (
                <RubbleSettings rubbleInfo={rubbleInfo} setRubbleInfo={setRubbleInfo} />
            )}
        </>
    )
}

export default StackContentBrush

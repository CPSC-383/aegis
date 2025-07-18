import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RubbleInfo } from '@/core/world'
import { StackContentBrushTypes } from '@/types'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'
import { Mountain, User } from 'lucide-react'
import RubbleSettings from './RubbleSettings'

interface Props {
  stackType: StackContentBrushTypes
  setStackType: (type: StackContentBrushTypes) => void
  rubbleInfo: RubbleInfo
  setRubbleInfo: (info: RubbleInfo) => void
}

function StackContentBrush({
  stackType,
  setStackType,
  rubbleInfo,
  setRubbleInfo
}: Props): JSX.Element {
  return (
    <>
      <Select
        value={stackType}
        onValueChange={(value: string): void =>
          setStackType(value as StackContentBrushTypes)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose stack item" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(StackContentBrushTypes)
            .filter((type) =>
              getCurrentAssignment() === ASSIGNMENT_A1
                ? type === StackContentBrushTypes.Survivor
                : true
            )
            .map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center space-x-2">
                  {type === StackContentBrushTypes.Survivor && (
                    <User className="w-4 h-4" />
                  )}
                  {type === StackContentBrushTypes.Rubble && (
                    <Mountain className="w-4 h-4" />
                  )}
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

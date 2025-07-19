import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RubbleInfo } from '@/core/world'
import { CellContentBrushTypes } from '@/types'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'
import { Mountain, User } from 'lucide-react'
import RubbleSettings from './RubbleSettings'

interface Props {
  stackType: CellContentBrushTypes
  setStackType: (type: CellContentBrushTypes) => void
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
          setStackType(value as CellContentBrushTypes)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose stack item" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(CellContentBrushTypes)
            .filter((type) =>
              getCurrentAssignment() === ASSIGNMENT_A1
                ? type === CellContentBrushTypes.Survivor
                : true
            )
            .map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center space-x-2">
                  {type === CellContentBrushTypes.Survivor && (
                    <User className="w-4 h-4" />
                  )}
                  {type === CellContentBrushTypes.Rubble && (
                    <Mountain className="w-4 h-4" />
                  )}
                  <span>{type}</span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {stackType === CellContentBrushTypes.Rubble && (
        <RubbleSettings rubbleInfo={rubbleInfo} setRubbleInfo={setRubbleInfo} />
      )}
    </>
  )
}

export default StackContentBrush

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SpawnZoneTypes, SpecialCellBrushTypes } from '@/utils/types'
import { ASSIGNMENT_A1, formatDisplayText, getCurrentAssignment } from '@/utils/util'
import { Flame, PlusCircle, Zap, Users, User, Tag, Skull } from 'lucide-react'

interface Props {
    specialCellType: SpecialCellBrushTypes
    setSpecialCellType: (type: SpecialCellBrushTypes) => void
    spawnZoneType: SpawnZoneTypes
    setSpawnZoneType: (type: SpawnZoneTypes) => void
    gid: number
    setGid: (gid: number) => void
}

function SpecialCellsBrush({
    specialCellType,
    setSpecialCellType,
    spawnZoneType,
    setSpawnZoneType,
    gid,
    setGid
}: Props) {
    const handleGidBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (!isNaN(value)) {
            const newValue = Math.max(0, value)
            setGid(newValue)
        }
    }

    return (
        <>
            <Select
                value={specialCellType}
                onValueChange={(value) => setSpecialCellType(value as SpecialCellBrushTypes)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select Special Cell Type" />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(SpecialCellBrushTypes).map((type) => (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center space-x-2">
                                {type === SpecialCellBrushTypes.Killer && <Skull className="w-4 h-4" />}
                                {type === SpecialCellBrushTypes.Fire && <Flame className="w-4 h-4" />}
                                {type === SpecialCellBrushTypes.Charging && <Zap className="w-4 h-4" />}
                                {type === SpecialCellBrushTypes.Spawn && <PlusCircle className="w-4 h-4" />}
                                <span>{formatDisplayText(type)}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {specialCellType === SpecialCellBrushTypes.Spawn && (
                <>
                    <Select value={spawnZoneType} onValueChange={(value) => setSpawnZoneType(value as SpawnZoneTypes)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Spawn Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(SpawnZoneTypes)
                                .filter((type) =>
                                    getCurrentAssignment() === ASSIGNMENT_A1 ? type === SpawnZoneTypes.Any : true
                                )
                                .map((type) => (
                                    <SelectItem key={type} value={type}>
                                        <div className="flex items-center space-x-2">
                                            {type === SpawnZoneTypes.Any && <Users className="w-4 h-4" />}
                                            {type === SpawnZoneTypes.Group && <User className="w-4 h-4" />}
                                            <span>{type === SpawnZoneTypes.Group ? 'Single' : 'Any'}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {spawnZoneType === SpawnZoneTypes.Group && (
                        <>
                            <Label htmlFor="gid" className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                Group Id:
                            </Label>
                            <Input
                                id="gid"
                                type="number"
                                value={gid === 0 ? '' : gid}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : Number(e.target.value)
                                    setGid(value)
                                }}
                                onBlur={handleGidBlur}
                                placeholder="Enter gid of the group to spawn 1 agent for"
                                className="w-full"
                            />
                        </>
                    )}
                </>
            )}
        </>
    )
}

export default SpecialCellsBrush

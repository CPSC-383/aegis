import { SpawnZoneTypes, SpecialCellBrushTypes } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'
import { Flame, PlusCircle, Target, Zap } from 'lucide-react'
import Dropdown from '@/components/Dropdown'

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
    const specialCellItems = Object.values(SpecialCellBrushTypes).map((type) => ({
        value: type,
        icon: {
            [SpecialCellBrushTypes.Killer]: Target,
            [SpecialCellBrushTypes.Fire]: Flame,
            [SpecialCellBrushTypes.Charging]: Zap,
            [SpecialCellBrushTypes.Spawn]: PlusCircle
        }[type]
    }))

    return (
        <>
            <Dropdown
                items={specialCellItems}
                selectedItem={specialCellType}
                onSelect={(item) => setSpecialCellType(item as SpecialCellBrushTypes)}
            />
            {specialCellType === SpecialCellBrushTypes.Spawn && (
                <>
                    <div className="flex mt-4 items-center justify-center">
                        <p className="mr-2">Type:</p>
                        <select
                            value={spawnZoneType}
                            onChange={(e) => setSpawnZoneType(e.target.value as SpawnZoneTypes)}
                            className="bg-white p-2 border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
                        >
                            <option value={SpawnZoneTypes.Any}>Any Group</option>
                            <option value={SpawnZoneTypes.Group}>Specific Group</option>
                        </select>
                    </div>
                    {spawnZoneType === SpawnZoneTypes.Group && (
                        <div className="flex mt-4 items-center justify-center">
                            <p className="mr-2">GID:</p>
                            <NumberInput value={gid} onChange={(newGid) => setGid(newGid)} min={0} extraStyles="w-16" />
                        </div>
                    )}
                </>
            )}
        </>
    )
}

export default SpecialCellsBrush

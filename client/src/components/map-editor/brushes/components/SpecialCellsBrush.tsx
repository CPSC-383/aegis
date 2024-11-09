import { SpawnZoneTypes, SpecialCellBrushTypes } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'

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
    return (
        <>
            <select
                value={specialCellType}
                onChange={(e) => setSpecialCellType(e.target.value as SpecialCellBrushTypes)}
                className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
            >
                <option value={SpecialCellBrushTypes.Killer}>Killer Brush</option>
                <option value={SpecialCellBrushTypes.Fire}>Fire Brush</option>
                <option value={SpecialCellBrushTypes.Charging}>Charging Brush</option>
                <option value={SpecialCellBrushTypes.Spawn}>Spawn Brush</option>
            </select>
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

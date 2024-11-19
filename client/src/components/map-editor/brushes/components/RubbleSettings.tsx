import { RubbleInfo } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'

interface Props {
    rubbleInfo: RubbleInfo
    setRubbleInfo: (info: RubbleInfo) => void
}

function RubbleSettings({ rubbleInfo, setRubbleInfo }: Props) {
    return (
        <>
            <div className="flex mt-4 items-center justify-center">
                <p className="mr-2">Energy to Remove:</p>
                <NumberInput
                    value={rubbleInfo.remove_energy}
                    onChange={(newEnergy) => setRubbleInfo({ ...rubbleInfo, remove_energy: newEnergy })}
                    min={0}
                    extraStyles="w-16"
                />
            </div>
            <div className="flex mt-4 items-center justify-center">
                <p className="mr-2">Required Agents:</p>
                <NumberInput
                    value={rubbleInfo.remove_agents}
                    onChange={(newAgents) => setRubbleInfo({ ...rubbleInfo, remove_agents: newAgents })}
                    min={0}
                    extraStyles="w-16"
                />
            </div>
        </>
    )
}

export default RubbleSettings

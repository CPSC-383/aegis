import { RubbleInfo } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'
import { Users, Zap } from 'lucide-react'

interface Props {
    rubbleInfo: RubbleInfo
    setRubbleInfo: (info: RubbleInfo) => void
}

function RubbleSettings({ rubbleInfo, setRubbleInfo }: Props) {
    return (
        <>
            <NumberInput
                value={rubbleInfo.remove_energy}
                onChange={(newEnergy) => setRubbleInfo({ ...rubbleInfo, remove_energy: newEnergy })}
                min={0}
                extraStyles="w-full"
                label={'Energy to Remove:'}
                icon={Zap}
            />
            <NumberInput
                value={rubbleInfo.remove_agents}
                onChange={(newAgents) => setRubbleInfo({ ...rubbleInfo, remove_agents: newAgents })}
                min={0}
                extraStyles="w-full"
                label={'Required Agents:'}
                icon={Users}
            />
        </>
    )
}

export default RubbleSettings

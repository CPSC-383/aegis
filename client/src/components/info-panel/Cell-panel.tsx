import { Simulation, AgentInfoDict, CellDict } from '@/core/simulation'
import { drawAgent } from '@/utils/renderUtils'
import { useCallback, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'

type Props = {
    selectedCell: { x: number; y: number }
    setSelectedAgent: (value: AgentInfoDict) => void
    cellInfo: CellDict | undefined
    agents: AgentInfoDict[]
    simulation: Simulation
}

function CellPanel({ selectedCell, setSelectedAgent, cellInfo, agents, simulation }: Props) {
    const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({})
    const containerRef = useRef<HTMLDivElement | null>(null)

    const groupedAgents = agents.reduce(
        (acc, agent) => {
            const { gid } = agent.agentId!
            acc[gid] = [...(acc[gid] || []), agent]
            return acc
        },
        {} as { [key: number]: AgentInfoDict[] }
    )

    const renderAgentCanvas = useCallback((canvas: HTMLCanvasElement | null, gid: number, agents: AgentInfoDict[]) => {
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const agentSize = 32
        const agentsPerRow = Math.floor(canvas.width / agentSize)

        agents.forEach((_, i) => {
            const col = i % agentsPerRow
            const row = Math.floor(i / agentsPerRow)

            const drawX = col * agentSize
            const drawY = row * agentSize

            drawAgent(ctx, gid, drawX, drawY, agentSize)
        })
    }, [])

    const updateCanvasSize = useCallback(() => {
        Object.keys(groupedAgents).forEach((gidStr) => {
            const gid = parseInt(gidStr)
            const canvas = canvasRefs.current[gid]
            const agentList = groupedAgents[gid]

            if (canvas && containerRef.current) {
                const agentSize = 32
                const containerWidth = containerRef.current.offsetWidth - 35
                const agentsPerRow = Math.floor(containerWidth / agentSize)
                const rows = Math.ceil(agentList.length / agentsPerRow)

                canvas.width = containerWidth
                canvas.height = rows * agentSize

                renderAgentCanvas(canvas, gid, agentList)
            }
        })
    }, [agents, renderAgentCanvas])

    useEffect(() => {
        updateCanvasSize()
        window.addEventListener('resize', updateCanvasSize)
        return () => window.removeEventListener('resize', updateCanvasSize)
    }, [agents, selectedCell, simulation, updateCanvasSize, renderAgentCanvas])

    const handleAgentCanvasClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const container = containerRef.current
        if (!container || !simulation) return

        const agentSize = 32
        Object.values(canvasRefs.current).forEach((canvas, i) => {
            if (canvas === e.currentTarget) {
                const rect = canvas.getBoundingClientRect()

                const x = Math.floor((e.clientX - rect.left) / agentSize)
                const y = Math.floor((e.clientY - rect.top) / agentSize)

                const agents = groupedAgents[i + 1]
                const id = x + y * Math.floor(canvas.width / agentSize)

                if (id >= agents.length) return

                const selectedAgent = agents[id]
                setSelectedAgent(selectedAgent)
                return
            }
        })
    }

    return (
        <div>
            <h2 className="font-bold text-center mb-4">
                Location: ({selectedCell.x}, {selectedCell.y})
            </h2>

            <section className="m-2">
                <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Cell Info</h3>
                {cellInfo ? (
                    <div className="space-y-2">
                        <div>
                            Cell Type: <Badge variant="secondary">{cellInfo.cell_type.replace(/\w*\./, '')}</Badge>
                        </div>
                        <div>
                            Move Cost: <Badge variant="secondary">{cellInfo.move_cost}</Badge>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No cell information available.</p>
                )}
            </section>

            <section className="m-2">
                <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Agents</h3>
                {agents.length === 0 ? (
                    <p className="text-muted-foreground">No agents in this cell.</p>
                ) : (
                    <div ref={containerRef} className="space-y-2">
                        {Object.keys(groupedAgents).map((gid) => (
                            <div key={gid} className="flex items-center space-x-2">
                                <Badge variant="secondary">{gid}:</Badge>
                                <canvas
                                    ref={(el) => (canvasRefs.current[parseInt(gid)] = el)}
                                    onClick={handleAgentCanvasClick}
                                    className="cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default CellPanel

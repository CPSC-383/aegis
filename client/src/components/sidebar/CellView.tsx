import goobA from "@/assets/goob-team-a.png"
import goobB from "@/assets/goob-team-b.png"
import Round from "@/core/Round"
import { useAppStore } from "@/store/useAppStore"
import { Scaffold } from "@/types"
import { schema } from "aegis-schema"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Layers3, MapPin, User, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { getLayerColor, getLayerIcon } from "../dnd/dnd-utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

interface Props {
  cell: schema.Cell | undefined
  round: Round | undefined
  scaffold: Scaffold
}

function getCellTypeLabel(cellType: schema.CellType): string {
  switch (cellType) {
    case schema.CellType.NORMAL:
      return "Normal"
    case schema.CellType.SPAWN:
      return "Spawn"
    case schema.CellType.KILLER:
      return "Killer"
    case schema.CellType.CHARGING:
      return "Charging"
    default:
      return "Unknown"
  }
}

function getCellTypeColor(cellType: schema.CellType): string {
  switch (cellType) {
    case schema.CellType.NORMAL:
      return "bg-gray-100 text-gray-800 border-gray-200"
    case schema.CellType.SPAWN:
      return "bg-blue-100 text-blue-800 border-blue-200"
    case schema.CellType.KILLER:
      return "bg-red-100 text-red-800 border-red-200"
    case schema.CellType.CHARGING:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getAgentsByTeam(
  agentIds: number[],
  round: Round
): { [key: string]: number[] } {
  const teamAgents: { [key: string]: number[] } = {
    [schema.Team.GOOBS]: [],
    [schema.Team.VOIDSEERS]: [],
  }

  for (const agentId of agentIds) {
    const agent = round.agents.agents.get(agentId)
    if (agent && !agent.dead) {
      if (agent.team === schema.Team.GOOBS) {
        teamAgents[schema.Team.GOOBS].push(agentId)
      } else if (agent.team === schema.Team.VOIDSEERS) {
        teamAgents[schema.Team.VOIDSEERS].push(agentId)
      }
    }
  }

  return teamAgents
}

export default function CellView({ cell, round, scaffold }: Props): JSX.Element {
  const { collapsedPanels, togglePanel } = useAppStore()
  const isCollapsed = collapsedPanels["cellView"] ?? false
  const [cellData, setCellData] = useState<{
    moveCost: number
    cellType: schema.CellType
    layers: schema.WorldObject[]
    agents: number[]
    teamAgents: { [key: string]: number[] }
    isVersusMode: boolean
    position: { x: number; y: number } | undefined
  } | null>(null)

  useEffect(() => {
    if (!cell || !round) {
      setCellData(null)
      return
    }

    const moveCost = cell.moveCost
    const cellType = cell.type
    const layers = cell.layers
    const agents = cell.agents
    const teamAgents = getAgentsByTeam(agents, round)
    const isVersusMode = scaffold.config?.configType === "competition"
    const position = cell.loc ? { x: cell.loc.x, y: cell.loc.y } : undefined

    setCellData({
      moveCost,
      cellType,
      layers,
      agents,
      teamAgents,
      isVersusMode,
      position,
    })
  }, [cell, round, scaffold])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Cell View</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel("cellView")}
          className="h-6 w-6 p-0"
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          {!cell || !round || !cellData ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Click on a cell to view its information
            </div>
          ) : (
            <>
              {cellData.position && (
                <div className="text-xs text-muted-foreground">
                  Position: ({cellData.position.x}, {cellData.position.y})
                </div>
              )}

              <div className="flex items-center justify-start gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">Move Cost:</span>
                  <Badge variant="outline" className="font-mono px-1.5">
                    {cellData.moveCost}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Type:</span>
                  <Badge
                    variant="outline"
                    className={getCellTypeColor(cellData.cellType)}
                  >
                    {getCellTypeLabel(cellData.cellType)}
                  </Badge>
                </div>
              </div>

              <Card>
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Agents:</span>
                    </div>

                    {cellData.agents.length > 0 ? (
                      <div className="space-y-2">
                        {cellData.teamAgents[schema.Team.GOOBS].length > 0 && (
                          <div className="space-y-2">
                            {cellData.teamAgents[schema.Team.GOOBS].map((agentId) => (
                              <motion.div
                                key={agentId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                              >
                                <img src={goobA} alt="Goob" className="w-4 h-4" />
                                <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
                                  <User className="w-3 h-3 mr-1" />
                                  Goob
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ID: {agentId}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {cellData.isVersusMode &&
                          cellData.teamAgents[schema.Team.VOIDSEERS].length > 0 && (
                            <div className="space-y-2">
                              {cellData.teamAgents[schema.Team.VOIDSEERS].map(
                                (agentId) => (
                                  <motion.div
                                    key={agentId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                                  >
                                    <img
                                      src={goobB}
                                      alt="Voidseer"
                                      className="w-4 h-4"
                                    />
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-medium">
                                      <User className="w-3 h-3 mr-1" />
                                      Voidseer
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      ID: {agentId}
                                    </span>
                                  </motion.div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded">
                        No agents on this tile
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Layers3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Layers:</span>
                      </div>

                      {cellData.layers.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded">
                          No layers on this tile
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cellData.layers.map((layer, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                            >
                              <Badge
                                className={`${getLayerColor(layer.object.oneofKind!)} font-medium`}
                              >
                                {getLayerIcon(layer.object.oneofKind!)}
                                <span className="ml-1 capitalize">
                                  {layer.object.oneofKind}
                                </span>
                              </Badge>

                              {layer.object.oneofKind === "survivor" && (
                                <span className="text-xs text-muted-foreground">
                                  HP: {layer.object.survivor.health}
                                </span>
                              )}

                              {layer.object.oneofKind === "rubble" && (
                                <span className="text-xs text-muted-foreground">
                                  Energy: {layer.object.rubble?.energyRequired ?? 0}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}

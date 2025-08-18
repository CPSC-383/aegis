import Round from "@/core/Round"
import { useAppStore } from "@/store/useAppStore"
import { Scaffold, Vector } from "@/types"
import { schema } from "aegis-schema"
import { motion } from "framer-motion"
import { AlertTriangle, ChevronDown, ChevronUp, Trophy } from "lucide-react"
import { Button } from "../ui/button"
import CellView from "./CellView"

interface Props {
  tile: Vector | undefined
  round: Round | undefined
  scaffold: Scaffold
}

export default function Game({ tile, round, scaffold }: Props): JSX.Element {
  const { collapsedPanels, togglePanel } = useAppStore()
  const isStatsCollapsed = collapsedPanels["matchStats"] ?? false

  if (!round || !scaffold) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex justify-center items-center h-60"
      >
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto mb-4 text-orange-500" size={48} />
          <p className="text-lg font-bold text-center text-black">
            Run A Simulation To See Game Stuff!
          </p>
        </div>
      </motion.div>
    )
  }

  const stats = round.game.stats[round.round]
  const goobs = stats.getTeamStats(schema.Team.GOOBS)
  const voidseers = stats.getTeamStats(schema.Team.VOIDSEERS)
  const cell = tile ? round.world.cellAt(tile.x, tile.y) : undefined

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Match Statistics Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-600" />
          <h3 className="font-semibold text-sm">Match Statistics</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel("matchStats")}
          className="h-6 w-6 p-0"
        >
          {isStatsCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Collapsible Statistics Table */}
      {!isStatsCollapsed && (
        <div className="overflow-x-auto scrollbar">
          <table className="min-w-full text-sm border border-gray-300 rounded overflow-hidden bg-white shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Metric</th>
                <th className="px-4 py-2 text-center">Goobs</th>
                <th className="px-4 py-2 text-center">Voidseers</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr className="border-t">
                <td className="px-4 py-2 text-left">Score</td>
                <td>{goobs.score}</td>
                <td>{voidseers.score}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 text-left">Units</td>
                <td>{goobs.units}</td>
                <td>{voidseers.units}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 text-left">Saved (Alive)</td>
                <td>{goobs.saved_alive}</td>
                <td>{voidseers.saved_alive}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 text-left">Saved (Dead)</td>
                <td>{goobs.saved_dead}</td>
                <td>{voidseers.saved_dead}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 text-left">Correct Predictions</td>
                <td>{goobs.predicted_right}</td>
                <td>{voidseers.predicted_right}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 text-left">Incorrect Predictions</td>
                <td>{goobs.predicted_wrong}</td>
                <td>{voidseers.predicted_wrong}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <CellView cell={cell} round={round} scaffold={scaffold} />
    </motion.div>
  )
}

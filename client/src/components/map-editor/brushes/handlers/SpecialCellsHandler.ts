// import { Location, SpawnZoneTypes, WorldMap } from '@/core/world'
import { SpecialCellBrushTypes } from '@/types'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'
import BrushHandler from './BrushHandler'

class SpecialCellsHandler extends BrushHandler {
  constructor(
    worldMap: WorldMap,
    private specialCellType: SpecialCellBrushTypes,
    private spawnZoneType: SpawnZoneTypes,
    private gid: number
  ) {
    super(worldMap)
  }

  handle(tile: Location, rightClicked: boolean): void {
    const stack = this.getStack(tile)

    if (rightClicked) {
      this.removeSpecialCell(tile)
    } else if (!this.isOccupied(tile) && (!stack || stack.contents.length === 0)) {
      this.addSpecialCell(tile)
    }
  }

  private removeSpecialCell(tile: Location): void {
    const { killerCells, chargingCells, fireCells, spawnCells } = this.worldMap
    const key = JSON.stringify(tile)

    switch (this.specialCellType) {
      case SpecialCellBrushTypes.Killer:
        this.removeFromArray(killerCells, tile)
        break
      case SpecialCellBrushTypes.Fire:
        this.removeFromArray(fireCells, tile)
        break
      case SpecialCellBrushTypes.Charging:
        this.removeFromArray(chargingCells, tile)
        break
      case SpecialCellBrushTypes.Spawn:
        spawnCells.delete(key)
        break
    }
  }

  private removeFromArray(cells: Location[], tile: Location): void {
    const index = cells.findIndex((g) => g.x === tile.x && g.y === tile.y)
    if (index !== -1) cells.splice(index, 1)
  }

  private addSpecialCell(tile: Location): void {
    const { killerCells, chargingCells, fireCells, spawnCells } = this.worldMap
    const key = JSON.stringify(tile)

    if (this.specialCellType !== SpecialCellBrushTypes.Spawn && spawnCells.get(key))
      return

    switch (this.specialCellType) {
      case SpecialCellBrushTypes.Killer:
        killerCells.push(tile)
        break
      case SpecialCellBrushTypes.Fire:
        fireCells.push(tile)
        break
      case SpecialCellBrushTypes.Charging:
        chargingCells.push(tile)
        break
      case SpecialCellBrushTypes.Spawn:
        this.handleSpawnCells(tile)
        break
    }
  }

  private handleSpawnCells(tile: Location): void {
    const { spawnCells } = this.worldMap
    if (getCurrentAssignment() === ASSIGNMENT_A1 && spawnCells.size === 1) return
    const key = JSON.stringify(tile)
    const spawn = spawnCells.get(key)
    const existingGids = spawn?.groups || []

    if (spawn) {
      if (
        (spawn.type === SpawnZoneTypes.Any &&
          this.spawnZoneType === SpawnZoneTypes.Group) ||
        (spawn.type === SpawnZoneTypes.Group &&
          this.spawnZoneType === SpawnZoneTypes.Any)
      ) {
        return
      }
    }

    if (this.spawnZoneType === SpawnZoneTypes.Any) {
      spawnCells.set(key, { type: this.spawnZoneType, groups: [] })
      return
    }

    if (this.gid === 0) return

    if (!existingGids.includes(this.gid)) {
      spawnCells.set(key, {
        type: this.spawnZoneType,
        groups: [...existingGids, this.gid]
      })
    }
  }
}

export default SpecialCellsHandler

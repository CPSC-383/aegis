import goobA from "@/assets/goob-team-a.png"
import goobB from "@/assets/goob-team-b.png"
import { getImage, renderCoords } from "@/utils/util"
import { schema } from "aegis-schema"
import Game from "./Game"
import Games from "./Games"
import invariant from "tiny-invariant"

export default class Agents {
  public agents: Map<number, Agent> = new Map()

  constructor(
    public readonly games: Games,
    public initAgents?: schema.Spawn[]
  ) {
    if (initAgents) {
      this.insertAgents(initAgents)
    }
  }

  public processRound(round: schema.Round | null): void {
    if (round) {
      for (const id of round.deadIds) {
        this.getById(id).dead = true
      }
    }

    for (const agent of this.agents.values()) {
      agent.lastLoc = agent.loc
    }
  }

  public applyTurn(turn: schema.Turn): void {
    const agent = this.getById(turn.agentId)
    agent.loc = { ...turn.loc! }
    agent.energyLevel = Math.max(turn.energyLevel, 0)

    for (const spawn of turn.spawns) {
      this.spawnAgent(spawn)
    }
  }

  private getById(id: number): Agent {
    const agent = this.agents.get(id)
    invariant(agent, `Agent with ID ${id} does not exist.`)
    return agent
  }

  public clearDead(): void {
    for (const agent of this.agents.values()) {
      if (!agent.dead) {
        continue
      }
      this.agents.delete(agent.id)
    }
  }

  public spawnAgent(_agent: schema.Spawn): void {
    const id = _agent.agentId
    invariant(
      !this.agents.has(id),
      `Cannot spawn agent: one already exists with ID ${id}`
    )

    const loc = _agent.loc!
    const team = _agent.team

    // Check if we have multiple teams
    const existingTeams = new Set(Array.from(this.agents.values()).map((a) => a.team))
    const hasMultipleTeams = existingTeams.size > 0 || team !== schema.Team.GOOBS

    // If single team or first agent, always use blue sprite
    // If multiple teams, use team-based assignment
    const imgPath = hasMultipleTeams
      ? team === schema.Team.GOOBS
        ? goobA
        : goobB
      : goobA

    const agent = new Agent(this.games, id, team, loc, imgPath)
    this.agents.set(id, agent)

    if (this.games.currentGame) {
      agent.default()
    }
  }

  private insertAgents(spawns: schema.Spawn[]): void {
    for (const spawn of spawns) {
      this.spawnAgent(spawn)
    }
  }

  public draw(game: Game, ctx: CanvasRenderingContext2D): void {
    // TODO: draw multiple agents on a cell
    for (const agent of this.agents.values()) {
      agent.draw(game, ctx)
    }
  }

  public copy(): Agents {
    const newAgents = new Agents(this.games)
    newAgents.agents = new Map(this.agents)
    for (const agent of this.agents.values()) {
      newAgents.agents.set(agent.id, agent.copy())
    }
    return newAgents
  }
}

export class Agent {
  public energyLevel: number = 0
  public lastLoc: schema.Location
  public dead: boolean = false

  constructor(
    private games: Games,
    public readonly id: number,
    public readonly team: schema.Team,
    public loc: schema.Location,
    public imgPath: string
  ) {
    this.lastLoc = this.loc
  }

  public draw(game: Game, ctx: CanvasRenderingContext2D): void {
    const goob = getImage(this.imgPath)
    invariant(goob, "goob should already be loaded")

    const pos = renderCoords(this.loc.x, this.loc.y, game.world.size)
    if (this.dead) {
      ctx.globalAlpha = 0.5
    }
    ctx.drawImage(goob, pos.x, pos.y, 1, 1)
    ctx.globalAlpha = 1
  }

  public copy(): Agent {
    // Use the same logic as spawnAgent - first agent gets blue sprite
    const imgPath = this.team === schema.Team.GOOBS ? goobA : goobB
    const copy = new Agent(this.games, this.id, this.team, { ...this.loc }, imgPath)
    copy.energyLevel = this.energyLevel
    copy.lastLoc = { ...this.lastLoc }
    copy.dead = this.dead
    return copy
  }

  public default(): void {
    const currentGame = this.games.currentGame
    invariant(currentGame, "No active game found for agent initialization")
    this.energyLevel = currentGame.world.startEnergy
  }
}

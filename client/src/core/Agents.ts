import { schema } from "aegis-schema"
import Games from "./Games"

export default class Agents {
  public agents: Map<number, Agent> = new Map()

  constructor(
    public readonly games: Games,
    public initAgents?: schema.Spawn[]
  ) {
    if (initAgents) this.insertAgents(initAgents)
  }

  public processRound(round: schema.Round | null): void {
    if (round) { }

    for (const agent of this.agents.values()) {
      agent.lastLoc = agent.loc
    }
  }

  public spawnAgent(_agent: schema.Spawn): void {
    const id = _agent.agentId
    const loc = _agent.loc!
    const team = _agent.team

    const agent = new Agent(this.games, id, team, loc)
    this.agents.set(id, agent)

    if (this.games.currentGame) agent.default()
  }

  private insertAgents(spawns: schema.Spawn[]): void {
    for (const spawn of spawns) {
      this.spawnAgent(spawn)
    }
  }

  public copy(): Agents {
    const newAgents = new Agents(this.games)
    newAgents.agents = new Map(this.agents)
    for (const agent of this.agents.values())
      newAgents.agents.set(agent.id, agent.copy())
    return newAgents
  }
}

export class Agent {
  public energyLevel: number = 0
  public lastLoc: schema.Location

  constructor(
    private games: Games,
    public readonly id: number,
    public readonly team: schema.Team,
    public loc: schema.Location
  ) {
    this.lastLoc = this.loc
  }

  public copy(): Agent {
    const copy = new Agent(
      this.games,
      this.id,
      this.team,
      { ...this.loc }
    )
    copy.energyLevel = this.energyLevel
    copy.lastLoc = { ...this.lastLoc }
    return copy
  }

  public default(): void {
    const currentGame = this.games.currentGame
    if (!currentGame) throw new Error("No active game found for agent initialization")
    this.energyLevel = this.games.currentGame!.world.startEnergy
  }
}

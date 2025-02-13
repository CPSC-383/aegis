import { Stack } from "@/core/world";

export interface SimulationState {
  currentRound: number;
  maxRounds: number;
  isRoundZero: boolean;
}

export interface WorldStats {
  AgentsAlive?: { value: number; icon: any };
  AgentsDead?: { value: number; icon: any };
  TotalSurvivors?: { value: number; icon: any };
  SurvivorsSaved?: { value: number; icon: any };
  StepsTaken?: { value: number; icon: any };
}

export type CellDict = {
  cell_type: string;
  stack: Stack;
};

export type AgentInfoDict = {
  id: number;
  gid: number;
  x: number;
  y: number;
  energy_level: number;
  command_sent: string;
  steps_taken: number;
};

export type World = {
  cell_data: CellDict[];
  agent_data: AgentInfoDict[];
  top_layer_rem_data: Location[];
  number_of_alive_agents: number;
  number_of_dead_agents: number;
  number_of_survivors: number;
  number_of_survivors_alive: number;
  number_of_survivors_dead: number;
  number_of_survivors_saved_alive: number;
  number_of_survivors_saved_dead: number;
};

export type GroupData = {
  gid: number;
  name: string;
  score: number;
  number_saved: number;
  number_predicted_right: number;
  number_predicted_wrong: number;
};

export type GroupStats = {
  gid: number;
  name: string;
  score: number;
  SurvivorsSaved: number;
  CorrectPredictions: number;
  IncorrectPredictions: number;
};

export type Groups = GroupData[];

export type Round = [World, Groups];

export type RoundData = {
  event_type: string;
  round: number;
  after_world: World;
  groups_data: Groups;
};

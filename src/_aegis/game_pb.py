from .agent import Agent
from .common import Location
from .schemas.event_pb2 import Event
from .schemas.game_pb2 import GameFooter, GameHeader, GamesFooter, GamesHeader, Round
from .schemas.location_pb2 import Location as PbLocation
from .schemas.spawn_pb2 import Spawn
from .schemas.team_pb2 import Team as PbTeam
from .schemas.team_pb2 import TeamInfo as PbTeamInfo
from .schemas.turn_pb2 import Turn
from .server_websocket import WebSocketServer
from .team import Team
from .team_info import TeamInfo
from .world import World
from .world_proto import serialize_world


class GamePb:
    def __init__(self) -> None:
        self.round: int = 0
        self.team_info: list[PbTeamInfo] = []
        self.turns: list[Turn] = []
        self.spawns: list[Spawn] = []
        self.removed_layers: list[PbLocation] = []
        self.dead_ids: list[int] = []
        self.ws_server: WebSocketServer | None = None
        self.drone_scans: dict[Location, dict[Team, int]] = {}

    def make_games_header(self, ws_server: WebSocketServer) -> None:
        self.ws_server = ws_server
        games_header = GamesHeader()

        event = Event()
        event.games_header.CopyFrom(games_header)

        binary_string = event.SerializeToString()
        self.ws_server.add_event(binary_string)

    def make_game_header(self, world: World) -> None:
        if self.ws_server is None:
            error = "Server should have started."
            raise ValueError(error)

        game_header = GameHeader()
        pb_world = serialize_world(world)
        game_header.world.CopyFrom(pb_world)
        game_header.rounds = world.rounds

        if self.spawns:
            game_header.spawns.extend(self.spawns)

        event = Event()
        event.game_header.CopyFrom(game_header)

        binary_string = event.SerializeToString()
        self.ws_server.add_event(binary_string)
        # clear so it doesn't keep ids for agent turn spawns
        self.spawns.clear()

    def start_round(self, game_round: int) -> None:
        self.round = game_round

    def end_round(self) -> None:
        if self.ws_server is None:
            error = "Server should have started."
            raise ValueError(error)
        pb_round = Round()
        pb_round.round = self.round
        pb_round.turns.extend(self.turns)
        pb_round.team_info.extend(self.team_info)
        pb_round.layers_removed.extend(self.removed_layers)
        pb_round.dead_ids.extend(self.dead_ids)

        event = Event()
        event.round.CopyFrom(pb_round)

        binary_string = event.SerializeToString()
        self.ws_server.add_event(binary_string)
        self.clear_round()

    def end_turn(self, agent: Agent) -> None:
        pb_turn = Turn()
        pb_turn.agentId = agent.id
        pb_turn.energy_level = agent.energy_level
        pb_turn.steps_taken = agent.steps_taken

        pb_loc = PbLocation()
        pb_loc.x = agent.location.x
        pb_loc.y = agent.location.y
        pb_turn.loc.CopyFrom(pb_loc)

        action_command = agent.command_manager.get_action_command()
        directive_commands = agent.command_manager.get_directives()
        commands = directive_commands
        if action_command is not None:
            commands.append(action_command)
        pb_turn.commands.extend(str(command) for command in commands)
        pb_turn.spawns.extend(self.spawns)

        self.turns.append(pb_turn)
        self.clear_turn()

    def make_game_footer(self) -> None:
        if self.ws_server is None:
            error = "Server should have started."
            raise ValueError(error)

        game_footer = GameFooter()

        event = Event()
        event.game_footer.CopyFrom(game_footer)

        binary_string = event.SerializeToString()
        self.ws_server.add_event(binary_string)

    def make_games_footer(self) -> None:
        if self.ws_server is None:
            error = "Server should have started."
            raise ValueError(error)

        games_footer = GamesFooter()

        event = Event()
        event.games_footer.CopyFrom(games_footer)

        binary_string = event.SerializeToString()
        self.ws_server.add_event(binary_string)

    def add_team_info(self, team: Team, team_info: TeamInfo) -> None:
        pb_team_info = PbTeamInfo()
        pb_team_info.saved_alive = team_info.get_saved_alive(team)
        pb_team_info.saved_dead = team_info.get_saved_dead(team)
        pb_team_info.saved = team_info.get_saved(team)
        pb_team_info.predicted_right = team_info.get_predicted_right(team)
        pb_team_info.predicted_wrong = team_info.get_predicted_wrong(team)
        pb_team_info.predicted = team_info.get_predicted(team)
        pb_team_info.score = team_info.get_score(team)
        pb_team_info.units = team_info.get_units(team)
        pb_team_info.team = self.team_to_schema(team)
        self.team_info.append(pb_team_info)

    def add_spawn(self, agent_id: int, team: Team, loc: Location) -> None:
        pb_spawn = Spawn()
        pb_spawn.agentId = agent_id
        pb_loc = PbLocation()
        pb_loc.x = loc.x
        pb_loc.y = loc.y
        pb_spawn.loc.CopyFrom(pb_loc)
        pb_spawn.team = self.team_to_schema(team)
        self.spawns.append(pb_spawn)

    def add_removed_layer(self, loc: Location) -> None:
        pb_loc = PbLocation()
        pb_loc.x = loc.x
        pb_loc.y = loc.y
        self.removed_layers.append(pb_loc)

    def add_dead(self, agent_id: int) -> None:
        self.dead_ids.append(agent_id)

    def team_to_schema(self, team: Team) -> PbTeam:
        return PbTeam.GOOBS if team == Team.GOOBS else PbTeam.VOIDSEERS

    def clear_round(self) -> None:
        self.team_info.clear()
        self.spawns.clear()
        self.turns.clear()
        self.removed_layers.clear()
        self.dead_ids.clear()

    def clear_turn(self) -> None:
        self.spawns.clear()

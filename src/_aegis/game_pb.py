from .agent import Agent
from .schemas.event_pb2 import Event
from .schemas.game_pb2 import GameFooter, GameHeader, Round
from .schemas.location_pb2 import Location
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
        self.ws_server: WebSocketServer | None = None

    def make_game_header(self, world: World, ws_server: WebSocketServer) -> None:
        self.ws_server = ws_server
        game_header = GameHeader()
        pb_world = serialize_world(world)
        game_header.world.CopyFrom(pb_world)
        game_header.rounds = world.rounds

        event = Event()
        event.game_header.CopyFrom(game_header)

        binary_string = event.SerializeToString()
        self.ws_server.add_event(binary_string)

    def start_round(self, game_round: int) -> None:
        self.round = game_round

    def end_round(self, world: World) -> None:
        if self.ws_server is None:
            error = "Server should have started."
            raise ValueError(error)
        pb_round = Round()
        pb_world = serialize_world(world)
        pb_round.world.CopyFrom(pb_world)
        pb_round.round = self.round

        for turn in self.turns:
            pb_turn = pb_round.turns.add()
            pb_turn.CopyFrom(turn)

        for team_info in self.team_info:
            pb_team_info = pb_round.team_info.add()
            pb_team_info.CopyFrom(team_info)

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
        pb_loc = Location()
        pb_loc.x = agent.location.x
        pb_loc.y = agent.location.y
        pb_turn.loc.CopyFrom(pb_loc)
        action_command = agent.command_manager.get_action_command()
        directive_commands = agent.command_manager.get_directives()
        commands = directive_commands
        if action_command is not None:
            commands.append(action_command)
        pb_turn.commands.extend(str(command) for command in commands)
        self.turns.append(pb_turn)

    def make_game_footer(self) -> None:
        if self.ws_server is None:
            error = "Server should have started."
            raise ValueError(error)
        game_footer = GameFooter()

        event = Event()
        event.game_footer.CopyFrom(game_footer)

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
        self.team_info.append(pb_team_info)

    def clear_round(self) -> None:
        self.team_info.clear()

import random
from typing import override

from agent.base_agent import BaseAgent
from agent.brain import Brain
from agent.log_levels import LogLevels
from aegis.common import AgentID, AgentIDList, Direction, Location
from aegis.common.commands.agent_command import AgentCommand
from aegis.common.commands.agent_commands import (
    END_TURN,
    MOVE,
    OBSERVE,
    SAVE_SURV,
    SEND_MESSAGE,
    SLEEP,
    TEAM_DIG,
)
from aegis.common.commands.aegis_commands import (
    CONNECT_OK,
    FWD_MESSAGE,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT_RESULT,
    SAVE_SURV_RESULT,
    SLEEP_RESULT,
    TEAM_DIG_RESULT,
)


class ExampleAgent(Brain):
    def __init__(self) -> None:
        super().__init__()
        random.seed(12345)
        self._random = random
        self._round = 1
        self._agent = BaseAgent.get_base_agent()
        self._list: list[AgentCommand] = []
        self._list.append(SLEEP())
        self._list.append(OBSERVE(Location(2, 2)))
        self._list.append(SAVE_SURV())
        self._list.append(TEAM_DIG())
        self._list.append(MOVE(Direction.SOUTH_EAST))
        self._list.append(SEND_MESSAGE(AgentIDList(), "This is a test"))

    @override
    def handle_connect_ok(self, connect_ok: CONNECT_OK) -> None:
        BaseAgent.log(LogLevels.Always, "CONNECT_OK")

    @override
    def handle_disconnect(self) -> None:
        BaseAgent.log(LogLevels.Always, "DISCONNECT")

    @override
    def handle_dead(self) -> None:
        BaseAgent.log(LogLevels.Always, "DEAD")

    @override
    def handle_fwd_message(self, msg: FWD_MESSAGE) -> None:
        BaseAgent.log(LogLevels.Always, f"FWD MESSAGE: {msg}")
        BaseAgent.log(LogLevels.Test, f"{msg}")

    @override
    def handle_move_result(self, mr: MOVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"MOVE_RESULT: {mr}")
        BaseAgent.log(LogLevels.Test, f"{mr}")

    @override
    def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"OBSERVER_RESULT: {ovr}")
        BaseAgent.log(LogLevels.Always, f"{ovr.energy_level}")
        BaseAgent.log(LogLevels.Always, f"{ovr.life_signals}")
        BaseAgent.log(LogLevels.Always, f"{ovr.grid_info}")
        BaseAgent.log(LogLevels.Test, f"{ovr}")

    @override
    def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SAVE_SURV_RESULT: {ssr}")
        BaseAgent.log(LogLevels.Test, f"{ssr}")

    @override
    def handle_predict_result(self, prd: PREDICT_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"PREDICT_RESULT: {prd}")
        BaseAgent.log(LogLevels.Test, f"{prd}")

    @override
    def handle_sleep_result(self, sr: SLEEP_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SLEEP_RESULT: {sr}")
        BaseAgent.log(LogLevels.Test, f"{sr}")

    @override
    def handle_team_dig_result(self, tdr: TEAM_DIG_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"TEAM_DIG_RSULT: {tdr}")
        BaseAgent.log(LogLevels.Test, f"{tdr}")

    @override
    def think(self) -> None:
        BaseAgent.log(LogLevels.Always, "Thinking")
        command = self._list[self._round % len(self._list)]
        if isinstance(command, SEND_MESSAGE):
            if not (command.agent_id_list):
                command.agent_id_list.add(AgentID(0, self._agent.get_agent_id().gid))

        if isinstance(command, OBSERVE):
            world = self.get_world()
            if world is not None:
                width = len(world.get_world_grid()[0])
                x = self._random.randint(0, width - 1)
                height = len(world.get_world_grid())
                y = self._random.randint(0, height - 1)
                command = OBSERVE(Location(x, y))
        elif isinstance(command, MOVE):
            world = self.get_world()
            if world is not None:
                width = len(world.get_world_grid()[0])
                x = self._random.randint(0, width - 1)
                height = len(world.get_world_grid())
                y = self._random.randint(0, height - 1)
                command = MOVE(Direction.get_random_direction())
        BaseAgent.log(LogLevels.Always, f"Sending {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())
        self._round += 1

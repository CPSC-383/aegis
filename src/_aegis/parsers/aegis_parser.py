# TODO: THIS NEEDS TO CHANGE AFTER ALL THE UPDATES
# VERY IMPORTANT!!!!!!
import re
import sys
from collections.abc import Iterator
from typing import TextIO

import numpy as np
from numpy.typing import NDArray

from _aegis.aegis_config import is_feature_enabled
from _aegis.common import (
    AgentID,
    AgentIDList,
    CellType,
    Direction,
    Location,
)
from _aegis.common.commands.aegis_command import AegisCommand
from _aegis.common.commands.aegis_commands import (
    AEGIS_UNKNOWN,
    CMD_RESULT_END,
    CMD_RESULT_START,
    DEATH_CARD,
    MESSAGES_END,
    MESSAGES_START,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT_RESULT,
    ROUND_END,
    ROUND_START,
    SAVE_SURV_RESULT,
    SEND_MESSAGE_RESULT,
    RECHARGE_RESULT,
    TEAM_DIG_RESULT,
)
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    AGENT_UNKNOWN,
    CONNECT,
    END_TURN,
    MOVE,
    OBSERVE,
    PREDICT,
    SAVE_SURV,
    SEND_MESSAGE,
    RECHARGE,
    TEAM_DIG,
)
from _aegis.common.commands.command import Command
from _aegis.common.parsers.aegis_parser_exception import AegisParserException
from _aegis.common.world.cell import Cell
from _aegis.common.world.info import (
    CellInfo,
    SurroundInfo,
)
from _aegis.common.world.objects import (
    Rubble,
    Survivor,
    WorldObject,
)


class AegisParser:
    @staticmethod
    def build_world(file_location: str) -> list[list[Cell]] | None:
        world: list[list[Cell]] | None = None
        try:
            with open(file_location) as file:
                world = AegisParser.read_world_size(file)
                for line in file:
                    cell = AegisParser.read_and_build_cell(line)
                    world[cell.location.x][cell.location.y] = cell
        except FileNotFoundError:
            raise AegisParserException(
                f"Unable to find startup world information file from {file_location}"
            )
        except Exception:
            raise AegisParserException(
                f"Unable to read in startup world information file from {file_location}"
            )
        return world

    @staticmethod
    def read_world_size(file: TextIO) -> list[list[Cell]]:
        tokens = file.readline().split()
        width = int(tokens[3])
        height = int(tokens[6])
        return [[None] * height for _ in range(width)]  # pyright: ignore[reportReturnType]

    @staticmethod
    def read_and_build_cell(line: str) -> Cell:
        pattern = r"[\[\]\(\),% ]"
        tokens = re.split(pattern, line.strip())
        tokens = [token for token in tokens if token]
        x = int(tokens[0])
        y = int(tokens[1])
        killer = tokens[2]
        charging = tokens[3]
        has_survivors = tokens[4] == "True"
        cell = Cell(x, y)

        cell.set_normal_cell()
        if killer[0] == "+":
            cell.set_killer_cell()

        if charging[0] == "+":
            cell.set_charging_cell()

        cell.has_survivors = has_survivors

        if is_feature_enabled("ENABLE_MOVE_COST"):
            cell.move_cost = int(tokens[5])
        return cell

    # @staticmethod
    # def parse_aegis_command(string: str) -> AegisCommand:
    #     try:
    #         string = string.strip()
    #         tokens = iter(string.split())
    #         if string.startswith(Command.STR_UNKNOWN):
    #             AegisParser.text(tokens, Command.STR_UNKNOWN)
    #             AegisParser.done(tokens)
    #             return AEGIS_UNKNOWN()
    #         elif string.startswith(Command.STR_CMD_RESULT_END):
    #             AegisParser.text(tokens, Command.STR_CMD_RESULT_END)
    #             AegisParser.done(tokens)
    #             return CMD_RESULT_END()
    #         elif string.startswith(Command.STR_CMD_RESULT_START):
    #             AegisParser.text(tokens, Command.STR_CMD_RESULT_START)
    #             AegisParser.open_round_bracket(tokens)
    #             results = AegisParser.integer(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return CMD_RESULT_START(results)
    #         elif string.startswith(Command.STR_DEATH_CARD):
    #             AegisParser.text(tokens, Command.STR_DEATH_CARD)
    #             AegisParser.done(tokens)
    #             return DEATH_CARD()
    #         elif string.startswith(Command.STR_SEND_MESSAGE_RESULT):
    #             AegisParser.text(tokens, Command.STR_SEND_MESSAGE_RESULT)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "IDFrom")
    #             AegisParser.open_round_bracket(tokens)
    #             id = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             gid = AegisParser.integer(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "MsgSize")
    #             msg_size = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "NUM_TO")
    #             number_left_to_read = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "IDS")
    #             AegisParser.open_round_bracket(tokens)
    #             agent_id_list = AegisParser.id_list(tokens, number_left_to_read)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "MSG")
    #             msg_index = string.index("MSG") + 4
    #             msg_end = msg_index + msg_size
    #             message = string[msg_index:msg_end]
    #             tokens = iter(string[msg_end + 1 :].split())
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return SEND_MESSAGE_RESULT(AgentID(id, gid), agent_id_list, message)
    #         elif string.startswith(Command.STR_MESSAGES_END):
    #             AegisParser.text(tokens, Command.STR_MESSAGES_END)
    #             AegisParser.done(tokens)
    #             return MESSAGES_END()
    #         elif string.startswith(Command.STR_MESSAGES_START):
    #             AegisParser.text(tokens, Command.STR_MESSAGES_START)
    #             AegisParser.open_round_bracket(tokens)
    #             messages = AegisParser.integer(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return MESSAGES_START(messages)
    #         # elif string.startswith(Command.STR_MOVE_RESULT):
    #         #     AegisParser.text(tokens, Command.STR_MOVE_RESULT)
    #         #     AegisParser.open_round_bracket(tokens)
    #         #     AegisParser.text(tokens, "ENG_LEV")
    #         #     energy_level = AegisParser.integer(tokens)
    #         #     AegisParser.comma(tokens)
    #         #     surround_information = AegisParser.surround_info(tokens)
    #         #     AegisParser.close_round_bracket(tokens)
    #         #     AegisParser.done(tokens)
    #         #     return MOVE_RESULT(energy_level, surround_information)
    #         # elif string.startswith(Command.STR_OBSERVE_RESULT):
    #         #     AegisParser.text(tokens, Command.STR_OBSERVE_RESULT)
    #         #     AegisParser.open_round_bracket(tokens)
    #         #     AegisParser.text(tokens, "ENG_LEV")
    #         #     energy_level = AegisParser.integer(tokens)
    #         #     AegisParser.comma(tokens)
    #         #     AegisParser.text(tokens, "CELL_INFO")
    #         #     AegisParser.open_round_bracket(tokens)
    #         #     cell_info = AegisParser.cell_info(tokens)
    #         #     AegisParser.close_round_bracket(tokens)
    #         #     AegisParser.comma(tokens)
    #         #     AegisParser.text(tokens, "NUM_SIG")
    #         #     num_sig = AegisParser.integer(tokens)
    #         #     AegisParser.comma(tokens)
    #         #     AegisParser.text(tokens, "LIFE_SIG")
    #         #     AegisParser.open_round_bracket(tokens)
    #         #     signals = AegisParser.life_signals(tokens, num_sig)
    #         #     AegisParser.close_round_bracket(tokens)
    #         #     AegisParser.close_round_bracket(tokens)
    #         #     AegisParser.done(tokens)
    #         #     return OBSERVE_RESULT(energy_level, cell_info, signals)
    #         elif string.startswith(Command.STR_ROUND_END):
    #             AegisParser.text(tokens, Command.STR_ROUND_END)
    #             AegisParser.done(tokens)
    #             return ROUND_END()
    #         elif string.startswith(Command.STR_ROUND_START):
    #             AegisParser.text(tokens, Command.STR_ROUND_START)
    #             AegisParser.done(tokens)
    #             return ROUND_START()
    #         elif string.startswith(Command.STR_SAVE_SURV_RESULT):
    #             AegisParser.text(tokens, Command.STR_SAVE_SURV_RESULT)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "ENG_LEV")
    #             energy_level = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "SUR_INFO")
    #             surround_information = AegisParser.surround_info(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             pred_after = AegisParser.done_but_can_have_pred_after(tokens)
    #             if not pred_after:
    #                 return SAVE_SURV_RESULT(energy_level, surround_information)
    #             else:
    #                 pred_data_res = AegisParser.prediction_data(tokens)
    #                 survivor_id: int = pred_data_res[0]
    #                 image: NDArray[np.float32] = pred_data_res[1]
    #                 labels: NDArray[np.int64] = pred_data_res[2]
    #                 return SAVE_SURV_RESULT(
    #                     energy_level, surround_information, (survivor_id, image, labels)
    #                 )
    #         elif string.startswith(Command.STR_PREDICT_RESULT):
    #             AegisParser.text(tokens, Command.STR_PREDICT_RESULT)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "SURV_ID")
    #             surv_id = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "PREDICTION_CORRECT")
    #             pred_res = AegisParser.boolean(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return PREDICT_RESULT(surv_id, pred_res)
    #         elif string.startswith(Command.STR_RECHARGE_RESULT):
    #             AegisParser.text(tokens, Command.STR_RECHARGE_RESULT)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "RESULT")
    #             success = AegisParser.boolean(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "CH_ENG")
    #             charge_energy = AegisParser.integer(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return RECHARGE_RESULT(success, charge_energy)
    #         elif string.startswith(Command.STR_TEAM_DIG_RESULT):
    #             AegisParser.text(tokens, Command.STR_TEAM_DIG_RESULT)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "ENG_LEV")
    #             energy_level = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             surround_information = AegisParser.surround_info(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return TEAM_DIG_RESULT(energy_level, surround_information)
    #         raise AegisParserException(f"Cannot parse AEGIS Action from {string}")
    #     except Exception as e:
    #         print(f"Exception: {e}", file=sys.stderr)
    #         return AEGIS_UNKNOWN()
    #
    # @staticmethod
    # def parse_agent_command(string: str) -> AgentCommand:
    #     try:
    #         string = string.strip()
    #         tokens = iter(string.split())
    #         if string.startswith(Command.STR_CONNECT):
    #             AegisParser.text(tokens, Command.STR_CONNECT)
    #             AegisParser.open_round_bracket(tokens)
    #             group_name = next(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return CONNECT(group_name)
    #         elif string.startswith(Command.STR_END_TURN):
    #             AegisParser.text(tokens, Command.STR_END_TURN)
    #             AegisParser.done(tokens)
    #             return END_TURN()
    #         elif string.startswith(Command.STR_MOVE):
    #             AegisParser.text(tokens, Command.STR_MOVE)
    #             AegisParser.open_round_bracket(tokens)
    #             dir = AegisParser.direction(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return MOVE(dir)
    #         elif string.startswith(Command.STR_OBSERVE):
    #             AegisParser.text(tokens, Command.STR_OBSERVE)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "X")
    #             x = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "Y")
    #             y = AegisParser.integer(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return OBSERVE(Location(x, y))
    #         elif string.startswith(Command.STR_SAVE_SURV):
    #             AegisParser.text(tokens, Command.STR_SAVE_SURV)
    #             AegisParser.done(tokens)
    #             return SAVE_SURV()
    #         elif string.startswith(Command.STR_PREDICT):
    #             AegisParser.text(tokens, Command.STR_PREDICT)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "SURV_ID")
    #             surv_id = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "LABEL")
    #             label = AegisParser.integer(tokens)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return PREDICT(surv_id, np.int64(label))
    #         elif string.startswith(Command.STR_SEND_MESSAGE):
    #             AegisParser.text(tokens, Command.STR_SEND_MESSAGE)
    #             AegisParser.open_round_bracket(tokens)
    #             AegisParser.text(tokens, "NumTo")
    #             num_to = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "MsgSize")
    #             msg_size = AegisParser.integer(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "ID_List")
    #             AegisParser.open_round_bracket(tokens)
    #             agent_id_list = AegisParser.id_list(tokens, num_to)
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.comma(tokens)
    #             AegisParser.text(tokens, "MSG")
    #             msg_index = string.index("MSG") + 4
    #             msg_end = msg_index + msg_size
    #             message = string[msg_index:msg_end]
    #             tokens = iter(string[msg_end + 1 :].split())
    #             AegisParser.close_round_bracket(tokens)
    #             AegisParser.done(tokens)
    #             return SEND_MESSAGE(agent_id_list, message)
    #         elif string.startswith(Command.STR_RECHARGE):
    #             AegisParser.text(tokens, Command.STR_RECHARGE)
    #             AegisParser.done(tokens)
    #             return RECHARGE()
    #         elif string.startswith(Command.STR_TEAM_DIG):
    #             AegisParser.text(tokens, Command.STR_TEAM_DIG)
    #             AegisParser.done(tokens)
    #             return TEAM_DIG()
    #         else:
    #             print(
    #                 f"Cannot parse Agent to Kernel Command from {string} | Did your agent throw an exception?"
    #             )
    #             return AGENT_UNKNOWN()
    #     except Exception as e:
    #         print(f"Exception: {e}", file=sys.stderr)
    #         return AGENT_UNKNOWN()
    #
    # @staticmethod
    # def text(tokens: Iterator[str], string: str) -> None:
    #     token = next(tokens)
    #     if token != string:
    #         raise AegisParserException(f"Expected: {string}, found: {token} ")
    #
    # @staticmethod
    # def integer(tokens: Iterator[str]) -> int:
    #     token = next(tokens)
    #     try:
    #         return int(token)
    #     except Exception:
    #         raise AegisParserException(f"Expected <int>, found {token}")
    #
    # @staticmethod
    # def boolean(tokens: Iterator[str]) -> bool:
    #     token = next(tokens)
    #     try:
    #         return bool(token)
    #     except Exception:
    #         raise AegisParserException(f"Expected <bool>, found {token}")
    #
    # @staticmethod
    # def file(tokens: Iterator[str]) -> str:
    #     parts: list[str] = []
    #     while True:
    #         token = next(tokens)
    #         if token == ")":
    #             return " ".join(parts)
    #         parts.append(token)
    #
    # @staticmethod
    # def direction(tokens: Iterator[str]) -> Direction:
    #     token = next(tokens)
    #     try:
    #         return Direction[token.upper()]
    #     except Exception:
    #         raise AegisParserException(f"Expected: <Direction>, found: {token} ")
    #
    # @staticmethod
    # def id_list(tokens: Iterator[str], number_left_to_read: int) -> AgentIDList:
    #     id_list = AgentIDList()
    #     for i in range(number_left_to_read):
    #         AegisParser.open_square_bracket(tokens)
    #         AegisParser.text(tokens, "ID")
    #         id = AegisParser.integer(tokens)
    #         AegisParser.comma(tokens)
    #         AegisParser.text(tokens, "GID")
    #         gid = AegisParser.integer(tokens)
    #         AegisParser.close_square_bracket(tokens)
    #         id_list.add(AgentID(id, gid))
    #         if i < number_left_to_read - 1:
    #             AegisParser.comma(tokens)
    #     return id_list
    #
    # # @staticmethod
    # # def surround_info(tokens: Iterator[str]) -> SurroundInfo:
    # #     info = SurroundInfo()
    # #     AegisParser.text(tokens, "CURR_CELL")
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_current_info(AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, "NUM_SIG")
    # #     num_sig = AegisParser.integer(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, "LIFE_SIG")
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.life_signals = AegisParser.life_signals(tokens, num_sig)
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.NORTH_WEST))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.NORTH_WEST, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.NORTH))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.NORTH, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.NORTH_EAST))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.NORTH_EAST, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.EAST))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.EAST, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.SOUTH_EAST))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.SOUTH_EAST, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.SOUTH))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.SOUTH, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.SOUTH_WEST))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.SOUTH_WEST, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     AegisParser.comma(tokens)
    # #     AegisParser.text(tokens, str(Direction.WEST))
    # #     AegisParser.open_round_bracket(tokens)
    # #     info.set_surround_info(Direction.WEST, AegisParser.cell_info(tokens))
    # #     AegisParser.close_round_bracket(tokens)
    # #     return info
    #
    # @staticmethod
    # def cell_info(tokens: Iterator[str]) -> CellInfo:
    #     cell_type = next(tokens)
    #
    #     if cell_type not in [
    #         "CHARGING_CELL",
    #         "KILLER_CELL",
    #         "NO_CELL",
    #         "NORMAL_CELL",
    #     ]:
    #         raise AegisParserException(f"Expected <cell_type>, found {cell_type}")
    #
    #     if cell_type == "NO_CELL":
    #         return CellInfo()
    #     elif cell_type == "KILLER_CELL":
    #         cell_type = CellType.KILLER_CELL
    #     elif cell_type == "CHARGING_CELL":
    #         cell_type = CellType.CHARGING_CELL
    #     else:
    #         cell_type = CellType.NORMAL_CELL
    #
    #     AegisParser.open_round_bracket(tokens)
    #     AegisParser.text(tokens, "X")
    #     x = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "Y")
    #     y = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "MV_COST")
    #     move_cost = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "NUM_AGT")
    #     num_agt = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "ID_LIST")
    #     AegisParser.open_round_bracket(tokens)
    #     agent_id_list = AegisParser.id_list(tokens, num_agt)
    #     AegisParser.close_round_bracket(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "TOP_LAYER")
    #     AegisParser.open_round_bracket(tokens)
    #     top_layer = AegisParser.object(tokens)
    #     AegisParser.close_round_bracket(tokens)
    #     AegisParser.close_round_bracket(tokens)
    #     return CellInfo(cell_type, Location(x, y), move_cost, agent_id_list, top_layer)
    #
    # @staticmethod
    # def object(tokens: Iterator[str]) -> WorldObject | None:
    #     object_type = next(tokens)
    #     if object_type == "RUBBLE":
    #         return AegisParser.rubble(tokens)
    #     elif object_type == "SURVIVOR":
    #         return AegisParser.survivor(tokens)
    #     elif object_type == "None":
    #         return None
    #     else:
    #         raise AegisParserException(f"Expected <object>, found {object_type}")
    #
    # @staticmethod
    # def rubble(tokens: Iterator[str]) -> Rubble:
    #     AegisParser.open_round_bracket(tokens)
    #     AegisParser.text(tokens, "ID")
    #     id = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "NUM_TO_RM")
    #     remove_agents = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "RM_ENG")
    #     remove_energy = AegisParser.integer(tokens)
    #     AegisParser.close_round_bracket(tokens)
    #     return Rubble(id, remove_energy, remove_agents)
    #
    # @staticmethod
    # def survivor(tokens: Iterator[str]) -> Survivor:
    #     AegisParser.open_round_bracket(tokens)
    #     AegisParser.text(tokens, "ID")
    #     id = AegisParser.integer(tokens)
    #     AegisParser.comma(tokens)
    #     AegisParser.text(tokens, "ENG_LEV")
    #     energy_level = AegisParser.integer(tokens)
    #     AegisParser.close_round_bracket(tokens)
    #     return Survivor(id, energy_level)
    #
    # @staticmethod
    # def open_round_bracket(tokens: Iterator[str]) -> None:
    #     token = next(tokens)
    #     if token != "(":
    #         raise AegisParserException(f"Expected: '(', found: {token}")
    #
    # @staticmethod
    # def close_round_bracket(tokens: Iterator[str]) -> None:
    #     token = next(tokens)
    #     if token != ")":
    #         raise AegisParserException(f"Expected: ')', found: {token}")
    #
    # @staticmethod
    # def open_square_bracket(tokens: Iterator[str]) -> None:
    #     token = next(tokens)
    #     if token != "[":
    #         raise AegisParserException(f"Expected: '[', found: {token}")
    #
    # @staticmethod
    # def close_square_bracket(tokens: Iterator[str]) -> None:
    #     token = next(tokens)
    #     if token != "]":
    #         raise AegisParserException(f"Expected: ']', found: {token}")
    #
    # @staticmethod
    # def comma(tokens: Iterator[str]) -> None:
    #     token = next(tokens)
    #     if token != ",":
    #         raise AegisParserException(f"Expected: ',', found: {token}")
    #
    # @staticmethod
    # def done(tokens: Iterator[str]) -> None:
    #     token = next(tokens, None)
    #     if token is not None:
    #         raise AegisParserException("Expected to be done parsing")
    #
    # @staticmethod
    # def done_but_can_have_pred_after(tokens: Iterator[str]) -> bool:
    #     token = next(tokens, None)
    #     if token is None:
    #         return False
    #     elif token == "PredInfo:":
    #         return True
    #     raise AegisParserException("Something wrong with prediction parsing")
    #
    # @staticmethod
    # def vert_line(tokens: Iterator[str]) -> None:
    #     token = next(tokens)
    #     if token != "|":
    #         raise AegisParserException(f"Expected: '|', found: {token}")
    #
    # @staticmethod
    # def prediction_data(
    #     tokens: Iterator[str],
    # ) -> tuple[int, NDArray[np.float32], NDArray[np.int64]]:
    #     token = next(tokens)
    #     if token != "SURV_ID:":
    #         raise AegisParserException(f"Expected 'SURV_ID:', found {token}")
    #     surv_id_str = next(tokens)
    #     try:
    #         survivor_id = int(surv_id_str)
    #     except ValueError:
    #         raise AegisParserException(f"Invalid SURV_ID: {surv_id_str}")
    #
    #     token = next(tokens)
    #     if token != "IMAGE:":
    #         raise AegisParserException(f"Expected 'IMAGE:', found {token}")
    #
    #     image_list: list[float] = []
    #     # collect floating point numbers until we reach "LABELS:"
    #     while True:
    #         token = next(tokens)
    #         if token == "LABELS:":
    #             break
    #         try:
    #             image_list.append(float(token))
    #         except ValueError:
    #             raise AegisParserException(f"Invalid image data: {token}")
    #     image_array: NDArray[np.float32] = np.array(image_list, dtype=np.float32)
    #
    #     labels_list: list[int] = []
    #     # only stuff left should be integer labels
    #     for token in tokens:
    #         try:
    #             labels_list.append(int(token))
    #         except ValueError:
    #             raise AegisParserException(f"Invalid label data: {token}")
    #     labels_array: NDArray[np.int64] = np.array(labels_list, dtype=np.int64)
    #
    #     return survivor_id, image_array, labels_array

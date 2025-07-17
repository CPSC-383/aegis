import logging

from .common.agent_id import AgentID
from .common.constants import Constants
from .group import AgentGroup

LOGGER = logging.getLogger("aegis")


class AgentHandler:
    def __init__(self) -> None:
        self.GID_counter: int = 1
        self.agent_group_list: list[AgentGroup] = []

    def agent_info(self, group_name: str) -> AgentID:
        group = self.get_group(group_name)
        if group is None:
            group = self.add_group(group_name)
            group.id_counter = 1

        agent_id = AgentID(group.id_counter, group.GID)
        group.id_counter += 1

        return agent_id

    def add_group(self, group_name: str) -> AgentGroup:
        group = AgentGroup(self.GID_counter, group_name)
        self.GID_counter += 1
        self.agent_group_list.append(group)
        return group

    def get_group(self, name: str) -> AgentGroup | None:
        for group in self.agent_group_list:
            if group.name == name:
                return group
        return None

    def get_agent_group(self, gid: int) -> AgentGroup | None:
        for group in self.agent_group_list:
            if gid == group.GID:
                return group
        return None

    def get_groups_data(self):  # noqa: ANN202
        groups_data: list[dict[str, str | int]] = []
        for group in self.agent_group_list:
            data = {
                "gid": group.GID,
                "name": group.name,
                "score": group.score,
                "number_saved": group.number_saved,
                "number_predicted_right": group.number_predicted_right,
                "number_predicted_wrong": group.number_predicted_wrong,
            }
            groups_data.append(data)

        return groups_data

    def increase_agent_group_saved(
        self,
        gid: int,
        number_saved: int,
        save_state: int,
    ) -> None:
        state_message = "alive" if save_state == Constants.SAVE_STATE_ALIVE else "dead"
        LOGGER.info(
            "Aegis  : Group %s saved %s survivors %s.",
            gid,
            number_saved,
            state_message,
        )
        agent_group: AgentGroup | None = self.get_agent_group(gid)
        if agent_group is None:
            return

        agent_group.number_saved += number_saved
        if save_state == Constants.SAVE_STATE_ALIVE:
            agent_group.number_saved_alive += number_saved
        elif save_state == Constants.SAVE_STATE_DEAD:
            agent_group.number_saved_dead += number_saved

        # update agent group score
        agent_group.score += Constants.SCORE_SURV_SAVED_BASE

    def increase_agent_group_predicted(
        self,
        gid: int,
        surv_id: int,
        label: int,
        *,
        pred_correct: bool,
    ) -> None:
        agent_group = self.get_agent_group(gid)
        if agent_group is None:
            return

        correct_string = "correctly!" if pred_correct else "incorrectly."

        if pred_correct:
            agent_group.score += Constants.SCORE_CORRECT_PRED
            agent_group.number_predicted_right += 1
        else:
            agent_group.number_predicted_wrong += 1
        agent_group.number_predicted += 1

        LOGGER.info(
            "Aegis  : Group %s predicted symbol %s from survivor %s %s",
            gid,
            label,
            surv_id,
            correct_string,
        )

    def print_group_survivor_saves(self) -> None:
        LOGGER.info("=================================================")
        LOGGER.info("Results for each Group")
        LOGGER.info("(Score, Number Saved, Correct Predictions)")
        LOGGER.info("=================================================")
        for group in self.agent_group_list:
            LOGGER.info(
                "%s : (%s, %s, %s)",
                group.name,
                group.score,
                group.number_saved,
                group.number_predicted_right,
            )

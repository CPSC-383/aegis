from .common.agent_id import AgentID
from .common.constants import Constants
from .group import AgentGroup


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
            if group.GID == gid:
                return group
        return None

    def get_groups_data(self):
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
        self, gid: int, number_saved: int, save_state: int
    ) -> None:
        state_message = "alive" if save_state == Constants.SAVE_STATE_ALIVE else "dead"
        print(f"Aegis  : Group {gid} saved {number_saved} survivors {state_message}.")
        agent_group: AgentGroup | None = self.get_agent_group(gid)
        if agent_group is None:
            return

        agent_group.number_saved += number_saved
        if save_state == Constants.SAVE_STATE_ALIVE:
            agent_group.number_saved_alive += number_saved
        elif save_state == Constants.SAVE_STATE_DEAD:
            agent_group.number_saved_dead += number_saved

        # update agent group score (BASE for first survivor saved, EXTRA for any additional survivors saved (surv groups))
        agent_group.score += (
            Constants.SCORE_SURV_SAVED_BASE
            + (number_saved - 1) * Constants.SCORE_ANY_EXTRA_SURV_SAVED
        )

    def increase_agent_group_predicted(
        self, gid: int, surv_id: int, label: int, pred_correct: bool
    ) -> None:
        """called when group predicts, also updates group score accordingly

        Args:
            gid (int): group id
        """

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

        print(
            f"Aegis  : Group {gid} predicted symbol {label} from survivor {surv_id} {correct_string}"
        )

    def print_group_survivor_saves(self) -> None:
        print("=================================================")
        print("Results for each Group")
        print("(Score, Number Saved, Correct Predictions)")
        print("=================================================")
        for group in self.agent_group_list:
            print(
                f"{group.name} : ({group.score}, {group.number_saved}, {group.number_predicted_right})"
            )

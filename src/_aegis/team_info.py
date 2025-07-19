from .team import Team


class TeamInfo:
    def __init__(self) -> None:
        self.saved_alive: list[int] = [0] * 2
        self.saved_dead: list[int] = [0] * 2
        self._saved: list[int] = [0] * 2
        self.predicted_right: list[int] = [0] * 2
        self.predicted_wrong: list[int] = [0] * 2
        self._predicted: list[int] = [0] * 2
        self._score: list[int] = [0] * 2

    def get_saved(self, team: Team) -> int:
        return self._saved[team.value]

    def get_predicted(self, team: Team) -> int:
        return self._predicted[team.value]

    def get_score(self, team: Team) -> int:
        return self._score[team.value]

    def inc_score(self, team: Team, amount: int) -> None:
        self._score[team.value] += amount

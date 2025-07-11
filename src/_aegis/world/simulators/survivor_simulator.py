from _aegis.common.utility import Utility
from _aegis.common.world.objects import Survivor


class SurvivorSimulator:
    def __init__(
        self,
        survivors_list: dict[int, Survivor],
    ) -> None:
        self.survivors_list: dict[int, Survivor] = survivors_list

    def run(self) -> str:
        s = ""
        s += f"{self.update_sv_list()}\n"
        return s

    def update_sv_list(self) -> str:
        s = "SV; { "
        changed_count = 0
        for survivor in self.survivors_list.values():
            change = Utility.random_in_range(0, 20)
            if change < 12:
                continue
            if survivor.is_dead():
                continue
            changed_count += 1
            remove_energy = survivor.damage_factor * Utility.random_in_range(1, 5)
            remove_energy += survivor.body_mass + survivor.mental_state
            change = Utility.random_in_range(5, 10)
            if remove_energy > change:
                remove_energy %= change
                remove_energy += 1
            survivor.remove_energy(remove_energy)
            s += f"({survivor.id},{survivor.get_energy_level()})"
        if changed_count <= 0:
            s += "NONE"
        s += " };"
        return s

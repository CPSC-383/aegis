import json
import random


def generate_random_world(width=15, height=15, agent_energy=500):
    world = {
        "settings": {
            "world_info": {
                "size": {"width": width, "height": height},
                "seed": random.randint(1, 10000),
                "world_file_levels": {
                    "high": 0,
                    "mid": 0,
                    "low": 0,
                },
                "agent_energy": agent_energy,
            }
        },
        "spawn_locs": generate_random_spawn_locations(width, height),
        "cell_types": generate_random_cell_types(width, height),
    }

    world["stacks"] = generate_random_stacks(width, height, world["cell_types"])

    return world


def generate_random_spawn_locations(width, height):
    spawns = []
    used_locations = set()

    # Ensure at least one 'any' spawn zone
    any_spawn_x = random.randint(0, width - 1)
    any_spawn_y = random.randint(0, height - 1)
    spawns.append({"x": any_spawn_x, "y": any_spawn_y, "type": "any"})
    used_locations.add((any_spawn_x, any_spawn_y))

    spawn_count = 6
    for _ in range(spawn_count):
        while True:
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)

            # Ensure no duplicate locations
            if (x, y) not in used_locations:
                # Randomly choose between 'any' and 'group' types
                spawn = {"x": x, "y": y}

                if random.random() < 0.4:  # 40% chance of being a group spawn
                    spawn["type"] = "group"
                    spawn["gid"] = 1
                else:
                    spawn["type"] = "any"

                spawns.append(spawn)
                used_locations.add((x, y))
                break

    return spawns


def generate_random_cell_types(width, height):
    cell_types = {
        "killer_cells": generate_random_cells(
            width, height, max_cells=width * height // 30
        ),
        "charging_cells": generate_random_cells(
            width, height, max_cells=width * height // 25
        ),
    }

    return cell_types


def generate_random_cells(width, height, max_cells=10):
    num_cells = random.randint(0, max_cells)
    cells = []
    used_locations = set()

    for _ in range(num_cells):
        while True:
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)

            if (x, y) not in used_locations:
                cells.append({"x": x, "y": y})
                used_locations.add((x, y))
                break

    return cells


def generate_random_stacks(width, height, cell_types):
    stacks = []
    special_cells = set()

    for cell_type_list in cell_types.values():
        for cell in cell_type_list:
            special_cells.add((cell["x"], cell["y"]))

    max_content_cells = 15
    content_cells = set()
    while len(content_cells) < max_content_cells:
        x = random.randint(0, width - 1)
        y = random.randint(0, height - 1)
        content_cells.add((x, y))

    for x in range(width):
        for y in range(height):
            stack = {
                "cell_loc": {"x": x, "y": y},
                "move_cost": 1 if (x, y) in special_cells else random.randint(1, 5),
                "contents": generate_random_stack_contents()
                if (x, y) in content_cells and (x, y) not in special_cells
                else [],
            }
            stacks.append(stack)

    return stacks


def generate_random_stack_contents():
    num_layers = random.randint(1, 6)
    contents = []

    for _ in range(num_layers):
        if random.random() < 0.6:
            contents.append(
                {
                    "type": "sv",
                    "arguments": {
                        "energy_level": 0,
                        "body_mass": 0,
                        "mental_state": 0,
                        "damage_factor": 0,
                    },
                }
            )

        if random.random() < 0.4:
            contents.append(
                {
                    "type": "rb",
                    "arguments": {
                        "remove_energy": random.randint(0, 20),
                        "remove_agents": random.randint(0, 2),
                    },
                }
            )

    return contents


def main():
    random_world = generate_random_world()

    with open("worlds/0random_world.world", "w") as f:
        json.dump(random_world, f, indent=2)


if __name__ == "__main__":
    main()

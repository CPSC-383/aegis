"""
Protobuf service for AEGIS server-side serialization.
"""

from typing import Any
from . import aegis_pb2


class ProtobufService:
    """Service for handling protobuf serialization (server only sends data)."""

    @staticmethod
    def serialize_world_init(world_data: dict[str, Any]) -> bytes:
        """Serialize world initialization data."""
        world_state = aegis_pb2.WorldState()

        # Set basic world properties
        world_state.width = world_data.get("width", 0)
        world_state.height = world_data.get("height", 0)

        # Add cells
        for cell_data in world_data.get("cells", []):
            cell = world_state.cells.add()
            cell.location.x = cell_data.get("location", {}).get("x", 0)
            cell.location.y = cell_data.get("location", {}).get("y", 0)
            cell.move_cost = cell_data.get("move_cost", 0)
            cell.has_survivors = cell_data.get("has_survivors", False)

            # Add agent IDs
            for agent_id_data in cell_data.get("agent_ids", []):
                agent_id = cell.agent_ids.add()
                agent_id.id = agent_id_data.get("id", 0)
                agent_id.gid = agent_id_data.get("gid", 0)

            # Set top layer
            if "survivor" in cell_data:
                survivor = cell.survivor
                survivor.id = cell_data["survivor"].get("id", 0)
                survivor.state = cell_data["survivor"].get("state", 0)
            elif "rubble" in cell_data:
                rubble = cell.rubble
                rubble.move_cost = cell_data["rubble"].get("move_cost", 0)

        # Add agents
        for agent_data in world_data.get("agents", []):
            agent = world_state.agents.add()
            agent.agent_id.id = agent_data.get("agent_id", {}).get("id", 0)
            agent.agent_id.gid = agent_data.get("agent_id", {}).get("gid", 0)
            agent.location.x = agent_data.get("location", {}).get("x", 0)
            agent.location.y = agent_data.get("location", {}).get("y", 0)
            agent.energy_level = agent_data.get("energy_level", 0)
            agent.steps_taken = agent_data.get("steps_taken", 0)

        # Add survivors
        for survivor_data in world_data.get("survivors", []):
            survivor = world_state.survivors.add()
            survivor.id = survivor_data.get("id", 0)
            survivor.state = survivor_data.get("state", 0)

        # Create the event
        event = aegis_pb2.SimulationEvent()
        event.world_init.CopyFrom(world_state)

        return event.SerializeToString()

    @staticmethod
    def serialize_round_update(
        round_num: int, world_data: dict[str, Any], groups_data: list[dict[str, Any]]
    ) -> bytes:
        """Serialize round update data."""
        round_update = aegis_pb2.RoundUpdate()
        round_update.round = round_num

        # Set world data (reuse world_init logic)
        world_state = aegis_pb2.WorldState()

        # Set basic world properties
        world_state.width = world_data.get("width", 0)
        world_state.height = world_data.get("height", 0)

        # Add cells
        for cell_data in world_data.get("cells", []):
            cell = world_state.cells.add()
            cell.location.x = cell_data.get("location", {}).get("x", 0)
            cell.location.y = cell_data.get("location", {}).get("y", 0)
            cell.move_cost = cell_data.get("move_cost", 0)
            cell.has_survivors = cell_data.get("has_survivors", False)

            # Add agent IDs
            for agent_id_data in cell_data.get("agent_ids", []):
                agent_id = cell.agent_ids.add()
                agent_id.id = agent_id_data.get("id", 0)
                agent_id.gid = agent_id_data.get("gid", 0)

            # Set top layer
            if "survivor" in cell_data:
                survivor = cell.survivor
                survivor.id = cell_data["survivor"].get("id", 0)
                survivor.state = cell_data["survivor"].get("state", 0)
            elif "rubble" in cell_data:
                rubble = cell.rubble
                rubble.move_cost = cell_data["rubble"].get("move_cost", 0)

        # Add agents
        for agent_data in world_data.get("agents", []):
            agent = world_state.agents.add()
            agent.agent_id.id = agent_data.get("agent_id", {}).get("id", 0)
            agent.agent_id.gid = agent_data.get("agent_id", {}).get("gid", 0)
            agent.location.x = agent_data.get("location", {}).get("x", 0)
            agent.location.y = agent_data.get("location", {}).get("y", 0)
            agent.energy_level = agent_data.get("energy_level", 0)
            agent.steps_taken = agent_data.get("steps_taken", 0)

        # Add survivors
        for survivor_data in world_data.get("survivors", []):
            survivor = world_state.survivors.add()
            survivor.id = survivor_data.get("id", 0)
            survivor.state = survivor_data.get("state", 0)

        round_update.world.CopyFrom(world_state)

        # Add groups data
        for group_data in groups_data:
            group = round_update.groups.add()
            group.gid = group_data.get("gid", 0)
            group.name = group_data.get("name", "")
            group.score = group_data.get("score", 0)
            group.number_saved = group_data.get("number_saved", 0)
            group.number_predicted_right = group_data.get("number_predicted_right", 0)
            group.number_predicted_wrong = group_data.get("number_predicted_wrong", 0)

        # Create the event
        event = aegis_pb2.SimulationEvent()
        event.round_update.CopyFrom(round_update)

        return event.SerializeToString()

    @staticmethod
    def serialize_simulation_complete() -> bytes:
        """Serialize simulation completion event."""
        event = aegis_pb2.SimulationEvent()
        event.complete.CopyFrom(aegis_pb2.SimulationComplete())
        return event.SerializeToString()

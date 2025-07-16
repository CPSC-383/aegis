#!/usr/bin/env python3
"""
Test script to verify protobuf serialization and deserialization works correctly.
"""

import sys
from pathlib import Path

# Add src to path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


def test_protobuf_imports():
    """Test that we can import the protobuf modules."""
    print("Testing protobuf imports...")

    try:
        from _aegis.protobuf import aegis_pb2

        print("Successfully imported aegis_pb2")

        # Check that key classes exist
        expected_classes = [
            "Location",
            "AgentID",
            "Survivor",
            "Rubble",
            "Cell",
            "WorldState",
            "Agent",
            "GroupData",
            "RoundUpdate",
            "SimulationComplete",
            "SimulationEvent",
        ]

        for class_name in expected_classes:
            if hasattr(aegis_pb2, class_name):
                print(f"Found class: {class_name}")
            else:
                print(f"✗ Missing class: {class_name}")
                return False

        return True

    except ImportError as e:
        print(f"✗ Failed to import aegis_pb2: {e}")
        return False


def test_protobuf_service():
    """Test that we can import and use the protobuf service."""
    print("\nTesting protobuf service...")

    try:
        from _aegis.protobuf.protobuf_service import ProtobufService

        print("Successfully imported ProtobufService")
        return True

    except ImportError as e:
        print(f"✗ Failed to import ProtobufService: {e}")
        return False


def test_basic_serialization():
    """Test basic protobuf serialization and deserialization."""
    print("\nTesting basic serialization...")

    try:
        from _aegis.protobuf import aegis_pb2

        # Test Location
        location = aegis_pb2.Location()
        location.x = 10
        location.y = 20

        serialized = location.SerializeToString()
        deserialized = aegis_pb2.Location()
        deserialized.ParseFromString(serialized)

        assert deserialized.x == 10
        assert deserialized.y == 20
        print("Location serialization/deserialization works")

        # Test AgentID
        agent_id = aegis_pb2.AgentID()
        agent_id.id = 1
        agent_id.gid = 2

        serialized = agent_id.SerializeToString()
        deserialized = aegis_pb2.AgentID()
        deserialized.ParseFromString(serialized)

        assert deserialized.id == 1
        assert deserialized.gid == 2
        print("AgentID serialization/deserialization works")

        return True

    except Exception as e:
        print(f"✗ Basic serialization failed: {e}")
        return False


def test_world_state_serialization():
    """Test WorldState serialization and deserialization."""
    print("\nTesting WorldState serialization...")

    try:
        from _aegis.protobuf import aegis_pb2

        # Create a simple world state
        world_state = aegis_pb2.WorldState()
        world_state.width = 5
        world_state.height = 5

        # Add a cell
        cell = world_state.cells.add()
        cell.location.x = 1
        cell.location.y = 2
        cell.move_cost = 3

        # Add a survivor to the cell
        survivor = cell.survivor
        survivor.id = 1
        survivor.state = 0  # alive

        # Add an agent
        agent = world_state.agents.add()
        agent.agent_id.id = 1
        agent.agent_id.gid = 1
        agent.location.x = 1
        agent.location.y = 2
        agent.energy_level = 100
        agent.steps_taken = 5

        # Serialize and deserialize
        serialized = world_state.SerializeToString()
        deserialized = aegis_pb2.WorldState()
        deserialized.ParseFromString(serialized)

        # Verify
        assert deserialized.width == 5
        assert deserialized.height == 5
        assert len(deserialized.cells) == 1
        assert deserialized.cells[0].location.x == 1
        assert deserialized.cells[0].location.y == 2
        assert deserialized.cells[0].survivor.id == 1
        assert len(deserialized.agents) == 1
        assert deserialized.agents[0].agent_id.id == 1

        print("WorldState serialization/deserialization works")
        return True

    except Exception as e:
        print(f"✗ WorldState serialization failed: {e}")
        return False


def test_simulation_event_serialization():
    """Test SimulationEvent serialization and deserialization."""
    print("\nTesting SimulationEvent serialization...")

    try:
        from _aegis.protobuf import aegis_pb2

        # Test world_init event
        event = aegis_pb2.SimulationEvent()
        world_state = event.world_init
        world_state.width = 10
        world_state.height = 10

        serialized = event.SerializeToString()
        deserialized = aegis_pb2.SimulationEvent()
        deserialized.ParseFromString(serialized)

        assert deserialized.HasField("world_init")
        assert deserialized.world_init.width == 10
        print("SimulationEvent world_init works")

        # Test round_update event
        event = aegis_pb2.SimulationEvent()
        round_update = event.round_update
        round_update.round = 5
        round_update.world.width = 8
        round_update.world.height = 8

        # Add group data
        group = round_update.groups.add()
        group.gid = 1
        group.name = "TestGroup"
        group.score = 100

        serialized = event.SerializeToString()
        deserialized = aegis_pb2.SimulationEvent()
        deserialized.ParseFromString(serialized)

        assert deserialized.HasField("round_update")
        assert deserialized.round_update.round == 5
        assert len(deserialized.round_update.groups) == 1
        assert deserialized.round_update.groups[0].name == "TestGroup"
        print("SimulationEvent round_update works")

        # Test complete event
        event = aegis_pb2.SimulationEvent()
        event.complete.CopyFrom(aegis_pb2.SimulationComplete())

        serialized = event.SerializeToString()
        deserialized = aegis_pb2.SimulationEvent()
        deserialized.ParseFromString(serialized)

        assert deserialized.HasField("complete")
        print("SimulationEvent complete works")

        return True

    except Exception as e:
        print(f"✗ SimulationEvent serialization failed: {e}")
        return False


def test_protobuf_service_methods():
    """Test the ProtobufService methods."""
    print("\nTesting ProtobufService methods...")

    try:
        from _aegis.protobuf.protobuf_service import ProtobufService

        # Test world_init serialization
        world_data = {
            "width": 5,
            "height": 5,
            "cells": [
                {
                    "location": {"x": 1, "y": 2},
                    "move_cost": 3,
                    "agent_ids": [{"id": 1, "gid": 1}],
                    "survivor": {"id": 1, "state": 0},
                }
            ],
            "agents": [
                {
                    "agent_id": {"id": 1, "gid": 1},
                    "location": {"x": 1, "y": 2},
                    "energy_level": 100,
                    "steps_taken": 5,
                }
            ],
            "survivors": [{"id": 1, "state": 0}],
        }

        serialized = ProtobufService.serialize_world_init(world_data)
        print(f"World init serialized to {len(serialized)} bytes")

        # Test round_update serialization
        groups_data = [
            {
                "gid": 1,
                "name": "TestGroup",
                "score": 100,
                "number_saved": 5,
                "number_predicted_right": 3,
                "number_predicted_wrong": 1,
            }
        ]

        serialized = ProtobufService.serialize_round_update(5, world_data, groups_data)
        print(f"Round update serialized to {len(serialized)} bytes")

        # Test simulation complete serialization
        serialized = ProtobufService.serialize_simulation_complete()
        print(f"Simulation complete serialized to {len(serialized)} bytes")

        return True

    except Exception as e:
        print(f"✗ ProtobufService methods failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=== Protobuf Test Suite ===\n")

    tests = [
        test_protobuf_imports,
        test_protobuf_service,
        test_basic_serialization,
        test_world_state_serialization,
        test_simulation_event_serialization,
        test_protobuf_service_methods,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()

    print("=== Test Results ===")
    print(f"Passed: {passed}/{total}")

    if passed == total:
        print("All tests passed")
        return 0
    else:
        print("Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())

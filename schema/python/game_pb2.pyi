from . import location_pb2 as _location_pb2
from . import spawn_pb2 as _spawn_pb2
from . import team_pb2 as _team_pb2
from . import turn_pb2 as _turn_pb2
from . import world_pb2 as _world_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GamesHeader(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class GameHeader(_message.Message):
    __slots__ = ("world", "rounds", "spawns")
    WORLD_FIELD_NUMBER: _ClassVar[int]
    ROUNDS_FIELD_NUMBER: _ClassVar[int]
    SPAWNS_FIELD_NUMBER: _ClassVar[int]
    world: _world_pb2.World
    rounds: int
    spawns: _containers.RepeatedCompositeFieldContainer[_spawn_pb2.Spawn]
    def __init__(self, world: _Optional[_Union[_world_pb2.World, _Mapping]] = ..., rounds: _Optional[int] = ..., spawns: _Optional[_Iterable[_Union[_spawn_pb2.Spawn, _Mapping]]] = ...) -> None: ...

class Round(_message.Message):
    __slots__ = ("round", "layers_removed", "turns", "team_info")
    ROUND_FIELD_NUMBER: _ClassVar[int]
    LAYERS_REMOVED_FIELD_NUMBER: _ClassVar[int]
    TURNS_FIELD_NUMBER: _ClassVar[int]
    TEAM_INFO_FIELD_NUMBER: _ClassVar[int]
    round: int
    layers_removed: _containers.RepeatedCompositeFieldContainer[_location_pb2.Location]
    turns: _containers.RepeatedCompositeFieldContainer[_turn_pb2.Turn]
    team_info: _containers.RepeatedCompositeFieldContainer[_team_pb2.TeamInfo]
    def __init__(self, round: _Optional[int] = ..., layers_removed: _Optional[_Iterable[_Union[_location_pb2.Location, _Mapping]]] = ..., turns: _Optional[_Iterable[_Union[_turn_pb2.Turn, _Mapping]]] = ..., team_info: _Optional[_Iterable[_Union[_team_pb2.TeamInfo, _Mapping]]] = ...) -> None: ...

class GameFooter(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class GamesFooter(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

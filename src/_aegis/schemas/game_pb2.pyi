from . import world_pb2 as _world_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GameHeader(_message.Message):
    __slots__ = ("world", "rounds")
    WORLD_FIELD_NUMBER: _ClassVar[int]
    ROUNDS_FIELD_NUMBER: _ClassVar[int]
    world: _world_pb2.World
    rounds: int
    def __init__(self, world: _Optional[_Union[_world_pb2.World, _Mapping]] = ..., rounds: _Optional[int] = ...) -> None: ...

class GameFooter(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

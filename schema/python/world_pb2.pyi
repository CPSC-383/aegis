from . import cell_pb2 as _cell_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class World(_message.Message):
    __slots__ = ("width", "height", "seed", "start_energy", "cells", "total_survivors")
    WIDTH_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_FIELD_NUMBER: _ClassVar[int]
    SEED_FIELD_NUMBER: _ClassVar[int]
    START_ENERGY_FIELD_NUMBER: _ClassVar[int]
    CELLS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_SURVIVORS_FIELD_NUMBER: _ClassVar[int]
    width: int
    height: int
    seed: int
    start_energy: int
    cells: _containers.RepeatedCompositeFieldContainer[_cell_pb2.Cell]
    total_survivors: int
    def __init__(self, width: _Optional[int] = ..., height: _Optional[int] = ..., seed: _Optional[int] = ..., start_energy: _Optional[int] = ..., cells: _Optional[_Iterable[_Union[_cell_pb2.Cell, _Mapping]]] = ..., total_survivors: _Optional[int] = ...) -> None: ...

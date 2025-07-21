from . import game_pb2 as _game_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Event(_message.Message):
    __slots__ = ("game_header", "round", "game_footer")
    GAME_HEADER_FIELD_NUMBER: _ClassVar[int]
    ROUND_FIELD_NUMBER: _ClassVar[int]
    GAME_FOOTER_FIELD_NUMBER: _ClassVar[int]
    game_header: _game_pb2.GameHeader
    round: _game_pb2.Round
    game_footer: _game_pb2.GameFooter
    def __init__(self, game_header: _Optional[_Union[_game_pb2.GameHeader, _Mapping]] = ..., round: _Optional[_Union[_game_pb2.Round, _Mapping]] = ..., game_footer: _Optional[_Union[_game_pb2.GameFooter, _Mapping]] = ...) -> None: ...

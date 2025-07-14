## Generate protobuf type file from the aegis.schema copied from the python side:

### Using the protobuf-ts package:

`npx protoc --ts_out src/generated/ --proto_path src/protobuf src/protobuf/aegis.proto`

# Aegis Schema

Protobuf schemas for Aegis.

## Prerequisites

You need `protoc` version **30.x to 33.x**.  
This corresponds to Protobuf Python runtime v6. Refer to the official version support chart to match the correct `protoc` version if needed:
https://protobuf.dev/support/version-support/

## How to Use

1. Activate the virtual environment (from the project root):

```bash
source ../.venv/bin/activate
```

2. Build the schema: 

```bash
npm run build
```

This will generate the protobuf files for both Python and TypeScript and install them into their respective directories.

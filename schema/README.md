# Aegis Schema

Protobuf schemas for Aegis.

## Prerequisites

You need `protoc` version **26.x to 29.x**.  
If Google's stupid aaahhh ever decides (20 years later lmao) to actually move Protobuf Python runtime to v6,
refer to the official version support chart to match the correct `protoc` version:

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

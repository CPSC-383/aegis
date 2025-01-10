# CPSC 383 Aegis

> [!NOTE]
> You can reuse existing tags found in the "Releases" section for building.

## Project Structure

- `/docs` - Documentation website
- `/client` - The aegis client

## Development

### Prerequisites

- Node.js 
- npm

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/CPSC-383/aegis.git
cd aegis
```

2. Install dependencies:

TODO

### Building and Deployment

#### Documentation

To build and deploy the documentation, check the docs folder [readme](./docs/README.md)

#### Aegis Release 

1. Create a release tag with assignment suffix:

```bash
git tag -a v<major>.<minor>.<patch>-<assignment> -m "<release message>"
# Example: git tag -a v2.1.3-a1 -m "Fix bug in map editor"
```

3. Push the tag.

```bash
git push origin <tag name>
```

> [!NOTE]
> Tags must end with -a1 or -a3 to trigger the release workflow. For example: v1.0.0-a1 or v2.1.3-a3

The client will be automatically built and available in the "Releases" section.

# CPSC 383 Aegis

> [!NOTE]
> You can reuse existing tags found in the "Releases" section for building.

## Project Structure

- `/docs` - Documentation website
- `/client` - The aegis client

## Development

### Prerequisites

- npm
- uv

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/CPSC-383/aegis.git
cd aegis
```

2. Install dependencies:

```bash
uv sync
source .venv/bin/activate
```

### Building and Deployment

#### Documentation

To build and deploy the documentation, check the docs folder [readme](./docs/README.md)

#### Releases

- Client release tag:

```bash
git tag -a client-v<major>.<minor>.<patch> -m "Release client <version>"
git push origin client-v<major>.<minor>.<patch>
```

- Aegis release tag:

```bash
git tag -a aegis-v<major>.<minor>.<patch> -m "Release Aegis <version>"
git push origin aegis-v<major>.<minor>.<patch>
```

Alternatively, use the Actions tab to run "Release Client" or "Release Aegis" and provide the tag as input.

Each tag creates its own entry in GitHub Releases with the corresponding artifacts. For prereleases use suffixes like `-rc1`, e.g. `client-v1.2.3-rc1` or `aegis-v1.2.3-rc1`.

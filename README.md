## AEGIS

AEGIS is a survivor simulation used in CPSC 383. This repo contains:

- Server/engine (Python package) that runs simulations and exposes a WebSocket for the client
- Client (Electron, React, TypeScript, Tailwind CSS) for visualizing and controlling simulations
- Documentation site (Next.js/MDX; see `docs/README.md`)

---

### Repo Layout

- `src/_aegis` and `src/aegis`: Python engine, CLI entrypoint, public API
- `client`: Electron desktop client (builds for macOS, Windows, Linux)
- `docs`: Documentation website and content
- `schema`: Shared Protocol Buffer/TypeScript types
- `worlds`: Sample worlds for running simulations
- `agents`: Example/reference agents (e.g., `agent_path`, `agent_mas`, `agent_prediction`)
- `config/config.yaml`: Runtime configuration for the engine

---

### Prerequisites

- Python 3.12+
- Node.js 20+
- `uv` (for Python env/build) — `pip install uv` or see `https://docs.astral.sh/uv/`

---

### Package name (PyPI)

The Python package is published as `aegis-game`. Once released, you can install it with:

```bash
pip install aegis-game
```

The CLI entrypoint is `aegis` (e.g., `aegis launch`).

---

### Download for usage in assignments or competitions

1. Create a python project and install the `aegis-game` package (Any method works, will demo with uv)

```bash
# Initialize project
uv init --package my-new-project
cd my-new-project

# Add the aegis-game package as a dependency
uv add aegis-game
```

2. Create scaffold

```
aegis init
```

This creates all necessary files/folders in your project that an aegis simulation needs to run

3. Configure features

Edit `config/config.yaml` to enable/disable features (e.g., messages, dynamic spawning, abilities). If you change features, regenerate stubs so the API your agent recongizes matches the config:

```PowerShell
aegis forge
```

4. Launch a game (through the console)

```PowerShell
# One agent
aegis launch --world ExampleWorld --agent agent_path

# Five agents with max rounds of 500 (requires config of ALLOW_CUSTOM_AGENT_COUNT=true)
aegis launch --world ExampleWorld --agent agent_path --amount 5 --rounds 500

```

Run `aegis launch -h` to see all ways you can run an aegis simulation

Notes:

- World names are the file names under `worlds/` without the `.world` extension. For example, `worlds/ExampleWorld.world` → `--world ExampleWorld`.
- Agent names are folder names under `agents/`. For example, `agents/agent_path` → `--agent agent_path`.

5. Use the client UI

TODO

---

### Download for Development

1. Clone and set up Python

```bash
git clone https://github.com/CPSC-383/aegis.git
cd aegis
uv sync --group dev
# Activate the virtualenv
# macOS/Linux
source .venv/bin/activate
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
```

2. Run the server locally

```PowerShell
aegis launch --world ExampleWorld --agent agent_path
```

3. Run the client in development mode

```PowerShell
cd client
npm ci
npm run dev
```

4. Linting and typing (Python)

```PowerShell
# After `uv sync --group dev`
uv run ruff check .
uv run pyright
```

---

### Documentation

See `docs/README.md` for local development and deployment of the docs site.

---

### Releasing

Releases are tag-driven and handled via GitHub Actions. Client and engine (Aegis) are released separately.

- Client tags: `client-v<major>.<minor>.<patch>`
- Aegis tags: `aegis-v<major>.<minor>.<patch>`

1. Client release

```PowerShell
cd client
npm version [patch|minor|major]
git tag -a client-v<major>.<minor>.<patch> -m "Client Release <version>"
git push origin client-v<major>.<minor>.<patch>
```

2. Aegis (Python) release

```PowerShell
# Bump version in the Python package
hatch version [release|major|minor|patch|a|b|pre|post|dev]
git tag -a aegis-v<major>.<minor>.<patch> -m "Aegis Release <version>"
git push origin aegis-v<major>.<minor>.<patch>
```

After tags are pushed, the corresponding workflows will:

- Build and upload artifacts to a GitHub Release
- For Aegis, also publish to the configured Python package index (currently set to TestPyPI in the workflow)

After the workflow completes, open the created GitHub Release and add in any notes for the release if you please

---

### Troubleshooting

- Windows PowerShell execution policy may block script activation; if needed, run PowerShell as Administrator and execute:
  - `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- Ensure Node.js 20+ and Python 3.12+ are on your PATH
- If the client cannot connect, verify the server was started with `--client` and that no firewall is blocking the port

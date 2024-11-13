# CPSC 383 Aegis

> [!NOTE]
> You can use reuse existing tags found in the "Releases" section for building.

## Building the Documentation

> [!WARNING]
> Do not touch the `docs` branch. The workflow will automatically update the files for the website.


To build the documentation, follow these steps:

1. Ensure you are on the appropriate branch.

- For assignment 1:

```bash
git checkout a1
```

- For assignment 3:

```bash
git checkout a3
```

2. Create a new tag for the documentation release.

```bash
git tag -a docs-v<major>.<minor>.<patch> -m "<release message>"
```

Example:

```bash
git tag -a docs-v2.1.3 -m "Fix typo in installation guide"
```

3. Push the tag.

```bash
git push origin <tag name>
```

## Release Build for the Aegis Client

To build and release the Aegis Client, follows these steps:

1. Ensure you are on the appropriate branch.

- For assignment 1:

```bash
git checkout a1
```

- For assignment 3:

```bash
git checkout a3
```

2. Create a new tag for the documentation release.

```bash
git tag -a v<major>.<minor>.<patch> -m "<release message>"
```

Example:

```bash
git tag -a v2.1.3 -m "Fix bug in map editor"
```

3. Push the tag.

```bash
git push origin <tag name>
```

### Finding the Latest Release for the Aegis Client

The zipped client will be in the "Releases" section. Check there for the most recent build.

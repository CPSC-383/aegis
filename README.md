# CPSC 383 Aegis

## Building the Documentation

To build the documentation, follow these steps:

### For Assignment 1

1. Ensure you are in the appropriate branch.

- For assignment 1:

```bash
git checkout a1
```

- For assignment 3:

```bash
git checkout main
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

### For Assignment 1

1. Ensure you are in the appropriate branch.

- For assignment 1:

```bash
git checkout a1
```

- For assignment 3:

```bash
git checkout main
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

### Finding the Release for the Client

The zipped client will be in the "Releases" section. Check there for the most recent build.

import platform
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import requests

OWNER = "CPSC-383"
REPO = "AEGIS"
CHUNK_SIZE = 8192
CLIENT_DIR = Path("client-temp")


def detect_target_asset() -> str:
    """Return the correct client asset filename for the current OS."""
    system = platform.system().lower()
    if system.startswith("win"):
        return "win-client.zip"
    if system.startswith("darwin"):
        return "mac-client.zip"
    if system.startswith("linux"):
        return "linux-client.zip"
    sys.exit(f"Unsupported system: {system}")


def get_latest_client_release(owner: str, repo: str):
    """Fetch the latest client release from GitHub."""
    url = f"https://api.github.com/repos/{owner}/{repo}/releases"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    releases = resp.json()

    client_releases = [r for r in releases if r["tag_name"].startswith("client-")]
    if not client_releases:
        error = "No client releases found."
        raise RuntimeError(error)

    return sorted(client_releases, key=lambda r: r["published_at"], reverse=True)[0]


def get_asset_from_release(release, asset_name: str):
    """Find the matching asset in a release."""
    asset = next((a for a in release["assets"] if a["name"] == asset_name), None)
    if not asset:
        sys.exit(f"No asset found for {asset_name}")
    return asset


def download_asset(url: str, output_path: Path, chunk_size: int = CHUNK_SIZE) -> None:
    """Download the asset from GitHub and save it to output_path with progress."""
    r = requests.get(url, stream=True, timeout=10)
    r.raise_for_status()

    total_size = int(r.headers.get("Content-Length", 0))
    downloaded = 0

    with output_path.open("wb") as f:
        for chunk in r.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size:
                    percent = downloaded / total_size * 100
                    print(
                        f"Downloaded {downloaded / (1024 * 1024):.2f} MB / {total_size / (1024 * 1024):.2f} MB ({percent:.1f}%)",
                        end="\r",
                    )
                else:
                    print(f"Downloaded {downloaded / (1024 * 1024):.2f} MB", end="\r")

    print(f"\nSaved to {output_path}")


def unzip_to_client(zip_path: Path, client_dir: Path) -> None:
    """Extract zip file."""
    if client_dir.exists():
        shutil.rmtree(client_dir)
    client_dir.mkdir(parents=True, exist_ok=True)

    os_name = platform.system().lower()
    try:
        if os_name.startswith("win"):
            with zipfile.ZipFile(zip_path, "r") as z_file:
                z_file.extractall(client_dir)
        else:
            command = ["unzip", "-o", str(zip_path), "-d", str(client_dir)]
            _ = subprocess.run(  # noqa: S603
                command,
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
    except Exception as e:  # noqa: BLE001
        print(f"Failed to extract zip: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Unzipped to {client_dir}")


def move_main_executable_up(client_dir: Path) -> None:
    """Move client up to root of CLIENT_DIR."""
    patterns = ["*.app", "*.AppImage", "*.exe"]

    for pattern in patterns:
        matches = list(client_dir.rglob(pattern))
        if matches:
            target_path = matches[0]

            if target_path.parent == client_dir:
                print(f"Executable already at root: {target_path.name}")
                return

            destination = client_dir / target_path.name
            if destination.exists():
                if destination.is_dir():
                    shutil.rmtree(destination)
                else:
                    destination.unlink()

            print(f"Moving {target_path} to {client_dir}")
            _ = shutil.move(str(target_path), str(destination))
            return

    print(f"No executable found to move in {client_dir}")


def cleanup_client_dir(client_dir: Path, keep_name: str) -> None:
    """Delete everything in client_dir except the item named keep_name."""
    for item in client_dir.iterdir():
        if item.name == keep_name:
            continue  # Keep this
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()
    print(f"Cleaned up {client_dir}, kept only '{keep_name}'")


def main() -> None:
    """Entry point to client fetch."""
    target_name = detect_target_asset()
    output_path = Path(target_name)

    if output_path.exists():
        print(f"Zip file '{output_path}' already exists. Skipping download.")
    else:
        latest_release = get_latest_client_release(OWNER, REPO)
        asset = get_asset_from_release(latest_release, target_name)

        print(f"Downloading {target_name} from {latest_release['tag_name']}...")
        download_asset(asset["browser_download_url"], output_path)

    print("Extracting client files...")
    unzip_to_client(output_path, CLIENT_DIR)
    move_main_executable_up(CLIENT_DIR)

    client_name = None
    for ext in ["*.app", "*.AppImage", "*.exe"]:
        matches = list(CLIENT_DIR.glob(ext))
        if matches:
            client_name = matches[0].name
            break

    if client_name:
        cleanup_client_dir(CLIENT_DIR, client_name)
    else:
        print("Warning: No executable found after moving.")


if __name__ == "__main__":
    main()

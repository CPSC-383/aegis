import subprocess
import sys
import platform
import zipfile
import os
import shutil
import importlib.util

RED = "\033[31m"
GREEN = "\033[92m"
RESET = "\033[0m"


def check_version() -> None:
    if sys.version_info < (3, 12):
        print(
            f"{RED}Wrong python version installed! Install python 3.12 or greater.{RESET}"
        )
        exit(1)


def is_package_installed(package_name: str) -> bool:
    return importlib.util.find_spec(package_name) is not None


def install_requirements(req_file: str = "requirements.txt") -> None:
    with open(req_file, "r") as file:
        requirements = file.readlines()

    missing_packages = []
    for req in requirements:
        req = req.strip()
        if req and not is_package_installed(req.split("==")[0]):
            missing_packages.append(req)

    if missing_packages:
        for package in missing_packages:
            print(f"Installing {package}...")
            try:
                with open(os.devnull, "w") as devnull:
                    _ = subprocess.check_call(
                        ["pip", "install", package],
                        stdout=devnull,
                        stderr=devnull,
                    )
                print(f"{GREEN}Successfully installed {package}.{RESET}")
            except Exception as e:
                print(f"{RED}Error installing {package}: {e}{RESET}")
        print(f"{GREEN}Successfully installed all packages.{RESET}")
    else:
        print("All requirements are already installed.")


def delete_clients():
    dir = "./client/"
    for item in os.listdir(dir):
        if item.endswith("-client"):
            item_path = os.path.join(dir, item)
            shutil.rmtree(item_path)


def client_is_installed(client_dir: str) -> bool:
    for file in os.listdir(client_dir):
        if file.endswith((".app", ".exe", ".AppImage")):
            return True
    return False


def install_client():
    name = "win"
    if platform.system() == "Darwin":
        name = "mac"
    elif platform.system() == "Linux":
        name = "linux"

    zip_path = f"./client/{name}-client/{name}-client.zip"
    extract_path = "./client/"

    if client_is_installed(extract_path):
        print("You're already setup.")
        return

    if name == "win":
        with zipfile.ZipFile(zip_path, "r") as z_file:
            z_file.extractall(extract_path)
    else:
        command = ["unzip", "-o", zip_path, "-d", extract_path]
        _ = subprocess.run(command, check=True)

    delete_clients()

    print("Client successfully installed.")


if __name__ == "__main__":
    check_version()
    install_requirements()
    install_client()

import subprocess
import platform
import zipfile
import os
import shutil


def install_requirements(req_file: str = "requirements.txt"):
    try:
        _ = subprocess.check_call(["pip", "install", "-r", req_file])
        print(f"Requirements from {req_file} have been successfully installed.")
    except Exception as e:
        print(f"Error installing requirements: {e}")


def delete_clients():
    dir = "./client/"
    for item in os.listdir(dir):
        if item.endswith("-client"):
            item_path = os.path.join(dir, item)
            shutil.rmtree(item_path)


def install_client():
    name = "win"
    if platform.system() == "Darwin":
        name = "mac"
    elif platform.system() == "Linux":
        name = "linux"

    zip_path = f"./client/{name}-client/{name}-client.zip"
    extract_path = "./client/"

    if name == "win":
        with zipfile.ZipFile(zip_path, "r") as z_file:
            z_file.extractall(extract_path)
    else:
        command = ["unzip", "-o", zip_path, "-d", extract_path]
        _ = subprocess.run(command, check=True)

    delete_clients()

    print("Client successfully installed.")


if __name__ == "__main__":
    install_requirements()
    install_client()

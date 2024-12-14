---
icon: octicons/download-16
---

This section will cover the basic information about downloading and installing AEGIS.

!!! info "Before You Begin"
    Ensure that your system meets the following prerequisites:

    - **Python 3.12.x**  
      To check if you have the correct Python version installed, run the following command in your terminal:
      
        === ":fontawesome-brands-apple: / :fontawesome-brands-linux: Mac/Linux"
            
            ```bash
            python3 --version
            ```
        === ":fontawesome-brands-windows: Windows"
            
            ```bash
            python --version
            ```

      This should return **Python 3.12.x**.

## Installation

1. **Download the project**
    - Download the ZIP file and unzip it with your preferred method.

    If successful, a new directory called `aegis` should have been created.

2. **Navigate to the project directory**

    ```bash
    cd aegis
    ```

3. **Setting up the project**

    AEGIS requires a set of Python packages to function. Installing these in a virtual
    environment ensures there are no conflicts with other Python projects or system-wide packages.


    - Run the setup script:

        === ":fontawesome-brands-apple: / :fontawesome-brands-linux: Mac/Linux"
            
            ```
            python3 setup.py 
            source .venv/bin/activate
            ```

        === ":fontawesome-brands-windows: Windows"
            
            ```
            python setup.py 
            .venv\Scripts\activate
            ```
        
        If the script was successful, a virtual environment named `.venv` should have been created, 
        the required packages installed within it and the client for your platform should be in the `client` folder.

    - Steps do to it manually if the setup script failed:

        === ":fontawesome-brands-apple: / :fontawesome-brands-linux: Mac/Linux"
            
            ```
            python3 -m venv .venv
            source .venv/bin/activate
            pip install -r requirements

            Unzip your platform client in the client folder with your preferred method.
            ```

        === ":fontawesome-brands-windows: Windows"
            
            ```
            python -m venv .venv
            .venv\Scripts\activate
            pip install -r requirements

            Unzip the windows client in the client folder with your preferred method.
            ```
   
    To deactivate the virtual environment once you're done:

    ```bash
    deactivate
    ```

    !!! tip 
        You must reactivate the virtual environment every time you work on the project. 
        If you're not inside the environment, you may encounter missing dependency errors.

4. **Confirm Installation**

    To confirm that AEGIS installed properly, follow the steps outlined [here](./running-aegis.md).

## File Structure
The AEGIS client uses a specific structure for agents and worlds. Be sure to follow these
guidelines so the client can find and run the necessary files correctly.

### Agent Structure

```bash
./
└── src/
    └── agents/
        └── example_agent/
            ├── example_agent.py
            └── main.py
```

- Place new agents in the `src/agents` directory.
- Agents must include a `main.py` file. 

### World Structure

```bash
./
└── worlds/
    └── ExampleWorld.world
```

- Place new worlds in the `worlds` directory.
- All world files must end with `.world`.

This section will cover the basic information about downloading and installing AEGIS.

!!! info "Before You Begin"
    Ensure that your system meets the following prerequisites:

    - **Python 3.12** or greater  
      To check if you have the correct Python version installed, run the following command in your terminal:
      
        === "Mac/Linux"
            
            ```bash
            python3 --version
            ```
        === "Windows"
            
            ```bash
            python --version
            ```

      This should return **Python 3.12** or greater.

## Installation

1. **Download the project**
    - Download the ZIP file and unzip it with your preferred method.

    If successful, a new directory called `aegis` should have been created.

2. **Navigate to the project directory**

    ```bash
    cd aegis
    ```

3. **Installing required Python packages into a virtual environment:**

    AEGIS requires a set of Python packages to function. Installing these in a virtual
    environment ensures there are no conflicts with other Python projects or system-wide packages.

    - Create and activate the virtual environment:

        === "Mac/Linux"
            
            ```
            python3 -m venv .venv
            source .venv/bin/activate
            ```
        === "Windows"
            
            ```
            python -m venv .venv
            .venv\Scripts\activate
            ```

    - Run the setup script:
        
        ```bash
        python setup.py
        ```

        If the script was successful, the required packages should have been installed and the client for your platform
        should be in the `client` folder.
   
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
src
└── agents
    └── example_agent
        ├── example_agent.py
        └── main.py
```

- Place new agents in the `src/agents` directory.
- Agents must include a `main.py` file. 

### World Structure

```bash
worlds
└── ExampleWorld.world
```

- Place new worlds in the `worlds` directory.
- All world files must end with `.world`.

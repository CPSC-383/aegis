This section will cover the basic information about downloading and installing AEGIS.

## Prerequisites

Before you begin, ensure you have the following:

- Python 3.10 or greater
    - Once installed, verify that you have the correct python version by running the following in your terminal:

        `python --version`

        Ensure it returns Python 3.10 or greater.

## Installation

1. **Download the project**
    - Download the ZIP file and unzip it with your preferred method.

    If successful, a new directory called AEGIS should have been created.

2. **Navigate to the project directory**
    - Move into the newly created directory:

        `cd AEGIS`

3. **Installing required Python packages**
    - **Installing the required Python Packages into a virtual environment**:
        - Create and activate the virtual environment:
            - Mac/Linux:
                
                `python3 -m venv .venv`

                `source .venv/bin/activate`

            - Windows:

                `python -m venv .venv`

                `.venv\Scripts\activate`

        - Install the required packages:
            
            `pip install -r requirements.txt`
       
        When you're done working in the virtual environment, you can deactivate it by running the following:

        `deactivate`

    Using a virtual environment is recommended to avoid conflicts with other Python projects and system-wide packages.
    You must activate the virtual environment everytime you start working on the code.

4. **Installing the client**
    - Navigate to the `client` folder and unzip the client for your specific platform.
    
5. **You have now completed the installation process.**

## File Structure
- Place new worlds in the `worlds` directory. The client will not be able to find them if they are stored elsewhere.

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

The client will not be able to locate the agents if they are stored elsewhere or if the `main.py` file is missing.

Before you start using AEGIS, you need to understand how AEGIS and its agents function.

Visit the [AEGIS System](aegis-system.md) to learn more.

# Common Errors and Solutions

If you can't solve your problem after reading through this page, please contact any of the Instructors or TAs and they will be able to help.

!!! warning "Important"
    - Your **path to the folder** you unzipped that has everything inside of it, **CANNOT HAVE SPACES** in it. For example,
    if a parent folder is called "CPSC 383", the space will create some undefined behaviour when running the system. To be safe,
    rename each parent folder to have no spaces, such as "CPSC_383" or "CPSC-383".  
    - Only python versions >= 3.12 are supported!  

## Problems trying to setup system/running a game

### Cannot activate venv because computer is not allowed to run scripts (Windows only)

**Problem**: Unable to activate virtual environment due to script execution restrictions.

**Solution**: Change execution policy to allow running the script that starts up the venv.

**Steps**:  

1. Type "powershell" into start menu  
2. Click "run as administrator" on right side  
3. Paste this command into terminal: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`  
4. Hit Enter (run the command), then type 'A', then hit Enter again.  

Now, close and reopen code editor, and you should be able to run the activate script to make venv.

### Cannot import "override" from module "typing"

**Problem**: Import error for "override" from "typing" module.

**Solution**: You are using a Python version older than 3.12. 

**Steps**:  

1. Delete old Python versions  
2. Install the latest Python 3.12 version  
3. Recreate the virtual environment

### Import error for module "websocket-server" or other packages

**Problem**: Unable to import "websocket-server" or other required packages.

**Solution**: Follow these fixes, one of them is most likely the problem causing this:

**Fixes**:

- Make sure you are running the client **inside an activated virtual environment**. This means starting the client from the command line with an activated venv, **NOT** by clicking on it from a file explorer.  
- With the virtual environment activated, run the Python setup script (`python setup.py` for Windows). Now, the package should be installed.  
- With the virtual environment activated, try installing the package directly by running `pip install websocket-server`.  

## Problems working with simulation + using client

### Game runs, but example_agent.py shows errors on imports only for stuff imported from aegis

**Problem**: IDE shows import errors for aegis packages, but the game runs fine.

**Solution**: The Python interpreter selected by your IDE is not recognizing the custom aegis packages. Change the interpreter to the one located in the virtual environment.

**Steps**:  

1. While editing a Python file, look in the bottom right of your IDE, and click on the spot showing the current Python interpreter.  
2. If you see a Python interpreter that points to the Python in your venv, click that. Import errors should disappear after restarting your IDE.  
3. If not, manually tell your IDE where the venv Python interpreter is:  
    1. Find the option that lets you "Enter interpreter path".  
    2. Navigate to the venv folder, then into `/Scripts/` on Windows or `/bin/` on macOS/Linux.  
    3. Select the Python executable there (`python.exe` on Windows, `python3` on macOS/Linux).  
4. Restart your IDE, and the import errors should go away.  

### Running a game gives an "AegisParserException"

**Problem**: Receiving an "AegisParserException" when running a game.

**Solution**: This is most likely caused by your agent throwing an exception during the simulation.

**Steps**: Try commenting out code until you don't see that error anymore to find the code throwing the exception.
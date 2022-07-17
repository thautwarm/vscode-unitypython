# VSCode-UnityPython

[UnityPython](https://github.com/thautwarm/Traffy.UnityPython) is a Python implementation that enables all-platform UI/game development and development time hot-reloading.

## Introduction
This extension is enabled when a `.unitypython.json` is included anywhere in a workspace folder.

Multi-root workspaces are supported, in case you need to edit Unity C# and UnityPython simultaneously.

Features:

1. Report if `unitypython` is not installed in the selected Python environment (by Microsoft Python Extension).
2. Compile Python scripts to `${unitypython.build-output-directory}`(default: `Compiled`) directory on save. Python executable in the selected environment is used.
3. Excellent Pylance Support: the bundled stub files `unitypython-typeshed` are copied to `${unitypython.build-output-directory}`(default: `unitypython-typeshed`) directory.


## Usage

1. Activate your preferred Python environment (Python >= 3.8 is a must, Python 3.10 is better), and do `pip install upycc --upgrade`
2. Install `vscode-unitypython` extension, and create a `.unitypython.json` in your workspace.
3. (for Unity users who wants to *hot reload* UnityPython) Copy `Assets/FileWatcher.cs` and `Assets/PythonHotReloader.cs` to your Unity project's `Assets` folder, and attach these two components to a top-level empty game object.

NOTE: The release is still preview, please update this extension frequently.

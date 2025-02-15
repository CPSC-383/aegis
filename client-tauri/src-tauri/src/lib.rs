use tauri::{AppHandle, State, Emitter};
use tauri_plugin_dialog::{DialogExt, FilePath };
use tauri_plugin_shell::{ShellExt, process::CommandEvent, process::CommandChild};
use std::path::{Path, PathBuf};
use std::collections::HashMap;
use std::sync::Mutex;
use std::fs::File;
use std::io::Write;

struct AppState {
    processes: Mutex<HashMap<String, CommandChild>>,
}

#[tauri::command]
async fn open_aegis_directory(app: AppHandle) -> Option<FilePath> {
    app.dialog()
        .file()
        .set_title("Select aegis directory")
        .blocking_pick_folder()
}

#[tauri::command]
fn toggle_move_cost(config_path: String, enable_move_cost: bool) -> Result<(), String> {
    let file_content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    
    let mut config: serde_json::Value = serde_json::from_str(&file_content)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;

    if let Some(enable_move_cost_value) = config.get_mut("Enable_Move_Cost") {
        *enable_move_cost_value = serde_json::Value::Bool(enable_move_cost);
    } else {
        return Err("Enable_Move_Cost field not found in the config".to_string());
    }

    let updated_config = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(&config_path, updated_config)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn get_app_path() -> String {
    std::env::current_dir().unwrap().to_str().unwrap().to_string()
}

#[tauri::command]
fn path_join(parts: Vec<String>) -> String {
    let mut path = PathBuf::new();
    for part in parts {
        path.push(part);
    }
    path.to_str().unwrap().to_string()
}

#[tauri::command]
fn path_dirname(path: String) -> String {
    Path::new(&path)
        .parent()
        .map(|p| p.to_str().unwrap_or_default())
        .unwrap_or_default()
        .to_string() 
}

#[tauri::command]
fn fs_exists_sync(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
fn fs_readdir_sync(path: String) -> Vec<String> {
    let mut entries: Vec<String> = std::fs::read_dir(path)
        .unwrap()
        .map(|entry| entry.unwrap().file_name().to_str().unwrap().to_string())
        .collect();
    
    entries.sort();
    entries
}

#[tauri::command]
fn fs_is_directory(path: String) -> bool {
    Path::new(&path).is_dir()
}

#[tauri::command]
fn fs_read_file_sync(path: String) -> String {
    match std::fs::read_to_string(&path) {
        Ok(contents) => contents,
        Err(e) => {
            format!("Error reading file: {}", e)
        }
    }
}

// TODO: Add save file dialog when game area is done.
#[tauri::command]
async fn export_world(app: AppHandle, default_path: String, content: String) {
    let path = Path::new(&default_path);
    let file_name = path.file_name().unwrap().to_str().unwrap().to_string();
    let result = app.dialog()
        .file()
        .set_title("Export World")
        .set_file_name(&file_name)
        .set_directory(default_path)
        .blocking_save_file();

    match result {
        Some(file_path) => {
            let _ = File::create(file_path.to_string()).and_then(|mut file| file.write_all(content.as_bytes()));
        },
        None => {} 
    }
}

#[tauri::command]
async fn spawn_aegis_process(
    state: State<'_, AppState>,
    app: AppHandle,
    root_path: String,
    num_of_rounds: String,
    num_of_agents: String,
    world_file: String,
) -> Result<String, String> {
    let src_path = std::path::Path::new(&root_path).join("src");
    let proc = src_path.join("aegis").join("main.py");

    let world_file_path = format!("worlds/{}", world_file);

    let proc_args = vec![
        "-NoKViewer",
        &num_of_agents,
        "-ProcFile",
        "replay.txt",
        "-WorldFile",
        &world_file_path,
        "-NumRound",
        &num_of_rounds,
        "-WaitForClient",
        "true",
    ];

    let python_exec = get_python_executable_path(&root_path);

    let handle = app.clone();
    let (mut rx, child) = handle
        .shell()
        .command(python_exec)
        .args(&[proc.to_str().unwrap()])
        .args(proc_args)
        .current_dir(&root_path)
        .env("PYTHONPATH", src_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    let pid = child.pid().to_string();

    state.processes.lock().unwrap().insert(pid.clone(), child);

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let line = String::from_utf8(line).unwrap();
                    app.emit("aegis-stdout", line)
                        .unwrap_or_else(|e| eprintln!("Failed to emit stdout: {}", e));
                }
                CommandEvent::Stderr(line) => {
                    let line = String::from_utf8(line).unwrap();
                    app.emit("aegis-stderr", line)
                        .unwrap_or_else(|e| eprintln!("Failed to emit stderr: {}", e));
                }
                CommandEvent::Terminated(_payload) => {
                    let _ = app.emit("aegis-exit", "");
                }
                _ => {}
            }
        }
    });

    Ok(pid)
}

#[tauri::command]
async fn spawn_agent_processes(
    state: State<'_, AppState>,
    app: AppHandle,
    root_path: String,
    group_name: String,
    num_of_agents_to_spawn: String,
    agent: String,
) -> Result<Vec<String>, String> {
    let src_path = std::path::Path::new(&root_path).join("src");
    let proc = src_path.join("agents").join(agent).join("main.py");
    let proc_args = vec![group_name.clone()];

    let python_exec = get_python_executable_path(&root_path);

    let mut pids = Vec::new();

    let num_of_agents_to_spawn: usize = num_of_agents_to_spawn
        .parse()
        .map_err(|e| format!("Failed to parse num_of_agents_to_spawn: {}", e))?;

    for _ in 0..num_of_agents_to_spawn {
        let handle = app.clone();
        let (mut rx, child) = handle
            .shell()
            .command(&python_exec)
            .args(&[proc.to_str().unwrap()])
            .args(&proc_args)
            .current_dir(&root_path)
            .env("PYTHONPATH", &src_path)
            .spawn()
            .map_err(|e| e.to_string())?;

        let pid = child.pid().to_string();

        state.processes.lock().unwrap().insert(pid.clone(), child);

        let app_stdout = app.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        let line = String::from_utf8(line).unwrap();
                        app_stdout
                            .emit("agent-stdout",  line)
                            .unwrap_or_else(|e| eprintln!("Failed to emit stdout: {}", e));
                    }
                    CommandEvent::Stderr(line) => {
                        let line = String::from_utf8(line).unwrap();
                        app_stdout
                            .emit("agent-stderr",  line)
                            .unwrap_or_else(|e| eprintln!("Failed to emit stderr: {}", e));
                    }
                    _ => {}
                }
            }
        });
        pids.push(pid);
    }

    Ok(pids)
}

#[tauri::command]
fn kill_process(state: tauri::State<AppState>, pid: String) -> Result<(), String> {
    if let Some(child) = state.processes.lock().unwrap().remove(&pid) {
        child.kill().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn get_python_executable_path(root_path: &str) -> String {
    let is_windows = cfg!(target_os = "windows");
    let venv_subpath = if is_windows {
        Path::new(".venv").join("Scripts").join("python")
    } else {
        Path::new(".venv").join("bin").join("python")
    };
    Path::new(root_path).join(venv_subpath).to_str().unwrap().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            processes: Mutex::new(HashMap::new()),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_aegis_directory,
            toggle_move_cost,
            get_app_path,
            path_join,
            path_dirname,
            fs_exists_sync,
            fs_readdir_sync,
            fs_is_directory,
            fs_read_file_sync,
            export_world,
            spawn_aegis_process,
            spawn_agent_processes,
            kill_process
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

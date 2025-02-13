use std::path::{Path, PathBuf};
use std::process::{Command, Child};
use std::collections::HashMap;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Config {
    enable_move_cost: bool,
}

struct AppState {
    processes: Mutex<HashMap<String, Child>>,
}

#[tauri::command]
fn open_aegis_directory() -> Option<String> {
    // TODO: Use the dialog plugin to add a file dialog box
    Some("/path/to/aegis".to_string())
}

#[tauri::command]
fn toggle_move_cost(file_path: String, enable_move_cost: bool) -> Result<(), String> {
    let file_content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let mut config: Config = serde_json::from_str(&file_content)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;

    config.enable_move_cost = enable_move_cost;

    let updated_config = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    std::fs::write(&file_path, updated_config)
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
    Path::new(&path).parent().unwrap().to_str().unwrap().to_string()
}

#[tauri::command]
fn fs_exists_sync(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
fn fs_readdir_sync(path: String) -> Vec<String> {
    std::fs::read_dir(path).unwrap().map(|entry| entry.unwrap().path().to_str().unwrap().to_string()).collect()
}

#[tauri::command]
fn fs_is_directory(path: String) -> bool {
    Path::new(&path).is_dir()
}

#[tauri::command]
fn fs_read_file_sync(path: String) -> String {
    std::fs::read_to_string(path).unwrap()
}

#[tauri::command]
fn export_world(default_path: String, content: String) {
    std::fs::write(default_path, content).unwrap();
}

#[tauri::command]
fn spawn_aegis_process(state: tauri::State<AppState>, root_path: String, num_of_rounds: String, num_of_agents: String, world_file: String) -> Result<String, String> {
    let src_path = Path::new(&root_path).join("src");
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
        "true"
    ];

    let python_exec = get_python_executable_path(&root_path);
    let child = Command::new(python_exec)
        .args(&[proc.to_str().unwrap()])
        .args(proc_args)
        .current_dir(&root_path)
        .env("PYTHONPATH", src_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    let pid = child.id().to_string();
    state.processes.lock().unwrap().insert(pid.clone(), child);

    Ok(pid)
}

#[tauri::command]
fn spawn_agent_processes(state: tauri::State<AppState>, root_path: String, group_name: String, num_of_agents_to_spawn: usize, agent: String) -> Result<Vec<String>, String> {
    let src_path = Path::new(&root_path).join("src");
    let proc = src_path.join("agents").join(agent).join("main.py");
    let proc_args = vec![group_name];

    let python_exec = get_python_executable_path(&root_path);

    let mut pids = Vec::new();
    for _ in 0..num_of_agents_to_spawn {
        let child = Command::new(&python_exec)
            .args(&[proc.to_str().unwrap()])
            .args(&proc_args)
            .current_dir(&root_path)
            .env("PYTHONPATH", &src_path)
            .spawn()
            .map_err(|e| e.to_string())?;

        let pid = child.id().to_string();
        state.processes.lock().unwrap().insert(pid.clone(), child);
        pids.push(pid);
    }

    Ok(pids)
}

#[tauri::command]
fn kill_process(state: tauri::State<AppState>, pid: String) -> Result<(), String> {
    if let Some(mut child) = state.processes.lock().unwrap().remove(&pid) {
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

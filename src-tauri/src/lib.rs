use std::fs;
use std::path::PathBuf;

#[tauri::command]
fn save_file(path: String, filename: String, content: String) -> Result<(), String> {
    let mut full_path = PathBuf::from(path);
    full_path.push(filename);

    fs::write(full_path, content).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

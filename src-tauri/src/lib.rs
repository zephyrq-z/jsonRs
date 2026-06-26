mod commands;
mod json_parser;
mod xml_parser;
mod file_reader;
mod searcher;
mod history;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            open_file_dialog,
            read_file_content,
            parse_json_shallow,
            parse_json_full,
            parse_xml,
            parse_jsonl,
            detect_format,
            search_text,
            get_file_info,
            format_json,
            add_recent_file,
            get_recent_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
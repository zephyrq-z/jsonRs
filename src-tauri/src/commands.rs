use crate::file_reader;
use crate::json_parser;
use crate::xml_parser;
use crate::searcher;
use crate::history;


/// Open a file dialog and return the selected path
#[tauri::command]
pub async fn open_file_dialog() -> Result<String, String> {
    // Return empty string - dialog is handled on frontend via tauri-plugin-dialog
    Ok(String::new())
}

/// Read file content with format detection
#[tauri::command]
pub async fn read_file_content(path: String) -> Result<file_reader::FileContent, String> {
    // 50MB limit for file reading
    file_reader::read_file_with_limit(&path, 50 * 1024 * 1024)
}

/// Shallow parse JSON (top-level only, for large files)
#[tauri::command]
pub async fn parse_json_shallow(content: String) -> Result<Vec<json_parser::JsonNode>, String> {
    json_parser::parse_shallow(&content)
}

/// Full recursive JSON parse
#[tauri::command]
pub async fn parse_json_full(content: String) -> Result<Vec<json_parser::JsonNode>, String> {
    json_parser::parse_full(&content)
}

/// Parse XML content
#[tauri::command]
pub async fn parse_xml(content: String) -> Result<Vec<xml_parser::XmlElement>, String> {
    xml_parser::parse_xml(&content)
}

/// Parse JSONL content — returns each line with parsed JSON or error
#[tauri::command]
pub async fn parse_jsonl(content: String) -> Result<Vec<serde_json::Value>, String> {
    let mut results = Vec::new();
    for (_, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        match serde_json::from_str::<serde_json::Value>(trimmed) {
            Ok(v) => results.push(v),
            Err(e) => {
                results.push(serde_json::json!({
                    "_error": format!("{}", e),
                    "_raw": trimmed.chars().take(200).collect::<String>(),
                }));
            }
        }
    }
    Ok(results)
}

/// Detect file format from path and content
#[tauri::command]
pub async fn detect_format(path: String, content: Option<String>) -> Result<String, String> {
    let path_format = file_reader::detect_format_from_path(&path);
    if path_format != "text" {
        return Ok(path_format);
    }
    if let Some(c) = content {
        return Ok(file_reader::detect_format_from_content(&c));
    }
    Ok("text".to_string())
}

/// Search text content
#[tauri::command]
pub async fn search_text(
    content: String,
    query: String,
    case_sensitive: bool,
    use_regex: bool,
    whole_word: bool,
) -> Result<Vec<searcher::SearchResult>, String> {
    let options = searcher::SearchOptions {
        query,
        case_sensitive,
        use_regex,
        whole_word,
    };
    searcher::search_text(&content, &options)
}

/// Get file metadata
#[tauri::command]
pub async fn get_file_info(path: String) -> Result<file_reader::FileInfo, String> {
    file_reader::get_file_info(&path)
}

/// Format JSON content (pretty-print or minify)
#[tauri::command]
pub async fn format_json(content: String, mode: String) -> Result<String, String> {
    let value: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    match mode.as_str() {
        "pretty" => serde_json::to_string_pretty(&value)
            .map_err(|e| format!("Format error: {}", e)),
        "minify" => serde_json::to_string(&value)
            .map_err(|e| format!("Format error: {}", e)),
        _ => Err(format!("Unknown format mode: {}", mode)),
    }
}

/// Add a file to recent history
#[tauri::command]
pub fn add_recent_file(path: String, name: String, format: String) {
    history::add_recent(&path, &name, &format);
}

/// Get recent files
#[tauri::command]
pub fn get_recent_files() -> Vec<history::RecentFile> {
    history::get_recent()
}
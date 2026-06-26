use serde::{Deserialize, Serialize};
use std::io::Read;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub format: String,
    pub last_modified: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileContent {
    pub content: String,
    pub format: String,
    pub size: u64,
    pub line_count: usize,
    pub truncated: bool,
}

/// Detect file format based on extension and content analysis
pub fn detect_format_from_path(path: &str) -> String {
    let ext = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "jsonl" => "jsonl".to_string(),
        "json" | "geojson" | "json5" => "json".to_string(),
        "xml" | "svg" | "xsl" | "xslt" | "xsd" | "wsdl" | "html" | "htm" => "xml".to_string(),
        _ => "text".to_string(),
    }
}

/// Detect format by analyzing content
pub fn detect_format_from_content(content: &str) -> String {
    let trimmed = content.trim();
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        if serde_json::from_str::<serde_json::Value>(trimmed).is_ok() {
            return "json".to_string();
        }
    }
    if trimmed.starts_with("<?xml") || trimmed.starts_with('<') {
        return "xml".to_string();
    }
    "text".to_string()
}
/// Read file with size limit using streaming read (only reads up to max_bytes).
/// For .jsonl files, format is forced to "jsonl" to avoid content-based JSON detection.
pub fn read_file_with_limit(path: &str, max_bytes: usize) -> Result<FileContent, String> {
    let file = std::fs::File::open(path)
        .map_err(|e| format!("Failed to open file: {}", e))?;

    let metadata = file
        .metadata()
        .map_err(|e| format!("Failed to read metadata: {}", e))?;

    let total_size = metadata.len() as u64;

    // Stream read: only read up to max_bytes + 1 (to detect truncation)
    let mut reader = file.take((max_bytes + 1) as u64);
    let mut buffer = String::new();
    reader
        .read_to_string(&mut buffer)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let truncated = buffer.len() > max_bytes;
    if truncated {
        buffer.truncate(max_bytes);
    }

    let line_count = buffer.lines().count();
    let format = detect_format_from_path(path);
    // For non-jsonl files, fall back to content-based detection
    let format = if format == "jsonl" {
        format
    } else {
        detect_format_from_content(&buffer)
    };

    Ok(FileContent {
        content: buffer,
        format,
        size: total_size,
        line_count,
        truncated,
    })
}

/// Get file metadata
pub fn get_file_info(path: &str) -> Result<FileInfo, String> {
    let metadata = std::fs::metadata(path)
        .map_err(|e| format!("Failed to get file info: {}", e))?;

    let name = Path::new(path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let format = detect_format_from_path(path);

    let last_modified = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);

    Ok(FileInfo {
        path: path.to_string(),
        name,
        size: metadata.len(),
        format,
        last_modified,
    })
}
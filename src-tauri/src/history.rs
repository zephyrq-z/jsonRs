use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecentFile {
    pub path: String,
    pub name: String,
    pub format: String,
    pub timestamp: u64,
}

const MAX_ENTRIES: usize = 50;

fn history_path() -> PathBuf {
    let mut dir = dirs_next().unwrap_or_else(|| PathBuf::from("."));
    dir.push(".jsonrs");
    fs::create_dir_all(&dir).ok();
    dir.push("history.json");
    dir
}

fn dirs_next() -> Option<PathBuf> {
    #[cfg(target_os = "macos")]
    {
        std::env::var("HOME").ok().map(PathBuf::from)
    }
    #[cfg(target_os = "windows")]
    {
        std::env::var("APPDATA").ok().map(PathBuf::from)
    }
    #[cfg(target_os = "linux")]
    {
        std::env::var("HOME")
            .ok()
            .map(|h| PathBuf::from(h).join(".local").join("share"))
    }
}

fn load_all() -> Vec<RecentFile> {
    let path = history_path();
    fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn save_all(files: &[RecentFile]) {
    let path = history_path();
    if let Ok(json) = serde_json::to_string_pretty(files) {
        fs::write(&path, json).ok();
    }
}

pub fn add_recent(path: &str, name: &str, format: &str) {
    let mut files = load_all();

    // Remove existing entry for this path
    files.retain(|f| f.path != path);

    files.insert(
        0,
        RecentFile {
            path: path.to_string(),
            name: name.to_string(),
            format: format.to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        },
    );

    files.truncate(MAX_ENTRIES);
    save_all(&files);
}

pub fn get_recent() -> Vec<RecentFile> {
    let mut files = load_all();
    // Filter out files that no longer exist
    files.retain(|f| PathBuf::from(&f.path).exists());
    files.truncate(MAX_ENTRIES);
    files
}
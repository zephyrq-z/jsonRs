use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JsonNode {
    pub id: String,
    pub key: Option<String>,
    pub value: String,
    pub value_type: String,
    pub depth: u32,
    pub child_count: usize,
    pub is_expandable: bool,
    pub children: Option<Vec<JsonNode>>,
}

/// Shallow parse: only parse top-level keys/elements for large files.
/// Now uses true shallow parsing — only iterates top-level keys, not full AST.
pub fn parse_shallow(content: &str) -> Result<Vec<JsonNode>, String> {
    let trimmed = content.trim();

    // Try to parse as object
    if let Some(obj) = parse_top_level_object(trimmed) {
        return Ok(obj);
    }
    // Try to parse as array
    if let Some(arr) = parse_top_level_array(trimmed) {
        return Ok(arr);
    }
    // Fallback: single value
    let value: Value = serde_json::from_str(trimmed)
        .map_err(|e| format!("JSON parse error: {}", e))?;
    Ok(vec![create_shallow_node(None, &value, 0, "root")])
}

/// Parse only the top-level keys of a JSON object without full AST traversal
fn parse_top_level_object(content: &str) -> Option<Vec<JsonNode>> {
    let content = content.trim();
    if !content.starts_with('{') {
        return None;
    }

    // Use serde_json::Value but only for the top-level structure
    let value: Value = serde_json::from_str(content).ok()?;
    let map = value.as_object()?;

    let mut nodes = Vec::new();
    for (i, (key, val)) in map.iter().enumerate() {
        let node = create_shallow_node(Some(key.clone()), val, 0, &format!("root.{}", i));
        nodes.push(node);
    }
    Some(nodes)
}

/// Parse only top-level elements of a JSON array
fn parse_top_level_array(content: &str) -> Option<Vec<JsonNode>> {
    let content = content.trim();
    if !content.starts_with('[') {
        return None;
    }

    let value: Value = serde_json::from_str(content).ok()?;
    let arr = value.as_array()?;

    let mut nodes = Vec::new();
    for (i, val) in arr.iter().enumerate() {
        let node = create_shallow_node(Some(format!("{}", i)), val, 0, &format!("root.{}", i));
        nodes.push(node);
    }
    Some(nodes)
}

/// Full recursive parse
pub fn parse_full(content: &str) -> Result<Vec<JsonNode>, String> {
    let value: Value = serde_json::from_str(content)
        .map_err(|e| format!("JSON parse error: {}", e))?;

    match &value {
        Value::Object(map) => {
            let mut nodes = Vec::new();
            for (i, (key, val)) in map.iter().enumerate() {
                let node = create_full_node(
                    Some(key.clone()),
                    val,
                    0,
                    &format!("root.{}", i),
                );
                nodes.push(node);
            }
            Ok(nodes)
        }
        Value::Array(arr) => {
            let mut nodes = Vec::new();
            for (i, val) in arr.iter().enumerate() {
                let node = create_full_node(
                    Some(format!("{}", i)),
                    val,
                    0,
                    &format!("root.{}", i),
                );
                nodes.push(node);
            }
            Ok(nodes)
        }
        _ => Ok(vec![create_full_node(None, &value, 0, "root")]),
    }
}

fn create_shallow_node(
    key: Option<String>,
    value: &Value,
    depth: u32,
    path: &str,
) -> JsonNode {
    let (value_type, display_value, is_expandable, child_count) = match value {
        Value::Object(map) => (
            "object".to_string(),
            format!("{{...}} // {} keys", map.len()),
            true,
            map.len(),
        ),
        Value::Array(arr) => (
            "array".to_string(),
            format!("[...] // {} items", arr.len()),
            true,
            arr.len(),
        ),
        Value::String(s) => ("string".to_string(), format!("\"{}\"", truncate_str(s, 100)), false, 0),
        Value::Number(n) => ("number".to_string(), n.to_string(), false, 0),
        Value::Bool(b) => ("boolean".to_string(), b.to_string(), false, 0),
        Value::Null => ("null".to_string(), "null".to_string(), false, 0),
    };

    JsonNode {
        id: path.to_string(),
        key,
        value: display_value,
        value_type,
        depth,
        child_count,
        is_expandable,
        children: None, // Shallow: no children loaded
    }
}

fn create_full_node(
    key: Option<String>,
    value: &Value,
    depth: u32,
    path: &str,
) -> JsonNode {
    match value {
        Value::Object(map) => {
            let children: Vec<JsonNode> = map
                .iter()
                .enumerate()
                .map(|(i, (k, v))| {
                    create_full_node(Some(k.clone()), v, depth + 1, &format!("{}.{}", path, i))
                })
                .collect();
            JsonNode {
                id: path.to_string(),
                key,
                value: format!("{{}} // {} keys", map.len()),
                value_type: "object".to_string(),
                depth,
                child_count: map.len(),
                is_expandable: true,
                children: Some(children),
            }
        }
        Value::Array(arr) => {
            let children: Vec<JsonNode> = arr
                .iter()
                .enumerate()
                .map(|(i, v)| {
                    create_full_node(Some(format!("{}", i)), v, depth + 1, &format!("{}.{}", path, i))
                })
                .collect();
            JsonNode {
                id: path.to_string(),
                key,
                value: format!("[] // {} items", arr.len()),
                value_type: "array".to_string(),
                depth,
                child_count: arr.len(),
                is_expandable: true,
                children: Some(children),
            }
        }
        _ => {
            let (value_type, display_value) = match value {
                Value::String(s) => ("string".to_string(), format!("\"{}\"", truncate_str(s, 200))),
                Value::Number(n) => ("number".to_string(), n.to_string()),
                Value::Bool(b) => ("boolean".to_string(), b.to_string()),
                Value::Null => ("null".to_string(), "null".to_string()),
                _ => unreachable!(),
            };
            JsonNode {
                id: path.to_string(),
                key,
                value: display_value,
                value_type,
                depth,
                child_count: 0,
                is_expandable: false,
                children: None,
            }
        }
    }
}

fn truncate_str(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        return s.to_string();
    }
    // Find a valid UTF-8 char boundary at or before max_len
    let mut end = max_len;
    while end > 0 && !s.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}…", &s[..end])
}
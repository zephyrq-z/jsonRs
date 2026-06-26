use serde::{Deserialize, Serialize};
use quick_xml::Reader;
use quick_xml::events::Event;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct XmlElement {
    pub id: String,
    pub node_type: String,
    pub tag: String,
    pub attributes: HashMap<String, String>,
    pub children: Vec<XmlElement>,
    pub text: Option<String>,
    pub depth: u32,
    pub is_expandable: bool,
}

pub fn parse_xml(content: &str) -> Result<Vec<XmlElement>, String> {
    let mut reader = Reader::from_str(content);
    reader.config_mut().trim_text(true);

    let mut elements: Vec<XmlElement> = Vec::new();
    let mut stack: Vec<XmlElement> = Vec::new();
    let mut counter: u32 = 0;
    let mut depth: u32 = 0;

    loop {
        match reader.read_event() {
            Ok(Event::Start(ref e)) => {
                counter += 1;
                let tag = String::from_utf8_lossy(e.name().as_ref()).to_string();
                let mut attrs = HashMap::new();
                for attr in e.attributes() {
                    if let Ok(a) = attr {
                        let key = String::from_utf8_lossy(a.key.as_ref()).to_string();
                        let val = String::from_utf8_lossy(&a.value).to_string();
                        attrs.insert(key, val);
                    }
                }

                let elem = XmlElement {
                    id: format!("xml_{}", counter),
                    node_type: "element".to_string(),
                    tag: tag.clone(),
                    attributes: attrs,
                    children: Vec::new(),
                    text: None,
                    depth,
                    is_expandable: true,
                };

                stack.push(elem);
                depth += 1;
            }
            Ok(Event::End(_)) => {
                depth = depth.saturating_sub(1);
                if let Some(elem) = stack.pop() {
                    if let Some(parent) = stack.last_mut() {
                        parent.children.push(elem);
                    } else {
                        elements.push(elem);
                    }
                }
            }
            Ok(Event::Empty(ref e)) => {
                counter += 1;
                let tag = String::from_utf8_lossy(e.name().as_ref()).to_string();
                let mut attrs = HashMap::new();
                for attr in e.attributes() {
                    if let Ok(a) = attr {
                        let key = String::from_utf8_lossy(a.key.as_ref()).to_string();
                        let val = String::from_utf8_lossy(&a.value).to_string();
                        attrs.insert(key, val);
                    }
                }

                let elem = XmlElement {
                    id: format!("xml_{}", counter),
                    node_type: "element".to_string(),
                    tag,
                    attributes: attrs,
                    children: Vec::new(),
                    text: None,
                    depth,
                    is_expandable: false,
                };

                if let Some(parent) = stack.last_mut() {
                    parent.children.push(elem);
                } else {
                    elements.push(elem);
                }
            }
            Ok(Event::Text(ref e)) => {
                let text = String::from_utf8_lossy(e.as_ref()).to_string();
                if !text.trim().is_empty() {
                    if let Some(parent) = stack.last_mut() {
                        parent.text = Some(text);
                        parent.is_expandable = !parent.children.is_empty();
                    }
                }
            }
            Ok(Event::CData(ref e)) => {
                counter += 1;
                let text = String::from_utf8_lossy(e.as_ref()).to_string();
                let elem = XmlElement {
                    id: format!("xml_{}", counter),
                    node_type: "cdata".to_string(),
                    tag: "CDATA".to_string(),
                    attributes: HashMap::new(),
                    children: Vec::new(),
                    text: Some(text),
                    depth,
                    is_expandable: false,
                };

                if let Some(parent) = stack.last_mut() {
                    parent.children.push(elem);
                } else {
                    elements.push(elem);
                }
            }
            Ok(Event::Comment(ref e)) => {
                counter += 1;
                let text = String::from_utf8_lossy(e.as_ref()).to_string();
                let elem = XmlElement {
                    id: format!("xml_{}", counter),
                    node_type: "comment".to_string(),
                    tag: "comment".to_string(),
                    attributes: HashMap::new(),
                    children: Vec::new(),
                    text: Some(text),
                    depth,
                    is_expandable: false,
                };

                if let Some(parent) = stack.last_mut() {
                    parent.children.push(elem);
                } else {
                    elements.push(elem);
                }
            }
            Ok(Event::Decl(ref e)) => {
                counter += 1;
                let mut attrs = HashMap::new();
                if let Ok(version) = e.version() {
                    attrs.insert("version".to_string(), String::from_utf8_lossy(&version).to_string());
                }
                if let Some(Ok(encoding)) = e.encoding() {
                    attrs.insert("encoding".to_string(), String::from_utf8_lossy(&encoding).to_string());
                }
                let elem = XmlElement {
                    id: format!("xml_{}", counter),
                    node_type: "declaration".to_string(),
                    tag: "xml".to_string(),
                    attributes: attrs,
                    children: Vec::new(),
                    text: None,
                    depth: 0,
                    is_expandable: false,
                };
                elements.push(elem);
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(format!("XML parse error: {}", e)),
            _ => {}
        }
    }

    Ok(elements)
}

use serde::{Deserialize, Serialize};
use regex::RegexBuilder;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub line: usize,
    pub column: usize,
    pub context: String,
    pub match_start: usize,
    pub match_end: usize,
}

#[derive(Debug, Deserialize)]
pub struct SearchOptions {
    pub query: String,
    pub case_sensitive: bool,
    pub use_regex: bool,
    pub whole_word: bool,
}

pub fn search_text(content: &str, options: &SearchOptions) -> Result<Vec<SearchResult>, String> {
    if options.query.is_empty() {
        return Ok(Vec::new());
    }

    let pattern = if options.use_regex {
        options.query.clone()
    } else {
        regex::escape(&options.query)
    };

    let pattern = if options.whole_word {
        format!(r"\b{}\b", pattern)
    } else {
        pattern
    };

    let re = RegexBuilder::new(&pattern)
        .case_insensitive(!options.case_sensitive)
        .build()
        .map_err(|e| format!("Invalid regex: {}", e))?;

    let mut results = Vec::new();
    let lines: Vec<&str> = content.lines().collect();

    for (line_idx, line) in lines.iter().enumerate() {
        for mat in re.find_iter(line) {
            results.push(SearchResult {
                line: line_idx + 1,
                column: mat.start() + 1,
                context: line.to_string(),
                match_start: mat.start(),
                match_end: mat.end(),
            });
        }
    }

    // Limit results to prevent UI freeze
    if results.len() > 10000 {
        results.truncate(10000);
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_search() {
        let content = "hello world\nhello rust\nfoo bar";
        let opts = SearchOptions {
            query: "hello".to_string(),
            case_sensitive: false,
            use_regex: false,
            whole_word: false,
        };
        let results = search_text(content, &opts).unwrap();
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].line, 1);
        assert_eq!(results[1].line, 2);
    }

    #[test]
    fn test_case_sensitive() {
        let content = "Hello world\nhello rust";
        let opts = SearchOptions {
            query: "Hello".to_string(),
            case_sensitive: true,
            use_regex: false,
            whole_word: false,
        };
        let results = search_text(content, &opts).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].line, 1);
    }

    #[test]
    fn test_case_insensitive() {
        let content = "Hello world\nhello rust";
        let opts = SearchOptions {
            query: "hello".to_string(),
            case_sensitive: false,
            use_regex: false,
            whole_word: false,
        };
        let results = search_text(content, &opts).unwrap();
        assert_eq!(results.len(), 2);
    }

    #[test]
    fn test_whole_word() {
        let content = "test testing test";
        let opts = SearchOptions {
            query: "test".to_string(),
            case_sensitive: false,
            use_regex: false,
            whole_word: true,
        };
        let results = search_text(content, &opts).unwrap();
        assert_eq!(results.len(), 2); // "test" and "test", not "testing"
    }

    #[test]
    fn test_regex() {
        let content = "foo123\nbar456\nfoo789";
        let opts = SearchOptions {
            query: r"\d+".to_string(),
            case_sensitive: false,
            use_regex: true,
            whole_word: false,
        };
        let results = search_text(content, &opts).unwrap();
        assert_eq!(results.len(), 3);
    }

    #[test]
    fn test_empty_query() {
        let content = "hello world";
        let opts = SearchOptions {
            query: "".to_string(),
            case_sensitive: false,
            use_regex: false,
            whole_word: false,
        };
        let results = search_text(content, &opts).unwrap();
        assert!(results.is_empty());
    }

    #[test]
    fn test_no_results() {
        let content = "foo bar baz";
        let opts = SearchOptions {
            query: "hello".to_string(),
            case_sensitive: false,
            use_regex: false,
            whole_word: false,
        };
        let results = search_text(content, &opts).unwrap();
        assert!(results.is_empty());
    }
}
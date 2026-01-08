//! Static Site Generation for Ox Content.
//!
//! This crate provides HTML page generation for documentation sites,
//! including navigation, table of contents, search functionality,
//! and theming support.
//!
//! # Features
//!
//! - Full HTML page generation with responsive layout
//! - Navigation sidebar with grouping
//! - Table of contents generation
//! - Client-side search integration
//! - Dark/light theme support
//! - Mobile-friendly responsive design
//!
//! # Example
//!
//! ```ignore
//! use ox_content_ssg::{generate_html, PageData, NavGroup, NavItem, SsgConfig, TocEntry};
//!
//! let page_data = PageData {
//!     title: "Getting Started".to_string(),
//!     description: Some("Learn how to use ox-content".to_string()),
//!     content: "<h1>Getting Started</h1><p>Welcome!</p>".to_string(),
//!     toc: vec![TocEntry { depth: 1, text: "Getting Started".to_string(), slug: "getting-started".to_string() }],
//!     path: "getting-started".to_string(),
//! };
//!
//! let nav_groups = vec![NavGroup {
//!     title: "Guide".to_string(),
//!     items: vec![NavItem {
//!         title: "Getting Started".to_string(),
//!         path: "getting-started".to_string(),
//!         href: "/docs/getting-started/index.html".to_string(),
//!     }],
//! }];
//!
//! let config = SsgConfig {
//!     site_name: "My Docs".to_string(),
//!     base: "/docs/".to_string(),
//!     og_image: None,
//! };
//!
//! let html = generate_html(&page_data, &nav_groups, &config);
//! ```

mod html;

pub use html::{generate_html, NavGroup, NavItem, PageData, SsgConfig, TocEntry};

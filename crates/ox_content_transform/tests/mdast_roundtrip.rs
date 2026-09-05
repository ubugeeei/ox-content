use ox_content_transform::TransformOptions;
use ox_content_transform::transformer::MarkdownTransformer;

#[test]
fn source_spans_do_not_emit_empty_mdast_round_trip_spans() {
    let transformer = MarkdownTransformer::from_options(&TransformOptions {
        source_spans: Some(true),
        ..Default::default()
    });
    let result = transformer.transform_from_mdast_json(
        r#"{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"Hello"}]}]}"#,
        "{}",
    );

    assert_eq!(result.html, "<p>Hello</p>\n");
    assert!(!result.html.contains("data-source-span=\"0-0\""));
}

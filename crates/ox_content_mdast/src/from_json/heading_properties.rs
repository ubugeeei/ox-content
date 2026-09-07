use ox_content_allocator::{Allocator, Vec as ArenaVec};
use serde_json::Value;

pub(super) fn heading_id<'a>(allocator: &'a Allocator, value: &Value) -> Option<&'a str> {
    heading_h_properties(value)
        .and_then(|properties| properties.get("id"))
        .and_then(Value::as_str)
        .map(|id| allocator.alloc_str(id))
}

pub(super) fn heading_classes<'a>(
    allocator: &'a Allocator,
    value: &Value,
) -> ArenaVec<'a, &'a str> {
    let mut classes = allocator.new_vec();
    let Some(class_name) =
        heading_h_properties(value).and_then(|properties| properties.get("className"))
    else {
        return classes;
    };

    if let Some(class_name) = class_name.as_str() {
        for item in class_name.split_whitespace() {
            classes.push(allocator.alloc_str(item));
        }
        return classes;
    }

    let Some(items) = class_name.as_array() else {
        return classes;
    };
    for item in items {
        if let Some(class_name) = item.as_str() {
            classes.push(allocator.alloc_str(class_name));
        }
    }
    classes
}

fn heading_h_properties(value: &Value) -> Option<&serde_json::Map<String, Value>> {
    value.get("data").and_then(Value::as_object)?.get("hProperties").and_then(Value::as_object)
}

import { describe, expect, it } from "vite-plus/test";
import { deserializeMdastFromRaw } from "./mdast-raw";

const MAGIC = 0x3152444d;
const VERSION = 1;
const HEADER_LEN = 28;
const NODE_RECORD_LEN = 60;
const NONE_U32 = 0xffffffff;

function createMdxBuffer(
  attributesJson = JSON.stringify([
    { type: "mdxJsxAttribute", name: "title", value: "Hi" },
    {
      type: "mdxJsxAttribute",
      name: "count",
      value: { type: "mdxJsxAttributeValueExpression", value: "count" },
    },
    { type: "mdxJsxExpressionAttribute", value: "...props" },
  ]),
): Uint8Array {
  const encoder = new TextEncoder();
  const strings = [
    "import Alert from './Alert'",
    "count",
    "name",
    "Hello ",
    "Badge",
    "[]",
    "Alert",
    attributesJson,
  ];
  const stringOffsets = new Map<string, [number, number]>();
  let stringBytesLength = 0;
  for (const value of strings) {
    const bytes = encoder.encode(value);
    stringOffsets.set(value, [stringBytesLength, bytes.length]);
    stringBytesLength += bytes.length;
  }

  const nodeCount = 8;
  const childIndices = [3, 4, 2, 5, 0, 1, 6];
  const nodesOffset = HEADER_LEN;
  const childIndicesOffset = nodesOffset + nodeCount * NODE_RECORD_LEN;
  const stringsOffset = childIndicesOffset + childIndices.length * 4;
  const buffer = new Uint8Array(stringsOffset + stringBytesLength);
  const view = new DataView(buffer.buffer);

  const stringRange = (value?: string): [number, number] =>
    value === undefined ? [NONE_U32, 0] : stringOffsets.get(value)!;
  const writeNode = (
    index: number,
    kind: number,
    childStart = 0,
    childLen = 0,
    str0?: string,
    str1?: string,
  ) => {
    const base = nodesOffset + index * NODE_RECORD_LEN;
    const [str0Offset, str0Len] = stringRange(str0);
    const [str1Offset, str1Len] = stringRange(str1);
    view.setUint8(base, kind);
    view.setUint8(base + 1, 0);
    view.setUint16(base + 2, 0, true);
    view.setUint32(base + 4, 0, true);
    view.setUint32(base + 8, 0, true);
    view.setUint32(base + 12, childStart, true);
    view.setUint32(base + 16, childLen, true);
    view.setUint32(base + 20, 0, true);
    view.setUint32(base + 24, 0, true);
    view.setUint32(base + 28, str0Offset, true);
    view.setUint32(base + 32, str0Len, true);
    view.setUint32(base + 36, str1Offset, true);
    view.setUint32(base + 40, str1Len, true);
    view.setUint32(base + 44, NONE_U32, true);
    view.setUint32(base + 48, 0, true);
    view.setUint32(base + 52, NONE_U32, true);
    view.setUint32(base + 56, 0, true);
  };

  view.setUint32(0, MAGIC, true);
  view.setUint32(4, VERSION, true);
  view.setUint32(8, nodeCount, true);
  view.setUint32(12, childIndices.length, true);
  view.setUint32(16, 0, true);
  view.setUint32(20, stringBytesLength, true);
  view.setUint32(24, 7, true);

  writeNode(0, 25, 0, 0, "import Alert from './Alert'");
  writeNode(1, 26, 0, 0, "count");
  writeNode(2, 27, 0, 0, "name");
  writeNode(3, 12, 0, 0, "Hello ");
  writeNode(4, 24, 0, 0, "Badge", "[]");
  writeNode(5, 1, 0, 3);
  writeNode(6, 23, 3, 1, "Alert", attributesJson);
  writeNode(7, 0, 4, 3);

  childIndices.forEach((child, index) => {
    view.setUint32(childIndicesOffset + index * 4, child, true);
  });
  for (const value of strings) {
    const [offset] = stringOffsets.get(value)!;
    buffer.set(encoder.encode(value), stringsOffset + offset);
  }
  return buffer;
}

function createExtensionBuffer(): Uint8Array {
  const encoder = new TextEncoder();
  const strings = ["Term", "H", "2", "O, ", "E=mc^2", ", and ", "n", "x^2"];
  const stringOffsets = new Map<string, [number, number]>();
  let stringBytesLength = 0;
  for (const value of strings) {
    const bytes = encoder.encode(value);
    stringOffsets.set(value, [stringBytesLength, bytes.length]);
    stringBytesLength += bytes.length;
  }

  const nodeCount = 15;
  const childIndices = [0, 4, 8, 2, 3, 5, 6, 7, 9, 10, 1, 11, 12, 13];
  const nodesOffset = HEADER_LEN;
  const childIndicesOffset = nodesOffset + nodeCount * NODE_RECORD_LEN;
  const stringsOffset = childIndicesOffset + childIndices.length * 4;
  const buffer = new Uint8Array(stringsOffset + stringBytesLength);
  const view = new DataView(buffer.buffer);

  const stringRange = (value?: string): [number, number] =>
    value === undefined ? [NONE_U32, 0] : stringOffsets.get(value)!;
  const writeNode = (index: number, kind: number, childStart = 0, childLen = 0, str0?: string) => {
    const base = nodesOffset + index * NODE_RECORD_LEN;
    const [str0Offset, str0Len] = stringRange(str0);
    view.setUint8(base, kind);
    view.setUint8(base + 1, 0);
    view.setUint16(base + 2, 0, true);
    view.setUint32(base + 4, 0, true);
    view.setUint32(base + 8, 0, true);
    view.setUint32(base + 12, childStart, true);
    view.setUint32(base + 16, childLen, true);
    view.setUint32(base + 20, 0, true);
    view.setUint32(base + 24, 0, true);
    view.setUint32(base + 28, str0Offset, true);
    view.setUint32(base + 32, str0Len, true);
    view.setUint32(base + 36, NONE_U32, true);
    view.setUint32(base + 40, 0, true);
    view.setUint32(base + 44, NONE_U32, true);
    view.setUint32(base + 48, 0, true);
    view.setUint32(base + 52, NONE_U32, true);
    view.setUint32(base + 56, 0, true);
  };

  view.setUint32(0, MAGIC, true);
  view.setUint32(4, VERSION, true);
  view.setUint32(8, nodeCount, true);
  view.setUint32(12, childIndices.length, true);
  view.setUint32(16, 0, true);
  view.setUint32(20, stringBytesLength, true);
  view.setUint32(24, 14, true);

  writeNode(0, 12, 0, 0, "Term");
  writeNode(1, 31, 0, 1);
  writeNode(2, 12, 0, 0, "H");
  writeNode(3, 34, 1, 1);
  writeNode(4, 12, 0, 0, "2");
  writeNode(5, 12, 0, 0, "O, ");
  writeNode(6, 29, 0, 0, "E=mc^2");
  writeNode(7, 12, 0, 0, ", and ");
  writeNode(8, 12, 0, 0, "n");
  writeNode(9, 33, 2, 1);
  writeNode(10, 1, 3, 6);
  writeNode(11, 32, 9, 1);
  writeNode(12, 30, 10, 2);
  writeNode(13, 28, 0, 0, "x^2");
  writeNode(14, 0, 12, 2);

  childIndices.forEach((child, index) => {
    view.setUint32(childIndicesOffset + index * 4, child, true);
  });
  for (const value of strings) {
    const [offset] = stringOffsets.get(value)!;
    buffer.set(encoder.encode(value), stringsOffset + offset);
  }
  return buffer;
}

function createHeadingAttributeBuffer(): Uint8Array {
  const encoder = new TextEncoder();
  const strings = ["Custom identifier", "custom-heading-id", "highlight wide"];
  const stringOffsets = new Map<string, [number, number]>();
  let stringBytesLength = 0;
  for (const value of strings) {
    const bytes = encoder.encode(value);
    stringOffsets.set(value, [stringBytesLength, bytes.length]);
    stringBytesLength += bytes.length;
  }

  const nodeCount = 3;
  const childIndices = [0, 1];
  const nodesOffset = HEADER_LEN;
  const childIndicesOffset = nodesOffset + nodeCount * NODE_RECORD_LEN;
  const stringsOffset = childIndicesOffset + childIndices.length * 4;
  const buffer = new Uint8Array(stringsOffset + stringBytesLength);
  const view = new DataView(buffer.buffer);
  const stringRange = (value?: string): [number, number] =>
    value === undefined ? [NONE_U32, 0] : stringOffsets.get(value)!;
  const writeNode = (
    index: number,
    kind: number,
    childStart = 0,
    childLen = 0,
    num0 = 0,
    str0?: string,
    str1?: string,
  ) => {
    const base = nodesOffset + index * NODE_RECORD_LEN;
    const [str0Offset, str0Len] = stringRange(str0);
    const [str1Offset, str1Len] = stringRange(str1);
    view.setUint8(base, kind);
    view.setUint8(base + 1, 0);
    view.setUint16(base + 2, 0, true);
    view.setUint32(base + 4, 0, true);
    view.setUint32(base + 8, 0, true);
    view.setUint32(base + 12, childStart, true);
    view.setUint32(base + 16, childLen, true);
    view.setUint32(base + 20, num0, true);
    view.setUint32(base + 24, 0, true);
    view.setUint32(base + 28, str0Offset, true);
    view.setUint32(base + 32, str0Len, true);
    view.setUint32(base + 36, str1Offset, true);
    view.setUint32(base + 40, str1Len, true);
    view.setUint32(base + 44, NONE_U32, true);
    view.setUint32(base + 48, 0, true);
    view.setUint32(base + 52, NONE_U32, true);
    view.setUint32(base + 56, 0, true);
  };

  view.setUint32(0, MAGIC, true);
  view.setUint32(4, VERSION, true);
  view.setUint32(8, nodeCount, true);
  view.setUint32(12, childIndices.length, true);
  view.setUint32(16, 0, true);
  view.setUint32(20, stringBytesLength, true);
  view.setUint32(24, 2, true);

  writeNode(0, 12, 0, 0, 0, "Custom identifier");
  writeNode(1, 2, 0, 1, 2, "custom-heading-id", "highlight wide");
  writeNode(2, 0, 1, 1);

  childIndices.forEach((child, index) => {
    view.setUint32(childIndicesOffset + index * 4, child, true);
  });
  for (const value of strings) {
    const [offset] = stringOffsets.get(value)!;
    buffer.set(encoder.encode(value), stringsOffset + offset);
  }
  return buffer;
}

describe("MDX raw mdast transfer", () => {
  it("decodes JSX, ESM, expressions, attributes, and children", () => {
    const root = deserializeMdastFromRaw(createMdxBuffer(), "");

    expect(root.children[0]).toMatchObject({
      type: "mdxjsEsm",
      value: "import Alert from './Alert'",
    });
    expect(root.children[1]).toMatchObject({ type: "mdxFlowExpression", value: "count" });
    expect(root.children[2]).toMatchObject({
      type: "mdxJsxFlowElement",
      name: "Alert",
      attributes: [
        { type: "mdxJsxAttribute", name: "title", value: "Hi" },
        {
          type: "mdxJsxAttribute",
          name: "count",
          value: { type: "mdxJsxAttributeValueExpression", value: "count" },
        },
        { type: "mdxJsxExpressionAttribute", value: "...props" },
      ],
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Hello " },
            { type: "mdxJsxTextElement", name: "Badge", attributes: [], children: [] },
            { type: "mdxTextExpression", value: "name" },
          ],
        },
      ],
    });
  });

  it("rejects malformed attribute payloads", () => {
    expect(() => deserializeMdastFromRaw(createMdxBuffer("{}"), "")).toThrow(
      "invalid MDX attributes",
    );
  });

  it("decodes append-only markdown extension kinds", () => {
    const root = deserializeMdastFromRaw(createExtensionBuffer(), "");

    expect(root.children[0]).toMatchObject({
      type: "definitionList",
      children: [
        { type: "definitionTerm", children: [{ type: "text", value: "Term" }] },
        {
          type: "definitionDescription",
          children: [
            {
              type: "paragraph",
              children: [
                { type: "text", value: "H" },
                { type: "subscript", children: [{ type: "text", value: "2" }] },
                { type: "text", value: "O, " },
                { type: "inlineMath", value: "E=mc^2" },
                { type: "text", value: ", and " },
                { type: "superscript", children: [{ type: "text", value: "n" }] },
              ],
            },
          ],
        },
      ],
    });
    expect(root.children[1]).toMatchObject({ type: "math", value: "x^2" });
  });

  it("decodes heading attributes as hProperties", () => {
    const root = deserializeMdastFromRaw(createHeadingAttributeBuffer(), "");

    expect(root.children[0]).toMatchObject({
      type: "heading",
      depth: 2,
      data: {
        hProperties: {
          id: "custom-heading-id",
          className: ["highlight", "wide"],
        },
      },
      children: [{ type: "text", value: "Custom identifier" }],
    });
  });
});

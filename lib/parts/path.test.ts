import {
  joinPaths,
  resolvePaths,
  normalizePath,
  splitPath,
  getExtension,
  ensurePathEndsWithSlash,
} from "./path";

test("joinPaths", () => {
  expect(joinPaths("a", "/b/c")).toBe("a/b/c");
  expect(joinPaths("a", "b/c")).toBe("a/b/c");
});

test("resolvePaths", () => {
  expect(resolvePaths("/a", "/b/c")).toBe("/b/c");
  expect(resolvePaths("a", "b/c")).toBe(process.cwd() + "/a/b/c");
});

test("normalizePath", () => {
  expect(normalizePath("/a/../b")).toBe("/b");
  expect(normalizePath("/a/./b")).toBe("/a/b");
  expect(normalizePath("a/..")).toBe(".");
});

test("splitPath", () => {
  expect(splitPath("/hello/world")).toEqual(["hello", "world"]);
  expect(splitPath("/")).toEqual([]);
  expect(splitPath("/hello")).toEqual(["hello"]);
  expect(splitPath("world/")).toEqual(["world"]);
});

test("getExtension", () => {
  expect(getExtension("/hello/world")).toBe("");
  expect(getExtension("/hello/world.png")).toBe(".png");
  expect(getExtension("/a.dir.with.dots/world")).toBe("");
  expect(getExtension("/a.dir.with.dots/")).toBe(".dots");
});

test("getExtension", () => {
  expect(ensurePathEndsWithSlash("/hello/world")).toBe("/hello/world/");
  expect(ensurePathEndsWithSlash("/hello/world/")).toBe("/hello/world/");
  expect(ensurePathEndsWithSlash("/hello")).toBe("/hello/");
  expect(ensurePathEndsWithSlash("/")).toBe("/");
});

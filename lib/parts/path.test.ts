import {
  joinPaths,
  resolvePaths,
  getNormalizedPath,
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

test("getNormalizedPath", () => {
  expect(getNormalizedPath("/a/../b")).toBe("/b");
  expect(getNormalizedPath("/a/./b")).toBe("/a/b");
  expect(getNormalizedPath("a/..")).toBe(".");
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

test("ensurePathEndsWithSlash", () => {
  expect(ensurePathEndsWithSlash("/hello/world")).toBe("/hello/world/");
  expect(ensurePathEndsWithSlash("/hello/world/")).toBe("/hello/world/");
  expect(ensurePathEndsWithSlash("/hello")).toBe("/hello/");
  expect(ensurePathEndsWithSlash("/")).toBe("/");
});

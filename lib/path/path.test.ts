import { ensureSlash, extension, join, normalize, resolve, split } from "./path";

test("join", () => {
  expect(join("a", "/b/c")).toBe("a/b/c");
  expect(join("a", "b/c")).toBe("a/b/c");
  expect(join("a", "b/c/")).toBe("a/b/c");
});

test("resolve", () => {
  expect(resolve("/a", "/b/c")).toBe("/b/c");
  expect(resolve("a", "b/c")).toBe(process.cwd() + "/a/b/c");
  expect(resolve("a", "b/c/")).toBe(process.cwd() + "/a/b/c");
});

test("normalize", () => {
  expect(normalize("/a/../b")).toBe("/b");
  expect(normalize("/a/./b")).toBe("/a/b");
  expect(normalize("/a/./b/")).toBe("/a/b");
  expect(normalize("a/..")).toBe(".");
  expect(normalize("a/../")).toBe(".");
});

test("split", () => {
  expect(split("/hello/world")).toEqual(["hello", "world"]);
  expect(split("/")).toEqual([]);
  expect(split(".")).toEqual([]);
  expect(split("/hello")).toEqual(["hello"]);
  expect(split("world/")).toEqual(["world"]);
});

test("readExtension", () => {
  expect(extension("/hello/world")).toBe("");
  expect(extension("/hello/world.png")).toBe(".png");
  expect(extension("/hello/world.png", 2)).toBe(".png");
  expect(extension("/a.dir.with.dots/world")).toBe("");
  expect(extension("/a.dir.with.dots")).toBe(".dots");
  expect(extension("/a.dir.with.dots", 2)).toBe(".with.dots");
  expect(extension("/a.dir.with.dots", 3)).toBe(".dir.with.dots");
  expect(extension("/a.dir.with.dots/")).toBe(".dots");
});

test("ensurePathEndsWithSlash", () => {
  expect(ensureSlash("/hello/world")).toBe("/hello/world/");
  expect(ensureSlash("/hello/world/")).toBe("/hello/world/");
  expect(ensureSlash("/hello")).toBe("/hello/");
  expect(ensureSlash("/")).toBe("/");
});

import {
  ensureNoSlash,
  ensureSlash,
  extension,
  join,
  normalize,
  relative,
  resolve,
  split,
  up,
} from "./path";

test("join", () => {
  expect(join("a", "/b/c")).toBe("a/b/c");
  expect(join("a", "b/c")).toBe("a/b/c");
  expect(join("a", "b/c/")).toBe("a/b/c");
});

test("resolve", () => {
  expect(resolve("/a", "/b/c")).toBe("/b/c");
  expect(resolve("a", "b/c")).toBe(process.cwd() + "/a/b/c");
  expect(resolve("a", "b/c/")).toBe(process.cwd() + "/a/b/c");
  expect(resolve("a", "/b/c/")).toBe("/b/c");
});

test("normalize", () => {
  expect(normalize("/a/../b")).toBe("/b");
  expect(normalize("/a/./b")).toBe("/a/b");
  expect(normalize("/a/./b/")).toBe("/a/b");
  expect(normalize("a/..")).toBe(".");
  expect(normalize("a/../")).toBe(".");
  expect(normalize("")).toBe(".");
});

test("split", () => {
  expect(split("/hello/world")).toEqual(["hello", "world"]);
  expect(split("/")).toEqual([]);
  expect(split(".")).toEqual([]);
  expect(split("/hello")).toEqual(["hello"]);
  expect(split("world/")).toEqual(["world"]);
});

test("readExtension", () => {
  expect(extension("")).toBe("");
  expect(extension("/")).toBe("");
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

test("up", () => {
  expect(up("/")).toBe("/");
  expect(() => up("/", true)).toThrow();
  expect(up("/hello/world/")).toBe("/hello");
  expect(up("/hello/world")).toBe("/hello");
  expect(up("/hello/")).toBe("/");
  expect(up("/hello")).toBe("/");
});

test("relative", () => {
  expect(relative("/", "/hello/world/")).toBe("hello/world");
  expect(relative("/hello/world", "/hello/planet/")).toBe("../planet");
  expect(relative("/hello/world", "/hello/planet")).toBe("../planet");
  expect(relative("/hello/world/", "/hello/planet/")).toBe("../planet");
  expect(relative("a", "b")).toBe("../b");
  expect(relative("/hello", "/")).toBe("..");
  expect(relative("/hello/a", "/hello/")).toBe("..");
  expect(relative("/hello/world", "/hello/world/earth")).toBe("earth");
  expect(relative("/hello", "/hello")).toBe("");
  expect(relative("/hello/", "/hello")).toBe("");
});

test("ensureNoSlash", () => {
  expect(ensureNoSlash("/", true)).toBe("");
  expect(ensureNoSlash("/")).toBe("/");
  expect(ensureNoSlash("/hello/world")).toBe("/hello/world");
  expect(ensureNoSlash("/hello/world/", true)).toBe("/hello/world");
  expect(ensureNoSlash("a")).toBe("a");
});

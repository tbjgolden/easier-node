# easier-node

> Node.js, but with a modern API

Assumes Node 16+

---

This is:

- an abstraction layer over common Node built-in APIs
- strict about semantic versioning
- 'lite' implementation of the most commonly installed npm packages
  - most will have zero dependencies
  - for well-maintained projects, they are managed as dependencies to this package
  - large dependencies or less well-maintained projects are instead left as optional dependencies, so this package will never become too heavy

This is not:

- exhaustive over each built-in
- for browser packages
- a one-to-one name mapping from old API to new API

---

Apache-2.0

const store = [
  {
    _id: "60f1e7716e4fbb24fcd38dc0",
    assigned_to: "",
    status_text: "",
    open: true,
    issue_title: "seed issue",
    issue_text: "seed data for tests",
    created_by: "Sam",
    created_on: new Date(),
    updated_on: new Date(),
    project: "apitest",
  },
];

let idCounter = 1;

function clone(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(clone);
  if (typeof value !== "object") return value;
  const output = {};
  Object.keys(value).forEach((key) => {
    output[key] = clone(value[key]);
  });
  return output;
}

function generateId() {
  const suffix = (idCounter++).toString(16).padStart(6, "0");
  return `60f1e7716e4fbb24fc${suffix}`;
}

function normalizeForCompare(key, value) {
  if (key === "open" && typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return value;
}

function makeQuery(resolver) {
  const run = () => Promise.resolve().then(resolver);
  return {
    exec: run,
    then: (onFulfilled, onRejected) => run().then(onFulfilled, onRejected),
    catch: (onRejected) => run().catch(onRejected),
  };
}

class IssueModel {
  constructor(doc) {
    const now = new Date();
    this._id = doc._id || generateId();
    this.assigned_to = doc.assigned_to || "";
    this.status_text = doc.status_text || "";
    this.open = doc.open === undefined ? true : doc.open;
    this.issue_title = doc.issue_title;
    this.issue_text = doc.issue_text;
    this.created_by = doc.created_by;
    this.created_on = doc.created_on || now;
    this.updated_on = doc.updated_on || now;
    this.project = doc.project;
  }

  save(callback) {
    const existingIndex = store.findIndex((item) => item._id === this._id);
    const record = clone(this);
    if (existingIndex >= 0) {
      store[existingIndex] = record;
    } else {
      store.push(record);
    }

    if (typeof callback === "function") {
      callback(null, clone(record));
    }
    return Promise.resolve(clone(record));
  }

  static find(filter = {}) {
    return makeQuery(() => {
      const rows = store.filter((item) =>
        Object.keys(filter).every(
          (key) => item[key] === normalizeForCompare(key, filter[key]),
        ),
      );
      return rows.map((row) => clone(row));
    });
  }

  static findOne(filter = {}) {
    return makeQuery(() => {
      const row = store.find((item) =>
        Object.keys(filter).every(
          (key) => item[key] === normalizeForCompare(key, filter[key]),
        ),
      );
      return row ? clone(row) : null;
    });
  }

  static findByIdAndUpdate(id, updates = {}) {
    return makeQuery(() => {
      const index = store.findIndex((item) => item._id === id);
      if (index < 0) return null;

      const next = {
        ...store[index],
        ...clone(updates),
        _id: store[index]._id,
      };
      store[index] = next;
      return clone(next);
    });
  }

  static findByIdAndDelete(id) {
    return makeQuery(() => {
      const index = store.findIndex((item) => item._id === id);
      if (index < 0) return null;
      const [deleted] = store.splice(index, 1);
      return clone(deleted);
    });
  }
}

module.exports = IssueModel;

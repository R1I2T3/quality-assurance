const store = [];
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
  return `60f56b8c80d8f30591${suffix}`;
}

function makeQuery(resolver) {
  const run = () => Promise.resolve().then(resolver);
  return {
    exec: run,
    then: (onFulfilled, onRejected) => run().then(onFulfilled, onRejected),
    catch: (onRejected) => run().catch(onRejected),
  };
}

class LibraryModel {
  constructor(doc = {}) {
    this._id = doc._id || generateId();
    this.title = doc.title || "";
    this.comments = Array.isArray(doc.comments) ? doc.comments : [];
    this.commentcount =
      typeof doc.commentcount === "number"
        ? doc.commentcount
        : this.comments.length;
    this.__v = typeof doc.__v === "number" ? doc.__v : 0;
  }

  save(callback) {
    const existingIndex = store.findIndex((item) => item._id === this._id);
    const record = clone({
      _id: this._id,
      title: this.title,
      comments: this.comments,
      commentcount: this.commentcount,
      __v: this.__v,
    });

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
        Object.keys(filter).every((key) => item[key] === filter[key]),
      );
      return rows.map((row) => clone(row));
    });
  }

  static findOne(filter = {}) {
    return makeQuery(() => {
      const row = store.find((item) =>
        Object.keys(filter).every((key) => item[key] === filter[key]),
      );
      return row ? new LibraryModel(clone(row)) : null;
    });
  }

  static findById(id) {
    return makeQuery(() => {
      const row = store.find((item) => item._id === id);
      return row ? new LibraryModel(clone(row)) : null;
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

  static deleteMany() {
    return makeQuery(() => {
      const deletedCount = store.length;
      store.length = 0;
      return { deletedCount };
    });
  }
}

module.exports = LibraryModel;

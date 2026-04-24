const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const project = "apitest";
  let issueIdToUpdate = "";
  let issueIdToDelete = "";

  suite("Test POST", () => {
    test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: "Full issue",
          issue_text: "All fields included",
          created_by: "Alice",
          assigned_to: "Bob",
          status_text: "In QA",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Full issue");
          assert.equal(res.body.issue_text, "All fields included");
          assert.equal(res.body.created_by, "Alice");
          assert.equal(res.body.assigned_to, "Bob");
          assert.equal(res.body.status_text, "In QA");
          assert.property(res.body, "_id");
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          assert.strictEqual(res.body.open, true);

          issueIdToUpdate = res.body._id;
          done();
        });
    });

    test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: "Delete me",
          issue_text: "Issue created for delete test",
          created_by: "Charlie",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Delete me");
          assert.equal(res.body.issue_text, "Issue created for delete test");
          assert.equal(res.body.created_by, "Charlie");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.property(res.body, "_id");

          issueIdToDelete = res.body._id;
          done();
        });
    });

    test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post(`/api/issues/${project}`)
        .send({ issue_title: "Missing fields" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "required field(s) missing" });
          done();
        });
    });
  });

  suite("Test GET", () => {
    test("View issues on a project: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get(`/api/issues/${project}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          assert.property(res.body[0], "_id");
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          done();
        });
    });

    test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get(`/api/issues/${project}`)
        .query({ created_by: "Alice" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => {
            assert.equal(issue.created_by, "Alice");
          });
          done();
        });
    });

    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get(`/api/issues/${project}`)
        .query({ created_by: "Alice", open: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue) => {
            assert.equal(issue.created_by, "Alice");
            assert.strictEqual(issue.open, true);
          });
          done();
        });
    });
  });

  suite("Test PUT", () => {
    test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({ _id: issueIdToUpdate, status_text: "Retested" })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: issueIdToUpdate,
          });
          done();
        });
    });

    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({
          _id: issueIdToUpdate,
          issue_text: "Updated issue text",
          assigned_to: "Dave",
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: issueIdToUpdate,
          });
          done();
        });
    });

    test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({ issue_text: "No id" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });

    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({ _id: issueIdToUpdate })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "no update field(s) sent",
            _id: issueIdToUpdate,
          });
          done();
        });
    });

    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
      const invalidId = "60f1bee4521da62c5ccd7641";
      chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send({ _id: invalidId, issue_text: "Should fail" })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "could not update",
            _id: invalidId,
          });
          done();
        });
    });
  });

  suite("Test DELETE", () => {
    test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send({ _id: issueIdToDelete })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: "successfully deleted",
            _id: issueIdToDelete,
          });
          done();
        });
    });

    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
      const invalidId = "60f1c7cd0e7e0e0a74771d25";
      chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send({ _id: invalidId })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "could not delete",
            _id: invalidId,
          });
          done();
        });
    });

    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send({})
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });
  });
});

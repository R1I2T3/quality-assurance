"use strict";

module.exports = function (app) {
  const issueModel = require("../models/issue");

  //Routes
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;

      let obj = Object.assign(req.query);
      obj["project"] = project;

      issueModel
        .find(obj)
        .exec()
        .then((data) => {
          if (data) {
            let obj = [];
            data.forEach((data) => {
              obj.push({
                _id: data._id,
                assigned_to: data.assigned_to,
                status_text: data.status_text,
                issue_title: data.issue_title,
                issue_text: data.issue_text,
                created_by: data.created_by,
                created_on: data.created_on,
                updated_on: data.updated_on,
                open: data.open,
              });
            });
            return res.json(obj);
          }
        })
        .catch((err) => console.log(err));
    })

    .post(function (req, res) {
      let project = req.params.project;

      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by)
        return res.json({ error: "required field(s) missing" });

      const issue = new issueModel({
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        created_on: new Date(),
        updated_on: new Date(),
        project: project,
      });

      issue.save((err, data) => {
        if (err) return console.log(err);
        let obj = {
          _id: data._id,
          assigned_to: data.assigned_to,
          status_text: data.status_text,
          issue_title: data.issue_title,
          issue_text: data.issue_text,
          created_by: data.created_by,
          created_on: data.created_on,
          updated_on: data.updated_on,
          open: data.open,
        };
        return res.json(obj);
      });
    })

    .put(function (req, res) {
      const project = req.params.project;
      const { _id, ...updates } = req.body || {};

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      // FCC expects empty-string update fields to be treated as not sent.
      const payload = Object.keys(updates).reduce((acc, key) => {
        if (updates[key] !== undefined && updates[key] !== "") {
          acc[key] = updates[key];
        }
        return acc;
      }, {});

      if (Object.keys(payload).length === 0) {
        return res.json({ error: "no update field(s) sent", _id });
      }

      issueModel
        .findOne({ _id, project })
        .exec()
        .then((issue) => {
          if (!issue) return null;

          const now = new Date();
          const lastUpdated = new Date(issue.updated_on);
          payload.updated_on =
            Number.isNaN(lastUpdated.getTime()) || now > lastUpdated
              ? now
              : new Date(lastUpdated.getTime() + 1);

          return issueModel.findByIdAndUpdate(_id, payload).exec();
        })
        .then((updatedIssue) => {
          if (!updatedIssue)
            return res.json({ error: "could not update", _id });
          return res.json({ result: "successfully updated", _id });
        })
        .catch(() => res.json({ error: "could not update", _id }));
    })

    .delete(function (req, res) {
      let obj = Object.assign(req.body);
      if (!obj._id) return res.json({ error: "missing _id" });
      else {
        issueModel
          .findByIdAndDelete(obj._id)
          .exec()
          .then((data) => {
            if (data)
              res.json({ result: "successfully deleted", _id: obj._id });
            else res.json({ error: "could not delete", _id: obj._id });
          })
          .catch(() => res.json({ error: "could not delete", _id: obj._id }));
      }
    });
};

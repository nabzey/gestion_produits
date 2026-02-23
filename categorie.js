var fs = require("fs");
var path = require("path");
var util = require("util");

var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);

var DB_PATH = path.join(process.cwd(), "db.json");

function readDB() {
  return readFile(DB_PATH, "utf-8").then(function(raw) {
    return JSON.parse(raw);
  });
}

function writeDB(db) {
  return writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function nextId(list) {
  var max = list.reduce(function(m, x) { return x.id > m ? x.id : m; }, 0);
  return max + 1;
}

function ok(res, data) {
  return res.status(200).json({ success: true, data: data });
}

function created(res, data, location) {
  return res.status(201).set("Location", location).json({ success: true, data: data });
}

function noContent(res) {
  return res.status(204).send();
}

function error(res, status, code, message, details) {
  return res.status(status).json({
    success: false,
    error: { code: code, message: message, details: details }
  });
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isInt(v) {
  return Number.isInteger(v);
}

function createCategorie(req, res) {
  var libelle = req.body.libelle;
  if (!isNonEmptyString(libelle) || libelle.trim().length < 2) {
    return error(res, 422, "VALIDATION_ERROR", "libelle invalide", [{ field: "libelle", message: "Minimum 2 caractères" }]);
  }
  readDB().then(function(db) {
    db.categories = db.categories || [];
    var libelleTrimmed = libelle.trim().toLowerCase();
    if (db.categories.some(function(c) { return c.libelle.toLowerCase() === libelleTrimmed; })) {
      return error(res, 409, "CONFLICT", "Le libellé existe déjà", [{ field: "libelle", message: "Ce libellé est déjà utilisé" }]);
    }
    var newCat = { id: nextId(db.categories), libelle: libelle.trim() };
    db.categories.push(newCat);
    return writeDB(db).then(function() { return created(res, newCat, "/categories/" + newCat.id); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function getCategories(req, res) {
  readDB().then(function(db) {
    db.categories = db.categories || [];
    var search = (req.query.search || "").toString().toLowerCase();
    var data = search ? db.categories.filter(function(c) { return c.libelle.toLowerCase().indexOf(search) !== -1; }) : db.categories;
    return ok(res, data);
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function getCategorieById(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  readDB().then(function(db) {
    db.categories = db.categories || [];
    var cat = db.categories.find(function(c) { return c.id === id; });
    if (!cat) return error(res, 404, "NOT_FOUND", "Categorie introuvable");
    return ok(res, cat);
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function updateCategorie(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  var libelle = req.body.libelle;
  if (!isNonEmptyString(libelle) || libelle.trim().length < 2) {
    return error(res, 422, "VALIDATION_ERROR", "libelle invalide", [{ field: "libelle", message: "Minimum 2 caractères" }]);
  }
  readDB().then(function(db) {
    db.categories = db.categories || [];
    var cat = db.categories.find(function(c) { return c.id === id; });
    if (!cat) return error(res, 404, "NOT_FOUND", "Categorie introuvable");
    var libelleTrimmed = libelle.trim().toLowerCase();
    if (db.categories.some(function(c) { return c.id !== id && c.libelle.toLowerCase() === libelleTrimmed; })) {
      return error(res, 409, "CONFLICT", "Le libellé existe déjà", [{ field: "libelle", message: "Ce libellé est déjà utilisé" }]);
    }
    cat.libelle = libelle.trim();
    return writeDB(db).then(function() { return ok(res, cat); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function deleteCategorie(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  readDB().then(function(db) {
    db.categories = db.categories || [];
    var before = db.categories.length;
    db.categories = db.categories.filter(function(c) { return c.id !== id; });
    if (db.categories.length === before) return error(res, 404, "NOT_FOUND", "Categorie introuvable");
    return writeDB(db).then(function() { return noContent(res); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

module.exports = {
  createCategorie: createCategorie,
  getCategories: getCategories,
  getCategorieById: getCategorieById,
  updateCategorie: updateCategorie,
  deleteCategorie: deleteCategorie
};

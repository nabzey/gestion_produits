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

function createProduit(req, res) {
  var body = req.body;
  var errors = [];
  if (!isNonEmptyString(body.libelle)) errors.push({ field: "libelle", message: "Libellé requis" });
  if (typeof body.prixUnitaire !== "number" || body.prixUnitaire <= 0) errors.push({ field: "prixUnitaire", message: "Prix unitaire doit être un nombre positif" });
  if (!isInt(body["qte-stock"]) || body["qte-stock"] <= 10) errors.push({ field: "qte-stock", message: "Quantité en stock doit être un entier supérieur à 10" });
  if (!isInt(body["categorie-id"])) errors.push({ field: "categorie-id", message: "categorie-id doit être un entier" });
  if (!isInt(body["fournisseur-id"])) errors.push({ field: "fournisseur-id", message: "fournisseur-id doit être un entier" });
  if (errors.length > 0) return error(res, 422, "VALIDATION_ERROR", "Erreurs de validation", errors);
  
  readDB().then(function(db) {
    db.produits = db.produits || [];
    db.categories = db.categories || [];
    db.fournisseurs = db.fournisseurs || [];
    var libelleTrimmed = body.libelle.trim().toLowerCase();
    if (db.produits.some(function(p) { return p.libelle.toLowerCase() === libelleTrimmed; })) {
      return error(res, 409, "CONFLICT", "Le libellé existe déjà", [{ field: "libelle", message: "Ce libellé est déjà utilisé" }]);
    }
    if (!db.categories.find(function(c) { return c.id === body["categorie-id"]; })) {
      return error(res, 422, "VALIDATION_ERROR", "Catégorie inexistante", [{ field: "categorie-id", message: "Cette catégorie n'existe pas" }]);
    }
    if (!db.fournisseurs.find(function(f) { return f.id === body["fournisseur-id"]; })) {
      return error(res, 422, "VALIDATION_ERROR", "Fournisseur inexistant", [{ field: "fournisseur-id", message: "Ce fournisseur n'existe pas" }]);
    }
    var newProduit = { id: nextId(db.produits), libelle: body.libelle.trim(), prixUnitaire: body.prixUnitaire, "qte-stock": body["qte-stock"], "categorie-id": body["categorie-id"], "fournisseur-id": body["fournisseur-id"] };
    db.produits.push(newProduit);
    return writeDB(db).then(function() { return created(res, newProduit, "/produits/" + newProduit.id); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function getProduits(req, res) {
  readDB().then(function(db) {
    db.produits = db.produits || [];
    var search = (req.query.search || "").toString().toLowerCase();
    var categorieId = req.query["categorie-id"] ? Number(req.query["categorie-id"]) : null;
    var fournisseurId = req.query["fournisseur-id"] ? Number(req.query["fournisseur-id"]) : null;
    var data = db.produits;
    if (search) data = data.filter(function(p) { return p.libelle.toLowerCase().indexOf(search) !== -1; });
    if (categorieId && isInt(categorieId)) data = data.filter(function(p) { return p["categorie-id"] === categorieId; });
    if (fournisseurId && isInt(fournisseurId)) data = data.filter(function(p) { return p["fournisseur-id"] === fournisseurId; });
    return ok(res, data);
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function getProduitById(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  readDB().then(function(db) {
    db.produits = db.produits || [];
    var produit = db.produits.find(function(p) { return p.id === id; });
    if (!produit) return error(res, 404, "NOT_FOUND", "Produit introuvable");
    return ok(res, produit);
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function updateProduit(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  var body = req.body;
  var errors = [];
  if (!isNonEmptyString(body.libelle)) errors.push({ field: "libelle", message: "Libellé requis" });
  if (typeof body.prixUnitaire !== "number" || body.prixUnitaire <= 0) errors.push({ field: "prixUnitaire", message: "Prix unitaire doit être un nombre positif" });
  if (!isInt(body["qte-stock"]) || body["qte-stock"] <= 10) errors.push({ field: "qte-stock", message: "Quantité en stock doit être un entier supérieur à 10" });
  if (!isInt(body["categorie-id"])) errors.push({ field: "categorie-id", message: "categorie-id doit être un entier" });
  if (!isInt(body["fournisseur-id"])) errors.push({ field: "fournisseur-id", message: "fournisseur-id doit être un entier" });
  if (errors.length > 0) return error(res, 422, "VALIDATION_ERROR", "Erreurs de validation", errors);
  
  readDB().then(function(db) {
    db.produits = db.produits || [];
    db.categories = db.categories || [];
    db.fournisseurs = db.fournisseurs || [];
    var produit = db.produits.find(function(p) { return p.id === id; });
    if (!produit) return error(res, 404, "NOT_FOUND", "Produit introuvable");
    var libelleTrimmed = body.libelle.trim().toLowerCase();
    if (db.produits.some(function(p) { return p.id !== id && p.libelle.toLowerCase() === libelleTrimmed; })) {
      return error(res, 409, "CONFLICT", "Le libellé existe déjà", [{ field: "libelle", message: "Ce libellé est déjà utilisé" }]);
    }
    if (!db.categories.find(function(c) { return c.id === body["categorie-id"]; })) {
      return error(res, 422, "VALIDATION_ERROR", "Catégorie inexistante", [{ field: "categorie-id", message: "Cette catégorie n'existe pas" }]);
    }
    if (!db.fournisseurs.find(function(f) { return f.id === body["fournisseur-id"]; })) {
      return error(res, 422, "VALIDATION_ERROR", "Fournisseur inexistant", [{ field: "fournisseur-id", message: "Ce fournisseur n'existe pas" }]);
    }
    produit.libelle = body.libelle.trim();
    produit.prixUnitaire = body.prixUnitaire;
    produit["qte-stock"] = body["qte-stock"];
    produit["categorie-id"] = body["categorie-id"];
    produit["fournisseur-id"] = body["fournisseur-id"];
    return writeDB(db).then(function() { return ok(res, produit); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function deleteProduit(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  readDB().then(function(db) {
    db.produits = db.produits || [];
    var before = db.produits.length;
    db.produits = db.produits.filter(function(p) { return p.id !== id; });
    if (db.produits.length === before) return error(res, 404, "NOT_FOUND", "Produit introuvable");
    return writeDB(db).then(function() { return noContent(res); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

module.exports = {
  createProduit: createProduit,
  getProduits: getProduits,
  getProduitById: getProduitById,
  updateProduit: updateProduit,
  deleteProduit: deleteProduit
};
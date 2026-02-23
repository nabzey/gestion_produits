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

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function isValidSenegalPhone(phone) {
  if (typeof phone !== "string") return false;
  var cleaned = phone.replace(/\s+/g, "");
  var validPrefixes = ["77", "78", "75", "71", "70", "76"];
  
  if (cleaned.startsWith("+221")) {
    var number = cleaned.substring(4);
    if (number.length !== 9) return false;
    var prefix = number.substring(0, 2);
    return validPrefixes.indexOf(prefix) !== -1;
  }
  
  if (cleaned.length === 9) {
    var prefix = cleaned.substring(0, 2);
    return validPrefixes.indexOf(prefix) !== -1;
  }
  
  return false;
}

function createFournisseur(req, res) {
  var body = req.body;
  var errors = [];
  if (!isNonEmptyString(body.nom)) errors.push({ field: "nom", message: "Nom requis" });
  if (!isNonEmptyString(body.prenom)) errors.push({ field: "prenom", message: "Prenom requis" });
  if (!isValidEmail(body.email)) errors.push({ field: "email", message: "Email invalide" });
  if (!isValidSenegalPhone(body.telephone)) errors.push({ field: "telephone", message: "Téléphone invalide" });
  if (!isNonEmptyString(body.adresse)) errors.push({ field: "adresse", message: "Adresse requise" });
  if (errors.length > 0) return error(res, 422, "VALIDATION_ERROR", "Erreurs de validation", errors);
  
  readDB().then(function(db) {
    db.fournisseurs = db.fournisseurs || [];
    var emailTrimmed = body.email.trim().toLowerCase();
    if (db.fournisseurs.some(function(f) { return f.email.toLowerCase() === emailTrimmed; })) {
      return error(res, 409, "CONFLICT", "Email déjà utilisé", [{ field: "email", message: "Cet email est déjà utilisé" }]);
    }
    var newFournisseur = { id: nextId(db.fournisseurs), nom: body.nom.trim(), prenom: body.prenom.trim(), email: body.email.trim(), telephone: body.telephone.trim(), adresse: body.adresse.trim() };
    db.fournisseurs.push(newFournisseur);
    return writeDB(db).then(function() { return created(res, newFournisseur, "/fournisseurs/" + newFournisseur.id); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function getFournisseurs(req, res) {
  readDB().then(function(db) {
    db.fournisseurs = db.fournisseurs || [];
    var search = (req.query.search || "").toString().toLowerCase();
    var data = search ? db.fournisseurs.filter(function(f) { return f.nom.toLowerCase().indexOf(search) !== -1 || f.email.toLowerCase().indexOf(search) !== -1; }) : db.fournisseurs;
    return ok(res, data);
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function getFournisseurById(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  readDB().then(function(db) {
    db.fournisseurs = db.fournisseurs || [];
    var fournisseur = db.fournisseurs.find(function(f) { return f.id === id; });
    if (!fournisseur) return error(res, 404, "NOT_FOUND", "Fournisseur introuvable");
    return ok(res, fournisseur);
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function updateFournisseur(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  var body = req.body;
  var errors = [];
  if (!isNonEmptyString(body.nom)) errors.push({ field: "nom", message: "Nom requis" });
  if (!isNonEmptyString(body.prenom)) errors.push({ field: "prenom", message: "Prenom requis" });
  if (!isValidEmail(body.email)) errors.push({ field: "email", message: "Email invalide" });
  if (!isValidSenegalPhone(body.telephone)) errors.push({ field: "telephone", message: "Téléphone invalide" });
  if (!isNonEmptyString(body.adresse)) errors.push({ field: "adresse", message: "Adresse requise" });
  if (errors.length > 0) return error(res, 422, "VALIDATION_ERROR", "Erreurs de validation", errors);
  
  readDB().then(function(db) {
    db.fournisseurs = db.fournisseurs || [];
    var fournisseur = db.fournisseurs.find(function(f) { return f.id === id; });
    if (!fournisseur) return error(res, 404, "NOT_FOUND", "Fournisseur introuvable");
    var emailTrimmed = body.email.trim().toLowerCase();
    if (db.fournisseurs.some(function(f) { return f.id !== id && f.email.toLowerCase() === emailTrimmed; })) {
      return error(res, 409, "CONFLICT", "Email déjà utilisé", [{ field: "email", message: "Cet email est déjà utilisé" }]);
    }
    fournisseur.nom = body.nom.trim();
    fournisseur.prenom = body.prenom.trim();
    fournisseur.email = body.email.trim();
    fournisseur.telephone = body.telephone.trim();
    fournisseur.adresse = body.adresse.trim();
    return writeDB(db).then(function() { return ok(res, fournisseur); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

function deleteFournisseur(req, res) {
  var id = Number(req.params.id);
  if (!isInt(id)) return error(res, 400, "BAD_REQUEST", "id invalide");
  readDB().then(function(db) {
    db.fournisseurs = db.fournisseurs || [];
    var before = db.fournisseurs.length;
    db.fournisseurs = db.fournisseurs.filter(function(f) { return f.id !== id; });
    if (db.fournisseurs.length === before) return error(res, 404, "NOT_FOUND", "Fournisseur introuvable");
    return writeDB(db).then(function() { return noContent(res); });
  }).catch(function(err) { return error(res, 500, "SERVER_ERROR", err.message); });
}

module.exports = {
  createFournisseur: createFournisseur,
  getFournisseurs: getFournisseurs,
  getFournisseurById: getFournisseurById,
  updateFournisseur: updateFournisseur,
  deleteFournisseur: deleteFournisseur
};
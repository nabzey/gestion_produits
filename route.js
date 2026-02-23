var categorie = require("./categorie.js");
var fournisseurs = require("./fournisseurs.js");
var produit = require("./produit.js");

function error(res, status, code, message, details) {
  return res.status(status).json({
    success: false,
    error: { code: code, message: message, details: details }
  });
}

function notFound(req, res) {
  return error(res, 404, "NOT_FOUND", "Route introuvable");
}

function setupRoutes(app) {
  // Catégories
  app.post("/categories", categorie.createCategorie);
  app.get("/categories", categorie.getCategories);
  app.get("/categories/:id", categorie.getCategorieById);
  app.put("/categories/:id", categorie.updateCategorie);
  app.delete("/categories/:id", categorie.deleteCategorie);
  
  // Fournisseurs
  app.post("/fournisseurs", fournisseurs.createFournisseur);
  app.get("/fournisseurs", fournisseurs.getFournisseurs);
  app.get("/fournisseurs/:id", fournisseurs.getFournisseurById);
  app.put("/fournisseurs/:id", fournisseurs.updateFournisseur);
  app.delete("/fournisseurs/:id", fournisseurs.deleteFournisseur);
  
  // Produits
  app.post("/produits", produit.createProduit);
  app.get("/produits", produit.getProduits);
  app.get("/produits/:id", produit.getProduitById);
  app.put("/produits/:id", produit.updateProduit);
  app.delete("/produits/:id", produit.deleteProduit);
  
  // 404
  app.use(notFound);
}

module.exports = { setupRoutes: setupRoutes };
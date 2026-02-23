var swaggerJsdoc = require("swagger-jsdoc");

var swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gestion Produit",
      version: "1.0.0",
      description: "API de gestion des produits, catégories et fournisseurs"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de développement"
      }
    ],
    tags: [
      { name: "Catégories", description: "Gestion des catégories" },
      { name: "Fournisseurs", description: "Gestion des fournisseurs" },
      { name: "Produits", description: "Gestion des produits" }
    ],
    paths: {
      "/categories": {
        post: {
          summary: "Créer une nouvelle catégorie",
          tags: ["Catégories"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["libelle"],
                  properties: {
                    libelle: { type: "string", minLength: 2, example: "Boissons" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Catégorie créée avec succès" },
            409: { description: "Le libellé existe déjà" },
            422: { description: "Erreur de validation" }
          }
        },
        get: {
          summary: "Liste toutes les catégories",
          tags: ["Catégories"],
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Terme de recherche pour filtrer par libellé"
            }
          ],
          responses: {
            200: { description: "Liste des catégories" }
          }
        }
      },
      "/categories/{id}": {
        get: {
          summary: "Récupérer une catégorie par ID",
          tags: ["Catégories"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID de la catégorie"
            }
          ],
          responses: {
            200: { description: "Catégorie trouvée" },
            404: { description: "Catégorie introuvable" }
          }
        },
        put: {
          summary: "Mettre à jour une catégorie",
          tags: ["Catégories"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID de la catégorie"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["libelle"],
                  properties: {
                    libelle: { type: "string", minLength: 2, example: "Boissons" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Catégorie mise à jour" },
            409: { description: "Le libellé existe déjà" },
            404: { description: "Catégorie introuvable" }
          }
        },
        delete: {
          summary: "Supprimer une catégorie",
          tags: ["Catégories"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID de la catégorie"
            }
          ],
          responses: {
            204: { description: "Catégorie supprimée" },
            404: { description: "Catégorie introuvable" }
          }
        }
      },
      "/fournisseurs": {
        post: {
          summary: "Créer un nouveau fournisseur",
          tags: ["Fournisseurs"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nom", "prenom", "email", "telephone", "adresse"],
                  properties: {
                    nom: { type: "string", example: "Dupont" },
                    prenom: { type: "string", example: "Jean" },
                    email: { type: "string", format: "email", example: "jean.dupont@example.com" },
                    telephone: { 
                      type: "string", 
                      description: "Numéro de téléphone sénégalais (format +22177XXXXXXX ou 77XXXXXXX)",
                      example: "+221771234567"
                    },
                    adresse: { type: "string", example: "Dakar" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Fournisseur créé avec succès" },
            409: { description: "Email déjà utilisé" },
            422: { description: "Erreur de validation" }
          }
        },
        get: {
          summary: "Liste tous les fournisseurs",
          tags: ["Fournisseurs"],
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Terme de recherche pour filtrer par nom ou email"
            }
          ],
          responses: {
            200: { description: "Liste des fournisseurs" }
          }
        }
      },
      "/fournisseurs/{id}": {
        get: {
          summary: "Récupérer un fournisseur par ID",
          tags: ["Fournisseurs"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID du fournisseur"
            }
          ],
          responses: {
            200: { description: "Fournisseur trouvé" },
            404: { description: "Fournisseur introuvable" }
          }
        },
        put: {
          summary: "Mettre à jour un fournisseur",
          tags: ["Fournisseurs"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID du fournisseur"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nom", "prenom", "email", "telephone", "adresse"],
                  properties: {
                    nom: { type: "string", example: "Dupont" },
                    prenom: { type: "string", example: "Jean" },
                    email: { type: "string", format: "email", example: "jean.dupont@example.com" },
                    telephone: { 
                      type: "string", 
                      description: "Numéro de téléphone sénégalais",
                      example: "+221771234567"
                    },
                    adresse: { type: "string", example: "Dakar" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Fournisseur mis à jour" },
            409: { description: "Email déjà utilisé" },
            404: { description: "Fournisseur introuvable" }
          }
        },
        delete: {
          summary: "Supprimer un fournisseur",
          tags: ["Fournisseurs"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID du fournisseur"
            }
          ],
          responses: {
            204: { description: "Fournisseur supprimé" },
            404: { description: "Fournisseur introuvable" }
          }
        }
      },
      "/produits": {
        post: {
          summary: "Créer un nouveau produit",
          tags: ["Produits"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["libelle", "prixUnitaire", "qte-stock", "categorie-id", "fournisseur-id"],
                  properties: {
                    libelle: { type: "string", example: "Coca-Cola" },
                    prixUnitaire: { type: "number", minimum: 0, example: 150 },
                    "qte-stock": {
                      type: "integer",
                      minimum: 10,
                      description: "La quantité en stock doit être supérieure à 10",
                      example: 100
                    },
                    "categorie-id": { type: "integer", example: 1 },
                    "fournisseur-id": { type: "integer", example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Produit créé avec succès" },
            409: { description: "Le libellé existe déjà" },
            422: { description: "Erreur de validation" }
          }
        },
        get: {
          summary: "Liste tous les produits",
          tags: ["Produits"],
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Terme de recherche pour filtrer par libellé"
            },
            {
              in: "query",
              name: "categorie-id",
              schema: { type: "integer" },
              description: "Filtrer par ID de catégorie"
            },
            {
              in: "query",
              name: "fournisseur-id",
              schema: { type: "integer" },
              description: "Filtrer par ID de fournisseur"
            }
          ],
          responses: {
            200: { description: "Liste des produits" }
          }
        }
      },
      "/produits/{id}": {
        get: {
          summary: "Récupérer un produit par ID",
          tags: ["Produits"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID du produit"
            }
          ],
          responses: {
            200: { description: "Produit trouvé" },
            404: { description: "Produit introuvable" }
          }
        },
        put: {
          summary: "Mettre à jour un produit",
          tags: ["Produits"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID du produit"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["libelle", "prixUnitaire", "qte-stock", "categorie-id", "fournisseur-id"],
                  properties: {
                    libelle: { type: "string", example: "Coca-Cola" },
                    prixUnitaire: { type: "number", minimum: 0, example: 150 },
                    "qte-stock": {
                      type: "integer",
                      minimum: 10,
                      description: "La quantité en stock doit être supérieure à 10",
                      example: 100
                    },
                    "categorie-id": { type: "integer", example: 1 },
                    "fournisseur-id": { type: "integer", example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Produit mis à jour" },
            409: { description: "Le libellé existe déjà" },
            404: { description: "Produit introuvable" }
          }
        },
        delete: {
          summary: "Supprimer un produit",
          tags: ["Produits"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID du produit"
            }
          ],
          responses: {
            204: { description: "Produit supprimé" },
            404: { description: "Produit introuvable" }
          }
        }
      }
    }
  },
  apis: []
};

var swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
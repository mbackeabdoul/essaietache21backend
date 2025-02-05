const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// Configurations CORS
app.use(cors());
app.use(express.json());

// Configuration de la connexion MongoDB
mongoose.connect('mongodb+srv://khoudossmbacke18:Mbacke18@cluster0.oluqg.mongodb.net/Authentifications?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modèle Mongoose pour les services
const ServiceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  categorie: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  photos: [{
    type: String
  }],
  certifications: [{
    type: String
  }]
}, { timestamps: true });

const Service = mongoose.model('Service', ServiceSchema);

// Configuration Multer pour upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Créer le dossier uploads s'il n'existe pas
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Servir les fichiers statiques uploadés
app.use('/uploads', express.static('uploads'));

// Route pour ajouter un service
// Dans votre route POST d'ajout de service
app.post('/api/services/ajouter', 
  upload.fields([
    { name: 'photos', maxCount: 5 }, 
    { name: 'certifications', maxCount: 5 }
  ]), 
  async (req, res) => {
    try {
      // Récupérer les données du formulaire
      const { nom, categorie, description } = req.body;

      // Modifier cette partie pour créer des URL complètes
      const baseUrl = req.protocol + '://' + req.get('host');
      const photos = req.files['photos'] 
        ? req.files['photos'].map(file => `${baseUrl}/uploads/${file.filename}`)
        : [];
      
      const certifications = req.files['certifications']
        ? req.files['certifications'].map(file => `${baseUrl}/uploads/${file.filename}`)
        : [];

      // Le reste du code reste identique
      const nouveauService = new Service({
        nom,
        categorie,
        description,
        photos,
        certifications
      });

      const serviceSauvegarde = await nouveauService.save();
      res.status(201).json(serviceSauvegarde);
    } catch (erreur) {
      console.error('Erreur lors de l\'ajout du service:', erreur);
      res.status(500).json({ 
        message: 'Erreur lors de l\'ajout du service', 
        erreur: erreur.message 
      });
    }
});

// Route pour récupérer tous les services
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (erreur) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des services',
      erreur: erreur.message 
    });
  }
});

// Route pour récupérer un service par son ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du service',
      erreur: error.message 
    });
  }
});

// Configuration du port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});



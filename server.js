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
app.post('/api/services/ajouter', 
  upload.fields([
    { name: 'photos', maxCount: 5 }, 
    { name: 'certifications', maxCount: 5 }
  ]), 
  async (req, res) => {
    try {
      // Récupérer les données du formulaire
      const { nom, categorie, description } = req.body;

      // Préparer les chemins des fichiers
      const photos = req.files['photos'] 
        ? req.files['photos'].map(file => `/uploads/${file.filename}`)
        : [];
      
      const certifications = req.files['certifications']
        ? req.files['certifications'].map(file => `/uploads/${file.filename}`)
        : [];

      // Créer le nouveau service
      const nouveauService = new Service({
        nom,
        categorie,
        description,
        photos,
        certifications
      });

      // Sauvegarder le service
      const serviceSauvegarde = await nouveauService.save();

      // Répondre avec le service sauvegardé
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

// Configuration du port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});




// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json({limit: '10mb'}));
// app.use(express.urlencoded({limit: '10mb', extended: true}));

// // Connexion MongoDB
// mongoose.connect('mongodb+srv://khoudossmbacke18:Mbacke18@cluster0.oluqg.mongodb.net/Authentifications?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('Connexion à MongoDB réussie');
// }).catch((err) => {
//   console.log('Erreur de connexion à MongoDB:', err);
// });

// // Modèle Utilisateur
// const userSchema = new mongoose.Schema({
//   prenom: { type: String, required: true },
//   nom: { type: String, required: true },
//   email: { type: String, required: true },
//   photo: { type: String }
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);

// // Routes
// app.get('/api/utilisateurs/profil-client', async (req, res) => {
//   try {
//     console.log('GET - Recherche du profil');
//     const user = await User.findOne();
    
//     if (!user) {
//       console.log('Aucun utilisateur trouvé');
//       return res.status(404).json({ message: 'Aucun profil trouvé' });
//     }
    
//     console.log('Profil trouvé:', user);
//     res.json(user);
//   } catch (error) {
//     console.error('Erreur lors de la récupération:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// });

// app.post('/api/utilisateurs/profil-client', async (req, res) => {
//   try {
//     console.log('POST - Création profil avec données:', req.body);
//     const { prenom, nom, email, photo } = req.body;
    
//     if (!prenom || !nom || !email) {
//       console.log('Données manquantes');
//       return res.status(400).json({ message: 'Données incomplètes' });
//     }

//     const user = new User({
//       prenom,
//       nom,
//       email,
//       photo: photo || ''
//     });

//     const savedUser = await user.save();
//     console.log('Profil créé:', savedUser);
//     res.status(201).json(savedUser);
//   } catch (error) {
//     console.error('Erreur lors de la création:', error);
//     if (error.code === 11000) {
//       res.status(400).json({ message: 'Email déjà utilisé' });
//     } else {
//       res.status(500).json({ message: 'Erreur serveur' });
//     }
//   }
// });

// app.put('/api/utilisateurs/profil-client', async (req, res) => {
//   try {
//     console.log('PUT - Mise à jour profil avec données:', req.body);
//     const { prenom, nom, email, photo } = req.body;

//     if (!prenom || !nom || !email) {
//       console.log('Données manquantes');
//       return res.status(400).json({ message: 'Données incomplètes' });
//     }

//     let user = await User.findOne({ email });

//     if (!user) {
//       user = new User({ prenom, nom, email, photo });
//     } else {
//       user.prenom = prenom;
//       user.nom = nom;
//       if (photo) user.photo = photo;
//     }

//     const updatedUser = await user.save();
//     console.log('Profil mis à jour:', updatedUser);
//     res.json(updatedUser);
//   } catch (error) {
//     console.error('Erreur lors de la mise à jour:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// });

// // Route de test pour voir tous les utilisateurs
// app.get('/api/utilisateurs/tous', async (req, res) => {
//   try {
//     const users = await User.find();
//     console.log('Liste des utilisateurs:', users);
//     res.json(users);
//   } catch (error) {
//     console.error('Erreur liste utilisateurs:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// });

// // Démarrage du serveur
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Serveur démarré sur le port ${PORT}`);
// });
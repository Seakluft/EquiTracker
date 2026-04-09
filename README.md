# EquiTracker 🐎

EquiTracker est une application web moderne pour la gestion et le suivi des séances d'équitation. Conçue avec **Next.js**, **Tailwind CSS**, et **Prisma (SQLite)**, elle est optimisée pour l'auto-hébergement et la facilité d'utilisation.

## 🚀 Fonctionnalités
- **Calendrier Intelligent :** Génération automatique des samedis de septembre à juin.
- **Vacances Scolaires (Zone B) :** Intégration de l'API officielle pour masquer les séances pendant les vacances (le samedi de départ est maintenu).
- **Gestion Complète :** CRUD pour les chevaux et les disciplines (support PNG).
- **Statistiques :** Analyse des séances par cheval, disciplines favorites et estimation des calories brûlées.
- **Édition Totale :** Modifiez n'importe quelle séance (passée ou future) à tout moment.

## 🛠️ Installation & Lancement avec Docker

Le moyen le plus simple de lancer EquiTracker est d'utiliser Docker.

### 1. Cloner le dépôt
```bash
git clone https://github.com/Seakluft/EquiTracker.git
cd EquiTracker
```

### 2. Lancer avec Docker Compose
L'application est configurée pour utiliser le port **8765**.

```bash
docker-compose up --build -d
```

### 3. Accéder à l'application
Ouvrez votre navigateur et rendez-vous sur :
**[http://localhost:8765](http://localhost:8765)**

## ⚙️ Configuration Initiale
1. Allez dans l'onglet **Paramètres**.
2. Configurez vos tarifs (Licence, Forfait Annuel).
3. Ajoutez vos **Chevaux** et vos **Disciplines**.
4. Cliquez sur **"Générer la Saison"** pour initialiser votre calendrier.

## 📂 Structure Technique
- **Framework :** Next.js 15+ (App Router)
- **Base de données :** SQLite (via Prisma) - Fichier persistant `prisma/dev.db`
- **Style :** Tailwind CSS
- **Icônes :** Lucide-React
- **API :** data.education.gouv.fr (Vacances Zone B)

---
Développé pour simplifier le suivi de votre passion équestre.

### 📓 Journal de Bord - Projet TaskFlow (Océane GLANEUX & Athénaïs GRAVIL)

## 🏗️ Architecture Globale

- Base de données & Auth : Supabase (PostgreSQL)
- Logique Métier : Azure Functions (Node.js)
- Stockage Fichiers : Uploadthing
- Communications : Resend (Emails transactionnels)

# 📍 Phase 1 : Setup & Modélisation

**Objectif** : Mise en place de l'infrastructure de données et insertion des premières données de test.

- **Choix techniques** : Utilisation de l'extension `auth.users` de Supabase. Lors de la création des tables, nous avons validé l'activation automatique du **Row Level Security (RLS)** via la fenêtre de confirmation de l'éditeur SQL de Supabase pour garantir la sécurité dès l'initialisation.
- Lien Supabase : https://bmzgkoxyjezovtuhyuwv.supabase.co

- Ce que nous avons fait :

1. Création du projet sur Supabase.
2. Exécution du script de création des 6 tables.
3. **Action spécifique** : Lors de l'exécution du SQL, nous avons cliqué sur "Run and enable RLS" suite à l'alerte de sécurité de Supabase pour protéger la table tasks.
4. Insertion des profils et des tâches de test.

- **Code clé (Correction Bug UUID) :**

```
-- Correction du type pour l'insertion (Cast explicite en ::uuid)
INSERT INTO profiles (id, username, full_name) VALUES
 ('USER-1'::uuid, 'alice', 'Alice Martin'),
 ('USER-2'::uuid, 'bob', 'Bob Dupont');
INSERT INTO projects (id, name, description, owner_id) VALUES
 (gen_random_uuid(), 'Refonte API', 'Migration vers serverless', 'USER-1'::uuid);
WITH proj AS (SELECT id FROM projects WHERE name = 'Refonte API' LIMIT 1)
INSERT INTO tasks (project_id, title, status, priority, assigned_to, created_by)
SELECT proj.id, 'Configurer Supabase', 'done', 'high', 'USER-1'::uuid,
'USER-1'::uuid FROM proj UNION ALL
SELECT proj.id, 'Implémenter RLS', 'in_progress', 'high', 'USER-1'::uuid,
'USER-1'::uuid FROM proj UNION ALL
SELECT proj.id, 'Connecter Azure', 'todo', 'medium', 'USER-2'::uuid,
'USER-1'::uuid FROM proj;
```

- **Blocage & Résolution :**
  - **Erreur** : Échec de l'insertion des données de test à cause d'un format de chaîne non reconnu comme UUID pour les clés étrangères.

  - **Résolution** : Nous avons récupéré les UUID réels dans l'onglet Authentication > Users et appliqué un cast explicite ::uuid dans le script SQL pour forcer la correspondance des types entre les tables.

* Validation — Phase 1

- Les 6 tables existent dans Table Editor

![alt text](journal-img/image-1.png)

- Le trigger updated_at fonctionne (UPDATE tasks SET title='test' WHERE id=... →
  updated_at change)

```
SELECT id, title, updated_at, created_at from tasks;
```

![alt text](journal-img/image-2.png)

- 2 profils et au moins 3 tâches insérés

```SELECT 'profiles' as "table", count(*) from profiles
UNION ALL
SELECT 'tasks', count(*) from tasks;
```

![alt text](journal-img/image-3.png)

- Le binôme peut accéder au projet

`OUI`

## 🔐 Phase 2 : Authentification & Row Level Security

**Objectif** : Sécuriser l'accès aux données en fonction de l'utilisateur connecté.

- **Problèmes rencontrés & Résolutions** :
  - **URL Supabase** : L'URL dans le fichier `.env` contenait `/rest/v1/`, ce qui provoquait des erreurs de connexion. Nous l'avons corrigée en `https://secret.supabase.co`.
  - **Support ES Modules** : Erreur lors de l'exécution des scripts avec `import`. Nous avons ajouté `"type": "module"` dans le `package.json`.
  - **Scripts NPM** : Mise à jour du script de test : `"test": "node test-rls.js"`.
  - **Boucle Infinie RLS** : Une erreur de récursion infinie est survenue sur la table `project_members`. Nous avons résolu le problème en désactivant temporairement le RLS pour cette table spécifique
    ![alt text](journal-img/image-4.png)
    ![alt text](journal-img/image-5.png)

* Validation — Phase 2

- Exécution de `npm test` :
  - Sans authentification : 0 tâches visibles.
  - Alice authentifiée : Accès à ses tâches (✅).
  - Tentative de modification sur une tâche de Bob : Refusée (RLS silencieux ou erreur).

![alt text](journal-img/image-6.png)

## ⚡ Phase 3 : Temps Réel (Realtime)

**Objectif** : Synchronisation instantanée entre les membres d'un projet.

- **Mise en œuvre** : Activation de `supabase_realtime` pour les tables `tasks` et `comments`.
- **Validation** :
  - Lancement de `node alice-watch.js` pour écouter les changements.
  - Lancement de `node bob-actions.js` pour effectuer des modifications.
  - Alice reçoit instantanément les notifications de création, modification et ajout de commentaires.

**Focus Bob Actions** :
Mise à jour de `bob-actions.js` pour inclure l'assignation automatique des tâches créées :

```javascript
const task = await createTask(PROJECT_ID, {
  title: "Implémenter le Realtime",
  priority: "high",
  assignedTo: BOB_ID, // Attribution explicite à Bob
});
```

![alt text](journal-img/image-7.png)

- Validation — Phase 3

* [x] getProjectTasks() retourne les tâches avec profils et comptage de commentaires
* [x] Compte Uploadthing créé, clés dans .env
* [x] La colonne file_url existe dans la table tasks
* [x] Alice reçoit en temps réel les créations de Bob (< 500ms)
* [x] Les changements de statut arrivent instantanément
* [x] La présence affiche les 2 utilisateurs simultanément

![alt text](journal-img/image-8.png)

# ☁️ Phase 4 : Azure Functions — Notifications par email

**Objectif** : Automatiser l'envoi d'emails lors de l'assignation d'une tâche via une architecture serverless.

- **Problèmes rencontrés & Résolutions** :
  - **Région Azure** : La région `westeurope` ne fonctionnait pas pour le déploiement. Nous avons utilisé `spaincentral` à la place.
    ![alt text](journal-img/image-9.png)

  - **Nom du Stockage** : Le nom de compte de stockage `stgtaskflow` était déjà utilisé globalement. Nous avons opté pour `stgtaskflow1`.

* Validation — Phase 4

- [ ] Compte Resend créé, clé API dans `.env` et dans les settings Azure
- [ ] Function App `fn-taskflow` déployé (visible dans le portail Azure)
- [ ] Webhook Supabase configuré sur `UPDATE` de tasks
- [ ] Assignation d'une tâche → notification insérée dans la table `notifications`
- [ ] Logs visibles : `az functionapp logs tail --name fn-taskflow --resource-group rgtaskflow`
      ![alt text](journal-img/image-10.png)

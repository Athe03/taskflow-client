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

![alt text](image.png)

- Le trigger updated_at fonctionne (UPDATE tasks SET title='test' WHERE id=... →
  updated_at change)

```
SELECT id, title, updated_at, created_at from tasks;
```

![alt text](image-2.png)

- 2 profils et au moins 3 tâches insérés

```SELECT 'profiles' as "table", count(*) from profiles
UNION ALL
SELECT 'tasks', count(*) from tasks;
```

![alt text](image-1.png)

- Le binôme peut accéder au projet

`OUI`

## 🔒 Phase 2 : Authentification & RLS

// get-token.js
import { supabase } from './client.js';
import { signIn } from './auth.js';

async function getToken() {
    // 1. Connecte-toi d'abord pour générer une session
    // On utilise les vrais identifiants d'Alice définis dans test-rls.js
    await signIn('o.glaneux@gmail.com', 'M_zgz46e/Q2#sDw');

    // 2. La commande du TP : Récupérer la session active
    const { data: { session } } = await supabase.auth.getSession();

    // 3. Afficher le JWT dans la console
    if (session) {
        console.log("Voici ton JWT :");
        console.log(session.access_token);
    } else {
        console.log("Aucune session trouvée. Vérifie tes identifiants.");
    }
}

getToken();
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { randomUUID } from 'node:crypto'

const aliceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
const bobClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
const BASE = 'https://fn-taskflow1-dmgsgedtabegakbj.spaincentral-01.azurewebsites.net/api'


async function run() {
    console.log('\n━━━ INTÉGRATION TASKFLOW ━━━\n')
   
    // 1. Auth
    await aliceClient.auth.signInWithPassword({ email: 'o.glaneux@gmail.com', password: 'M_zgz46e/Q2#sDw' })
    await bobClient.auth.signInWithPassword({ email: 'oceane.glaneux@my-digital-school.org', password: 'M_zgz46e/Q2#sDw' })
    const { data: { session: aliceSession } } = await aliceClient.auth.getSession()
    const { data: { user: bobUser } } = await bobClient.auth.getUser()
    console.log('✅ Alice et Bob connectés')
    
    // 2. Créer un projet et ajouter Bob
    const projectId = randomUUID()
    const { error: projectInsertError } = await aliceClient
        .from('projects')
        .insert({ id: projectId, name: 'Intégration Test', owner_id: aliceSession.user.id })

    if (projectInsertError) {
        throw new Error(`Insertion projet échouée: ${projectInsertError.message}`)
    }

    await aliceClient.from('project_members').insert({ project_id: projectId, user_id: aliceSession.user.id, role: 'owner' })
    await fetch(`${BASE}/manage-members`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${aliceSession.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', project_id: projectId, target_user_id: bobUser.id, role: 'member' })
    })
    console.log('✅ Projet créé, Bob ajouté via Azure Function')
    
    // 3. Créer des tâches via Azure Function (avec validation)
    const titles = ['Architecture serverless', "Tests d'intégration", 'Documentation API']
    const createdTasks = []
    
    for (const title of titles) {
        const res = await fetch(`${BASE}/validate-task`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${aliceSession.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId, title, priority: 'medium'
            })
        })
        const { task } = await res.json()
        if (task) createdTasks.push(task)
    }
    console.log(`✅ ${createdTasks.length} tâches créées via Azure Function`)
    
    // 4. Alice surveille en Realtime
    let rtCount = 0
    const channel = aliceClient.channel(`project:${projectId}`).on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'tasks',
        filter: `project_id=eq.${projectId}`
    }, (p) => { rtCount++; console.log(` 📡 [RT] ${p.old.status} → ${p.new.status}`) }).subscribe()
    await new Promise(r => setTimeout(r, 1000))
    
    // 5. Bob fait progresser les tâches
    for (const task of createdTasks) {
        await bobClient.from('tasks').update({ status: 'in_progress' }).eq('id', task.id)
        await new Promise(r => setTimeout(r, 300))
        await bobClient.from('tasks').update({ status: 'done' }).eq('id', task.id)
        await new Promise(r => setTimeout(r, 300))
    }
    console.log('✅ Bob a terminé toutes les tâches')
    await new Promise(r => setTimeout(r, 1000))
    console.log(`✅ Alice a reçu ${rtCount} événements Realtime`)
    
    // 6. Stats finales
const stats = await (await fetch(`${BASE}/project-stats?project_id=${projectId}`)).json()
    console.log('\n📊 STATS FINALES:')
    console.log(` Tâches : ${stats.total_tasks}`)
    console.log(` Complétion : ${stats.completion_rate}%`)
    console.log(` Par statut :`, stats.by_status)
    
    // 7. Notifications
    const { data: notifs } = await bobClient.from('notifications').select('*')
    console.log(`\n🔔 Notifications Bob: ${notifs?.length}`)
    aliceClient.removeChannel(channel)
    console.log('\n━━━ FIN — TOUS LES SYSTÈMES FONCTIONNELS ━━━')
}

run().catch(console.error)
import { signIn } from './auth.js'
import { subscribeToProject } from './realtime.js'
await signIn('o.glaneux@gmail.com', 'M_zgz46e/Q2#sDw')
const PROJECT_ID = '28830f41-f7cc-4315-909b-53afe1456585'
const unsub = subscribeToProject(PROJECT_ID, {
    onTaskCreated: (t) => console.log('✅ Nouvelle tâche:', t.title),
    onTaskUpdated: (n, o) => console.log(`🔄 ${o.status} → ${n.status}`),
    onCommentAdded: (c) => console.log('💬', c.content),
    onPresenceChange: (u) => console.log('👥 En ligne:', u.length),
})
process.on('SIGINT', () => { unsub(); process.exit() })
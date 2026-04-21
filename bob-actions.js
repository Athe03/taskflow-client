import { signIn } from './auth.js'
import { createTask, updateTaskStatus, addComment } from './tasks.js'
await signIn('oceane.glaneux@my-digital-school.org', 'M_zgz46e/Q2#sDw')
const PROJECT_ID = '28830f41-f7cc-4315-909b-53afe1456585'
console.log('Creating task...')
const task = await createTask(PROJECT_ID, {
    title: 'Implémenter le Realtime', priority: 'high',
    // fileUrl et fileName seraient renseignés après un upload Uploadthing
})
console.log('Task created:', task.id)
await new Promise(r => setTimeout(r, 1000))
console.log('Updating status...')
await updateTaskStatus(task.id, 'in_progress')
console.log('Status updated.')
await new Promise(r => setTimeout(r, 1000))
console.log('Adding comment...')
await addComment(task.id, 'Je commence maintenant !')
console.log('Comment added.')
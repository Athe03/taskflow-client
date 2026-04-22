import { supabase } from './client.js'
import { signIn, signOut } from './auth.js'

// Test 1 : sans auth → tout vide
const { data: noAuth } = await supabase.from('tasks').select('*')
console.log('Sans auth:', noAuth?.length ?? 0, '(attendu: 0)')

// Test 2 : Alice voit ses tâches
await signIn('o.glaneux@gmail.com', 'M_zgz46e/Q2#sDw')
const { data: { user } } = await supabase.auth.getUser()
console.log('Is Alice authenticated?', !!user ? '✅' : '❌')

const { data: tasks, error: tasksError } = await supabase.from('tasks').select('*')
if (tasksError) console.error('Erreur selection tasks:', tasksError.message)
console.log('Tasks Alice:', tasks?.length)

// Test 3 : Alice ne peut pas modifier la tâche de Bob (assigned_to Bob)
const { data: bobTask } = await supabase.from('tasks')
    .select('id')
    .eq('assigned_to', '4e2a1f96-c92a-47c3-9c04-ff12edcc6501')
    .maybeSingle()

if (bobTask) {
    const { data: updatedData, error: updateError } = await supabase.from('tasks').update({ title: 'Hacked' }).eq('id', bobTask.id).select()

    if (updateError) {
        console.log('Modif refusée (Erreur):', updateError.message)
    } else if (!updatedData || updatedData.length === 0) {
        console.log('Modif refusée (RLS silencieux): Aucune ligne modifiée.')
    } else {
        console.log('⚠ ERREUR : La tâche a été modifiée !')
    }
} else {
    console.log('Test 3 réussi : Alice ne voit même pas la tâche de Bob.')
}

await signOut()
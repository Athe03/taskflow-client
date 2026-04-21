import { supabase } from './client.js'
import { signIn, signOut } from './auth.js'

// Test 1 : sans auth → tout vide
const { data: noAuth } = await supabase.from('tasks').select('*')
console.log('Sans auth:', noAuth?.length, '(attendu: 0)')

// Test 2 : Alice voit ses tâches
await signIn('o.glaneux@gmail.com', 'M_zgz46e/Q2#sDw')
const { data: tasks } = await supabase.from('tasks').select('*')
console.log('Tasks Alice:', tasks?.length)

// Test 3 : Alice ne peut pas modifier la tâche de Bob
const { data: bobTask } = await supabase.from('tasks').select('id').eq('assigned_to', '4e2a1f96-c92a-47c3-9c04-ff12edcc6501').single()
const { error } = await supabase.from('tasks').update({ title: 'Hacked' }).eq('id', bobTask?.id)
console.log('Modif refusée:', error?.message ?? '⚠ ERREUR : accès accordé !')

await signOut()
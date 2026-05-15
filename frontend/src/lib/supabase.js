import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rlfohdeujwvamiosfmoc.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_Uv_Ej1ZVrYJCeuPmHRksLQ_3MSZXC3u'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export default supabase

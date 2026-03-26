import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const makeStubQuery = (err) => {
  const result = { data: null, error: err }
  const thenable = {
    select: () => thenable,
    insert: () => thenable,
    upsert: () => thenable,
    update: () => thenable,
    eq: () => thenable,
    in: () => thenable,
    order: () => thenable,
    limit: () => thenable,
    single: () => Promise.resolve(result),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  return thenable
}

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  const err = new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  // Non-fatal stub for local preview without backend
  // eslint-disable-next-line no-console
  console.warn(err.message)
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signUp: async () => ({ data: null, error: err }),
      signInWithPassword: async () => ({ data: null, error: err }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: null, error: err }),
    },
    from: () => makeStubQuery(err),
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

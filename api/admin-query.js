/**
 * Admin data proxy — verifies Supabase JWT, checks admin role, handles data actions.
 * All admin data operations go through here so RLS is bypassed via service_role.
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify JWT from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' })

  // Check admin role in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin role required' })
  }

  const { action, ...params } = req.body || {}

  try {
    // ---- get_stats ----
    if (action === 'get_stats') {
      const [
        { count: orderCount },
        { data: revenueRows },
        { count: userCount },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ])
      const totalRevenue = (revenueRows || []).reduce((s, o) => s + Number(o.total), 0)
      return res.json({ orderCount: orderCount || 0, totalRevenue, userCount: userCount || 0 })
    }

    // ---- get_orders ----
    if (action === 'get_orders') {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return res.json(data)
    }

    // ---- update_order_status ----
    if (action === 'update_order_status') {
      const { id, status } = params
      if (!id || !status) return res.status(400).json({ error: 'id and status required' })
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return res.json(data)
    }

    // ---- bulk_update_orders ----
    if (action === 'bulk_update_orders') {
      const { ids, status } = params
      if (!ids?.length || !status) return res.status(400).json({ error: 'ids and status required' })
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .in('id', ids)
        .select('id, status')
      if (error) throw error
      return res.json(data)
    }

    // ---- get_users ----
    if (action === 'get_users') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, orders(count)')
        .order('updated_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return res.json(data)
    }

    // ---- get_settings ----
    if (action === 'get_settings') {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key')
      if (error) throw error
      return res.json(data)
    }

    // ---- update_setting ----
    if (action === 'update_setting') {
      const { key, value } = params
      if (!key) return res.status(400).json({ error: 'key is required' })
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ key, value: value || '', updated_at: new Date().toISOString() })
        .select()
        .single()
      if (error) throw error
      return res.json(data)
    }

    return res.status(400).json({ error: `Unknown action: ${action}` })
  } catch (err) {
    console.error('admin-query error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

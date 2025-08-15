import { neon } from '@neondatabase/serverless'

// Get database URL from environment
const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL
  if (!url && process.env.NODE_ENV !== 'production') {
    console.warn('DATABASE_URL environment variable is not set, using fallback')
    return 'postgresql://fallback@localhost/fallback' // Fallback for build time
  }
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return url
}

// Create Neon SQL client - handle build time gracefully
let sql: any
try {
  sql = neon(getDatabaseUrl())
} catch (error) {
  console.warn('Database connection not available during build:', error)
  sql = null
}

// Database connection utility
export class Database {
  private static checkConnection() {
    if (!sql) {
      throw new Error('Database connection not available')
    }
    return sql
  }

  // User operations
  static async createUser(userData: {
    email: string
    passwordHash: string
    fullName: string
    role: string
    businessStage: string
    productCategory: string
    businessName?: string
  }) {
    const sql = this.checkConnection()
    const result = await sql`
      INSERT INTO users (
        email, password_hash, full_name, role, 
        business_stage, product_category, business_name
      ) VALUES (
        ${userData.email}, ${userData.passwordHash}, ${userData.fullName},
        ${userData.role}, ${userData.businessStage}, ${userData.productCategory},
        ${userData.businessName || null}
      )
      RETURNING id, email, full_name, role, business_stage, product_category, 
               business_name, email_verified, created_at
    `
    return result[0]
  }

  static async getUserByEmail(email: string) {
    const sql = this.checkConnection()
    const result = await sql`
      SELECT id, email, password_hash, full_name, role, business_stage,
             product_category, business_name, email_verified, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `
    return result[0] || null
  }

  static async getUserById(userId: string) {
    const sql = this.checkConnection()
    const result = await sql`
      SELECT id, email, full_name, role, business_stage,
             product_category, business_name, email_verified, created_at, updated_at
      FROM users 
      WHERE id = ${userId}
    `
    return result[0] || null
  }

  static async updateUser(userId: string, updates: {
    fullName?: string
    businessName?: string
    role?: string
    businessStage?: string
    productCategory?: string
  }) {
    const setParts = []
    const values = []
    
    if (updates.fullName !== undefined) {
      setParts.push(`full_name = $${setParts.length + 1}`)
      values.push(updates.fullName)
    }
    if (updates.businessName !== undefined) {
      setParts.push(`business_name = $${setParts.length + 1}`)
      values.push(updates.businessName)
    }
    if (updates.role !== undefined) {
      setParts.push(`role = $${setParts.length + 1}`)
      values.push(updates.role)
    }
    if (updates.businessStage !== undefined) {
      setParts.push(`business_stage = $${setParts.length + 1}`)
      values.push(updates.businessStage)
    }
    if (updates.productCategory !== undefined) {
      setParts.push(`product_category = $${setParts.length + 1}`)
      values.push(updates.productCategory)
    }

    if (setParts.length === 0) return null

    const sql = this.checkConnection()
    const result = await sql`
      UPDATE users 
      SET ${sql.unsafe(setParts.join(', '))}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, full_name, role, business_stage,
                product_category, business_name, email_verified, updated_at
    `
    return result[0] || null
  }

  // Store operations
  static async createStore(userId: string, storeData: {
    name: string
    description?: string
    category: string
    theme?: string
    customDomain?: string
  }) {
    const sql = this.checkConnection()
    const result = await sql`
      INSERT INTO stores (
        user_id, name, description, category, theme, custom_domain, 
        status, setup_complete, next_step
      ) VALUES (
        ${userId}, ${storeData.name}, ${storeData.description || null},
        ${storeData.category}, ${storeData.theme || null}, 
        ${storeData.customDomain || null}, 'creating', 0, 'store_creation'
      )
      RETURNING id, name, description, category, status, domain, custom_domain,
                setup_complete, steps_completed, next_step, created_at, updated_at
    `
    return result[0]
  }

  static async getUserStores(userId: string, limit = 10, offset = 0) {
    const stores = await sql`
      SELECT id, name, description, category, status, domain, custom_domain,
             setup_complete, steps_completed, next_step, created_at, updated_at
      FROM stores 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const totalCount = await sql`
      SELECT COUNT(*) as count FROM stores WHERE user_id = ${userId}
    `

    return {
      stores,
      total: parseInt(totalCount[0].count)
    }
  }

  static async getStore(storeId: string, userId: string) {
    const sql = this.checkConnection()
    const result = await sql`
      SELECT id, name, description, category, status, domain, custom_domain,
             setup_complete, steps_completed, next_step, created_at, updated_at
      FROM stores 
      WHERE id = ${storeId} AND user_id = ${userId}
    `
    return result[0] || null
  }

  static async updateStoreProgress(storeId: string, progress: {
    setupComplete?: number
    stepsCompleted?: string[]
    nextStep?: string
    status?: string
  }) {
    const setParts = []
    
    if (progress.setupComplete !== undefined) {
      setParts.push(`setup_complete = ${progress.setupComplete}`)
    }
    if (progress.stepsCompleted !== undefined) {
      setParts.push(`steps_completed = $${setParts.length + 1}`)
    }
    if (progress.nextStep !== undefined) {
      setParts.push(`next_step = '${progress.nextStep}'`)
    }
    if (progress.status !== undefined) {
      setParts.push(`status = '${progress.status}'`)
    }

    if (setParts.length === 0) return null

    const sql = this.checkConnection()
    const result = await sql`
      UPDATE stores 
      SET ${sql.unsafe(setParts.join(', '))}, updated_at = NOW()
      WHERE id = ${storeId}
      RETURNING id, name, status, setup_complete, steps_completed, next_step, updated_at
    `
    return result[0] || null
  }

  // Store progress tracking
  static async createProgressStep(storeId: string, step: string) {
    const sql = this.checkConnection()
    const result = await sql`
      INSERT INTO store_progress (store_id, step, status, started_at)
      VALUES (${storeId}, ${step}, 'in_progress', NOW())
      RETURNING id, step, status, started_at
    `
    return result[0]
  }

  static async completeProgressStep(progressId: string, success = true, errorMessage?: string) {
    const sql = this.checkConnection()
    const result = await sql`
      UPDATE store_progress
      SET status = ${success ? 'completed' : 'failed'}, 
          completed_at = NOW(),
          error_message = ${errorMessage || null}
      WHERE id = ${progressId}
      RETURNING id, step, status, completed_at, error_message
    `
    return result[0]
  }

  // Refresh token operations
  static async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date, deviceInfo?: object) {
    const sql = this.checkConnection()
    const result = await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info)
      VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()}, ${JSON.stringify(deviceInfo || {})})
      RETURNING id, expires_at, created_at
    `
    return result[0]
  }

  static async getRefreshToken(tokenHash: string) {
    const sql = this.checkConnection()
    const result = await sql`
      SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked, rt.device_info,
             u.email, u.full_name, u.role
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = ${tokenHash} AND rt.revoked = false
    `
    return result[0] || null
  }

  static async revokeRefreshToken(tokenHash: string) {
    const sql = this.checkConnection()
    const result = await sql`
      UPDATE refresh_tokens
      SET revoked = true
      WHERE token_hash = ${tokenHash}
      RETURNING id
    `
    return result[0] || null
  }

  // Rate limiting
  static async checkRateLimit(identifier: string, endpoint: string, windowMinutes = 15) {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
    
    const sql = this.checkConnection()
    const result = await sql`
      SELECT request_count, window_start
      FROM rate_limits
      WHERE identifier = ${identifier} 
        AND endpoint = ${endpoint}
        AND window_start > ${windowStart.toISOString()}
    `

    if (result.length === 0) {
      // Create new rate limit record
      await sql`
        INSERT INTO rate_limits (identifier, endpoint, request_count, window_start)
        VALUES (${identifier}, ${endpoint}, 1, NOW())
        ON CONFLICT (identifier, endpoint) 
        DO UPDATE SET request_count = 1, window_start = NOW()
      `
      return { count: 1, windowStart: new Date() }
    }

    // Update existing record
    const current = result[0]
    await sql`
      UPDATE rate_limits
      SET request_count = request_count + 1
      WHERE identifier = ${identifier} AND endpoint = ${endpoint}
    `

    return { 
      count: current.request_count + 1, 
      windowStart: new Date(current.window_start) 
    }
  }

  // Audit logging
  static async logAction(userId: string | null, action: string, resourceType?: string, resourceId?: string, metadata?: object, ipAddress?: string, userAgent?: string) {
    const sql = this.checkConnection()
    await sql`
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, 
        metadata, ip_address, user_agent
      ) VALUES (
        ${userId}, ${action}, ${resourceType || null}, ${resourceId || null},
        ${JSON.stringify(metadata || {})}, ${ipAddress || null}, ${userAgent || null}
      )
    `
  }

  // Metrics
  static async recordMetric(name: string, value: number, type = 'counter', tags?: object) {
    const sql = this.checkConnection()
    await sql`
      INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags)
      VALUES (${name}, ${value}, ${type}, ${JSON.stringify(tags || {})})
    `
  }

  static async getMetrics(metricName: string, hoursBack = 24) {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    
    const sql = this.checkConnection()
    const result = await sql`
      SELECT metric_value, tags, recorded_at
      FROM system_metrics
      WHERE metric_name = ${metricName} AND recorded_at > ${since.toISOString()}
      ORDER BY recorded_at DESC
    `
    return result
  }

  // Health check
  static async healthCheck() {
    try {
      const sql = this.checkConnection()
    const result = await sql`SELECT 1 as health`
      return result[0].health === 1
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }
}

export { sql }
export default Database
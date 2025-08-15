#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

async function setupDatabase() {
  console.log('🏗️  Setting up Auto-Shopify database...')
  
  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required')
    console.log('Please set DATABASE_URL to your Neon database connection string')
    process.exit(1)
  }

  try {
    // Create SQL client
    const sql = neon(databaseUrl)
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📊 Executing database schema...')
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await sql.unsafe(statement)
      } catch (error) {
        // Skip errors for statements that might already exist
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Skipped: ${error.message}`)
        } else {
          throw error
        }
      }
    }
    
    // Test the connection
    console.log('🔍 Testing database connection...')
    const healthCheck = await sql`SELECT 1 as health`
    
    if (healthCheck[0].health === 1) {
      console.log('✅ Database setup completed successfully!')
      console.log('📋 Created tables:')
      console.log('   - users (authentication and profiles)')
      console.log('   - stores (store management)')
      console.log('   - store_progress (real-time tracking)')
      console.log('   - refresh_tokens (JWT security)')
      console.log('   - rate_limits (API protection)')
      console.log('   - audit_logs (security tracking)')
      console.log('   - system_metrics (monitoring)')
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('🚀 Ready for production deployment!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
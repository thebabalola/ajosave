import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate that we have valid credentials (not placeholders)
const isPlaceholder = supabaseUrl.includes('your-project-id') || supabaseUrl.includes('placeholder') || 
                     supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder')
const isValidUrl = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) && !isPlaceholder
const hasValidKey = supabaseAnonKey && supabaseAnonKey.length > 20 && !isPlaceholder

if (isPlaceholder || !isValidUrl || !hasValidKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ Supabase credentials are missing or invalid. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n' +
      'Get your credentials from: https://app.supabase.com/project/_/settings/api'
    )
  }
}

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = isValidUrl && hasValidKey

// Only create client if we have valid credentials, otherwise use a safe dummy client
// Using a valid Supabase URL format to avoid validation errors
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(
      'https://xxxxxxxxxxxxxxxxxxxx.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )

export type Database = {
  public: {
    Tables: {
      pools: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'rotational' | 'target' | 'flexible'
          status: 'active' | 'completed' | 'paused'
          creator_address: string
          contract_address: string
          token_address: string
          total_saved: number
          target_amount: number | null
          progress: number
          members_count: number
          next_payout: string | null
          next_recipient: string | null
          created_at: string
          updated_at: string
          contribution_amount: number | null
          round_duration: number | null
          frequency: string | null
          deadline: string | null
          minimum_deposit: number | null
          withdrawal_fee: number | null
          yield_enabled: boolean
        }
        Insert: {
          name: string
          description?: string | null
          type: 'rotational' | 'target' | 'flexible'
          status?: 'active' | 'completed' | 'paused'
          creator_address: string
          contract_address: string
          token_address: string
          total_saved?: number
          target_amount?: number | null
          progress?: number
          members_count?: number
          next_payout?: string | null
          next_recipient?: string | null
          contribution_amount?: number | null
          round_duration?: number | null
          frequency?: string | null
          deadline?: string | null
          minimum_deposit?: number | null
          withdrawal_fee?: number | null
          yield_enabled?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          type?: 'rotational' | 'target' | 'flexible'
          status?: 'active' | 'completed' | 'paused'
          creator_address?: string
          contract_address?: string
          token_address?: string
          total_saved?: number
          target_amount?: number | null
          progress?: number
          members_count?: number
          next_payout?: string | null
          next_recipient?: string | null
          contribution_amount?: number | null
          round_duration?: number | null
          frequency?: string | null
          deadline?: string | null
          minimum_deposit?: number | null
          withdrawal_fee?: number | null
          yield_enabled?: boolean
        }
      }
      pool_members: {
        Row: {
          id: string
          pool_id: string
          member_address: string
          contribution_amount: number
          status: 'pending' | 'paid' | 'late'
          joined_at: string
        }
        Insert: {
          pool_id: string
          member_address: string
          contribution_amount?: number
          status?: 'pending' | 'paid' | 'late'
        }
        Update: {
          pool_id?: string
          member_address?: string
          contribution_amount?: number
          status?: 'pending' | 'paid' | 'late'
        }
      }
      pool_activity: {
        Row: {
          id: string
          pool_id: string
          activity_type: string
          user_address: string | null
          amount: number | null
          description: string | null
          tx_hash: string | null
          created_at: string
        }
        Insert: {
          pool_id: string
          activity_type: string
          user_address?: string | null
          amount?: number | null
          description?: string | null
          tx_hash?: string | null
        }
        Update: {
          pool_id?: string
          activity_type?: string
          user_address?: string | null
          amount?: number | null
          description?: string | null
          tx_hash?: string | null
        }
      }
    }
  }
}

// Helper function to save pool to database
export async function savePoolToDatabase({
  name,
  description,
  poolType,
  creatorAddress,
  contractAddress,
  tokenAddress,
  members,
  contributionAmount,
  roundDuration,
  frequency,
  targetAmount,
  deadline,
  minimumDeposit,
  withdrawalFee,
  yieldEnabled,
}: {
  name: string
  description: string | null
  poolType: 'rotational' | 'target' | 'flexible'
  creatorAddress: string
  contractAddress: string
  tokenAddress: string
  members: string[]
  contributionAmount?: string
  roundDuration?: number
  frequency?: string
  targetAmount?: string
  deadline?: string
  minimumDeposit?: string
  withdrawalFee?: string
  yieldEnabled?: boolean
}) {
  // Early return if Supabase is not configured
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.',
    }
  }

  try {
    // Insert pool
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .insert([
        {
          name,
          description,
          type: poolType,
          status: 'active',
          creator_address: creatorAddress.toLowerCase(),
          contract_address: contractAddress.toLowerCase(),
          token_address: tokenAddress.toLowerCase(),
          members_count: members.length,
          contribution_amount: contributionAmount ? parseFloat(contributionAmount) : null,
          round_duration: roundDuration || null,
          frequency: frequency || null,
          target_amount: targetAmount ? parseFloat(targetAmount) : null,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          minimum_deposit: minimumDeposit ? parseFloat(minimumDeposit) : null,
          withdrawal_fee: withdrawalFee ? parseFloat(withdrawalFee) : null,
          yield_enabled: yieldEnabled || false,
        },
      ])
      .select()

    if (poolError) {
      // Check if it's a table not found error
      if (poolError.code === 'PGRST205' || (poolError.message && poolError.message.includes("Could not find the table"))) {
        throw new Error('Database tables not found. Please run the SQL schema to create the required tables.')
      }
      throw poolError
    }
    if (!pool || pool.length === 0) throw new Error('Failed to create pool')

    const poolId = pool[0].id

    // Insert members
    if (members.length > 0) {
      const memberData = members.map((address) => ({
        pool_id: poolId,
        member_address: address.toLowerCase(),
        contribution_amount: contributionAmount ? parseFloat(contributionAmount) : 0,
        status: 'pending' as const,
      }))

      const { error: membersError } = await supabase
        .from('pool_members')
        .insert(memberData)

      if (membersError) throw membersError
    }

    // Log activity
    await supabase.from('pool_activity').insert([
      {
        pool_id: poolId,
        activity_type: 'pool_created',
        user_address: creatorAddress.toLowerCase(),
        description: `${poolType} pool created`,
      },
    ])

    return { success: true, poolId, pool: pool[0] }
  } catch (error) {
    // Check if it's a table not found error
    const errorObj = error as { code?: string; message?: string }
    if (errorObj?.code === 'PGRST205' || (error instanceof Error && error.message.includes("Could not find the table"))) {
      return {
        success: false,
        error: 'Database tables not found. Please run the SQL schema to create the required tables. See frontend/supabase_schema.sql',
      }
    }
    
    // Check if it's a fetch/connection error
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED'))) {
      return {
        success: false,
        error: 'Unable to connect to Supabase. Please check your NEXT_PUBLIC_SUPABASE_URL and ensure Supabase is running.',
      }
    }
    
    // Only log non-connection/schema errors
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (!errorMsg.includes('Supabase') && !errorMsg.includes('Database tables')) {
      console.error('Failed to save pool:', error)
    }
    
    return {
      success: false,
      error: errorMsg,
    }
  }
}
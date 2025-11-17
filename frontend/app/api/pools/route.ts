import { supabase, savePoolToDatabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.' },
        { status: 503 }
      )
    }

    const body = await req.json()

    const {
      name,
      description,
      poolType,
      creatorAddress,
      poolAddress,
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
      txHash,
    } = body

    // Validate required fields
    if (!name || !poolType || !creatorAddress || !poolAddress || !tokenAddress || !members?.length) {
      return NextResponse.json(
        { error: 'Missing required fields. Need: name, poolType, creatorAddress, poolAddress, tokenAddress, members' },
        { status: 400 }
      )
    }

    // Use the helper function from supabase.ts
    const result = await savePoolToDatabase({
      name,
      description,
      poolType,
      creatorAddress,
      contractAddress: poolAddress,
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
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save pool' },
        { status: 500 }
      )
    }

    // Log the pool creation activity with tx hash
    if (txHash && result.poolId && isSupabaseConfigured) {
      try {
        await supabase.from('pool_activity').insert([
          {
            pool_id: result.poolId,
            activity_type: 'pool_created',
            user_address: creatorAddress.toLowerCase(),
            description: `${poolType} pool created`,
            tx_hash: txHash,
          },
        ])
      } catch (err) {
        // Ignore activity log errors - pool was already created
        console.warn('Failed to log pool activity:', err)
      }
    }

    return NextResponse.json(result.pool, { status: 201 })
  } catch (error) {
    console.error('Pool creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.' },
        { status: 503 }
      )
    }

    const poolId = req.nextUrl.searchParams.get('id')
    const creatorAddress = req.nextUrl.searchParams.get('creator')

    if (poolId) {
      // Fetch single pool by ID
      const { data, error } = await supabase
        .from('pools')
        .select(`
          *,
          pool_members (
            id,
            member_address,
            contribution_amount,
            status
          ),
          pool_activity (
            id,
            activity_type,
            user_address,
            amount,
            description,
            created_at,
            tx_hash
          )
        `)
        .eq('id', poolId)
        .single()

      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || (error.message && error.message.includes("Could not find the table"))) {
          return NextResponse.json(
            { 
              error: 'Database tables not found. Please run the SQL schema to create the required tables.',
              details: 'See frontend/supabase_schema.sql for the schema. Run it in your Supabase SQL editor.'
            },
            { status: 503 }
          )
        }
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    } else if (creatorAddress) {
      // Fetch all pools by creator
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('creator_address', creatorAddress.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) {
        // Check if it's a table not found error (schema not set up)
        if (error.code === 'PGRST205' || (error.message && error.message.includes("Could not find the table"))) {
          throw new Error('Database tables not found. Please run the SQL schema to create the required tables.')
        }
        // Check if it's a fetch/connection error
        const errorMsg = error.message || String(error) || ''
        if (errorMsg.includes('fetch failed') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ENOTFOUND')) {
          throw new Error('Unable to connect to Supabase')
        }
        throw error
      }

      return NextResponse.json(data || [])
    } else {
      // Fetch all pools
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        // Check if it's a table not found error (schema not set up)
        if (error.code === 'PGRST205' || (error.message && error.message.includes("Could not find the table"))) {
          throw new Error('Database tables not found. Please run the SQL schema to create the required tables.')
        }
        // Check if it's a fetch/connection error
        const errorMsg = error.message || String(error) || ''
        if (errorMsg.includes('fetch failed') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ENOTFOUND')) {
          throw new Error('Unable to connect to Supabase')
        }
        throw error
      }

      return NextResponse.json(data || [])
    }
  } catch (error) {
    // Check if it's a table not found error
    const errorObj = error as { code?: string; message?: string }
    if (errorObj?.code === 'PGRST205' || (error instanceof Error && error.message.includes("Could not find the table"))) {
      return NextResponse.json(
        { 
          error: 'Database tables not found. Please run the SQL schema to create the required tables.',
          details: 'See frontend/supabase_schema.sql for the schema. Run it in your Supabase SQL editor.'
        },
        { status: 503 }
      )
    }
    
    // Check if it's a Supabase connection error
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (errorMsg.includes('fetch failed') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ENOTFOUND') || errorMsg.includes('Unable to connect to Supabase')) {
      return NextResponse.json(
        { 
          error: 'Unable to connect to Supabase. Please check your NEXT_PUBLIC_SUPABASE_URL and ensure Supabase is running.',
          details: 'This usually means Supabase credentials are missing or invalid. Check your .env.local file.'
        },
        { status: 503 }
      )
    }
    
    // Only log non-connection/schema errors
    if (!errorMsg.includes('Supabase') && !errorMsg.includes('Database tables')) {
      console.error('Pool fetch error:', error)
    }
    
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.' },
        { status: 503 }
      )
    }

    const poolId = req.nextUrl.searchParams.get('id')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID required' },
        { status: 400 }
      )
    }

    const body = await req.json()

    const { data, error } = await supabase
      .from('pools')
      .update(body)
      .eq('id', poolId)
      .select()
      .single()

    if (error) {
      // Check if it's a table not found error
      if (error.code === 'PGRST205' || (error.message && error.message.includes("Could not find the table"))) {
        return NextResponse.json(
          { 
            error: 'Database tables not found. Please run the SQL schema to create the required tables.',
            details: 'See frontend/supabase_schema.sql for the schema. Run it in your Supabase SQL editor.'
          },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update pool' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    // Check if it's a table not found error
    const errorObj = error as { code?: string; message?: string }
    if (errorObj?.code === 'PGRST205' || (error instanceof Error && error.message.includes("Could not find the table"))) {
      return NextResponse.json(
        { 
          error: 'Database tables not found. Please run the SQL schema to create the required tables.',
          details: 'See frontend/supabase_schema.sql for the schema. Run it in your Supabase SQL editor.'
        },
        { status: 503 }
      )
    }
    
    const errorMsg = error instanceof Error ? error.message : String(error)
    // Only log non-schema errors
    if (!errorMsg.includes('Database tables')) {
      console.error('Pool update error:', error)
    }
    
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
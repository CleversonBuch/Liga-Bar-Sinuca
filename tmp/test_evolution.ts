import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetch() {
    // 1. Fetch top 5 players (mock IDs or just anyone with matches)
    const { data: topPlayers } = await supabase.from('players').select('id, name').limit(5)
    if (!topPlayers) return console.log('No players')

    const playerIds = topPlayers.map(p => p.id)

    // 2. Fetch matches where they WON (to build cumulative win chart)
    const { data: matches } = await supabase.from('matches')
        .select('id, winner_id, finished_at')
        .in('winner_id', playerIds)
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: true })
        // limit to last 50 matches for performance in chart
        .limit(50)

    console.log(`Found ${matches?.length} matches won by top 5 players`)

    // 3. Build cumulative array
    let cumulative: Record<string, number> = {}
    playerIds.forEach(id => cumulative[id] = 0)

    const chartData = matches?.map((m, index) => {
        cumulative[m.winner_id] += 1 // 1 win = 1 point on the graph

        let point: any = { name: `P${index + 1}`, date: m.finished_at }
        topPlayers.forEach(p => {
            point[p.name] = cumulative[p.id]
        })
        return point
    })

    console.log('Chart Data Sample:', chartData?.slice(0, 3))
}

testFetch()

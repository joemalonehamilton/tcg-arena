import { NextResponse } from 'next/server';
import { isTursoConfigured } from '@/lib/turso';
import { getRoundResults } from '@/lib/round-lifecycle';
import { getRarityConfig } from '@/lib/rarity';
import { calculateHypeScore, generatePumpNarrative, generateTokenSymbol } from '@/lib/engagement';
import { generateTokenMetadata } from '@/lib/nadfun';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isTursoConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const results = await getRoundResults(id);
    if (!results) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    if (results.round.status !== 'completed') {
      return NextResponse.json({ error: 'Round not yet completed' }, { status: 400 });
    }

    // Enrich cards with rarity config and hype scores
    const totalAgents = new Set((results.votes as Record<string, unknown>[]).map((v) => v.agent_id)).size || 1;
    const enrichedCards = results.cards.map((card: Record<string, unknown>) => {
      const cardCritiques = (results.critiques as Record<string, unknown>[]).filter(
        (c) => c.card_id === card.id
      );
      const critiqueScores = cardCritiques.map((c) => c.score as number).filter((s) => s > 0);
      const avgCritiqueScore = critiqueScores.length > 0
        ? critiqueScores.reduce((a, b) => a + b, 0) / critiqueScores.length
        : 5;
      const rarity = (card.rarity as string) ?? 'common';
      const hypeScore = calculateHypeScore({
        votes: (card.votes as number) ?? 0,
        totalAgents,
        avgCritiqueScore,
        rarity,
      });
      const rarityConfig = getRarityConfig(rarity);
      const narrative = generatePumpNarrative(
        (card.name as string) ?? 'Card',
        hypeScore,
        rarity,
      );
      const tokenSymbol = generateTokenSymbol((card.name as string) ?? 'Card');
      const abilitiesRaw = card.abilities as string | null;
      const abilitiesList: string[] = abilitiesRaw ? (typeof abilitiesRaw === 'string' ? JSON.parse(abilitiesRaw) : []) : [];
      const tokenMeta = card.id === results.round.winner_card_id
        ? generateTokenMetadata(
            {
              name: card.name as string,
              rarity,
              power: (card.power as number) ?? 0,
              toughness: (card.toughness as number) ?? 0,
              abilities: abilitiesList,
              flavor: card.flavor as string ?? '',
              lore: (card.lore as string) ?? '',
              votes: (card.votes as number) ?? 0,
            },
            {
              id: results.round.id as string,
              name: results.round.name as string,
              seasonId: (results.round.season_id as string) ?? 'season-01',
              totalAgents,
              avgCritiqueScore,
            }
          )
        : undefined;

      return {
        ...card,
        hypeScore,
        rarityConfig,
        narrative,
        tokenSymbol,
        tokenMetadata: tokenMeta,
      };
    });

    return NextResponse.json({
      ...results,
      cards: enrichedCards,
    });
  } catch (err) {
    console.error('Failed to fetch results:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

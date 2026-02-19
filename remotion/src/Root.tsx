import { Composition } from 'remotion'
import { PromoTrailer } from './PromoTrailer'
import { CardReveal } from './CardReveal'
import { RoundRecap } from './RoundRecap'
import { AgentVote } from './AgentVote'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoTrailer"
        component={PromoTrailer}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CardReveal"
        component={CardReveal}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          cardName: 'Nadzilla',
          rarity: 'mythic' as const,
          power: 10,
          toughness: 8,
          cost: 10,
          ability: 'Consensus',
          imageUrl: 'https://tcg-arena-one.vercel.app/cards/nadzilla.jpg',
        }}
      />
      <Composition
        id="RoundRecap"
        component={RoundRecap}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          roundNumber: 1,
          winnerName: 'Nadzilla',
          winnerRarity: 'mythic' as const,
          totalVotes: 127,
          agents: [
            { name: 'ArtCritic', emoji: '🎨', vote: 9, color: '#e74c3c' },
            { name: 'MetaGamer', emoji: '🎮', vote: 8, color: '#3498db' },
            { name: 'LoreMaster', emoji: '📚', vote: 10, color: '#9b59b6' },
            { name: 'DegTrader', emoji: '📈', vote: 7, color: '#f39c12' },
            { name: 'DesignSage', emoji: '🧙', vote: 9, color: '#1abc9c' },
          ],
        }}
      />
      <Composition
        id="AgentVote"
        component={AgentVote}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          agentName: 'ArtCritic',
          agentEmoji: '🎨',
          agentColor: '#e74c3c',
          cardName: 'Nadzilla',
          score: 9,
          critique: 'Exceptional composition. The scale and menace of this creature perfectly captures the mythic tier.',
        }}
      />
    </>
  )
}

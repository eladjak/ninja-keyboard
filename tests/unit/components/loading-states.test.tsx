import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import AppLoading from '@/app/(app)/loading'
import HomeLoading from '@/app/(app)/home/loading'
import LessonsLoading from '@/app/(app)/lessons/loading'
import PracticeLoading from '@/app/(app)/practice/loading'
import StatisticsLoading from '@/app/(app)/statistics/loading'
import SpeedTestLoading from '@/app/(app)/speed-test/loading'
import CertificatesLoading from '@/app/(app)/certificates/loading'
import BattleLoading from '@/app/(app)/battle/loading'
import LeaderboardLoading from '@/app/(app)/leaderboard/loading'

describe('Loading states', () => {
  const loadingComponents = [
    { name: 'AppLoading', Component: AppLoading },
    { name: 'HomeLoading', Component: HomeLoading },
    { name: 'LessonsLoading', Component: LessonsLoading },
    { name: 'PracticeLoading', Component: PracticeLoading },
    { name: 'StatisticsLoading', Component: StatisticsLoading },
    { name: 'SpeedTestLoading', Component: SpeedTestLoading },
    { name: 'CertificatesLoading', Component: CertificatesLoading },
    { name: 'BattleLoading', Component: BattleLoading },
    { name: 'LeaderboardLoading', Component: LeaderboardLoading },
  ]

  loadingComponents.forEach(({ name, Component }) => {
    describe(name, () => {
      it('renders without crashing', () => {
        const { container } = render(<Component />)
        expect(container.firstElementChild).toBeInTheDocument()
      })

      it('contains skeleton elements', () => {
        const { container } = render(<Component />)
        const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
      })

      it('is RTL-directed', () => {
        const { container } = render(<Component />)
        expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
      })
    })
  })
})

'use client'

import { useState, useRef, useEffect } from 'react'
import type { CalendarWeek } from '@/lib/github'

interface Props {
  weeks: CalendarWeek[]
  totalContributions: number
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColor(count: number): string {
  if (count === 0)  return 'rgba(255,255,255,0.07)'
  if (count <= 2)   return 'rgba(134,201,255,0.28)'
  if (count <= 5)   return 'rgba(134,201,255,0.50)'
  if (count <= 10)  return 'rgba(134,201,255,0.72)'
  return                   'rgba(134,201,255,0.96)'
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr))
}

export function GitHubHeatmap({ weeks, totalContributions }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)


  return (
    <div className="heatmap-wrap">
      <div className="heatmap-header">
        <span className="heatmap-title">GitHub Contributions</span>
        <span className="heatmap-total">{totalContributions.toLocaleString()} contributions this year</span>
      </div>

      <div className="heatmap-scroll" ref={scrollRef} onMouseLeave={() => setTooltip(null)}>
        <div className="heatmap-inner">
          <div className="heatmap-day-labels">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className="heatmap-day-label">{d}</span>
            ))}
          </div>

          <div className="heatmap-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.contributionDays.map((day, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{ background: getColor(day.contributionCount) }}
                    onMouseEnter={e => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setTooltip({
                        text: `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} · ${formatDate(day.date)}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      })
                    }}
                    onTouchStart={e => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setTooltip({
                        text: `${day.contributionCount} · ${formatDate(day.date)}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      })
                    }}
                    onTouchEnd={() => setTimeout(() => setTooltip(null), 1500)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span className="heatmap-legend-label">Less</span>
        {[0, 2, 5, 8, 12].map(n => (
          <div key={n} className="heatmap-legend-cell" style={{ background: getColor(n) }} />
        ))}
        <span className="heatmap-legend-label">More</span>
      </div>

      {tooltip && (
        <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
import React from 'react';
import { LegendSection } from './LegendSection';
import { MultiPercentageBar, PercentageSegment } from './MultiPercentageBar';

export interface LegendItem {
  label: string;
  count: number;
  color: string;
}

export interface FailingResource {
  name: string;
  failureCount: number;
  totalCount: number;
  failureRate: number; // percentage
  color: string;
}

export interface HoverContentProps {
  enabled: boolean;
  totalCount: number;
  totalLabel: string;
  legendItems: LegendItem[];
  failingResources?: FailingResource[];
}

export const HoverContent: React.FC<HoverContentProps> = ({
  enabled,
  totalCount,
  totalLabel,
  legendItems,
  failingResources,
}) => {
  if (!enabled) {
    return null;
  }

  // Get top 5 most frequently failing resources
  const top5FailingResources = failingResources
    ?.sort((a, b) => b.failureCount - a.failureCount)
    .slice(0, 5) || [];

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '1rem 0',
        overflow: 'visible',
      }}
    >
      <LegendSection title={`${totalCount} ${totalLabel}`} items={legendItems} />
      
      {/* Top 5 Failing Resources */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: 'var(--sapTile_Background, #ffffff)',
          border: '1px solid var(--sapList_BorderColor, #e1e5e9)',
          boxShadow: 'var(--sapContent_Shadow1, 0 1px 3px rgba(0, 0, 0, 0.1))',
        }}
      >
        <h3
          style={{
            margin: '0 0 1rem 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--sapTitleColor, #374151)',
            textAlign: 'center',
          }}
        >
          {top5FailingResources.length > 0
            ? 'Top 5 Most Frequently Failing Resources'
            : 'Resource Health Status'}
        </h3>
        
        {top5FailingResources.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
          {top5FailingResources.map((resource, index) => {
            // Create segments for MultiPercentageBar
            const segments: PercentageSegment[] = [
              {
                percentage: resource.failureRate,
                color: resource.color,
                label: 'Failed',
              },
              {
                percentage: 100 - resource.failureRate,
                color: 'var(--sapSuccessColor, #30a14e)',
                label: 'Success',
              },
            ];

            return (
              <div
                key={resource.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--sapObjectHeader_Background, #f8f9fa)',
                  border: '1px solid var(--sapGroup_ContentBorderColor, #e1e5e9)',
                }}
              >
                {/* Resource header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'var(--sapNegativeColor, #bb0000)',
                      }}
                    >
                      #{index + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: 'var(--sapTextColor, #374151)',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={resource.name}
                    >
                      {resource.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.1rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--sapNegativeColor, #bb0000)',
                      }}
                    >
                      {resource.failureCount} failures
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--sapContent_LabelColor, #6b7280)',
                      }}
                    >
                      of {resource.totalCount} total
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <MultiPercentageBar
                  segments={segments}
                  label={`${resource.failureRate.toFixed(1)}% failure rate`}
                  showPercentage={true}
                  isHealthy={resource.failureRate < 10}
                  barHeight="12px"
                  barWidth="100%"
                  labelFontSize="0.8rem"
                  animationDuration={600}
                />
              </div>
            );
          })}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--sapContent_LabelColor, #6b7280)',
              fontSize: '0.9rem',
            }}
          >
            <div
              style={{
                fontSize: '2.5rem',
                marginBottom: '0.5rem',
                color: 'var(--sapSuccessColor, #30a14e)',
              }}
            >
              ✓
            </div>
            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
              All resources are healthy!
            </div>
            <div>No failing resources found</div>
          </div>
        )}
      </div>
    </div>
  );
};

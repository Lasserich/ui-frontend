import { Card, CardHeader, ProgressIndicator, Button } from '@ui5/webcomponents-react';
import { RadarChart } from '@ui5/webcomponents-react-charts';
import { useTranslation } from 'react-i18next';
import { APIError } from '../../lib/api/error';
import { ManagedResourceItem, Condition } from '../../lib/shared/types';
import cx from 'clsx';
import styles from './Hints.module.css';
import React from 'react';

interface CrossplaneHintProps {
  enabled?: boolean;
  version?: string;
  onActivate?: () => void;
  allItems?: ManagedResourceItem[];
  isLoading?: boolean;
  error?: APIError;
}

export const CrossplaneHint: React.FC<CrossplaneHintProps> = ({
  enabled = false,
  version,
  onActivate,
  allItems = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation();

  const cardClassName = cx({
    [styles.disabled]: !enabled,
  });

  // Aggregate healthiness by resource type
  const resourceTypeHealth: Record<string, number> = {};
  const resourceTypeTotal: Record<string, number> = {};
  allItems.forEach((item: ManagedResourceItem) => {
    const type = item.kind || 'Unknown';
    resourceTypeTotal[type] = (resourceTypeTotal[type] || 0) + 1;
    const conditions = item.status?.conditions || [];
    const ready = conditions.find((c: Condition) => c.type === 'Ready' && c.status === 'True');
    const synced = conditions.find((c: Condition) => c.type === 'Synced' && c.status === 'True');
    if (ready && synced) {
      resourceTypeHealth[type] = (resourceTypeHealth[type] || 0) + 1;
    }
  });

  // Prepare radar chart dataset: each resource type is a dimension, value is percent healthy
  const radarDataset = Object.keys(resourceTypeTotal).map(type => ({
    type,
    health: `${Math.round(((resourceTypeHealth[type] || 0) / resourceTypeTotal[type]) * 100)}%`
  }));

  const totalCount = allItems.length;

  const [hovered, setHovered] = React.useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Card
        header={
          <CardHeader
            additionalText={enabled ? `v${version ?? ''}` : undefined}
            avatar={
              <img
                src="/crossplane-icon.png"
                alt="Crossplane"
                style={{ width: 50, height: 50, borderRadius: '50%', background: 'transparent', objectFit: 'cover' }}
              />
            }
            titleText={t('Hints.CrossplaneHint.title')}
            subtitleText={t('Hints.CrossplaneHint.subtitle')}
            interactive={true}
          />
        }
        className={cardClassName}
        onClick={() => {
          const el = document.querySelector('.crossplane-table-element');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
          {isLoading ? (
            <ProgressIndicator
              value={0}
              displayValue={t('Hints.common.loading')}
              valueState="None"
              style={{ 
                width: '80%', 
                maxWidth: 500, 
                minWidth: 120,
              }}
            />
          ) : error ? (
            <ProgressIndicator
              value={0}
              displayValue={t('Hints.common.errorLoadingResources')}
              valueState="Negative"
              style={{ 
                width: '80%', 
                maxWidth: 500, 
                minWidth: 120,
              }}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              width: '100%', 
              maxWidth: 500, 
              padding: '0 1rem' 
            }}>
              {(() => {
                // Calculate the three states
                const healthyCount = allItems.filter((item: ManagedResourceItem) => {
                  const conditions = item.status?.conditions || [];
                  const ready = conditions.find((c: Condition) => c.type === 'Ready' && c.status === 'True');
                  const synced = conditions.find((c: Condition) => c.type === 'Synced' && c.status === 'True');
                  return !!ready && !!synced;
                }).length;

                const creatingCount = allItems.filter((item: ManagedResourceItem) => {
                  const conditions = item.status?.conditions || [];
                  const ready = conditions.find((c: Condition) => c.type === 'Ready' && c.status === 'True');
                  const synced = conditions.find((c: Condition) => c.type === 'Synced' && c.status === 'True');
                  return !!synced && !ready;
                }).length;

                const unhealthyCount = totalCount - healthyCount - creatingCount;

                const healthyPercentage = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;
                const creatingPercentage = totalCount > 0 ? Math.round((creatingCount / totalCount) * 100) : 0;
                const unhealthyPercentage = totalCount > 0 ? Math.round((unhealthyCount / totalCount) * 100) : 0;

                const cards = [
                  {
                    percentage: healthyPercentage,
                    color: '#107e3e',
                    label: 'Healthy'
                  },
                  {
                    percentage: creatingPercentage,
                    color: '#e9730c',
                    label: 'Creating'
                  },
                  {
                    percentage: unhealthyPercentage,
                    color: '#b00',
                    label: 'Unhealthy'
                  }
                ].filter(card => card.percentage > 0);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                    {/* Slim cards */}
                    <div style={{ display: 'flex', gap: '4px', width: '80%', maxWidth: '400px' }}>
                      {cards.map((card, index) => (
                        <div 
                          key={index}
                          style={{
                            flex: card.percentage,
                            minWidth: '10px',
                            backgroundColor: card.color,
                            borderRadius: '6px',
                            height: '8px'
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Colored labels below */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                      {cards.map((card, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div 
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: card.color,
                              borderRadius: '3px'
                            }}
                          />
                          <span style={{ fontSize: '0.875rem', color: '#333', fontWeight: '500' }}>
                            {card.label}: {card.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        {/* Minimal RadarChart for resource healthiness, animated appearance on hover */}
        {!isLoading && !error && radarDataset.length > 0 && (
          <div 
            style={{ 
              width: 260, 
              height: hovered ? 260 : 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              margin: hovered ? '1rem 0' : '0', 
              overflow: 'hidden',
              transition: 'height 0.3s ease-in-out, margin 0.3s ease-in-out',
              opacity: hovered ? 1 : 0,
              transform: `scale(${hovered ? 1 : 0.8})`,
              transformOrigin: 'center',
              willChange: 'height, margin, opacity, transform'
            }}
          >
            <div
              style={{
                transition: 'opacity 0.2s ease-in-out 0.1s, transform 0.3s ease-in-out',
                opacity: hovered ? 1 : 0,
                transform: `translateY(${hovered ? '0' : '20px'})`,
              }}
            >
              <RadarChart
                dataset={radarDataset}
                dimensions={[{ accessor: 'type' }]}
                measures={[{
                  accessor: 'health',
                  color: 'green',
                  hideDataLabel: true,
                }]}
                style={{ width: 220, height: 220 }}
                noLegend={true}
              />
            </div>
          </div>
        )}
        {!enabled && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 2,
              pointerEvents: 'auto',
            }}
          >
            <Button design="Emphasized" onClick={onActivate}>
              {t('Hints.CrossplaneHint.activate')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

import { Card, CardHeader, Button } from '@ui5/webcomponents-react';
import { BarChart } from '@ui5/webcomponents-react-charts';
import { useTranslation } from 'react-i18next';
import cx from 'clsx';
import { APIError } from '../../lib/api/error';
import { styles } from './Hints';
import { ManagedResourceItem, Condition } from '../../lib/shared/types';
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

  // Aggregate all resources by status
  const totalCount = allItems.length;
  const healthyCount = allItems.filter((item: ManagedResourceItem) => {
    const conditions = item.status?.conditions || [];
    const ready = conditions.find((c: Condition) => c.type === 'Ready' && c.status === 'True');
    const synced = conditions.find((c: Condition) => c.type === 'Synced' && c.status === 'True');
    return !!ready && !!synced;
  }).length;
  
  const creatingCount = allItems.filter(item => {
    const conditions = item.status?.conditions || [];
    const readyCondition = conditions.find((c: Condition) => c.type === 'Ready');
    return readyCondition && readyCondition.status === 'False' && 
      (readyCondition.reason?.includes('Creating') || readyCondition.reason?.includes('Pending'));
  }).length;
  
  const unhealthyCount = totalCount - healthyCount - creatingCount;

  // Prepare single aggregated bar chart dataset with normalized percentages
  const barChartDataset = totalCount > 0 ? [{
    name: '',
    healthy: Math.round((healthyCount / totalCount) * 100),
    creating: Math.round((creatingCount / totalCount) * 100),
    unhealthy: Math.round((unhealthyCount / totalCount) * 100),
  }] : [];

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
            interactive={enabled}
          />
        }
        className={cx({
          [styles['disabled']]: !enabled,
        })}
        onClick={enabled ? () => {
          const el = document.querySelector('.crossplane-table-element');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Disabled overlay */}
        {!enabled && <div className={styles.disabledOverlay} />}
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', gap: '0.5rem' }}>
          {isLoading ? (
            <div style={{ fontSize: '0.875rem', color: '#6A6D70' }}>
              {t('Hints.common.loading')}
            </div>
          ) : error ? (
            <div style={{ fontSize: '0.875rem', color: '#BB0000' }}>
              {t('Hints.common.errorLoadingResources')}
            </div>
          ) : (
            <>
              {enabled && allItems.length > 0 ? (
                <div style={{ width: '100%', maxWidth: 400, minWidth: 250, height: 120 }}>
                  <BarChart
                    dataset={barChartDataset}
                    dimensions={[{ accessor: 'name' }]}
                    measures={[
                      {
                        accessor: 'healthy',
                        color: '#107E3E',
                        stackId: 'status',
                        formatter: (value: number) => `${value}%`
                      },
                      {
                        accessor: 'creating',
                        color: '#E9730C',
                        stackId: 'status',
                        formatter: (value: number) => `${value}%`
                      },
                      {
                        accessor: 'unhealthy',
                        color: '#BB0000',
                        stackId: 'status',
                        formatter: (value: number) => `${value}%`
                      }
                    ]}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}

                  />
                </div>
              ) : enabled ? (
                <div style={{ fontSize: '0.875rem', color: '#6A6D70' }}>
                  {t('Hints.CrossplaneHint.noResources')}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#6A6D70' }}>
                  {t('Hints.CrossplaneHint.inactive')}
                </div>
              )}
              
              {/* Summary stats */}
              {enabled && allItems.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6A6D70' }}>
                  <span style={{ color: '#107E3E' }}>
                    {healthyCount} {t('Hints.CrossplaneHint.healthy')}
                  </span>
                  <span style={{ color: '#E9730C' }}>
                    {creatingCount} Creating
                  </span>
                  <span style={{ color: '#BB0000' }}>
                    {unhealthyCount} {t('Hints.CrossplaneHint.unhealthy')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        {/* Minimal RadarChart for resource healthiness, only show on hover */}
        {hovered && !isLoading && !error && radarDataset.length > 0 && (
          <div style={{ width: 260, height: 260, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1rem 0', overflow: 'visible' }}>
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

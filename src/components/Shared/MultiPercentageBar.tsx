import React from 'react';

interface PercentageSegment {
  percentage: number;
  color: string;
  label: string;
}

interface MultiPercentageBarProps {
  segments: PercentageSegment[];
  showOnlyNonZero?: boolean;
  barWidth?: string;
  barMaxWidth?: string;
  barHeight?: string;
  showLabels?: boolean;
  labelFontSize?: string;
  labelColor?: string;
  labelFontWeight?: string;
  gap?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MultiPercentageBar: React.FC<MultiPercentageBarProps> = ({
  segments,
  showOnlyNonZero = true,
  barWidth = '80%',
  barMaxWidth = '400px',
  barHeight = '10px',
  showLabels = true,
  labelFontSize = '0.875rem',
  gap = '4px',
  borderRadius = '6px',
  className,
  style,
}) => {
  const filteredSegments = showOnlyNonZero 
    ? segments.filter(segment => segment.percentage > 0)
    : segments;

  if (filteredSegments.length === 0) {
    return null;
  }

  // Find the segment with the highest percentage
  const largestSegment = filteredSegments.reduce((prev, current) => 
    current.percentage > prev.percentage ? current : prev
  );

  // Check if all resources are healthy (assuming healthy means 100% of the largest segment)
  const allHealthy = largestSegment.percentage === 100;

  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '4px', 
        width: '100%',
        paddingBottom: '8px',
        ...style
      }}
    >
      {/* Label always shows "Healthy" with conditional styling */}
      {showLabels && (
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          flexWrap: 'wrap', 
          justifyContent: 'left', 
          width: '80%' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              fontSize: labelFontSize, 
              color: allHealthy ? 'green' : 'black', 
              fontWeight: allHealthy ? '700' : '400'
            }}>
              {largestSegment.percentage}%
            </span>
            <span style={{ 
              fontSize: labelFontSize, 
              color: allHealthy ? 'green' : 'black', 
              fontWeight: allHealthy ? '700' : '400'
            }}>
              Healthy
            </span>
          </div>
        </div>
      )}
      
      {/* Colored bars */}
      <div style={{ 
        display: 'flex', 
        gap, 
        width: barWidth, 
        maxWidth: barMaxWidth 
      }}>
        {filteredSegments.map((segment, index) => (
          <div 
            key={index}
            style={{
              flex: segment.percentage,
              minWidth: '10px',
              backgroundColor: segment.color,
              borderRadius,
              height: barHeight
            }}
          />
        ))}
      </div>
    </div>
  );
};

export type { PercentageSegment, MultiPercentageBarProps };

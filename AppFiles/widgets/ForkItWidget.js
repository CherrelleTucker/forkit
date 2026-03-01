import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

const COLORS = {
  bg: '#0D0D0D',
  accent: '#FB923C',
  pop: '#2DD4BF',
  text: '#FAFAFA',
  muted: '#A1A1AA',
  cardBg: '#1A1410',
};

export function ForkItWidget({ status = 'idle', restaurantName, restaurantRating }) {
  if (status === 'loading') {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.bg,
          borderRadius: 16,
          padding: 16,
        }}
      >
        <TextWidget
          text="🍴"
          style={{ fontSize: 28 }}
        />
        <TextWidget
          text="Picking..."
          style={{
            fontSize: 16,
            color: COLORS.accent,
            fontWeight: '600',
            marginTop: 4,
          }}
        />
      </FlexWidget>
    );
  }

  if (status === 'result' && restaurantName) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: COLORS.bg,
          borderRadius: 16,
          padding: 12,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <FlexWidget
          clickAction="OPEN_APP"
          style={{
            width: 'match_parent',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <TextWidget
            text={restaurantName}
            style={{
              fontSize: 16,
              color: COLORS.text,
              fontWeight: '700',
            }}
            maxLines={2}
          />
          <TextWidget
            text={restaurantRating ? `⭐ ${restaurantRating}` : ''}
            style={{
              fontSize: 14,
              color: COLORS.pop,
              fontWeight: '600',
              marginTop: 2,
            }}
          />
          <TextWidget
            text="Tap to open app"
            style={{
              fontSize: 11,
              color: COLORS.muted,
              marginTop: 2,
            }}
          />
        </FlexWidget>
        <FlexWidget
          clickAction="FORK_IT"
          style={{
            width: 'match_parent',
            backgroundColor: COLORS.accent,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
            marginTop: 4,
          }}
        >
          <TextWidget
            text="🍴 Fork Again"
            style={{
              fontSize: 14,
              color: '#0D0D0D',
              fontWeight: '700',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  // Default: idle state
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'column',
      }}
    >
      <TextWidget
        text="🍴"
        style={{ fontSize: 36 }}
      />
      <FlexWidget
        clickAction="FORK_IT"
        style={{
          backgroundColor: COLORS.accent,
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 10,
          marginTop: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="Fork It!"
          style={{
            fontSize: 18,
            color: '#0D0D0D',
            fontWeight: '700',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

// ForkIt — InfoModal component
// About/info modal with version, privacy links, Pro upgrade, and tour launch.

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Purchases from 'react-native-purchases';

import {
  SCROLL_THUMB_PERCENT,
  PRO_PRICE_LABEL,
  RC_ENTITLEMENT_ID,
  SUPPORT_MODAL_DELAY,
  TOAST_LONG,
  TOAST_DEFAULT,
  EASTER_EGG_TAPS,
} from '../constants/config';
import modalStyles from '../constants/sharedStyles';
import { THEME, INITIAL_SCREEN_HEIGHT, MODAL_CONTENT_RATIO } from '../constants/theme';
import { openMapsSearchByText } from '../utils/helpers';

/**
 * Info/About modal.
 * @param {object} props
 * @param {boolean} props.visible - Whether the modal is shown
 * @param {() => void} props.onClose - Close the modal
 * @param {boolean} props.isPro - Whether the user has Pro
 * @param {(type: string) => void} props.showPaywall - Show upgrade paywall
 * @param {(text: string, kind: string, ms: number) => void} props.showToast - Show a toast message
 * @param {() => void} props.startTour - Start the interactive tour
 * @returns {JSX.Element}
 */
function InfoModal({ visible, onClose, isPro, showPaywall, showToast, startTour }) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const [infoScrollRatio, setInfoScrollRatio] = useState(0);
  const [infoScrollVisible, setInfoScrollVisible] = useState(false);
  const easterEggTaps = useRef(0);

  function handleClose() {
    easterEggTaps.current = 0;
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={modalStyles.infoOverlay} accessibilityViewIsModal>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Close info"
          accessibilityRole="button"
        />
        <View style={styles.infoCard} accessibilityRole="none">
          <TouchableOpacity
            style={modalStyles.infoClose}
            onPress={handleClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color={THEME.textIcon} />
          </TouchableOpacity>

          <View style={[styles.infoModalRow, styles.modalContentHeight]}>
            <ScrollView
              style={modalStyles.flex1}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(w, h) =>
                setInfoScrollVisible(h > SCREEN_HEIGHT * MODAL_CONTENT_RATIO)
              }
              onScroll={({ nativeEvent }) => {
                const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
                const maxScroll = contentSize.height - layoutMeasurement.height;
                setInfoScrollRatio(maxScroll > 0 ? contentOffset.y / maxScroll : 0);
              }}
              scrollEventThrottle={16}
            >
              <TouchableOpacity
                style={styles.tourLaunchBtn}
                onPress={() => {
                  handleClose();
                  setTimeout(() => startTour(), SUPPORT_MODAL_DELAY);
                }}
                accessibilityRole="button"
                accessibilityLabel="Take a tour of ForkIt features"
              >
                <Ionicons name="compass-outline" size={16} color={THEME.pop} />
                <Text style={styles.tourLaunchText}>Take a Tour</Text>
                <Text style={styles.tourLaunchSub}>or read below</Text>
              </TouchableOpacity>

              <Text
                style={[modalStyles.infoHeading, modalStyles.marginTopNone]}
                accessibilityRole="header"
              >
                How ForkIt! Works
              </Text>
              <Text style={modalStyles.infoText}>
                ForkIt! uses Google Maps to find restaurants near you based on your filters, then
                picks one at random. Use cuisine keywords, price caps, ratings, and more to narrow
                results. It remembers what it showed you during a session so you won't get repeats.
                Restaurant data comes from Google's Places API — some spots may be missing or have
                outdated info.
              </Text>

              <Text style={modalStyles.infoHeading} accessibilityRole="header">
                Your Data
              </Text>
              <Text style={modalStyles.infoText}>
                Your location is used only to find nearby spots, cached on your device for up to 1
                hour, and never sent to our servers. Favorites, blocked places, and custom spots are
                saved locally on your device.
              </Text>

              <Text style={modalStyles.infoHeading} accessibilityRole="header">
                Free & Pro
              </Text>
              <Text style={modalStyles.infoText}>
                20 free searches + 1 Fork Around session every month. Re-rolls within a pool are
                always free — a new search only counts when filters change or the pool expires (4
                hours).{'\n\n'}
                ForkIt! Pro ({PRO_PRICE_LABEL}) removes all limits.
              </Text>
              {!isPro && Platform.OS !== 'web' && (
                <View style={styles.proButtonRow}>
                  <TouchableOpacity
                    onPress={() => {
                      handleClose();
                      setTimeout(() => showPaywall('solo'), SUPPORT_MODAL_DELAY);
                    }}
                    style={styles.goProBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Upgrade to ForkIt Pro"
                  >
                    <Text style={styles.goProBtnText} numberOfLines={1} adjustsFontSizeToFit>
                      Go Pro
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const info = await Purchases.restorePurchases();
                        if (typeof info.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined') {
                          showToast('Pro restored! Welcome back.', 'success', TOAST_LONG);
                        } else {
                          showToast('No active subscription found.', 'warn', TOAST_DEFAULT);
                        }
                      } catch (_) {
                        showToast('Restore failed. Please try again.', 'warn', TOAST_DEFAULT);
                      }
                    }}
                    style={styles.restoreBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Restore previous purchase"
                  >
                    <Text style={styles.restoreBtnText} numberOfLines={1} adjustsFontSizeToFit>
                      Restore Purchase
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {!isPro && Platform.OS !== 'web' && (
                <Text style={styles.subscriptionTerms}>
                  {PRO_PRICE_LABEL}. Auto-renews until canceled. Cancel anytime in your device's
                  subscription settings.
                </Text>
              )}

              <Text
                style={[modalStyles.infoHeading, { color: THEME.pop }]}
                accessibilityRole="header"
              >
                What's New in v2
              </Text>
              <Text style={modalStyles.infoText}>
                {'\u2022'} Interactive tour — tap "Take a Tour" above to see all features{'\n'}
                {'\u2022'} Tag your custom spots (pasta, homecooking, spicy) so they filter with
                Google results{'\n'}
                {'\u2022'} Fork Around sessions survive app restarts{'\n'}
                {'\u2022'} Push notifications when friends submit filters{'\n'}
                {'\u2022'} Smart pool caching — re-rolls are instant with zero API calls{'\n'}
                {'\u2022'} Free tier: 20 searches + 1 Fork Around/month. Pro removes all limits
              </Text>

              <View style={styles.legalRow}>
                <Text
                  style={styles.privacyLink}
                  onPress={() =>
                    Linking.openURL('https://cherrelletucker.github.io/forkit/privacy.html')
                  }
                  accessibilityRole="link"
                >
                  Privacy Policy
                </Text>
                <Text style={styles.legalDot}>{'\u00B7'}</Text>
                <Text
                  style={styles.privacyLink}
                  onPress={() =>
                    Linking.openURL('https://cherrelletucker.github.io/forkit/terms.html')
                  }
                  accessibilityRole="link"
                >
                  Terms of Use
                </Text>
              </View>

              <Text
                style={styles.versionText}
                onPress={() => {
                  easterEggTaps.current += 1;
                  if (easterEggTaps.current >= EASTER_EGG_TAPS) {
                    easterEggTaps.current = 0;
                    handleClose();
                    openMapsSearchByText('88 Buffet Huntsville AL');
                  }
                }}
                suppressHighlighting
              >
                v{Constants.expoConfig?.version || '2.0.0'}
              </Text>
            </ScrollView>
            {infoScrollVisible && (
              <View style={styles.scrollTrack}>
                <View
                  style={[
                    styles.scrollThumb,
                    { top: `${infoScrollRatio * SCROLL_THUMB_PERCENT}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: THEME.surfaceModal,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.borderGhost,
    padding: 16,
    marginHorizontal: 16,
    maxWidth: 380,
    width: '92%',
    shadowColor: THEME.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  infoModalRow: { flexDirection: 'row' },
  modalContentHeight: { maxHeight: INITIAL_SCREEN_HEIGHT * MODAL_CONTENT_RATIO },
  scrollTrack: {
    width: 4,
    backgroundColor: THEME.borderDim,
    borderRadius: 2,
    marginLeft: 8,
    marginTop: 30,
  },
  scrollThumb: {
    position: 'absolute',
    width: 4,
    height: '30%',
    backgroundColor: THEME.popThumb,
    borderRadius: 2,
  },
  proButtonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 4 },
  goProBtn: {
    flexGrow: 1,
    flexBasis: '40%',
    backgroundColor: THEME.accentBg,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  goProBtnText: { color: THEME.accent, fontFamily: 'Montserrat_600SemiBold', fontSize: 15 },
  restoreBtn: {
    flexGrow: 1,
    flexBasis: '40%',
    backgroundColor: THEME.surfaceLight,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtnText: { color: THEME.textSecondary, fontFamily: 'Montserrat_500Medium', fontSize: 15 },
  subscriptionTerms: {
    color: THEME.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  legalDot: { color: THEME.textMuted, fontSize: 15 },
  privacyLink: {
    color: THEME.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  versionText: { color: THEME.textHint, fontSize: 13, textAlign: 'center', marginTop: 10 },
  tourLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: THEME.tourLaunchBg,
    borderWidth: 1,
    borderColor: THEME.tourLaunchBorder,
    marginBottom: 14,
  },
  tourLaunchText: {
    color: THEME.pop,
    fontSize: 16,
    fontWeight: '800',
  },
  tourLaunchSub: {
    color: THEME.tourSkipText,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 'auto',
  },
});

export { InfoModal };
export default InfoModal;

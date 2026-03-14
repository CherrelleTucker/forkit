// ForkIt — BlockedModal component
// Modal for viewing and unblocking blocked restaurants.

import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TOAST_SHORT } from '../constants/config';
import modalStyles from '../constants/sharedStyles';
import { THEME, INITIAL_SCREEN_HEIGHT, MODAL_LIST_RATIO } from '../constants/theme';
import { unblockPlace } from '../utils/blocked';

/**
 * Blocked places modal.
 * @param {object} props
 * @param {boolean} props.visible - Whether the modal is shown
 * @param {() => void} props.onClose - Close the modal
 * @param {Array} props.blockedIds - Array of blocked place entries
 * @param {(blocked: Array) => void} props.setBlockedIds - Setter for blocked list
 * @param {(text: string, kind: string, ms: number) => void} props.showToast - Show a toast message
 * @returns {JSX.Element}
 */
function BlockedModal({ visible, onClose, blockedIds, setBlockedIds, showToast }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={modalStyles.infoOverlay} accessibilityViewIsModal>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close blocked list"
          accessibilityRole="button"
        />
        <View style={modalStyles.listCard}>
          <TouchableOpacity
            style={modalStyles.infoClose}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color={THEME.textIcon} />
          </TouchableOpacity>
          <Text
            style={[modalStyles.infoHeading, modalStyles.marginTopNone]}
            accessibilityRole="header"
          >
            Blocked ({blockedIds.length})
          </Text>
          <ScrollView style={styles.modalListHeight} showsVerticalScrollIndicator={false}>
            {blockedIds.length === 0 ? (
              <Text style={modalStyles.infoText}>No blocked restaurants.</Text>
            ) : (
              blockedIds.map((b) => (
                <View key={b.place_id} style={modalStyles.listItem}>
                  <Text style={[modalStyles.listItemName, styles.blockedItemName]}>{b.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      unblockPlace(b.place_id, blockedIds, setBlockedIds);
                      showToast(`Unblocked ${b.name}.`, 'success', TOAST_SHORT);
                    }}
                    accessibilityLabel={`Unblock ${b.name}`}
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={THEME.muted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blockedItemName: { flex: 1 },
  modalListHeight: { maxHeight: INITIAL_SCREEN_HEIGHT * MODAL_LIST_RATIO },
});

export { BlockedModal };
export default BlockedModal;

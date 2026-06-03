import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type OfflineCacheBannerProps = {
  isFromCache?: boolean;
  isOffline?: boolean;
};

export const OfflineCacheBanner = memo(function OfflineCacheBanner({
  isFromCache,
  isOffline,
}: OfflineCacheBannerProps) {
  if (!isFromCache && !isOffline) return null;

  const message = isFromCache
    ? 'Dane z pamięci urządzenia (tryb offline / cache).'
    : 'Brak połączenia z internetem.';

  return (
    <Text variant="labelSmall" style={styles.banner}>
      {message}
    </Text>
  );
});

const styles = StyleSheet.create({
  banner: {
    opacity: 0.75,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

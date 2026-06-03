import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

/** Haptics przy zmianie taba — listeners.tabPress w (tabs)/_layout.tsx (selectionAsync). */
export function HapticTab(props: BottomTabBarButtonProps) {
  return <PlatformPressable {...props} />;
}

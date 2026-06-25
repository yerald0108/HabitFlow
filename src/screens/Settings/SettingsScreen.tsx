// src/screens/Settings/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useHabitStore } from '../../store/habitStore';
import { HabitRepository } from '../../data/repositories/HabitRepository';
import { NotificationService } from '../../domain/services/NotificationService';
import { ExportService } from '../../domain/services/ExportService';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';

const SettingsRow: React.FC<{
  icon:        string;
  label:       string;
  subtitle?:   string;
  onPress?:    () => void;
  right?:      React.ReactNode;
  danger?:     boolean;
}> = ({ icon, label, subtitle, onPress, right, danger }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection:     'row',
        alignItems:        'center',
        paddingHorizontal: spacing[4],
        paddingVertical:   spacing[4],
        gap:               spacing[3],
      }}
    >
      <View style={{
        width:           36,
        height:          36,
        borderRadius:    borderRadius.md,
        backgroundColor: danger ? colors.dangerLight : colors.accentLight,
        alignItems:      'center',
        justifyContent:  'center',
      }}>
        <Feather
          name={icon as any}
          size={18}
          color={danger ? colors.danger : colors.accent}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize:   typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color:      danger ? colors.danger : colors.textPrimary,
        }}>
          {label}
        </Text>
        {subtitle && (
          <Text style={{
            fontSize:  typography.fontSize.xs,
            color:     colors.textTertiary,
            marginTop: 2,
          }}>
            {subtitle}
          </Text>
        )}
      </View>

      {right ?? (onPress && (
        <Feather name="chevron-right" size={16} color={colors.textTertiary} />
      ))}
    </TouchableOpacity>
  );
};

const SettingsSection: React.FC<{
  title:    string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <Text style={{
        fontSize:      typography.fontSize.xs,
        fontWeight:    typography.fontWeight.semibold,
        color:         colors.textTertiary,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
        marginBottom:  spacing[2],
        paddingHorizontal: spacing[1],
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: colors.surface,
        borderRadius:    borderRadius.xl,
        overflow:        'hidden',
        ...shadows.sm,
      }}>
        {children}
      </View>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const { colors, typography, spacing, isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const habits       = useHabitStore(s => s.habits);
  const resetAllData = useHabitStore(s => s.resetAllData);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const records = useHabitStore(s => s.records);
  const TAB_BAR_TOTAL = useTabBarHeight();

  useEffect(() => {
    NotificationService.hasPermissions().then(setNotificationsEnabled);
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      setNotificationsEnabled(granted);
      if (granted) {
        await NotificationService.rescheduleAll(habits);
      } else {
        Alert.alert(
          'Permisos requeridos',
          'Para activar notificaciones ve a Ajustes del sistema y habilita los permisos para HabitFlow.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      await NotificationService.cancelAll();
      setNotificationsEnabled(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportToJSON(habits, records);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportToCSV(habits, records);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      'Esta acción eliminará todos tus hábitos y registros de forma permanente. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text:    'Eliminar todo',
          style:   'destructive',
          onPress: async () => {
            await NotificationService.cancelAll();
            await resetAllData();
            Alert.alert('Datos eliminados', 'Todos tus datos han sido eliminados.');
          },
        },
      ]
    );
  };
  const activeCount   = habits.filter(h => !h.isArchived).length;
  const archivedCount = habits.filter(h => h.isArchived).length;
  const totalRecords  = 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top }}>
        <View style={{
          paddingHorizontal: spacing[5],
          paddingTop:        spacing[4],
          paddingBottom:     spacing[4],
        }}>
          <Text style={{
            fontSize:      typography.fontSize['2xl'],
            fontWeight:    typography.fontWeight.bold,
            color:         colors.textPrimary,
            letterSpacing: typography.letterSpacing.tight,
          }}>
            Ajustes
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingBottom:     TAB_BAR_TOTAL + spacing[4],
        }}
      >
        {/* Resumen */}
        <SettingsSection title="Resumen">
          <SettingsRow
            icon="activity"
            label="Hábitos activos"
            subtitle={`${activeCount} hábito${activeCount !== 1 ? 's' : ''}`}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />
          <SettingsRow
            icon="archive"
            label="Hábitos archivados"
            subtitle={`${archivedCount} hábito${archivedCount !== 1 ? 's' : ''}`}
          />
        </SettingsSection>

        {/* Notificaciones */}
        <SettingsSection title="Notificaciones">
          <SettingsRow
            icon="bell"
            label="Recordatorios"
            subtitle={notificationsEnabled ? 'Activados' : 'Desactivados'}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{
                  false: colors.border,
                  true:  colors.accent,
                }}
                thumbColor={colors.surface}
              />
            }
          />
        </SettingsSection>

        {/* Apariencia */}
        <SettingsSection title="Apariencia">
          <SettingsRow
            icon="moon"
            label="Tema"
            subtitle={isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
            right={
              <Text style={{
                fontSize:  typography.fontSize.sm,
                color:     colors.textTertiary,
              }}>
                Sistema
              </Text>
            }
          />
        </SettingsSection>

        {/* Datos */}
        <SettingsSection title="Datos">
          <SettingsRow
            icon="trash-2"
            label="Eliminar todos los datos"
            subtitle="Esta acción no se puede deshacer"
            onPress={handleClearData}
            danger
          />
        </SettingsSection>

        {/* Exportar */}
        <SettingsSection title="Exportar datos">
          <SettingsRow
            icon="download"
            label="Exportar como JSON"
            subtitle="Copia de seguridad completa"
            onPress={isExporting ? undefined : handleExportJSON}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />
          <SettingsRow
            icon="file-text"
            label="Exportar como CSV"
            subtitle="Compatible con Excel y Google Sheets"
            onPress={isExporting ? undefined : handleExportCSV}
          />
        </SettingsSection>

        {/* Acerca de */}
        <SettingsSection title="Acerca de">
          <SettingsRow
            icon="heart"
            label="HabitFlow"
            subtitle="Versión 1.0.0 — Hecho con ❤️"
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
};
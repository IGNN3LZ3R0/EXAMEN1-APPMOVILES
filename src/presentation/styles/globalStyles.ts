import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "./theme";
import Constants from "expo-constants";

export const globalStyles = StyleSheet.create({
  // CONTENEDORES
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Constants.statusBarHeight,
  },

  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: Constants.statusBarHeight,
  },

  contentPadding: {
    padding: spacing.md,
  },

  // HEADERS
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // INPUTS
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },

  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  inputError: {
    borderColor: colors.danger,
  },

  // BOTONES
  button: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  buttonDanger: {
    backgroundColor: colors.danger,
  },

  buttonSuccess: {
    backgroundColor: colors.success,
  },

  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: "600",
  },

  buttonTextOutline: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },

  buttonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },

  // TARJETAS
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },

  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
  },

  // TEXTOS
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  textPrimary: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  textSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  textTertiary: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },

  textError: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },

  // BADGES/CHIPS
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: "600",
  },

  badgeSuccess: {
    backgroundColor: "#E8F5E9",
  },

  badgeSuccessText: {
    color: colors.success,
  },

  badgeDanger: {
    backgroundColor: "#FFEBEE",
  },

  badgeDangerText: {
    color: colors.danger,
  },

  badgeWarning: {
    backgroundColor: "#FFF3E0",
  },

  badgeWarningText: {
    color: colors.warning,
  },

  // ESTADOS VACÍOS
  emptyState: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  // SEPARADORES
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
});
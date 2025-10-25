export const translations = {
  en: {
    // Header
    appTitle: "Subscription Manager",
    appDescription: "Manage your subscriptions and control your monthly expenses",

    // Settings
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    lightMode: "Light",
    darkMode: "Dark",

    // Currency Manager
    currencyManager: "Currency Manager",
    addCurrency: "Add Currency",
    editCurrency: "Edit Currency",
    currencyCode: "Currency Code",
    currencyName: "Currency Name",
    currencySymbol: "Symbol",
    conversionRate: "Conversion Rate",
    conversionRateHelp: "1 USD = X in this currency",
    defaultCurrency: "Default",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",

    // Subscription Manager
    subscriptionManager: "Subscription Manager",
    addSubscription: "Add Subscription",
    editSubscription: "Edit Subscription",
    serviceName: "Service Name",
    amount: "Amount",
    currency: "Currency",
    paymentDay: "Payment Day",
    dayOfMonth: "Day of month (1-31)",
    hasTax: "Has Tax",
    taxRate: "Tax Rate (%)",
    total: "Total",
    withTax: "with tax",

    // Summary
    summary: "Summary",
    totalMonthly: "Total Monthly",
    avgPerSubscription: "Avg per Subscription",
    nextPayment: "Next Payment",
    activeSubscriptions: "Active Subscriptions",
    viewIn: "View in",
    breakdownByCurrency: "Breakdown by Currency",
    subtotal: "Subtotal",
    taxes: "Taxes",

    // Data Manager
    importExport: "Import/Export",
    exportData: "Export Data",
    importData: "Import Data",
    exportSuccess: "Data exported successfully",
    importSuccess: "Data imported successfully",
    importError: "Error importing data. Please check the file format.",

    // Common
    noData: "No data available",
  },
  es: {
    // Header
    appTitle: "Gestor de Suscripciones",
    appDescription: "Administra tus suscripciones y controla tus gastos mensuales",

    // Settings
    settings: "Configuración",
    language: "Idioma",
    theme: "Tema",
    lightMode: "Claro",
    darkMode: "Oscuro",

    // Currency Manager
    currencyManager: "Gestor de Monedas",
    addCurrency: "Agregar Moneda",
    editCurrency: "Editar Moneda",
    currencyCode: "Código de Moneda",
    currencyName: "Nombre de Moneda",
    currencySymbol: "Símbolo",
    conversionRate: "Tasa de Conversión",
    conversionRateHelp: "1 USD = X en esta moneda",
    defaultCurrency: "Por defecto",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",

    // Subscription Manager
    subscriptionManager: "Gestor de Suscripciones",
    addSubscription: "Agregar Suscripción",
    editSubscription: "Editar Suscripción",
    serviceName: "Nombre del Servicio",
    amount: "Monto",
    currency: "Moneda",
    paymentDay: "Día de Pago",
    dayOfMonth: "Día del mes (1-31)",
    hasTax: "Tiene Impuesto",
    taxRate: "Tasa de Impuesto (%)",
    total: "Total",
    withTax: "con impuesto",

    // Summary
    summary: "Resumen",
    totalMonthly: "Total Mensual",
    avgPerSubscription: "Promedio por Suscripción",
    nextPayment: "Próximo Pago",
    activeSubscriptions: "Suscripciones Activas",
    viewIn: "Ver en",
    breakdownByCurrency: "Desglose por Moneda",
    subtotal: "Subtotal",
    taxes: "Impuestos",

    // Data Manager
    importExport: "Importar/Exportar",
    exportData: "Exportar Datos",
    importData: "Importar Datos",
    exportSuccess: "Datos exportados exitosamente",
    importSuccess: "Datos importados exitosamente",
    importError: "Error al importar datos. Por favor verifica el formato del archivo.",

    // Common
    noData: "No hay datos disponibles",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

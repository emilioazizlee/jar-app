import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const LANGS = ['en', 'ru', 'es', 'fr', 'tr', 'de', 'az'];

function getInitialLang() {
  const stored = localStorage.getItem('jar_language') || localStorage.getItem('i18nextLng');
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  if (browser && LANGS.includes(browser)) return browser;
  return 'en';
}

const resources = {
  en: { translation: {
    'nav.dashboard': 'Dashboard', 'nav.dailySpends': 'Daily Spends', 'nav.subscriptions': 'Subscriptions', 'nav.payments': 'Payments', 'nav.finance': 'Finance', 'nav.insights': 'Insights', 'nav.calendar': 'Calendar', 'nav.tasks': 'Tasks', 'nav.diet': 'Diet', 'nav.groceries': 'Groceries', 'nav.health': 'Health', 'nav.leisure': 'Leisure', 'nav.favorites': 'Favorites', 'nav.settings': 'Settings', 'nav.help': 'Help', 'nav.projects': 'Projects', 'nav.tracking': 'Tracking', 'nav.life': 'Life',
    'set.settings': 'Settings', 'set.unsavedChanges': 'Unsaved changes', 'set.saveChanges': 'Save changes',
    'set.account': 'Account', 'set.profile': 'Profile', 'set.profileSubtitle': 'Edit name, email, avatar', 'set.accountSecurity': 'Account security', 'set.accountSecuritySubtitle': 'Password, two-factor auth', 'set.country': 'Country', 'set.autoDetect': 'Auto-detect', 'set.currency': 'Currency', 'set.defaultCurrency': 'Default currency', 'set.timeZone': 'Time zone',
    'set.preferences': 'Preferences', 'set.manageStepTemplates': 'Manage step templates', 'set.savedTaskTemplates': 'Saved task templates', 'set.language': 'Language', 'set.theme': 'Theme', 'set.darkOnly': 'Dark only', 'set.density': 'Density', 'set.densitySubtitle': 'Card padding & row height', 'set.borderRadius': 'Border radius', 'set.sidebarReset': 'Sidebar order', 'set.bedtimeMode': 'Bedtime mode trigger', 'set.bedtimeModeSubtitle': 'Auto-activates at this time', 'set.oneHandedMode': 'One-handed mode',
    'set.data': 'Data', 'set.exportJson': 'Export JSON', 'set.exportCsv': 'Export CSV', 'set.exportCsvSubtitle': 'Flat entry data', 'set.importData': 'Import data', 'set.importDataSubtitle': 'JSON or CSV file', 'set.bulkTextImport': 'Bulk text import', 'set.bulkTextImportSubtitle': 'Paste freeform text, JAR parses it', 'set.clearAllData': 'Clear all data', 'set.clearAllDataSubtitle': 'Permanently delete everything',
    'set.privacy': 'Privacy', 'set.biometricLock': 'Biometric lock', 'set.hideEntries': 'Hide entries', 'set.familySafe': 'Family safe mode',
    'set.directory': 'Directory', 'set.myBrands': 'My brands', 'set.myBrandsSubtitle': 'Manage known brands, domains, and logos',
    'set.crisisResources': 'Crisis resources',
    'set.about': 'About', 'set.app': 'App', 'set.appSubtitle': 'JAR — Fill your life.', 'set.buildDate': 'Build date', 'set.credits': 'Credits', 'set.creditsSubtitle': 'Built with Base44 · Nivo · Framer Motion · PapaParse', 'set.sendFeedback': 'Send feedback', 'set.privacyPolicy': 'Privacy policy', 'set.terms': 'Terms',
    'set.btnManage': 'Manage', 'set.btnViewDirectory': 'View directory', 'set.btnResetDefault': 'Reset to default', 'set.btnResetDone': '✓ Reset done', 'set.btnExported': '✓ Exported', 'set.btnExportJson': 'Export JSON', 'set.btnExportCsv': 'Export CSV', 'set.btnImport': 'Import', 'set.btnOpen': 'Open', 'set.btnClearAll': 'Clear all',
    'onboarding.welcome': 'Welcome', 'onboarding.toJar': 'to JAR'
  }},
  ru: { translation: {
    'nav.dashboard': 'Панель управления', 'nav.dailySpends': 'Ежедневные расходы', 'nav.subscriptions': 'Подписки', 'nav.payments': 'Платежи', 'nav.finance': 'Финансы', 'nav.insights': 'Инсайты', 'nav.calendar': 'Календарь', 'nav.tasks': 'Задачи', 'nav.diet': 'Диета', 'nav.groceries': 'Продукты', 'nav.health': 'Здоровье', 'nav.leisure': 'Досуг', 'nav.favorites': 'Избранное', 'nav.settings': 'Настройки', 'nav.help': 'Справка', 'nav.projects': 'Проекты', 'nav.tracking': 'Трекинг', 'nav.life': 'Жизнь',
    'set.settings': 'Настройки', 'set.unsavedChanges': 'Несохранённые изменения', 'set.saveChanges': 'Сохранить изменения',
    'set.account': 'Аккаунт', 'set.profile': 'Профиль', 'set.profileSubtitle': 'Изменить имя, email, аватар', 'set.accountSecurity': 'Безопасность аккаунта', 'set.accountSecuritySubtitle': 'Пароль, двухфакторная аутентификация', 'set.country': 'Страна', 'set.autoDetect': 'Авто-определение', 'set.currency': 'Валюта', 'set.defaultCurrency': 'Валюта по умолчанию', 'set.timeZone': 'Часовой пояс',
    'set.preferences': 'Предпочтения', 'set.manageStepTemplates': 'Управление шаблонами шагов', 'set.savedTaskTemplates': 'Сохранённые шаблоны задач', 'set.language': 'Язык', 'set.theme': 'Тема', 'set.darkOnly': 'Только тёмная', 'set.density': 'Плотность', 'set.densitySubtitle': 'Отступы карточек и высота строк', 'set.borderRadius': 'Радиус скругления', 'set.sidebarReset': 'Порядок боковой панели', 'set.bedtimeMode': 'Режим отхода ко сну', 'set.bedtimeModeSubtitle': 'Автоматически активируется в это время', 'set.oneHandedMode': 'Режим одной руки',
    'set.data': 'Данные', 'set.exportJson': 'Экспорт JSON', 'set.exportCsv': 'Экспорт CSV', 'set.exportCsvSubtitle': 'Плоские данные записей', 'set.importData': 'Импорт данных', 'set.importDataSubtitle': 'Файл JSON или CSV', 'set.bulkTextImport': 'Массовый текстовый импорт', 'set.bulkTextImportSubtitle': 'Вставьте текст, JAR разберёт его', 'set.clearAllData': 'Очистить все данные', 'set.clearAllDataSubtitle': 'Удалить всё навсегда',
    'set.privacy': 'Конфиденциальность', 'set.biometricLock': 'Биометрический замок', 'set.hideEntries': 'Скрыть записи', 'set.familySafe': 'Семейный режим',
    'set.directory': 'Справочник', 'set.myBrands': 'Мои бренды', 'set.myBrandsSubtitle': 'Управление брендами, доменами и логотипами',
    'set.crisisResources': 'Ресурсы кризисной помощи',
    'set.about': 'О приложении', 'set.app': 'Приложение', 'set.appSubtitle': 'JAR — Наполни свою жизнь.', 'set.buildDate': 'Дата сборки', 'set.credits': 'Благодарности', 'set.creditsSubtitle': 'Создано с Base44 · Nivo · Framer Motion · PapaParse', 'set.sendFeedback': 'Отправить отзыв', 'set.privacyPolicy': 'Политика конфиденциальности', 'set.terms': 'Условия',
    'set.btnManage': 'Управлять', 'set.btnViewDirectory': 'Открыть справочник', 'set.btnResetDefault': 'Сбросить', 'set.btnResetDone': '✓ Сброшено', 'set.btnExported': '✓ Экспортировано', 'set.btnExportJson': 'Экспорт JSON', 'set.btnExportCsv': 'Экспорт CSV', 'set.btnImport': 'Импорт', 'set.btnOpen': 'Открыть', 'set.btnClearAll': 'Очистить всё',
    'onboarding.welcome': 'Добро пожаловать', 'onboarding.toJar': 'в JAR'
  }},
  es: { translation: {
    'nav.dashboard': 'Panel de Control', 'nav.dailySpends': 'Gastos Diarios', 'nav.subscriptions': 'Suscripciones', 'nav.payments': 'Pagos', 'nav.finance': 'Finanzas', 'nav.insights': 'Insights', 'nav.calendar': 'Calendario', 'nav.tasks': 'Tareas', 'nav.diet': 'Dieta', 'nav.groceries': 'Comestibles', 'nav.health': 'Salud', 'nav.leisure': 'Ocio', 'nav.favorites': 'Favoritos', 'nav.settings': 'Configuración', 'nav.help': 'Ayuda', 'nav.projects': 'Proyectos', 'nav.tracking': 'Seguimiento', 'nav.life': 'Vida',
    'set.settings': 'Configuración', 'set.unsavedChanges': 'Cambios sin guardar', 'set.saveChanges': 'Guardar cambios',
    'set.account': 'Cuenta', 'set.profile': 'Perfil', 'set.profileSubtitle': 'Editar nombre, email, avatar', 'set.accountSecurity': 'Seguridad de cuenta', 'set.accountSecuritySubtitle': 'Contraseña, autenticación en dos pasos', 'set.country': 'País', 'set.autoDetect': 'Auto-detectar', 'set.currency': 'Moneda', 'set.defaultCurrency': 'Moneda predeterminada', 'set.timeZone': 'Zona horaria',
    'set.preferences': 'Preferencias', 'set.manageStepTemplates': 'Gestionar plantillas de pasos', 'set.savedTaskTemplates': 'Plantillas de tareas guardadas', 'set.language': 'Idioma', 'set.theme': 'Tema', 'set.darkOnly': 'Solo oscuro', 'set.density': 'Densidad', 'set.densitySubtitle': 'Relleno de tarjetas y altura de filas', 'set.borderRadius': 'Radio de borde', 'set.sidebarReset': 'Orden de barra lateral', 'set.bedtimeMode': 'Modo hora de dormir', 'set.bedtimeModeSubtitle': 'Se activa automáticamente a esta hora', 'set.oneHandedMode': 'Modo una mano',
    'set.data': 'Datos', 'set.exportJson': 'Exportar JSON', 'set.exportCsv': 'Exportar CSV', 'set.exportCsvSubtitle': 'Datos planos de entradas', 'set.importData': 'Importar datos', 'set.importDataSubtitle': 'Archivo JSON o CSV', 'set.bulkTextImport': 'Importación de texto masivo', 'set.bulkTextImportSubtitle': 'Pega texto libre, JAR lo analiza', 'set.clearAllData': 'Borrar todos los datos', 'set.clearAllDataSubtitle': 'Eliminar todo permanentemente',
    'set.privacy': 'Privacidad', 'set.biometricLock': 'Bloqueo biométrico', 'set.hideEntries': 'Ocultar entradas', 'set.familySafe': 'Modo familiar',
    'set.directory': 'Directorio', 'set.myBrands': 'Mis marcas', 'set.myBrandsSubtitle': 'Gestionar marcas, dominios y logos conocidos',
    'set.crisisResources': 'Recursos de crisis',
    'set.about': 'Acerca de', 'set.app': 'App', 'set.appSubtitle': 'JAR — Llena tu vida.', 'set.buildDate': 'Fecha de compilación', 'set.credits': 'Créditos', 'set.creditsSubtitle': 'Construido con Base44 · Nivo · Framer Motion · PapaParse', 'set.sendFeedback': 'Enviar comentarios', 'set.privacyPolicy': 'Política de privacidad', 'set.terms': 'Términos',
    'set.btnManage': 'Gestionar', 'set.btnViewDirectory': 'Ver directorio', 'set.btnResetDefault': 'Restablecer', 'set.btnResetDone': '✓ Restablecido', 'set.btnExported': '✓ Exportado', 'set.btnExportJson': 'Exportar JSON', 'set.btnExportCsv': 'Exportar CSV', 'set.btnImport': 'Importar', 'set.btnOpen': 'Abrir', 'set.btnClearAll': 'Borrar todo',
    'onboarding.welcome': 'Bienvenido', 'onboarding.toJar': 'a JAR'
  }},
  fr: { translation: {
    'nav.dashboard': 'Tableau de Bord', 'nav.dailySpends': 'Dépenses Quotidiennes', 'nav.subscriptions': 'Abonnements', 'nav.payments': 'Paiements', 'nav.finance': 'Finance', 'nav.insights': 'Insights', 'nav.calendar': 'Calendrier', 'nav.tasks': 'Tâches', 'nav.diet': 'Régime', 'nav.groceries': 'Épicerie', 'nav.health': 'Santé', 'nav.leisure': 'Loisirs', 'nav.favorites': 'Favoris', 'nav.settings': 'Paramètres', 'nav.help': 'Aide', 'nav.projects': 'Projets', 'nav.tracking': 'Suivi', 'nav.life': 'Vie',
    'set.settings': 'Paramètres', 'set.unsavedChanges': 'Modifications non sauvegardées', 'set.saveChanges': 'Sauvegarder',
    'set.account': 'Compte', 'set.profile': 'Profil', 'set.profileSubtitle': 'Modifier nom, email, avatar', 'set.accountSecurity': 'Sécurité du compte', 'set.accountSecuritySubtitle': 'Mot de passe, authentification à deux facteurs', 'set.country': 'Pays', 'set.autoDetect': 'Détection auto', 'set.currency': 'Devise', 'set.defaultCurrency': 'Devise par défaut', 'set.timeZone': 'Fuseau horaire',
    'set.preferences': 'Préférences', 'set.manageStepTemplates': 'Gérer les modèles d\'étapes', 'set.savedTaskTemplates': 'Modèles de tâches sauvegardés', 'set.language': 'Langue', 'set.theme': 'Thème', 'set.darkOnly': 'Sombre uniquement', 'set.density': 'Densité', 'set.densitySubtitle': 'Espacement des cartes et hauteur des lignes', 'set.borderRadius': 'Rayon des bordures', 'set.sidebarReset': 'Ordre de la barre latérale', 'set.bedtimeMode': 'Mode heure du coucher', 'set.bedtimeModeSubtitle': 'S\'active automatiquement à cette heure', 'set.oneHandedMode': 'Mode une main',
    'set.data': 'Données', 'set.exportJson': 'Exporter JSON', 'set.exportCsv': 'Exporter CSV', 'set.exportCsvSubtitle': 'Données d\'entrée plates', 'set.importData': 'Importer des données', 'set.importDataSubtitle': 'Fichier JSON ou CSV', 'set.bulkTextImport': 'Import de texte en masse', 'set.bulkTextImportSubtitle': 'Coller du texte libre, JAR l\'analyse', 'set.clearAllData': 'Effacer toutes les données', 'set.clearAllDataSubtitle': 'Supprimer définitivement tout',
    'set.privacy': 'Confidentialité', 'set.biometricLock': 'Verrouillage biométrique', 'set.hideEntries': 'Masquer les entrées', 'set.familySafe': 'Mode famille',
    'set.directory': 'Répertoire', 'set.myBrands': 'Mes marques', 'set.myBrandsSubtitle': 'Gérer les marques, domaines et logos connus',
    'set.crisisResources': 'Ressources de crise',
    'set.about': 'À propos', 'set.app': 'App', 'set.appSubtitle': 'JAR — Remplissez votre vie.', 'set.buildDate': 'Date de build', 'set.credits': 'Crédits', 'set.creditsSubtitle': 'Construit avec Base44 · Nivo · Framer Motion · PapaParse', 'set.sendFeedback': 'Envoyer des commentaires', 'set.privacyPolicy': 'Politique de confidentialité', 'set.terms': 'Conditions',
    'set.btnManage': 'Gérer', 'set.btnViewDirectory': 'Voir le répertoire', 'set.btnResetDefault': 'Réinitialiser', 'set.btnResetDone': '✓ Réinitialisé', 'set.btnExported': '✓ Exporté', 'set.btnExportJson': 'Exporter JSON', 'set.btnExportCsv': 'Exporter CSV', 'set.btnImport': 'Importer', 'set.btnOpen': 'Ouvrir', 'set.btnClearAll': 'Tout effacer',
    'onboarding.welcome': 'Bienvenue', 'onboarding.toJar': 'dans JAR'
  }},
  tr: { translation: {
    'nav.dashboard': 'Kontrol Paneli', 'nav.dailySpends': 'Günlük Harcamalar', 'nav.subscriptions': 'Abonelikler', 'nav.payments': 'Ödemeler', 'nav.finance': 'Finans', 'nav.insights': 'İçgörüler', 'nav.calendar': 'Takvim', 'nav.tasks': 'Görevler', 'nav.diet': 'Diyeti', 'nav.groceries': 'Bakkaliye', 'nav.health': 'Sağlık', 'nav.leisure': 'Boş Zaman', 'nav.favorites': 'Favoriler', 'nav.settings': 'Ayarlar', 'nav.help': 'Yardım', 'nav.projects': 'Projeler', 'nav.tracking': 'Takip', 'nav.life': 'Hayat',
    'set.settings': 'Ayarlar', 'set.unsavedChanges': 'Kaydedilmemiş değişiklikler', 'set.saveChanges': 'Değişiklikleri kaydet',
    'set.account': 'Hesap', 'set.profile': 'Profil', 'set.profileSubtitle': 'Ad, e-posta, avatar düzenle', 'set.accountSecurity': 'Hesap güvenliği', 'set.accountSecuritySubtitle': 'Şifre, iki faktörlü kimlik doğrulama', 'set.country': 'Ülke', 'set.autoDetect': 'Otomatik algıla', 'set.currency': 'Para birimi', 'set.defaultCurrency': 'Varsayılan para birimi', 'set.timeZone': 'Saat dilimi',
    'set.preferences': 'Tercihler', 'set.manageStepTemplates': 'Adım şablonlarını yönet', 'set.savedTaskTemplates': 'Kayıtlı görev şablonları', 'set.language': 'Dil', 'set.theme': 'Tema', 'set.darkOnly': 'Yalnızca koyu', 'set.density': 'Yoğunluk', 'set.densitySubtitle': 'Kart dolgusu ve satır yüksekliği', 'set.borderRadius': 'Kenar yarıçapı', 'set.sidebarReset': 'Kenar çubuğu sırası', 'set.bedtimeMode': 'Yatma vakti modu', 'set.bedtimeModeSubtitle': 'Bu saatte otomatik etkinleşir', 'set.oneHandedMode': 'Tek elle kullanım modu',
    'set.data': 'Veri', 'set.exportJson': 'JSON dışa aktar', 'set.exportCsv': 'CSV dışa aktar', 'set.exportCsvSubtitle': 'Düz giriş verisi', 'set.importData': 'Veri içe aktar', 'set.importDataSubtitle': 'JSON veya CSV dosyası', 'set.bulkTextImport': 'Toplu metin içe aktarma', 'set.bulkTextImportSubtitle': 'Serbest metin yapıştır, JAR analiz eder', 'set.clearAllData': 'Tüm verileri temizle', 'set.clearAllDataSubtitle': 'Her şeyi kalıcı olarak sil',
    'set.privacy': 'Gizlilik', 'set.biometricLock': 'Biyometrik kilit', 'set.hideEntries': 'Girişleri gizle', 'set.familySafe': 'Aile güvenli modu',
    'set.directory': 'Dizin', 'set.myBrands': 'Markalarım', 'set.myBrandsSubtitle': 'Bilinen markaları, alanları ve logoları yönet',
    'set.crisisResources': 'Kriz kaynakları',
    'set.about': 'Hakkında', 'set.app': 'Uygulama', 'set.appSubtitle': 'JAR — Hayatını doldur.', 'set.buildDate': 'Derleme tarihi', 'set.credits': 'Katkılar', 'set.creditsSubtitle': 'Base44 · Nivo · Framer Motion · PapaParse ile oluşturuldu', 'set.sendFeedback': 'Geri bildirim gönder', 'set.privacyPolicy': 'Gizlilik politikası', 'set.terms': 'Şartlar',
    'set.btnManage': 'Yönet', 'set.btnViewDirectory': 'Dizini görüntüle', 'set.btnResetDefault': 'Varsayılana sıfırla', 'set.btnResetDone': '✓ Sıfırlandı', 'set.btnExported': '✓ Dışa aktarıldı', 'set.btnExportJson': 'JSON dışa aktar', 'set.btnExportCsv': 'CSV dışa aktar', 'set.btnImport': 'İçe aktar', 'set.btnOpen': 'Aç', 'set.btnClearAll': 'Tümünü temizle',
    'onboarding.welcome': 'Hoş geldin', 'onboarding.toJar': "JAR'a"
  }},
  de: { translation: {
    'nav.dashboard': 'Armaturenbrett', 'nav.dailySpends': 'Tägliche Ausgaben', 'nav.subscriptions': 'Abos', 'nav.payments': 'Zahlungen', 'nav.finance': 'Finanzen', 'nav.insights': 'Einblicke', 'nav.calendar': 'Kalender', 'nav.tasks': 'Aufgaben', 'nav.diet': 'Diät', 'nav.groceries': 'Lebensmittel', 'nav.health': 'Gesundheit', 'nav.leisure': 'Freizeit', 'nav.favorites': 'Favoriten', 'nav.settings': 'Einstellungen', 'nav.help': 'Hilfe', 'nav.projects': 'Projekte', 'nav.tracking': 'Verfolgung', 'nav.life': 'Leben',
    'set.settings': 'Einstellungen', 'set.unsavedChanges': 'Ungespeicherte Änderungen', 'set.saveChanges': 'Änderungen speichern',
    'set.account': 'Konto', 'set.profile': 'Profil', 'set.profileSubtitle': 'Name, E-Mail, Avatar bearbeiten', 'set.accountSecurity': 'Kontosicherheit', 'set.accountSecuritySubtitle': 'Passwort, Zwei-Faktor-Authentifizierung', 'set.country': 'Land', 'set.autoDetect': 'Automatisch erkennen', 'set.currency': 'Währung', 'set.defaultCurrency': 'Standardwährung', 'set.timeZone': 'Zeitzone',
    'set.preferences': 'Einstellungen', 'set.manageStepTemplates': 'Schrittvorlagen verwalten', 'set.savedTaskTemplates': 'Gespeicherte Aufgabenvorlagen', 'set.language': 'Sprache', 'set.theme': 'Theme', 'set.darkOnly': 'Nur dunkel', 'set.density': 'Dichte', 'set.densitySubtitle': 'Kartenabstand & Zeilenhöhe', 'set.borderRadius': 'Eckenradius', 'set.sidebarReset': 'Seitenleistenreihenfolge', 'set.bedtimeMode': 'Schlafenszeit-Modus', 'set.bedtimeModeSubtitle': 'Aktiviert sich automatisch zu dieser Zeit', 'set.oneHandedMode': 'Einhandmodus',
    'set.data': 'Daten', 'set.exportJson': 'JSON exportieren', 'set.exportCsv': 'CSV exportieren', 'set.exportCsvSubtitle': 'Flache Einträgsdaten', 'set.importData': 'Daten importieren', 'set.importDataSubtitle': 'JSON- oder CSV-Datei', 'set.bulkTextImport': 'Massen-Textimport', 'set.bulkTextImportSubtitle': 'Freitext einfügen, JAR analysiert ihn', 'set.clearAllData': 'Alle Daten löschen', 'set.clearAllDataSubtitle': 'Alles dauerhaft löschen',
    'set.privacy': 'Datenschutz', 'set.biometricLock': 'Biometrische Sperre', 'set.hideEntries': 'Einträge ausblenden', 'set.familySafe': 'Familienmodus',
    'set.directory': 'Verzeichnis', 'set.myBrands': 'Meine Marken', 'set.myBrandsSubtitle': 'Bekannte Marken, Domains und Logos verwalten',
    'set.crisisResources': 'Krisenressourcen',
    'set.about': 'Über', 'set.app': 'App', 'set.appSubtitle': 'JAR — Fülle dein Leben.', 'set.buildDate': 'Build-Datum', 'set.credits': 'Danksagungen', 'set.creditsSubtitle': 'Erstellt mit Base44 · Nivo · Framer Motion · PapaParse', 'set.sendFeedback': 'Feedback senden', 'set.privacyPolicy': 'Datenschutzrichtlinie', 'set.terms': 'Nutzungsbedingungen',
    'set.btnManage': 'Verwalten', 'set.btnViewDirectory': 'Verzeichnis anzeigen', 'set.btnResetDefault': 'Zurücksetzen', 'set.btnResetDone': '✓ Zurückgesetzt', 'set.btnExported': '✓ Exportiert', 'set.btnExportJson': 'JSON exportieren', 'set.btnExportCsv': 'CSV exportieren', 'set.btnImport': 'Importieren', 'set.btnOpen': 'Öffnen', 'set.btnClearAll': 'Alles löschen',
    'onboarding.welcome': 'Willkommen', 'onboarding.toJar': 'bei JAR'
  }},
  az: { translation: {
    'nav.dashboard': 'İnformasiya Paneli', 'nav.dailySpends': 'Gündəlik Xərclər', 'nav.subscriptions': 'Aboneliklər', 'nav.payments': 'Ödənişlər', 'nav.finance': 'Maliyyə', 'nav.insights': 'İnsaytlar', 'nav.calendar': 'Təqvim', 'nav.tasks': 'Tapşırıqlar', 'nav.diet': 'Diyeta', 'nav.groceries': 'Bakaliya', 'nav.health': 'Səhiyyə', 'nav.leisure': 'Boş Vaxt', 'nav.favorites': 'Seçimlərim', 'nav.settings': 'Parametrlər', 'nav.help': 'Kömək', 'nav.projects': 'Layihələr', 'nav.tracking': 'İzləmə', 'nav.life': 'Həyat',
    'set.settings': 'Parametrlər', 'set.unsavedChanges': 'Saxlanılmamış dəyişikliklər', 'set.saveChanges': 'Dəyişiklikləri saxla',
    'set.account': 'Hesab', 'set.profile': 'Profil', 'set.profileSubtitle': 'Ad, e-poçt, avatarı redaktə et', 'set.accountSecurity': 'Hesab təhlükəsizliyi', 'set.accountSecuritySubtitle': 'Şifrə, iki faktorlu autentifikasiya', 'set.country': 'Ölkə', 'set.autoDetect': 'Avtomatik aşkar et', 'set.currency': 'Valyuta', 'set.defaultCurrency': 'Standart valyuta', 'set.timeZone': 'Saat qurşağı',
    'set.preferences': 'Seçimlər', 'set.manageStepTemplates': 'Addım şablonlarını idarə et', 'set.savedTaskTemplates': 'Saxlanılmış tapşırıq şablonları', 'set.language': 'Dil', 'set.theme': 'Tema', 'set.darkOnly': 'Yalnız tünd', 'set.density': 'Sıxlıq', 'set.densitySubtitle': 'Kart dolgusu və sətir hündürlüyü', 'set.borderRadius': 'Künclərin radiusu', 'set.sidebarReset': 'Yan panel sırası', 'set.bedtimeMode': 'Yatma vaxtı rejimi', 'set.bedtimeModeSubtitle': 'Bu saatda avtomatik aktivləşir', 'set.oneHandedMode': 'Bir əllə istifadə rejimi',
    'set.data': 'Məlumatlar', 'set.exportJson': 'JSON ixrac et', 'set.exportCsv': 'CSV ixrac et', 'set.exportCsvSubtitle': 'Düz giriş məlumatları', 'set.importData': 'Məlumatları idxal et', 'set.importDataSubtitle': 'JSON və ya CSV faylı', 'set.bulkTextImport': 'Toplu mətn idxalı', 'set.bulkTextImportSubtitle': 'Sərbəst mətn yapışdır, JAR analiz edir', 'set.clearAllData': 'Bütün məlumatları sil', 'set.clearAllDataSubtitle': 'Hər şeyi həmişəlik sil',
    'set.privacy': 'Məxfilik', 'set.biometricLock': 'Biometrik kilit', 'set.hideEntries': 'Qeydləri gizlət', 'set.familySafe': 'Ailə təhlükəsiz rejimi',
    'set.directory': 'Kataloq', 'set.myBrands': 'Brendlərim', 'set.myBrandsSubtitle': 'Tanınan brendlər, domenler və loqoları idarə et',
    'set.crisisResources': 'Böhran resursları',
    'set.about': 'Haqqında', 'set.app': 'Tətbiq', 'set.appSubtitle': 'JAR — Həyatını doldur.', 'set.buildDate': 'Qurulma tarixi', 'set.credits': 'Təşəkkürlər', 'set.creditsSubtitle': 'Base44 · Nivo · Framer Motion · PapaParse ilə yaradıldı', 'set.sendFeedback': 'Rəy göndər', 'set.privacyPolicy': 'Məxfilik siyasəti', 'set.terms': 'Şərtlər',
    'set.btnManage': 'İdarə et', 'set.btnViewDirectory': 'Kataloqa bax', 'set.btnResetDefault': 'Standarta sıfırla', 'set.btnResetDone': '✓ Sıfırlandı', 'set.btnExported': '✓ İxrac edildi', 'set.btnExportJson': 'JSON ixrac et', 'set.btnExportCsv': 'CSV ixrac et', 'set.btnImport': 'İdxal et', 'set.btnOpen': 'Aç', 'set.btnClearAll': 'Hamısını sil',
    'onboarding.welcome': 'Xoş gəlmisiniz', 'onboarding.toJar': 'JAR-a'
  }}
};

export async function initI18n() {
  console.log('[i18n] Initializing with embedded resources');
  const lng = getInitialLang();
  await i18n.use(LanguageDetector).use(initReactI18next).init({ resources, lng, fallbackLng: 'en', interpolation: { escapeValue: false }, detection: { order: ['localStorage'], lookupLocalStorage: 'i18nextLng', caches: ['localStorage'] } });
  console.log(`[i18n] Ready in language: ${lng}`);
  return i18n;
}

export default i18n;
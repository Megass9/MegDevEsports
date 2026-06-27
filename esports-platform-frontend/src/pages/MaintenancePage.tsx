import { useTranslation } from '../hooks/useTranslation';

export default function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-600 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-valorant/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔧</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">
          {t('maintenance.title', 'Bakım Modu')}
        </h1>
        <p className="text-gray-400 leading-relaxed mb-8">
          {t('maintenance.description', 'Sitemiz şu anda bakım çalışmaları nedeniyle geçici olarak hizmet dışıdır. Kısa süre içinde tekrar yayında olacağız. Anlayışınız için teşekkür ederiz.')}
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-valorant animate-pulse" />
          {t('maintenance.status', 'Bakım devam ediyor...')}
        </div>
      </div>
    </div>
  );
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    registration: 'badge-primary',
    in_progress: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    scheduled: 'badge-warning',
    ongoing: 'badge-primary',
    awaiting_confirmation: 'badge-warning',
    confirmed: 'badge-success',
    disputed: 'badge-danger',
  };
  return colors[status] || 'badge-warning';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Beklemede',
    registration: 'Kayıt Açık',
    in_progress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    scheduled: 'Planlandı',
    ongoing: 'Devam Ediyor',
    awaiting_confirmation: 'Onay Bekliyor',
    confirmed: 'Onaylandı',
    disputed: 'İhtilaflı',
  };
  return labels[status] || status;
}

// Teknisyen modülü için tip tanımları (Backend: /api/Technicians)

export interface TechnicianDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  isAvailable: boolean;
  activeWorkOrderCount: number; // Dinamik iş yükü göstergesi
}

// POST /api/Technicians — id ve activeWorkOrderCount olmadan gönderilir
export interface CreateTechnicianRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  isAvailable: boolean;
}

// İş yükü seviyesi (UI renk rozetleri için)
export type WorkloadLevel = 'available' | 'moderate' | 'heavy';

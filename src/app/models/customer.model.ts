// Müşteri modülü için tip tanımları (Backend: /api/Customers)

export interface CustomerDto {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  phoneNumber: string;
  email?: string;
  address: string;
  totalWorkOrderCount: number; // Geçmiş göstergesi
}

// POST /api/Customers — oluşturma komutu
export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  companyName?: string;
  phoneNumber: string;
  email?: string;
  address: string;
}

// GET /api/Customers/{id}/workorders — geçmiş/timeline kaydı
export interface CustomerWorkOrder {
  id: number;
  title: string;
  status: number;
  scheduledDate?: string;
  technicianName?: string;
}

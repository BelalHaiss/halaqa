// ============================================================================
// DTOs (Public Types)
// ============================================================================

export interface Student {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface UpdateStudentDto {
  id: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  notes?: string;
}

export interface StudentFilterDto {
  search?: string;
  groupId?: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

const phoneRegex = /^[\d\s\-+()]+$/;

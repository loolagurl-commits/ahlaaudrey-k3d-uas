export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserSession {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatarUrl?: string;
  token?: string;
}

export type PTKPStatus = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export type TERCategory = 'A' | 'B' | 'C';

export interface Employee {
  id: string;
  nip: string; // Nomor Induk Pegawai
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentType: 'PKWT (Kontrak)' | 'PKWTT (Tetap)' | 'Probation' | 'Internship';
  joinDate: string;
  status: 'Aktif' | 'Cuti' | 'Non-Aktif';
  
  // Sensitive Data (Masked & RBAC protected)
  nik: string; // 16 digit NIK
  npwp: string; // NPWP
  bankName: string;
  bankAccount: string;
  ptkpStatus: PTKPStatus;
  
  // Compensation
  baseSalary: number; // Gaji Pokok
  fixedAllowance: number; // Tunjangan Tetap (Jabatan/Transportasi)
  dailyAllowance: number; // Tunjangan Makan harian
  annualLeaveBalance: number; // Sisa Kuota Cuti (default 12 hari)
  
  // Security credentials
  role: UserRole;
  password?: string;
  avatar?: string;
}

export type AttendanceStatus = 'Hadir Tepat Waktu' | 'Terlambat' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpha';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  workMode: 'WFO (Kantor)' | 'WFH (Remote)';
  locationName: string;
  lateMinutes: number; // Menit keterlambatan setelah 08:30 WIB
  notes?: string;
  selfieUrl?: string;
}

export type LeaveType = 
  | 'Cuti Tahunan' 
  | 'Izin Sakit (Surat Dokter)' 
  | 'Cuti Khusus (Melahirkan / Menikah)' 
  | 'Cuti Tanpa Bayar (Unpaid Leave)';

export type LeaveStatus = 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentName?: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  impactsSalaryDeduction: boolean; // True jika Unpaid Leave
}

export interface PayrollRecord {
  id: string;
  period: string; // e.g. "Maret 2026"
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  nip: string;
  ptkpStatus: PTKPStatus;
  terCategory: TERCategory;
  
  // Penghasilan Bruto
  baseSalary: number;
  fixedAllowance: number;
  dailyAllowance: number; // total hari kerja hadir * dailyAllowance
  attendanceDays: number;
  overtimeHours: number;
  overtimePay: number; // Dihitung sesuai permenaker (1.5x, 2x)
  
  // Tunjangan BPJS dari Perusahaan (untuk kalkulasi Bruto PPh 21)
  bpjsKesehatanCompany: number; // 4% (max cap Rp 12jt)
  bpjsJkkCompany: number; // JKK 0.24%
  bpjsJkmCompany: number; // JKM 0.30%
  
  grossIncome: number; // Total Bruto kena pajak
  
  // Potongan Karyawan
  latePenaltyDeduction: number; // Terintegrasi dari data absensi
  unpaidLeaveDeduction: number; // Terintegrasi dari data cuti tanpa bayar
  bpjsKesehatanEmployee: number; // 1% (max cap Rp 12jt)
  bpjsJhtEmployee: number; // JHT 2%
  bpjsJpEmployee: number; // JP 1% (max cap Rp 10.042.300)
  pph21TERPercentage: number; // % TER
  pph21Amount: number; // Nominal PPh 21 TER
  
  totalDeductions: number; // Total potongan karyawan
  netSalary: number; // Take Home Pay (THP)
  
  status: 'Draft' | 'Finalized' | 'Paid';
  paymentDate?: string;
  generatedAt: string;
}

export type CandidateStage = 
  | 'Lamaran Baru' 
  | 'Screening HR' 
  | 'Interview Teknis' 
  | 'Interview Direksi' 
  | 'Offering Letter' 
  | 'Diterima' 
  | 'Ditolak';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  openingsCount: number;
  status: 'Buka' | 'Tutup';
  postedDate: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  experienceYears: number;
  stage: CandidateStage;
  appliedDate: string;
  expectedSalary: number;
  cvUrl?: string;
  interviewNotes?: string;
  rating?: number; // 1-5
}

export interface KPIGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string; // e.g. "Q1 2026"
  title: string;
  description: string;
  weight: number; // e.g. 25 (%)
  targetValue: number;
  actualValue: number;
  unit: string; // e.g. "%", "Fitur", "Tiket", "Proyek"
  selfRating?: number; // 1-5
  managerRating?: number; // 1-5
  feedback?: string;
  status: 'Berjalan' | 'Menunggu Review' | 'Selesai';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'USER_LOGIN' 
    | 'USER_LOGOUT' 
    | 'CREATE_EMPLOYEE' 
    | 'UPDATE_EMPLOYEE' 
    | 'DELETE_EMPLOYEE' 
    | 'SALARY_CHANGE' 
    | 'LEAVE_APPROVAL' 
    | 'LEAVE_REJECTION' 
    | 'CLOCK_IN' 
    | 'CLOCK_OUT' 
    | 'GENERATE_PAYROLL' 
    | 'FINALIZE_PAYROLL' 
    | 'HIRE_CANDIDATE';
  resource: string;
  details: string;
  ipAddress?: string;
}

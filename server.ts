import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRecord, 
  JobPosting, 
  Candidate, 
  KPIGoal, 
  AuditLog, 
  UserSession 
} from './src/types/hrm.js';
import { calculatePayroll } from './src/lib/indonesianPayroll.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent Database Directory & File
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'hrm-store.json');

interface HRMStore {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  jobs: JobPosting[];
  candidates: Candidate[];
  kpis: KPIGoal[];
  auditLogs: AuditLog[];
}

function getInitialStore(): HRMStore {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const employees: Employee[] = [
    {
      id: 'emp-1',
      nip: 'EMP001',
      fullName: 'Hendra Wijaya, S.Psi, M.M.',
      email: 'hr.admin@nusantara.co.id',
      phone: '0812-3456-7890',
      department: 'Operasional & SDM',
      position: 'Head of Human Resources & Operations',
      employmentType: 'PKWTT (Tetap)',
      joinDate: '2021-01-15',
      status: 'Aktif',
      nik: '3201011501880001',
      npwp: '09.123.456.7-011.000',
      bankName: 'Bank Mandiri',
      bankAccount: '1270009876543',
      ptkpStatus: 'K/2',
      baseSalary: 24500000,
      fixedAllowance: 3500000,
      dailyAllowance: 65000,
      annualLeaveBalance: 12,
      role: 'admin',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-2',
      nip: 'EMP002',
      fullName: 'Budi Santoso, S.T., M.Kom.',
      email: 'budi.santoso@nusantara.co.id',
      phone: '0813-8899-1122',
      department: 'Teknologi & Engineering',
      position: 'VP of Engineering',
      employmentType: 'PKWTT (Tetap)',
      joinDate: '2021-03-01',
      status: 'Aktif',
      nik: '3171020103850002',
      npwp: '12.456.789.0-022.000',
      bankName: 'BCA (Bank Central Asia)',
      bankAccount: '5270192837',
      ptkpStatus: 'K/1',
      baseSalary: 28000000,
      fixedAllowance: 4000000,
      dailyAllowance: 65000,
      annualLeaveBalance: 10,
      role: 'manager',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-3',
      nip: 'EMP003',
      fullName: 'Siti Aminah, S.Kom.',
      email: 'siti.aminah@nusantara.co.id',
      phone: '0821-4455-6677',
      department: 'Teknologi & Engineering',
      position: 'Senior Fullstack Software Engineer',
      employmentType: 'PKWTT (Tetap)',
      joinDate: '2022-06-10',
      status: 'Aktif',
      nik: '3275031006940003',
      npwp: '21.789.123.4-033.000',
      bankName: 'BCA (Bank Central Asia)',
      bankAccount: '8820491823',
      ptkpStatus: 'TK/0',
      baseSalary: 16500000,
      fixedAllowance: 1500000,
      dailyAllowance: 55000,
      annualLeaveBalance: 9,
      role: 'employee',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-4',
      nip: 'EMP004',
      fullName: 'Reza Pratama, S.E., Ak.',
      email: 'reza.pratama@nusantara.co.id',
      phone: '0857-9911-2233',
      department: 'Keuangan & Pajak',
      position: 'Senior Tax & Financial Analyst',
      employmentType: 'PKWTT (Tetap)',
      joinDate: '2022-09-01',
      status: 'Aktif',
      nik: '3174040109920004',
      npwp: '33.987.654.3-044.000',
      bankName: 'Bank Mandiri',
      bankAccount: '1370001928374',
      ptkpStatus: 'K/0',
      baseSalary: 14000000,
      fixedAllowance: 1200000,
      dailyAllowance: 50000,
      annualLeaveBalance: 11,
      role: 'employee',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'emp-5',
      nip: 'EMP005',
      fullName: 'Dewi Lestari, S.I.Kom.',
      email: 'dewi.lestari@nusantara.co.id',
      phone: '0819-2233-4455',
      department: 'Pemasaran & Bisnis',
      position: 'Growth Marketing Lead',
      employmentType: 'PKWT (Kontrak)',
      joinDate: '2023-02-15',
      status: 'Aktif',
      nik: '3204051502950005',
      npwp: '44.321.654.9-055.000',
      bankName: 'BNI (Bank Negara Indonesia)',
      bankAccount: '0981234567',
      ptkpStatus: 'TK/1',
      baseSalary: 12500000,
      fixedAllowance: 1000000,
      dailyAllowance: 50000,
      annualLeaveBalance: 8,
      role: 'employee',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
    }
  ];

  const attendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      employeeId: 'emp-1',
      employeeName: 'Hendra Wijaya, S.Psi, M.M.',
      department: 'Operasional & SDM',
      date: todayStr,
      clockInTime: '08:14:22',
      clockOutTime: undefined,
      status: 'Hadir Tepat Waktu',
      workMode: 'WFO (Kantor)',
      locationName: 'Kantor Pusat SCBD Sudirman, Jakarta',
      lateMinutes: 0
    },
    {
      id: 'att-2',
      employeeId: 'emp-2',
      employeeName: 'Budi Santoso, S.T., M.Kom.',
      department: 'Teknologi & Engineering',
      date: todayStr,
      clockInTime: '08:22:10',
      clockOutTime: undefined,
      status: 'Hadir Tepat Waktu',
      workMode: 'WFO (Kantor)',
      locationName: 'Kantor Pusat SCBD Sudirman, Jakarta',
      lateMinutes: 0
    },
    {
      id: 'att-3',
      employeeId: 'emp-3',
      employeeName: 'Siti Aminah, S.Kom.',
      department: 'Teknologi & Engineering',
      date: todayStr,
      clockInTime: '08:42:15',
      clockOutTime: undefined,
      status: 'Terlambat',
      workMode: 'WFH (Remote)',
      locationName: 'Bandung Hub / Remote Secure IP',
      lateMinutes: 12,
      notes: 'Kemacetan akses jaringan fiber optik Bandung'
    },
    {
      id: 'att-4',
      employeeId: 'emp-4',
      employeeName: 'Reza Pratama, S.E., Ak.',
      department: 'Keuangan & Pajak',
      date: todayStr,
      clockInTime: '08:05:40',
      clockOutTime: undefined,
      status: 'Hadir Tepat Waktu',
      workMode: 'WFO (Kantor)',
      locationName: 'Kantor Pusat SCBD Sudirman, Jakarta',
      lateMinutes: 0
    }
  ];

  const leaves: LeaveRequest[] = [
    {
      id: 'lev-1',
      employeeId: 'emp-3',
      employeeName: 'Siti Aminah, S.Kom.',
      department: 'Teknologi & Engineering',
      leaveType: 'Cuti Tahunan',
      startDate: '2026-11-20',
      endDate: '2026-11-22',
      daysCount: 3,
      reason: 'Keperluan keluarga dan rehat tahunan',
      status: 'Menunggu Persetujuan',
      appliedAt: '2026-11-09T10:30:00Z',
      impactsSalaryDeduction: false
    },
    {
      id: 'lev-2',
      employeeId: 'emp-5',
      employeeName: 'Dewi Lestari, S.I.Kom.',
      department: 'Pemasaran & Bisnis',
      leaveType: 'Izin Sakit (Surat Dokter)',
      startDate: '2026-11-05',
      endDate: '2026-11-06',
      daysCount: 2,
      reason: 'Demam tinggi dan istirahat dokter',
      attachmentName: 'Surat_Dokter_RS_Siloman.pdf',
      status: 'Disetujui',
      appliedAt: '2026-11-05T07:15:00Z',
      reviewedBy: 'Hendra Wijaya, S.Psi, M.M.',
      reviewedAt: '2026-11-05T08:30:00Z',
      impactsSalaryDeduction: false
    },
    {
      id: 'lev-3',
      employeeId: 'emp-4',
      employeeName: 'Reza Pratama, S.E., Ak.',
      department: 'Keuangan & Pajak',
      leaveType: 'Cuti Tanpa Bayar (Unpaid Leave)',
      startDate: '2026-12-01',
      endDate: '2026-12-02',
      daysCount: 2,
      reason: 'Keperluan personal mendadak di luar kuota',
      status: 'Menunggu Persetujuan',
      appliedAt: '2026-11-10T09:00:00Z',
      impactsSalaryDeduction: true
    }
  ];

  // Pre-generate recent payroll
  const payroll: PayrollRecord[] = employees.map(emp => {
    return calculatePayroll(emp, 'November 2026', 22, 4, 12, 0);
  });

  const jobs: JobPosting[] = [
    {
      id: 'job-1',
      title: 'Senior DevOps & Cloud Infrastructure Engineer',
      department: 'Teknologi & Engineering',
      location: 'Jakarta (Hybrid)',
      type: 'Penuh Waktu (Full-Time)',
      openingsCount: 2,
      status: 'Buka',
      postedDate: '2026-10-15'
    },
    {
      id: 'job-2',
      title: 'Talent Acquisition & HRBP Specialist',
      department: 'Operasional & SDM',
      location: 'Jakarta (Onsite)',
      type: 'Penuh Waktu (Full-Time)',
      openingsCount: 1,
      status: 'Buka',
      postedDate: '2026-10-20'
    },
    {
      id: 'job-3',
      title: 'Corporate Financial Planning & Tax Specialist',
      department: 'Keuangan & Pajak',
      location: 'Jakarta (Hybrid)',
      type: 'Penuh Waktu (Full-Time)',
      openingsCount: 1,
      status: 'Buka',
      postedDate: '2026-11-01'
    }
  ];

  const candidates: Candidate[] = [
    {
      id: 'cand-1',
      jobId: 'job-1',
      jobTitle: 'Senior DevOps & Cloud Infrastructure Engineer',
      fullName: 'Muhammad Rizki, S.T.',
      email: 'm.rizki.cloud@gmail.com',
      phone: '0812-7788-9900',
      experienceYears: 6,
      stage: 'Interview Direksi',
      appliedDate: '2026-10-25',
      expectedSalary: 22000000,
      cvUrl: 'CV_Muhammad_Rizki_DevOps.pdf',
      interviewNotes: 'Kandidat memiliki sertifikasi CKA dan pengalaman migrasi multi-cluster Kubernetes di Telco.',
      rating: 5
    },
    {
      id: 'cand-2',
      jobId: 'job-1',
      jobTitle: 'Senior DevOps & Cloud Infrastructure Engineer',
      fullName: 'Ahmad Fauzi, S.Kom.',
      email: 'fauzi.ahmad.tech@gmail.com',
      phone: '0813-5566-7788',
      experienceYears: 4,
      stage: 'Interview Teknis',
      appliedDate: '2026-10-28',
      expectedSalary: 18500000,
      interviewNotes: 'Paham CI/CD GitLab & Docker, sedang mendalami Terraform infrastructure-as-code.',
      rating: 4
    },
    {
      id: 'cand-3',
      jobId: 'job-2',
      jobTitle: 'Talent Acquisition & HRBP Specialist',
      fullName: 'Nadia Putri, S.Psi.',
      email: 'nadia.putri.hr@gmail.com',
      phone: '0878-1122-3344',
      experienceYears: 5,
      stage: 'Offering Letter',
      appliedDate: '2026-10-22',
      expectedSalary: 13500000,
      interviewNotes: 'Sangat menguasai end-to-end recruitment tech startup dan regulasi ketenagakerjaan PP 35/2021.',
      rating: 5
    }
  ];

  const kpis: KPIGoal[] = [
    {
      id: 'kpi-1',
      employeeId: 'emp-3',
      employeeName: 'Siti Aminah, S.Kom.',
      department: 'Teknologi & Engineering',
      period: 'Q4 2026',
      title: 'Peningkatan System Reliability & Uptime Service Core',
      description: 'Menjaga SLO ketersediaan sistem core minimal 99.95% tanpa major downtime',
      weight: 35,
      targetValue: 99.95,
      actualValue: 99.98,
      unit: '%',
      selfRating: 5,
      managerRating: 5,
      feedback: 'Pencapaian luar biasa dalam arsitektur failover cluster.',
      status: 'Selesai'
    },
    {
      id: 'kpi-2',
      employeeId: 'emp-3',
      employeeName: 'Siti Aminah, S.Kom.',
      department: 'Teknologi & Engineering',
      period: 'Q4 2026',
      title: 'Delivery Modul Multi-Tenant & Otomasi Payroll',
      description: 'Menuntaskan integrasi modul perhitungan PPh 21 TER dan BPJS tepat waktu',
      weight: 40,
      targetValue: 100,
      actualValue: 95,
      unit: '%',
      selfRating: 4,
      managerRating: 4,
      feedback: 'Integrasi formula sudah sesuai regulasi terbaru PMK 168.',
      status: 'Menunggu Review'
    },
    {
      id: 'kpi-3',
      employeeId: 'emp-4',
      employeeName: 'Reza Pratama, S.E., Ak.',
      department: 'Keuangan & Pajak',
      period: 'Q4 2026',
      title: 'Akurasi Rekonsiliasi Pajak PPh 21 TER & e-Bupot Unifikasi',
      description: 'Laporan kepatuhan pajak bulanan nihil denda dan rekonsiliasi tepat waktu',
      weight: 50,
      targetValue: 100,
      actualValue: 100,
      unit: '%',
      selfRating: 5,
      managerRating: 5,
      feedback: 'Sangat teliti dalam audit trail perpajakan.',
      status: 'Selesai'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      userId: 'emp-1',
      userName: 'Hendra Wijaya, S.Psi, M.M.',
      userRole: 'admin',
      action: 'USER_LOGIN',
      resource: 'Auth Session',
      details: 'Super Admin login dari IP Terverifikasi (Jakarta SCBD)',
      ipAddress: '180.252.12.88'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'emp-1',
      userName: 'Hendra Wijaya, S.Psi, M.M.',
      userRole: 'admin',
      action: 'FINALIZE_PAYROLL',
      resource: 'Payroll Periode November 2026',
      details: 'Pengesahan penggajian otomatis terintegrasi absensi & BPJS Ketenagakerjaan/Kesehatan',
      ipAddress: '180.252.12.88'
    }
  ];

  return {
    employees,
    attendance,
    leaves,
    payroll,
    jobs,
    candidates,
    kpis,
    auditLogs
  };
}

// Read database
function readDB(): HRMStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as HRMStore;
  } catch (err) {
    console.error('Error reading DB, re-initializing:', err);
    const initial = getInitialStore();
    return initial;
  }
}

// Write database atomically
function writeDB(data: HRMStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Log audit helper
function logAudit(
  db: HRMStore, 
  user: { id: string; name: string; role: any }, 
  action: AuditLog['action'], 
  resource: string, 
  details: string,
  req?: express.Request
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    resource,
    details,
    ipAddress: req?.ip || '127.0.0.1'
  };
  db.auditLogs.unshift(newLog);
  // keep max 500 logs
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
}

// ================= API ROUTES =================

// 1. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/NIP dan kata sandi wajib diisi.' });
  }

  const db = readDB();
  const cleanId = String(identifier).trim().toLowerCase();
  const employee = db.employees.find(e => 
    e.email.toLowerCase() === cleanId || 
    e.nip.toLowerCase() === cleanId
  );

  if (!employee) {
    return res.status(401).json({ error: 'Karyawan dengan NIP / Email tersebut tidak ditemukan.' });
  }

  if (employee.password && employee.password !== password) {
    return res.status(401).json({ error: 'Kata sandi tidak sesuai. Silakan periksa kembali.' });
  }

  if (employee.status === 'Non-Aktif') {
    return res.status(403).json({ error: 'Akun karyawan berstatus Non-Aktif. Hubungi divisi HR.' });
  }

  const session: UserSession = {
    id: employee.id,
    employeeId: employee.nip,
    name: employee.fullName,
    email: employee.email,
    role: employee.role,
    department: employee.department,
    position: employee.position,
    avatarUrl: employee.avatar,
    token: `token-${employee.id}-${Date.now()}`
  };

  logAudit(
    db, 
    { id: employee.id, name: employee.fullName, role: employee.role }, 
    'USER_LOGIN', 
    'Autentikasi Karyawan', 
    `Login berhasil sebagai [${employee.role.toUpperCase()}] melalui portal online`,
    req
  );
  writeDB(db);

  return res.json({ session });
});

// 2. Employees: List (RBAC protected)
app.get('/api/employees', (req, res) => {
  const db = readDB();
  const role = req.headers['x-user-role'] as string || 'employee';
  const userId = req.headers['x-user-id'] as string;

  // Mask sensitive data for non-admin viewers
  const sanitized = db.employees.map(emp => {
    const isOwner = emp.id === userId;
    const isAdmin = role === 'admin';

    if (isAdmin || isOwner) {
      return emp;
    }

    // Mask sensitive fields
    return {
      ...emp,
      nik: emp.nik ? `${emp.nik.slice(0, 6)}**********` : '',
      npwp: emp.npwp ? `${emp.npwp.slice(0, 4)}***.***.*-***.***` : '',
      bankAccount: emp.bankAccount ? `*****${emp.bankAccount.slice(-4)}` : '',
      baseSalary: 0,
      fixedAllowance: 0,
      dailyAllowance: 0
    };
  });

  res.json({ employees: sanitized });
});

// Create Employee (Admin only)
app.post('/api/employees', (req, res) => {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string || 'system';
  const userName = req.headers['x-user-name'] as string || 'Admin';

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Hanya Super Admin / HR yang memiliki hak menambah karyawan baru.' });
  }

  const db = readDB();
  const body = req.body;

  const newId = `emp-${Date.now()}`;
  const nip = body.nip || `EMP${String(db.employees.length + 1).padStart(3, '0')}`;

  const newEmployee: Employee = {
    id: newId,
    nip,
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
    department: body.department,
    position: body.position,
    employmentType: body.employmentType || 'PKWTT (Tetap)',
    joinDate: body.joinDate || new Date().toISOString().split('T')[0],
    status: body.status || 'Aktif',
    nik: body.nik || '',
    npwp: body.npwp || '',
    bankName: body.bankName || 'BCA',
    bankAccount: body.bankAccount || '',
    ptkpStatus: body.ptkpStatus || 'TK/0',
    baseSalary: Number(body.baseSalary) || 8000000,
    fixedAllowance: Number(body.fixedAllowance) || 1000000,
    dailyAllowance: Number(body.dailyAllowance) || 45000,
    annualLeaveBalance: Number(body.annualLeaveBalance) || 12,
    role: body.role || 'employee',
    password: body.password || 'Password123!',
    avatar: body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  };

  db.employees.push(newEmployee);
  logAudit(
    db, 
    { id: userId, name: userName, role: 'admin' }, 
    'CREATE_EMPLOYEE', 
    `Karyawan: ${newEmployee.fullName} (${newEmployee.nip})`, 
    `Registrasi karyawan baru dengan posisi ${newEmployee.position} di divisi ${newEmployee.department}`,
    req
  );
  writeDB(db);

  res.status(201).json({ employee: newEmployee });
});

// Update Employee
app.put('/api/employees/:id', (req, res) => {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string;
  const userName = req.headers['x-user-name'] as string || 'Admin';

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Perubahan data karyawan memerlukan hak Super Admin.' });
  }

  const db = readDB();
  const index = db.employees.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Karyawan tidak ditemukan.' });
  }

  const old = db.employees[index];
  const updated: Employee = {
    ...old,
    ...req.body,
    id: old.id // immutable id
  };

  const isSalaryChanged = old.baseSalary !== updated.baseSalary || old.fixedAllowance !== updated.fixedAllowance;

  db.employees[index] = updated;

  if (isSalaryChanged) {
    logAudit(
      db,
      { id: userId, name: userName, role: 'admin' },
      'SALARY_CHANGE',
      `Karyawan: ${updated.fullName} (${updated.nip})`,
      `Penyesuaian gaji dari Rp ${old.baseSalary.toLocaleString('id-ID')} menjadi Rp ${updated.baseSalary.toLocaleString('id-ID')}`,
      req
    );
  } else {
    logAudit(
      db,
      { id: userId, name: userName, role: 'admin' },
      'UPDATE_EMPLOYEE',
      `Karyawan: ${updated.fullName} (${updated.nip})`,
      `Pembaruan profil / status ketenagakerjaan`,
      req
    );
  }

  writeDB(db);
  res.json({ employee: updated });
});

// 3. Attendance: List & Clock In/Out
app.get('/api/attendance', (req, res) => {
  const db = readDB();
  const date = req.query.date as string;
  const employeeId = req.query.employeeId as string;

  let records = db.attendance;
  if (date) {
    records = records.filter(r => r.date === date);
  }
  if (employeeId) {
    records = records.filter(r => r.employeeId === employeeId);
  }

  // Sort descending by date & clockInTime
  records.sort((a, b) => `${b.date} ${b.clockInTime}`.localeCompare(`${a.date} ${a.clockInTime}`));

  res.json({ attendance: records });
});

// Clock In / Clock Out
app.post('/api/attendance/clock', (req, res) => {
  const { employeeId, type, workMode, locationName, notes, selfieUrl } = req.body;
  if (!employeeId || !type) {
    return res.status(400).json({ error: 'ID Karyawan dan Tipe Absensi wajib disertakan.' });
  }

  const db = readDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ error: 'Karyawan tidak ditemukan.' });
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

  // Check today record
  const existingIndex = db.attendance.findIndex(a => a.employeeId === employeeId && a.date === todayStr);

  if (type === 'CLOCK_IN') {
    if (existingIndex !== -1) {
      return res.status(400).json({ error: 'Anda sudah melakukan Absen Masuk untuk hari ini.' });
    }

    // Jam masuk standar 08:30 WIB
    const [h, m] = timeStr.split(':').map(Number);
    const standardMin = 8 * 60 + 30; // 08:30
    const actualMin = h * 60 + m;
    const lateMinutes = Math.max(0, actualMin - standardMin);
    const status = lateMinutes > 0 ? 'Terlambat' : 'Hadir Tepat Waktu';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.fullName,
      department: employee.department,
      date: todayStr,
      clockInTime: timeStr,
      status,
      workMode: workMode || 'WFO (Kantor)',
      locationName: locationName || 'Kantor Pusat SCBD Sudirman, Jakarta',
      lateMinutes,
      notes,
      selfieUrl
    };

    db.attendance.unshift(newRecord);
    logAudit(
      db, 
      { id: employee.id, name: employee.fullName, role: employee.role }, 
      'CLOCK_IN', 
      `Presensi Masuk (${newRecord.date})`, 
      `Absen masuk pukul ${timeStr} WIB [${status} - ${newRecord.workMode}]`,
      req
    );
    writeDB(db);
    return res.json({ record: newRecord, message: 'Absen masuk berhasil dicatat!' });
  }

  if (type === 'CLOCK_OUT') {
    if (existingIndex === -1) {
      return res.status(400).json({ error: 'Anda belum melakukan Absen Masuk hari ini.' });
    }

    db.attendance[existingIndex].clockOutTime = timeStr;
    logAudit(
      db, 
      { id: employee.id, name: employee.fullName, role: employee.role }, 
      'CLOCK_OUT', 
      `Presensi Keluar (${todayStr})`, 
      `Absen pulang pukul ${timeStr} WIB`,
      req
    );
    writeDB(db);
    return res.json({ record: db.attendance[existingIndex], message: 'Absen pulang berhasil dicatat!' });
  }

  res.status(400).json({ error: 'Tipe clock tidak dikenali.' });
});

// 4. Leave Management: List & Requests
app.get('/api/leaves', (req, res) => {
  const db = readDB();
  const employeeId = req.query.employeeId as string;
  let leaves = db.leaves;
  if (employeeId) {
    leaves = leaves.filter(l => l.employeeId === employeeId);
  }
  leaves.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  res.json({ leaves });
});

app.post('/api/leaves', (req, res) => {
  const { employeeId, leaveType, startDate, endDate, daysCount, reason, attachmentName } = req.body;
  if (!employeeId || !leaveType || !startDate || !endDate) {
    return res.status(400).json({ error: 'Data pengajuan cuti tidak lengkap.' });
  }

  const db = readDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ error: 'Karyawan tidak ditemukan.' });
  }

  const days = Number(daysCount) || 1;

  if (leaveType === 'Cuti Tahunan' && employee.annualLeaveBalance < days) {
    return res.status(400).json({ 
      error: `Sisa kuota cuti tahunan tidak mencukupi (${employee.annualLeaveBalance} hari tersisa). Gunakan opsi Cuti Tanpa Bayar jika diperlukan.` 
    });
  }

  const newRequest: LeaveRequest = {
    id: `lev-${Date.now()}`,
    employeeId: employee.id,
    employeeName: employee.fullName,
    department: employee.department,
    leaveType,
    startDate,
    endDate,
    daysCount: days,
    reason,
    attachmentName,
    status: 'Menunggu Persetujuan',
    appliedAt: new Date().toISOString(),
    impactsSalaryDeduction: leaveType === 'Cuti Tanpa Bayar (Unpaid Leave)'
  };

  db.leaves.unshift(newRequest);
  writeDB(db);
  res.status(201).json({ request: newRequest });
});

app.put('/api/leaves/:id/status', (req, res) => {
  const userRole = req.headers['x-user-role'] as string;
  const userName = req.headers['x-user-name'] as string || 'Manager / HR';
  const userId = req.headers['x-user-id'] as string || 'system';

  if (userRole !== 'admin' && userRole !== 'manager') {
    return res.status(403).json({ error: 'Hanya Manajer Divisi atau HR yang dapat menyetujui/menolak pengajuan cuti.' });
  }

  const { status, rejectionReason } = req.body;
  const db = readDB();
  const leave = db.leaves.find(l => l.id === req.params.id);

  if (!leave) {
    return res.status(404).json({ error: 'Pengajuan cuti tidak ditemukan.' });
  }

  leave.status = status;
  leave.reviewedBy = userName;
  leave.reviewedAt = new Date().toISOString();
  if (rejectionReason) leave.rejectionReason = rejectionReason;

  // Deduct quota if approved & Annual Leave
  if (status === 'Disetujui' && leave.leaveType === 'Cuti Tahunan') {
    const emp = db.employees.find(e => e.id === leave.employeeId);
    if (emp) {
      emp.annualLeaveBalance = Math.max(0, emp.annualLeaveBalance - leave.daysCount);
    }
  }

  logAudit(
    db, 
    { id: userId, name: userName, role: userRole }, 
    status === 'Disetujui' ? 'LEAVE_APPROVAL' : 'LEAVE_REJECTION', 
    `Pengajuan Cuti: ${leave.employeeName} (${leave.leaveType})`, 
    `Status diubah menjadi [${status}] untuk tanggal ${leave.startDate} s/d ${leave.endDate}`,
    req
  );

  writeDB(db);
  res.json({ leave });
});

// 5. Payroll: List & Generator
app.get('/api/payroll', (req, res) => {
  const db = readDB();
  const employeeId = req.query.employeeId as string;
  const period = req.query.period as string;

  let records = db.payroll;
  if (employeeId) {
    records = records.filter(p => p.employeeId === employeeId);
  }
  if (period) {
    records = records.filter(p => p.period === period);
  }

  res.json({ payroll: records });
});

// Generate / Recalculate Payroll Batch
app.post('/api/payroll/generate', (req, res) => {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string || 'admin';
  const userName = req.headers['x-user-name'] as string || 'HR Admin';

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Hanya Super Admin / HR yang dapat memproses penggajian (payroll).' });
  }

  const { period } = req.body;
  const targetPeriod = period || 'November 2026';

  const db = readDB();

  // Integrated calculation based on attendance and unpaid leaves
  const generatedRecords: PayrollRecord[] = db.employees
    .filter(emp => emp.status === 'Aktif')
    .map(emp => {
      // Hitung keterlambatan bulan ini dari attendance
      const empAttendance = db.attendance.filter(a => a.employeeId === emp.id);
      const totalLateMinutes = empAttendance.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
      const attendanceDaysCount = empAttendance.length > 0 ? Math.min(22, empAttendance.length + 18) : 22;

      // Hitung Cuti Tanpa Bayar yang disetujui
      const unpaidLeaves = db.leaves.filter(l => 
        l.employeeId === emp.id && 
        l.status === 'Disetujui' && 
        l.leaveType === 'Cuti Tanpa Bayar (Unpaid Leave)'
      );
      const unpaidLeaveDays = unpaidLeaves.reduce((acc, curr) => acc + curr.daysCount, 0);

      // Default lembur 2-6 jam untuk engineering/marketing
      const overtimeHours = emp.department.includes('Teknologi') ? 4 : 2;

      return calculatePayroll(
        emp, 
        targetPeriod, 
        attendanceDaysCount, 
        overtimeHours, 
        totalLateMinutes, 
        unpaidLeaveDays
      );
    });

  // Replace records for this period
  db.payroll = db.payroll.filter(p => p.period !== targetPeriod).concat(generatedRecords);

  logAudit(
    db, 
    { id: userId, name: userName, role: 'admin' }, 
    'GENERATE_PAYROLL', 
    `Payroll Periode ${targetPeriod}`, 
    `Kalkulasi payroll otomatis untuk ${generatedRecords.length} karyawan aktif berdasarkan BPJS, PPh 21 TER, dan absensi terintegrasi`,
    req
  );

  writeDB(db);
  res.json({ count: generatedRecords.length, records: generatedRecords });
});

// 6. Recruitment (ATS)
app.get('/api/jobs', (req, res) => {
  const db = readDB();
  res.json({ jobs: db.jobs });
});

app.post('/api/jobs', (req, res) => {
  const db = readDB();
  const newJob: JobPosting = {
    id: `job-${Date.now()}`,
    title: req.body.title,
    department: req.body.department,
    location: req.body.location || 'Jakarta (Hybrid)',
    type: req.body.type || 'Penuh Waktu (Full-Time)',
    openingsCount: Number(req.body.openingsCount) || 1,
    status: 'Buka',
    postedDate: new Date().toISOString().split('T')[0]
  };
  db.jobs.unshift(newJob);
  writeDB(db);
  res.status(201).json({ job: newJob });
});

app.get('/api/candidates', (req, res) => {
  const db = readDB();
  res.json({ candidates: db.candidates });
});

app.put('/api/candidates/:id/stage', (req, res) => {
  const { stage } = req.body;
  const db = readDB();
  const cand = db.candidates.find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Kandidat tidak ditemukan.' });

  cand.stage = stage;
  writeDB(db);
  res.json({ candidate: cand });
});

// Hire candidate -> directly creates an Employee record
app.post('/api/candidates/:id/hire', (req, res) => {
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string || 'admin';
  const userName = req.headers['x-user-name'] as string || 'HR Admin';

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Hanya Super Admin / HR yang dapat menyelesaikan offering & onboarding kandidat.' });
  }

  const db = readDB();
  const cand = db.candidates.find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Kandidat tidak ditemukan.' });

  cand.stage = 'Diterima';

  // Find job to get department
  const job = db.jobs.find(j => j.id === cand.jobId);
  const department = job ? job.department : 'Teknologi & Engineering';

  const newEmpId = `emp-${Date.now()}`;
  const nip = `EMP${String(db.employees.length + 1).padStart(3, '0')}`;

  const newEmployee: Employee = {
    id: newEmpId,
    nip,
    fullName: cand.fullName,
    email: cand.email,
    phone: cand.phone,
    department,
    position: cand.jobTitle,
    employmentType: 'PKWT (Kontrak)',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    nik: `3171${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    npwp: `09.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.0-011.000`,
    bankName: 'BCA (Bank Central Asia)',
    bankAccount: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    ptkpStatus: 'TK/0',
    baseSalary: cand.expectedSalary || 12000000,
    fixedAllowance: 1000000,
    dailyAllowance: 50000,
    annualLeaveBalance: 12,
    role: 'employee',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256'
  };

  db.employees.push(newEmployee);
  logAudit(
    db, 
    { id: userId, name: userName, role: 'admin' }, 
    'HIRE_CANDIDATE', 
    `Onboarding Karyawan: ${newEmployee.fullName}`, 
    `Kandidat resmi diterima dari lowongan [${cand.jobTitle}] dengan NIP ${newEmployee.nip}`,
    req
  );

  writeDB(db);
  res.json({ message: 'Kandidat berhasil di-onboard menjadi karyawan!', employee: newEmployee });
});

// 7. Performance (KPI / OKR)
app.get('/api/kpis', (req, res) => {
  const db = readDB();
  const employeeId = req.query.employeeId as string;
  let kpis = db.kpis;
  if (employeeId) {
    kpis = kpis.filter(k => k.employeeId === employeeId);
  }
  res.json({ kpis });
});

app.post('/api/kpis', (req, res) => {
  const db = readDB();
  const newKpi: KPIGoal = {
    id: `kpi-${Date.now()}`,
    employeeId: req.body.employeeId,
    employeeName: req.body.employeeName,
    department: req.body.department,
    period: req.body.period || 'Q4 2026',
    title: req.body.title,
    description: req.body.description,
    weight: Number(req.body.weight) || 20,
    targetValue: Number(req.body.targetValue) || 100,
    actualValue: Number(req.body.actualValue) || 0,
    unit: req.body.unit || '%',
    status: 'Berjalan'
  };
  db.kpis.push(newKpi);
  writeDB(db);
  res.status(201).json({ kpi: newKpi });
});

app.put('/api/kpis/:id', (req, res) => {
  const db = readDB();
  const kpi = db.kpis.find(k => k.id === req.params.id);
  if (!kpi) return res.status(404).json({ error: 'KPI tidak ditemukan.' });

  Object.assign(kpi, req.body);
  writeDB(db);
  res.json({ kpi });
});

// 8. Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const db = readDB();
  res.json({ logs: db.auditLogs });
});

// 9. System status & metrics
app.get('/api/system/status', (req, res) => {
  const db = readDB();
  const activeCount = db.employees.filter(e => e.status === 'Aktif').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = db.attendance.filter(a => a.date === todayStr).length;
  const pendingLeaves = db.leaves.filter(l => l.status === 'Menunggu Persetujuan').length;
  const openJobs = db.jobs.filter(j => j.status === 'Buka').length;

  res.json({
    status: 'ONLINE',
    version: '1.0.0-enterprise',
    serverTime: new Date().toISOString(),
    metrics: {
      totalEmployees: db.employees.length,
      activeEmployees: activeCount,
      todayAttendance,
      pendingLeaves,
      openJobs
    }
  });
});

// ================= VITE DEV / PROD INTEGRATION =================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[HRM Server] Nusantara HRIS running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

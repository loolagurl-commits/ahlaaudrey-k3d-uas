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
} from '../types/hrm';

class APIService {
  private getHeaders(session?: UserSession | null) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (session) {
      headers['x-user-role'] = session.role;
      headers['x-user-id'] = session.id;
      headers['x-user-name'] = session.name;
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    }
    return headers;
  }

  async login(identifier: string, password: string):Promise<{ session: UserSession }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gagal terhubung ke server.' }));
      throw new Error(err.error || 'Autentikasi gagal.');
    }
    return res.json();
  }

  async getEmployees(session: UserSession): Promise<Employee[]> {
    const res = await fetch('/api/employees', {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal mengambil data karyawan.');
    const data = await res.json();
    return data.employees;
  }

  async createEmployee(session: UserSession, employeeData: Partial<Employee>): Promise<Employee> {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: this.getHeaders(session),
      body: JSON.stringify(employeeData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gagal menambah karyawan.' }));
      throw new Error(err.error || 'Gagal menambah karyawan.');
    }
    const data = await res.json();
    return data.employee;
  }

  async updateEmployee(session: UserSession, id: string, employeeData: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(session),
      body: JSON.stringify(employeeData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gagal memperbarui karyawan.' }));
      throw new Error(err.error || 'Gagal memperbarui karyawan.');
    }
    const data = await res.json();
    return data.employee;
  }

  async getAttendance(session: UserSession, params?: { date?: string; employeeId?: string }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.employeeId) query.set('employeeId', params.employeeId);

    const res = await fetch(`/api/attendance?${query.toString()}`, {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal mengambil data absensi.');
    const data = await res.json();
    return data.attendance;
  }

  async clockAttendance(
    session: UserSession, 
    type: 'CLOCK_IN' | 'CLOCK_OUT', 
    workMode: 'WFO (Kantor)' | 'WFH (Remote)',
    locationName: string,
    notes?: string
  ): Promise<{ record: AttendanceRecord; message: string }> {
    const res = await fetch('/api/attendance/clock', {
      method: 'POST',
      headers: this.getHeaders(session),
      body: JSON.stringify({
        employeeId: session.id,
        type,
        workMode,
        locationName,
        notes
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Presensi gagal.' }));
      throw new Error(err.error || 'Presensi gagal.');
    }
    return res.json();
  }

  async getLeaves(session: UserSession, employeeId?: string): Promise<LeaveRequest[]> {
    const query = new URLSearchParams();
    if (employeeId) query.set('employeeId', employeeId);

    const res = await fetch(`/api/leaves?${query.toString()}`, {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal mengambil data cuti.');
    const data = await res.json();
    return data.leaves;
  }

  async applyLeave(session: UserSession, leaveData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: this.getHeaders(session),
      body: JSON.stringify({
        employeeId: session.id,
        ...leaveData,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Pengajuan cuti gagal.' }));
      throw new Error(err.error || 'Pengajuan cuti gagal.');
    }
    const data = await res.json();
    return data.request;
  }

  async updateLeaveStatus(
    session: UserSession, 
    leaveId: string, 
    status: 'Disetujui' | 'Ditolak', 
    rejectionReason?: string
  ): Promise<LeaveRequest> {
    const res = await fetch(`/api/leaves/${leaveId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(session),
      body: JSON.stringify({ status, rejectionReason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Pembaruan status cuti gagal.' }));
      throw new Error(err.error || 'Pembaruan status cuti gagal.');
    }
    const data = await res.json();
    return data.leave;
  }

  async getPayroll(session: UserSession, params?: { employeeId?: string; period?: string }): Promise<PayrollRecord[]> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.set('employeeId', params.employeeId);
    if (params?.period) query.set('period', params.period);

    const res = await fetch(`/api/payroll?${query.toString()}`, {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal mengambil data payroll.');
    const data = await res.json();
    return data.payroll;
  }

  async generatePayrollBatch(session: UserSession, period: string): Promise<{ count: number; records: PayrollRecord[] }> {
    const res = await fetch('/api/payroll/generate', {
      method: 'POST',
      headers: this.getHeaders(session),
      body: JSON.stringify({ period }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gagal memproses kalkulasi payroll.' }));
      throw new Error(err.error || 'Gagal memproses kalkulasi payroll.');
    }
    return res.json();
  }

  async getJobs(session: UserSession): Promise<JobPosting[]> {
    const res = await fetch('/api/jobs', {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal memuat lowongan kerja.');
    const data = await res.json();
    return data.jobs;
  }

  async createJob(session: UserSession, jobData: Partial<JobPosting>): Promise<JobPosting> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: this.getHeaders(session),
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Gagal membuat lowongan kerja.');
    const data = await res.json();
    return data.job;
  }

  async getCandidates(session: UserSession): Promise<Candidate[]> {
    const res = await fetch('/api/candidates', {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal memuat kandidat.');
    const data = await res.json();
    return data.candidates;
  }

  async updateCandidateStage(session: UserSession, id: string, stage: string): Promise<Candidate> {
    const res = await fetch(`/api/candidates/${id}/stage`, {
      method: 'PUT',
      headers: this.getHeaders(session),
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) throw new Error('Gagal mengubah stage kandidat.');
    const data = await res.json();
    return data.candidate;
  }

  async hireCandidate(session: UserSession, id: string): Promise<{ message: string; employee: Employee }> {
    const res = await fetch(`/api/candidates/${id}/hire`, {
      method: 'POST',
      headers: this.getHeaders(session),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gagal merekrut kandidat.' }));
      throw new Error(err.error || 'Gagal merekrut kandidat.');
    }
    return res.json();
  }

  async getKPIs(session: UserSession, employeeId?: string): Promise<KPIGoal[]> {
    const query = new URLSearchParams();
    if (employeeId) query.set('employeeId', employeeId);

    const res = await fetch(`/api/kpis?${query.toString()}`, {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal mengambil data KPI.');
    const data = await res.json();
    return data.kpis;
  }

  async updateKPI(session: UserSession, id: string, kpiData: Partial<KPIGoal>): Promise<KPIGoal> {
    const res = await fetch(`/api/kpis/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(session),
      body: JSON.stringify(kpiData),
    });
    if (!res.ok) throw new Error('Gagal memperbarui KPI.');
    const data = await res.json();
    return data.kpi;
  }

  async getAuditLogs(session: UserSession): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs', {
      headers: this.getHeaders(session),
    });
    if (!res.ok) throw new Error('Gagal mengambil audit logs.');
    const data = await res.json();
    return data.logs;
  }

  async getSystemStatus(): Promise<any> {
    const res = await fetch('/api/system/status');
    if (!res.ok) return { status: 'OFFLINE' };
    return res.json();
  }
}

export const api = new APIService();

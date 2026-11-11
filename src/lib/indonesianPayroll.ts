import { PTKPStatus, TERCategory, PayrollRecord, Employee } from '../types/hrm';

/**
 * Batas maksimal upah perhitungan BPJS (Regulasi Indonesia)
 */
export const BPJS_KESEHATAN_MAX_WAGE = 12000000; // Cap Rp 12.000.000
export const BPJS_PENSIUN_MAX_WAGE = 10042300; // Cap Rp 10.042.300

/**
 * Menentukan Kategori TER (A, B, C) berdasarkan status PTKP sesuai PP 58/2023
 */
export function getTERCategory(ptkp: PTKPStatus): TERCategory {
  switch (ptkp) {
    case 'TK/0':
    case 'TK/1':
    case 'K/0':
      return 'A';
    case 'TK/2':
    case 'TK/3':
    case 'K/1':
    case 'K/2':
      return 'B';
    case 'K/3':
      return 'C';
    default:
      return 'A';
  }
}

/**
 * Menghitung persentase PPh 21 TER bulanan berdasarkan Bruto dan Kategori TER (PP 58/2023)
 */
export function getTERPercentage(grossIncome: number, category: TERCategory): number {
  if (category === 'A') {
    if (grossIncome <= 5400000) return 0;
    if (grossIncome <= 5650000) return 0.25;
    if (grossIncome <= 5950000) return 0.50;
    if (grossIncome <= 6300000) return 0.75;
    if (grossIncome <= 6750000) return 1.00;
    if (grossIncome <= 7500000) return 1.25;
    if (grossIncome <= 8550000) return 1.50;
    if (grossIncome <= 9650000) return 1.75;
    if (grossIncome <= 10050000) return 2.00;
    if (grossIncome <= 10350000) return 2.25;
    if (grossIncome <= 10700000) return 2.50;
    if (grossIncome <= 11050000) return 3.00;
    if (grossIncome <= 11600000) return 3.50;
    if (grossIncome <= 12500000) return 4.00;
    if (grossIncome <= 13750000) return 5.00;
    if (grossIncome <= 15100000) return 6.00;
    if (grossIncome <= 16950000) return 7.00;
    if (grossIncome <= 19750000) return 8.00;
    if (grossIncome <= 24150000) return 9.00;
    if (grossIncome <= 26450000) return 10.00;
    if (grossIncome <= 28000000) return 11.00;
    if (grossIncome <= 30050000) return 12.00;
    if (grossIncome <= 32400000) return 13.00;
    if (grossIncome <= 35400000) return 14.00;
    if (grossIncome <= 39100000) return 15.00;
    if (grossIncome <= 43850000) return 16.00;
    if (grossIncome <= 47800000) return 17.00;
    if (grossIncome <= 51400000) return 18.00;
    if (grossIncome <= 56300000) return 19.00;
    if (grossIncome <= 62200000) return 20.00;
    return 22.00;
  }

  if (category === 'B') {
    if (grossIncome <= 6200000) return 0;
    if (grossIncome <= 6500000) return 0.25;
    if (grossIncome <= 68500000) return 0.50;
    if (grossIncome <= 7300000) return 0.75;
    if (grossIncome <= 9200000) return 1.00;
    if (grossIncome <= 10750000) return 1.50;
    if (grossIncome <= 12300000) return 2.00;
    if (grossIncome <= 13900000) return 3.00;
    if (grossIncome <= 15600000) return 4.00;
    if (grossIncome <= 17500000) return 5.00;
    if (grossIncome <= 19800000) return 6.00;
    if (grossIncome <= 22700000) return 7.00;
    if (grossIncome <= 26600000) return 8.00;
    if (grossIncome <= 30000000) return 9.00;
    if (grossIncome <= 33000000) return 10.00;
    if (grossIncome <= 36000000) return 11.00;
    if (grossIncome <= 40000000) return 12.00;
    return 15.00;
  }

  // Category C
  if (grossIncome <= 6600000) return 0;
  if (grossIncome <= 6950000) return 0.25;
  if (grossIncome <= 7350000) return 0.50;
  if (grossIncome <= 7800000) return 0.75;
  if (grossIncome <= 8850000) return 1.00;
  if (grossIncome <= 10400000) return 1.50;
  if (grossIncome <= 12100000) return 2.00;
  if (grossIncome <= 14050000) return 3.00;
  if (grossIncome <= 16100000) return 4.00;
  if (grossIncome <= 18550000) return 5.00;
  if (grossIncome <= 21650000) return 6.00;
  if (grossIncome <= 25500000) return 7.00;
  if (grossIncome <= 29500000) return 8.00;
  return 10.00;
}

/**
 * Hitung upah lembur per jam sesuai UU Ketenagakerjaan (1/173 x Upah Sebulan)
 */
export function calculateOvertimePay(baseSalary: number, fixedAllowance: number, overtimeHours: number): number {
  if (overtimeHours <= 0) return 0;
  const hourlyRate = (baseSalary + fixedAllowance) / 173;
  // Skenario standar hari kerja: Jam pertama 1.5x, jam berikutnya 2x
  if (overtimeHours <= 1) {
    return Math.round(overtimeHours * 1.5 * hourlyRate);
  }
  const firstHour = 1.5 * hourlyRate;
  const remainingHours = (overtimeHours - 1) * 2 * hourlyRate;
  return Math.round(firstHour + remainingHours);
}

/**
 * Hitung kalkulasi lengkap penggajian bulanan karyawan
 */
export function calculatePayroll(
  employee: Employee,
  period: string,
  attendanceDays: number = 22,
  overtimeHours: number = 0,
  lateMinutesAccumulated: number = 0,
  unpaidLeaveDays: number = 0
): PayrollRecord {
  const baseSalary = employee.baseSalary;
  const fixedAllowance = employee.fixedAllowance;
  const dailyAllowanceTotal = attendanceDays * employee.dailyAllowance;
  const overtimePay = calculateOvertimePay(baseSalary, fixedAllowance, overtimeHours);

  // Komponen BPJS yang ditanggung Perusahaan (menambah bruto untuk PPh 21)
  const bpjsKesBase = Math.min(baseSalary + fixedAllowance, BPJS_KESEHATAN_MAX_WAGE);
  const bpjsPensiunBase = Math.min(baseSalary + fixedAllowance, BPJS_PENSIUN_MAX_WAGE);
  
  const bpjsKesehatanCompany = Math.round(bpjsKesBase * 0.04); // 4%
  const bpjsJkkCompany = Math.round((baseSalary + fixedAllowance) * 0.0024); // 0.24%
  const bpjsJkmCompany = Math.round((baseSalary + fixedAllowance) * 0.0030); // 0.30%

  // Penghasilan Bruto Kena Pajak
  const directIncome = baseSalary + fixedAllowance + dailyAllowanceTotal + overtimePay;
  const grossIncome = directIncome + bpjsKesehatanCompany + bpjsJkkCompany + bpjsJkmCompany;

  // Potongan Keterlambatan (Misal: Rp 20.000 per 30 menit jika terlambat > 30 menit)
  let latePenaltyDeduction = 0;
  if (lateMinutesAccumulated > 30) {
    latePenaltyDeduction = Math.floor(lateMinutesAccumulated / 30) * 25000;
  }

  // Potongan Unpaid Leave (Cuti Tanpa Bayar) proporsional hari kerja standar 22 hari
  const unpaidLeaveDeduction = unpaidLeaveDays > 0 
    ? Math.round((unpaidLeaveDays / 22) * baseSalary) 
    : 0;

  // Potongan BPJS Karyawan
  const bpjsKesehatanEmployee = Math.round(bpjsKesBase * 0.01); // 1%
  const bpjsJhtEmployee = Math.round((baseSalary + fixedAllowance) * 0.02); // 2%
  const bpjsJpEmployee = Math.round(bpjsPensiunBase * 0.01); // 1%

  // Perhitungan Pajak PPh 21 TER
  const terCategory = getTERCategory(employee.ptkpStatus);
  const pph21TERPercentage = getTERPercentage(grossIncome, terCategory);
  const pph21Amount = Math.round((grossIncome * pph21TERPercentage) / 100);

  // Total Potongan Karyawan dari Penghasilan Langsung
  const totalDeductions = 
    latePenaltyDeduction + 
    unpaidLeaveDeduction + 
    bpjsKesehatanEmployee + 
    bpjsJhtEmployee + 
    bpjsJpEmployee + 
    pph21Amount;

  // Gaji Bersih (Take Home Pay)
  const netSalary = Math.max(0, directIncome - totalDeductions);

  return {
    id: `PAY-${period.replace(/\s+/g, '-')}-${employee.nip}`,
    period,
    employeeId: employee.id,
    employeeName: employee.fullName,
    department: employee.department,
    position: employee.position,
    nip: employee.nip,
    ptkpStatus: employee.ptkpStatus,
    terCategory,
    baseSalary,
    fixedAllowance,
    dailyAllowance: dailyAllowanceTotal,
    attendanceDays,
    overtimeHours,
    overtimePay,
    bpjsKesehatanCompany,
    bpjsJkkCompany,
    bpjsJkmCompany,
    grossIncome,
    latePenaltyDeduction,
    unpaidLeaveDeduction,
    bpjsKesehatanEmployee,
    bpjsJhtEmployee,
    bpjsJpEmployee,
    pph21TERPercentage,
    pph21Amount,
    totalDeductions,
    netSalary,
    status: 'Finalized',
    paymentDate: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toISOString()
  };
}

/**
 * Format Rupiah rapi
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

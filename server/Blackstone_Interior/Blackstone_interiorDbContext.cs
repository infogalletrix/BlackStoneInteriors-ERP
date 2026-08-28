using Microsoft.EntityFrameworkCore;
using Blackstone_Interior.models;

namespace Blackstone_Interior
{
    public class BlackstoneinteriorDbContext : DbContext
    {
        public BlackstoneinteriorDbContext(DbContextOptions<BlackstoneinteriorDbContext> options) : base(options) { }

        // ── Legacy ──────────────────────────────────────────────────
        public DbSet<Client> Clients { get; set; }

        // ── CRM ─────────────────────────────────────────────────────
        public DbSet<CrmContact> CrmContacts { get; set; }
        public DbSet<Deal> Deals { get; set; }
        public DbSet<Activity> Activities { get; set; }

        // ── Finance ─────────────────────────────────────────────────
        public DbSet<Quotation> Quotations { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<PayrollRecord> PayrollRecords { get; set; }
        public DbSet<PaymentReceipt> PaymentReceipts { get; set; }

        // ── HR ──────────────────────────────────────────────────────
        public DbSet<Employee> Employees { get; set; }
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }

        // ── Projects ────────────────────────────────────────────────
        public DbSet<Site> Sites { get; set; }
    }
}


using Fastnet.Core;
using Fastnet.Core.Web;
using Microsoft.AspNetCore.Hosting;
using Fastnet.Webframe.Common2;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;

namespace Fastnet.Webframe.BookingData2
{
    public class BookingDbInitialiser
    {
        public static void Initialise(BookingDataContext db, ILogger log)
        {
            var creator = db.Database.GetService<IDatabaseCreator>() as RelationalDatabaseCreator;
            var dbExists = creator.Exists();

            if (dbExists)
            {
                log.Debug("BookingDb exists");
            }
            else
            {
                log.Warning("No BookingDb found");
            }
            var pendingMigrations = db.Database.GetPendingMigrations();
            db.Database.Migrate();
            //log.Trace("The following migrations have been applied:");
            //var migrations = db.Database.GetAppliedMigrations();
            //foreach (var migration in migrations)
            //{
            //    log.Trace($"\t{migration}");
            //}
        }
    }
    public class BookingDbContextFactory : WebDbContextFactory
    {
        public BookingDbContextFactory(IOptions<BookingDbOptions> options, IServiceProvider sp) : base(options, sp)
        {
        }
    }
    public class BookingDbOptions : WebDbOptions
    {

    }
    public partial class BookingDataContext : WebDbContext // DbContext
    {
        private CustomisationOptions customisation;
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingAccomodation> BookingAccomodations { get; set; }
        public DbSet<Accomodation> AccomodationSet { get; set; }
        public DbSet<AccomodationExtra> AccomodationExtras { get; set; }
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<PriceStructure> PriceStructures { get; set; }
        public DbSet<Period> Periods { get; set; }
        public DbSet<Price> Prices { get; set; }

        public DbSet<EntryCode> EntryCodes { get; set; }
        public DbSet<Parameter> Parameters { get; set; }
        public DbSet<DWHParameter> DWHParameters { get; set; }
        public DbSet<BookingEmail> Emails { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<Tasklog> Tasklogs { get; set; }
        public BookingDataContext(DbContextOptions<BookingDataContext> options, IOptions<CustomisationOptions> customisation, IOptions<BookingDbOptions> webDbOptions, IServiceProvider sp) : base(options, webDbOptions, sp)
        {
            this.customisation = customisation.Value;
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("book");
            modelBuilder.Entity<Booking>()
                .Property(x => x.TotalCost)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Price>()
                .Property(x => x.Amount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Accomodation>()
                .HasIndex(c => c.Name)
                .IsUnique();

            modelBuilder.Entity<Accomodation>()
                .HasOne(x => x.ParentAccomodation)
                .WithMany(x => x.SubAccomodation)
                .HasForeignKey(x => x.ParentAccomodation_AccomodationId);

            modelBuilder.Entity<BookingAccomodation>()
                .HasKey(c => new { c.Booking_BookingId, c.Accomodation_AccomodationId });

            modelBuilder.Entity<BookingAccomodation>()
                .HasOne(x => x.Accomodation)
                .WithMany(x => x.BookingAccomodations)
                .HasForeignKey(x => x.Accomodation_AccomodationId);

            modelBuilder.Entity<BookingAccomodation>()
                .HasOne(x => x.Booking)
                .WithMany(x => x.BookingAccomodations)
                .HasForeignKey(x => x.Booking_BookingId);

            base.OnModelCreating(modelBuilder);
        }
    }
}

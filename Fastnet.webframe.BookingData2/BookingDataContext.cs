using Fastnet.Webframe.Common2;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.BookingData2
{
    public partial class BookingDataContext : DbContext
    {
        private CustomisationOptions customisation;
        public DbSet<Accomodation> AccomodationSet { get; set; }
        public DbSet<AccomodationExtra> AccomodationExtras { get; set; }
        public DbSet<Availability> Availablities { get; set; }
        public DbSet<PriceStructure> PriceStructures { get; set; }
        public DbSet<Period> Periods { get; set; }
        public DbSet<Price> Prices { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<EntryCode> EntryCodes { get; set; }
        public DbSet<Parameter> Parameters { get; set; }
        public DbSet<DWHParameter> DWHParameters { get; set; }
        public DbSet<BookingEmail> Emails { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<Tasklog> Tasklogs { get; set; }
        public BookingDataContext(DbContextOptions<BookingDataContext> options, IOptions<CustomisationOptions> customisation) : base(options)
        {
            this.customisation = customisation.Value;
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("book");
            modelBuilder.Entity<Accomodation>()
                .HasIndex(c => c.Name)
                .IsUnique();
            base.OnModelCreating(modelBuilder);
        }
    }
}

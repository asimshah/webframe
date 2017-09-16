using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace Fastnet.Webframe.CoreData2
{
    public partial class CoreDataContext : DbContext
    {
        public DbSet<Directory> Directories { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<MenuMaster> MenuMasters { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<FileChunk> FileChunks { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<DirectoryGroup> DirectoryGroups { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<MemberBase> Members { get; set; }
        public DbSet<Page> Pages { get; set; }
        public DbSet<PageMarkup> PageMarkups { get; set; }
        public DbSet<SiteSetting> SiteSettings { get; set; }
        public DbSet<UploadFile> UploadFiles { get; set; }
        public DbSet<ActionBase> Actions { get; set; }
        public DbSet<Recorder> Recorders { get; set; }
        public DbSet<Record> Records { get; set; }
        public DbSet<Webtask> Webtasks { get; set; }
        public DbSet<SageTransaction> SageTransactions { get; set; }
        public CoreDataContext(DbContextOptions<CoreDataContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("std");
            base.OnModelCreating(modelBuilder);
        }
    }
}

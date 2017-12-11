
using Fastnet.Webframe.Common2;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
        private CustomisationOptions customisation;
        public DbSet<Directory> Directories { get; set; }
        public DbSet<Menu> Menus { get; set; }
        //public DbSet<MenuMaster> MenuMasters { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<FileChunk> FileChunks { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<DirectoryGroup> DirectoryGroups { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<DWHMember> DWHMembers { get; set; }
        public DbSet<Page> Pages { get; set; }
        public DbSet<PageMarkup> PageMarkups { get; set; }
        public DbSet<PagePage> PagePages { get; set; }
        public DbSet<PageDocument> PageDocuments { get; set; }
        public DbSet<SiteSetting> SiteSettings { get; set; }
        public DbSet<UploadFile> UploadFiles { get; set; }
        public DbSet<ActionBase> Actions { get; set; }
        public DbSet<ApplicationAction> ApplicationActions { get; set; }
        //public DbSet<Recorder> Recorders { get; set; }
        //public DbSet<Record> Records { get; set; }
        public DbSet<Webtask> Webtasks { get; set; }
        public DbSet<SageTransaction> SageTransactions { get; set; }
        public CoreDataContext(DbContextOptions<CoreDataContext> options, IOptions<CustomisationOptions> customisation) : base(options)
        {
            this.customisation = customisation.Value;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("std");
            if (this.customisation.Factory != FactoryName.DonWhillansHut)
            {
                modelBuilder.Ignore<DWHMember>();
            }
            modelBuilder.Entity<Menu>()
                .HasOne(x => x.ParentMenu)
                .WithMany(x => x.Submenus)
                .HasForeignKey(x => x.ParentMenu_Id);
            //modelBuilder.Entity<Menu>()
            //    .HasOne(x => x.MenuMaster)
            //    .WithMany(x => x.Menus)
            //    .HasForeignKey(x => x.MenuMaster_Id);


            modelBuilder.Entity<Directory>()
                .HasOne(x => x.ParentDirectory)
                .WithMany(x => x.SubDirectories)
                .HasForeignKey(x => x.ParentDirectoryId);

            modelBuilder.Entity<DirectoryGroup>()
                .HasKey(c => new { c.DirectoryId, c.GroupId });
            modelBuilder.Entity<DirectoryGroup>()
                .HasOne(x => x.Directory)
                .WithMany(x => x.DirectoryGroups)
                .HasForeignKey(x => x.DirectoryId);
            modelBuilder.Entity<DirectoryGroup>()
                .HasOne(x => x.Group)
                .WithMany(x => x.DirectoryGroups)
                .HasForeignKey(x => x.GroupId);

            modelBuilder.Entity<GroupMember>()
                .HasKey(c => new { c.GroupId, c.MemberId });
            modelBuilder.Entity<GroupMember>()
                .HasOne(x => x.Group)
                .WithMany(x => x.GroupMembers)
                .HasForeignKey(x => x.GroupId);
            modelBuilder.Entity<GroupMember>()
                .HasOne(x => x.Member)
                .WithMany(x => x.GroupMembers)
                .HasForeignKey(x => x.MemberId);

            modelBuilder.Entity<Page>()
                .HasOne(p => p.PageMarkup)
                .WithOne(pm => pm.Page)
                .HasForeignKey<PageMarkup>(pm => pm.PageId);
            modelBuilder.Entity<Page>()
                .HasMany(x => x.Menus)
                .WithOne(x => x.Page)
                .HasForeignKey(x => x.Page_PageId);

            modelBuilder.Entity<PageDocument>()
                .HasKey(c => new { c.PageId, c.DocumentId });
            modelBuilder.Entity<PageDocument>()
                .HasOne(p => p.Page)
                .WithMany(p => p.PageDocuments)
                .HasForeignKey(p => p.PageId);
            modelBuilder.Entity<PageDocument>()
                .HasOne(x => x.Document)
                .WithMany(x => x.PageDocuments)
                .HasForeignKey(x => x.DocumentId);

            modelBuilder.Entity<PagePage>()
                .HasKey(x => new { x.FromPageId, x.ToPageId });
            modelBuilder.Entity<PagePage>()
                .HasOne(x => x.FromPage)
                .WithMany(x => x.BackLinks)
                .HasForeignKey(x => x.FromPageId);
            modelBuilder.Entity<PagePage>()
                .HasOne(x => x.ToPage)
                .WithMany(x => x.ForwardLinks)
                .HasForeignKey(x => x.ToPageId);

            base.OnModelCreating(modelBuilder);
        }
    }
}


using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.Common2;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using System.Threading.Tasks;

namespace Fastnet.Webframe.CoreData2
{
    //public class DesignTimeCoreDataDbFactory : DesignTimeWebDbContextFactory<CoreDataContext>
    //{
    //    protected override string GetDesignTimeConnectionString()
    //    {
    //        var path = @"C:\devroot\Fastnet Webframe\Fastnet.Webframe\Fastnet.Webframe.Web2";
    //        var databaseFilename = @"sitedb.mdf";
    //        var catalog = @"dwh-netstandard2";
    //        //string path = environment.ContentRootPath;
    //        string dataFolder = Path.Combine(path, "Data");
    //        if (!System.IO.Directory.Exists(dataFolder))
    //        {
    //            System.IO.Directory.CreateDirectory(dataFolder);
    //        }
    //        string databaseFile = Path.Combine(dataFolder, databaseFilename);
    //        SqlConnectionStringBuilder csb = new SqlConnectionStringBuilder();
    //        csb.AttachDBFilename = databaseFile;
    //        csb.DataSource = ".\\SQLEXPRESS";
    //        csb.InitialCatalog = catalog;
    //        csb.IntegratedSecurity = true;
    //        csb.MultipleActiveResultSets = true;
    //        return csb.ToString();
    //    }
    //}
    public class CoreDataDbInitialiser
    {
        public static void Initialise(CoreDataContext db, ILogger log, IHostingEnvironment env)
        {
            //var options = db.Database.GetService<IOptions<QParaDbOptions>>();
            //var log = db.Database.GetService<ILogger<QParaDb>>() as ILogger;
            var creator = db.Database.GetService<IDatabaseCreator>() as RelationalDatabaseCreator;
            var dbExists = creator.Exists();

            if (dbExists)
            {
                log.Debug("CoreDataContext exists");
            }
            else
            {
                log.Warning("No CoreDataContext found");
            }
            var pendingMigrations = db.Database.GetPendingMigrations();
            db.Database.Migrate();
            log.Trace("The following migrations have been applied:");
            var migrations = db.Database.GetAppliedMigrations();
            foreach (var migration in migrations)
            {
                log.Trace($"\t{migration}");
            }
            db.Seed(env);
        }
    }
    public class CoreDataDbContextFactory : WebDbContextFactory
    {
        public CoreDataDbContextFactory(IOptions<CoreDataDbOptions> options, IServiceProvider sp) : base(options, sp)
        {
        }
    }
    public class CoreDataDbOptions : WebDbOptions
    {
        public bool ReloadMainTemplates { get; set; }
    }

    public partial class CoreDataContext : WebDbContext // DbContext
    {
        private ILogger log;
        private IHostingEnvironment env;
        //private CustomisationOptions customisation;
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
        public DbSet<SessionAction> SessionActions { get; set; }
        public DbSet<MemberAction> MemberActions { get; set; }
        public DbSet<GroupAction> GroupActions { get; set; }
        public DbSet<FolderAction> FolderActions { get; set; }
        public DbSet<MailAction> MailActions { get; set; }
        //public DbSet<Recorder> Recorders { get; set; }
        //public DbSet<Record> Records { get; set; }
        public DbSet<Webtask> Webtasks { get; set; }
        public DbSet<SageTransaction> SageTransactions { get; set; }
        public DbSet<HtmlTemplate> HtmlTemplates { get; set; }

        public CoreDataContext(DbContextOptions<CoreDataContext> options, IOptions<CoreDataDbOptions> webDbOptions, IServiceProvider sp) : base(options, webDbOptions, sp)
        {
            //this.customisation = sp?.GetRequiredService<IOptions<CustomisationOptions>>().Value;
            //this.customisation = customisation.Value;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("std");
            modelBuilder.Entity<ActionBase>()
                .ToTable("ActionBases");

            //modelBuilder.Entity<GroupAction>()
            //    .Property("Action").HasColumnName("Action1");

            //modelBuilder.Entity<MemberAction>()
            //    .Property("Action").HasColumnName("Action2");

            /*
             * Note
             * I tried to drop the DWHMember from the model using modelBuilder.Ignore but this proved to be unsatisfactory
             * because of a complexities arising GetWebDbContext<TContext>() in Fastnet.Core.Web.WebDbContextFactory:
             * 
             * Recall the purpose of GetWebDbContext<TContext>() is to make it easy to obtain a database context when
             * not running in a transient scope such as from a Controller. The prime case is when using "background" tasks
             * as supports by Fastnet.Core.Web.ScheduledTask.
             * 
             * The difficulty arising in finding a way to detect whether a WebDbContext instance is being created through
             * DependencyInjection, or through GetWebDbContext<TContext>() - I use the presence of one of the constructor parameters
             * (specifically the IServiceProvider), i.e. if it is null or not, to separate DependencyInjection is providing
             * the instance (when it is not null) of GetWebDbContext<TContext>() which explicitly passes it as null.
             * This, as I say in the code, is a hack and really a more robust technique is required.
             * The consequence is that I cannot add additional constructor parameters as then GetWebDbContext<TContext>() cannot find the constructor.
             * There really needs to be a better way - perhaps I need to analyse each contsructor and find the one I want (but the underlying design is
             * remains a hack).
             * 
             * This limitation of providing further constructor parameters means I cannot inject the customisation options instance. This means that
             * when using GetWebDbContext<TContext>(), the DWHMember entity is no longer in the model!
             * So I have made the DWHMember entity a permanent part of the model though really it is only used for DWH.
             */
            //if (this.customisation == null || this.customisation.Factory != FactoryName.DonWhillansHut)
            //{
            //    modelBuilder.Ignore<DWHMember>();
            //}
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
        internal void Seed(IHostingEnvironment env)
        {
            this.env = env;
            log = this.serviceProvider.GetService<ILogger<CoreDataContext>>();
            log.Information("Seed() started");
            LoadRequiredEmailTemplates();
        }

        private void LoadRequiredEmailTemplates()
        {
            var contentRoot = env.ContentRootPath;
            var defaultTemplatePath = Path.Combine(contentRoot, "Default Templates");
            LoadMainTemplates(defaultTemplatePath);
            SaveChanges();
        }
        private void LoadMainTemplates(string defaultTemplatePath)
        {
            CoreDataDbOptions dbOptions = webDbOptions.Value as CoreDataDbOptions;
            var reload = dbOptions.ReloadMainTemplates;
            var mainTemplates = Path.Combine(defaultTemplatePath, "main");
            LoadTemplateIfRequired("main", "AccountActivation-Email", mainTemplates, "AccountActivation.html", reload);
            LoadTemplateIfRequired("main", "PasswordReset-Email", mainTemplates, "PasswordReset.html", reload);
            LoadTemplateIfRequired("main", "EmailAddressChanged-Email", mainTemplates, "EmailAddressChanged.html", reload);
        }
        private void LoadTemplateIfRequired(string category, string templateName, string templatePath, string templateFilename, bool reload)
        {
            var item = HtmlTemplates.SingleOrDefault(x => string.Compare(category, x.Category, true) == 0 && string.Compare(templateName, x.Name, true) == 0);
            if(item == null)
            {
                var htmlText = File.ReadAllText(Path.Combine(templatePath, templateFilename));
                item = new HtmlTemplate { Category = category, Name = templateName, HtmlText = htmlText };
                HtmlTemplates.Add(item);
                log.Information($"Template {templateName} loaded");
            }
            else if(reload)
            {
                var htmlText = File.ReadAllText(Path.Combine(templatePath, templateFilename));
                item.HtmlText = htmlText;
                log.Information($"Template {templateName} reloaded");
            }
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Fastnet.Webframe.CoreData2.Migrations
{
    public partial class InitialVersion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            // COMMENTED OUT AS I ALREADY HAVE A DATBASE WITH THIS STUFF

            //migrationBuilder.EnsureSchema(
            //    name: "std");

            //migrationBuilder.CreateTable(
            //    name: "Actions",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        ActionBaseId = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        RecordedOn = table.Column<DateTimeOffset>(nullable: false),
            //        Remark = table.Column<string>(nullable: true),
            //        Discriminator = table.Column<string>(nullable: false),
            //        SiteUrl = table.Column<string>(nullable: true),
            //        Version = table.Column<string>(nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Actions", x => x.ActionBaseId);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Directories",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        DirectoryId = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        Name = table.Column<string>(maxLength: 1024, nullable: true),
            //        ParentDirectoryId = table.Column<long>(nullable: true),
            //        Deleted = table.Column<bool>(nullable: false),
            //        OriginalFolderId = table.Column<long>(nullable: true),
            //        TimeStamp = table.Column<byte[]>(rowVersion: true, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Directories", x => x.DirectoryId);
            //        table.ForeignKey(
            //            name: "FK_Directories_Directories_ParentDirectoryId",
            //            column: x => x.ParentDirectoryId,
            //            principalSchema: "std",
            //            principalTable: "Directories",
            //            principalColumn: "DirectoryId",
            //            onDelete: ReferentialAction.Restrict);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Groups",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        GroupId = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        ParentGroupId = table.Column<long>(nullable: true),
            //        Name = table.Column<string>(nullable: true),
            //        Description = table.Column<string>(nullable: true),
            //        Weight = table.Column<int>(nullable: false),
            //        TypeCode = table.Column<int>(nullable: false),
            //        TimeStamp = table.Column<byte[]>(rowVersion: true, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Groups", x => x.GroupId);
            //        table.ForeignKey(
            //            name: "FK_Groups_Groups_ParentGroupId",
            //            column: x => x.ParentGroupId,
            //            principalSchema: "std",
            //            principalTable: "Groups",
            //            principalColumn: "GroupId",
            //            onDelete: ReferentialAction.Restrict);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Members",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        Id = table.Column<string>(maxLength: 128, nullable: false),
            //        EmailAddress = table.Column<string>(maxLength: 256, nullable: true),
            //        EmailAddressConfirmed = table.Column<bool>(nullable: false),
            //        FirstName = table.Column<string>(maxLength: 128, nullable: true),
            //        LastName = table.Column<string>(maxLength: 128, nullable: true),
            //        PhoneNumber = table.Column<string>(maxLength: 128, nullable: true),
            //        CreationDate = table.Column<DateTime>(nullable: false),
            //        LastLoginDate = table.Column<DateTime>(nullable: true),
            //        Disabled = table.Column<bool>(nullable: false),
            //        ActivationCode = table.Column<string>(maxLength: 128, nullable: true),
            //        ActivationEmailSentDate = table.Column<DateTime>(nullable: true),
            //        PasswordResetCode = table.Column<string>(nullable: true),
            //        PasswordResetEmailSentDate = table.Column<DateTime>(nullable: true),
            //        PlainPassword = table.Column<string>(nullable: true),
            //        IsAdministrator = table.Column<bool>(nullable: false),
            //        IsAnonymous = table.Column<bool>(nullable: false),
            //        CreationMethod = table.Column<int>(nullable: false),
            //        Discriminator = table.Column<string>(nullable: false),
            //        BMCMembership = table.Column<string>(maxLength: 128, nullable: true),
            //        BMCMembershipExpiresOn = table.Column<DateTime>(nullable: true),
            //        BMCMembershipIsValid = table.Column<bool>(nullable: true),
            //        BMCMembershipValidatedOn = table.Column<DateTime>(nullable: true),
            //        Organisation = table.Column<string>(maxLength: 128, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Members", x => x.Id);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "SageTransactions",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        VendorTxCode = table.Column<string>(maxLength: 128, nullable: false),
            //        SecurityKey = table.Column<string>(maxLength: 16, nullable: true),
            //        VpsTxId = table.Column<string>(maxLength: 64, nullable: true),
            //        RedirectUrl = table.Column<string>(maxLength: 255, nullable: true),
            //        Timestamp = table.Column<DateTime>(nullable: false),
            //        LongUserKey = table.Column<long>(nullable: false),
            //        GuidUserKey = table.Column<string>(maxLength: 128, nullable: true),
            //        UserString = table.Column<string>(maxLength: 255, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_SageTransactions", x => x.VendorTxCode);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "SiteSettings",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        SiteSettingId = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        Name = table.Column<string>(nullable: true),
            //        Value = table.Column<string>(nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_SiteSettings", x => x.SiteSettingId);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "UploadFiles",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        UploadFileId = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        Name = table.Column<string>(nullable: true),
            //        MimeType = table.Column<string>(nullable: true),
            //        DirectoryId = table.Column<long>(nullable: false),
            //        Guid = table.Column<string>(nullable: true),
            //        TotalChunks = table.Column<long>(nullable: false),
            //        BinaryLength = table.Column<long>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_UploadFiles", x => x.UploadFileId);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Webtasks",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        Id = table.Column<string>(maxLength: 128, nullable: false),
            //        Status = table.Column<int>(nullable: false),
            //        StartedAt = table.Column<DateTime>(nullable: false),
            //        FinishedAt = table.Column<DateTime>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Webtasks", x => x.Id);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Documents",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        DocumentId = table.Column<long>(nullable: false),
            //        DirectoryId = table.Column<long>(nullable: false),
            //        Name = table.Column<string>(nullable: true),
            //        Extension = table.Column<string>(nullable: true),
            //        Length = table.Column<long>(nullable: false),
            //        CreatedOn = table.Column<DateTimeOffset>(nullable: false),
            //        CreatedBy = table.Column<string>(nullable: true),
            //        Visible = table.Column<bool>(nullable: false),
            //        Deleted = table.Column<bool>(nullable: false),
            //        Data = table.Column<byte[]>(nullable: true),
            //        MimeType = table.Column<string>(nullable: true),
            //        TimeStamp = table.Column<byte[]>(rowVersion: true, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Documents", x => x.DocumentId);
            //        table.ForeignKey(
            //            name: "FK_Documents_Directories_DirectoryId",
            //            column: x => x.DirectoryId,
            //            principalSchema: "std",
            //            principalTable: "Directories",
            //            principalColumn: "DirectoryId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Images",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        ImageId = table.Column<long>(nullable: false),
            //        Name = table.Column<string>(nullable: true),
            //        Data = table.Column<byte[]>(nullable: true),
            //        CreatedOn = table.Column<DateTimeOffset>(nullable: false),
            //        CreatedBy = table.Column<string>(nullable: true),
            //        ImageType = table.Column<int>(nullable: false),
            //        Height = table.Column<int>(nullable: false),
            //        Width = table.Column<int>(nullable: false),
            //        TimeStamp = table.Column<byte[]>(rowVersion: true, nullable: true),
            //        Directory_DirectoryId = table.Column<long>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Images", x => x.ImageId);
            //        table.ForeignKey(
            //            name: "FK_Images_Directories_Directory_DirectoryId",
            //            column: x => x.Directory_DirectoryId,
            //            principalSchema: "std",
            //            principalTable: "Directories",
            //            principalColumn: "DirectoryId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Pages",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        PageId = table.Column<long>(nullable: false),
            //        Name = table.Column<string>(nullable: true),
            //        MarkupType = table.Column<int>(nullable: false),
            //        Type = table.Column<int>(nullable: false),
            //        DirectoryId = table.Column<long>(nullable: false),
            //        IsLandingPage = table.Column<bool>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Pages", x => x.PageId);
            //        table.ForeignKey(
            //            name: "FK_Pages_Directories_DirectoryId",
            //            column: x => x.DirectoryId,
            //            principalSchema: "std",
            //            principalTable: "Directories",
            //            principalColumn: "DirectoryId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "DirectoryGroups",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        DirectoryId = table.Column<long>(nullable: false),
            //        GroupId = table.Column<long>(nullable: false),
            //        Permission = table.Column<int>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_DirectoryGroups", x => new { x.DirectoryId, x.GroupId });
            //        table.ForeignKey(
            //            name: "FK_DirectoryGroups_Directories_DirectoryId",
            //            column: x => x.DirectoryId,
            //            principalSchema: "std",
            //            principalTable: "Directories",
            //            principalColumn: "DirectoryId",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_DirectoryGroups_Groups_GroupId",
            //            column: x => x.GroupId,
            //            principalSchema: "std",
            //            principalTable: "Groups",
            //            principalColumn: "GroupId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "GroupMember",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        GroupId = table.Column<long>(nullable: false),
            //        MemberId = table.Column<string>(maxLength: 128, nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_GroupMember", x => new { x.GroupId, x.MemberId });
            //        table.ForeignKey(
            //            name: "FK_GroupMember_Groups_GroupId",
            //            column: x => x.GroupId,
            //            principalSchema: "std",
            //            principalTable: "Groups",
            //            principalColumn: "GroupId",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_GroupMember_Members_MemberId",
            //            column: x => x.MemberId,
            //            principalSchema: "std",
            //            principalTable: "Members",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "FileChunks",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        FileChunkId = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        UploadFileId = table.Column<long>(nullable: false),
            //        ChunkNumber = table.Column<int>(nullable: false),
            //        Base64String = table.Column<string>(nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_FileChunks", x => x.FileChunkId);
            //        table.ForeignKey(
            //            name: "FK_FileChunks_UploadFiles_UploadFileId",
            //            column: x => x.UploadFileId,
            //            principalSchema: "std",
            //            principalTable: "UploadFiles",
            //            principalColumn: "UploadFileId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Menus",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        Id = table.Column<long>(nullable: false)
            //            .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
            //        Index = table.Column<int>(nullable: false),
            //        Text = table.Column<string>(nullable: true),
            //        Url = table.Column<string>(nullable: true),
            //        Page_PageId = table.Column<long>(nullable: true),
            //        ParentMenu_Id = table.Column<long>(nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Menus", x => x.Id);
            //        table.ForeignKey(
            //            name: "FK_Menus_Pages_Page_PageId",
            //            column: x => x.Page_PageId,
            //            principalSchema: "std",
            //            principalTable: "Pages",
            //            principalColumn: "PageId",
            //            onDelete: ReferentialAction.Restrict);
            //        table.ForeignKey(
            //            name: "FK_Menus_Menus_ParentMenu_Id",
            //            column: x => x.ParentMenu_Id,
            //            principalSchema: "std",
            //            principalTable: "Menus",
            //            principalColumn: "Id",
            //            onDelete: ReferentialAction.Restrict);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "PageDocuments",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        PageId = table.Column<long>(nullable: false),
            //        DocumentId = table.Column<long>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_PageDocuments", x => new { x.PageId, x.DocumentId });
            //        table.ForeignKey(
            //            name: "FK_PageDocuments_Documents_DocumentId",
            //            column: x => x.DocumentId,
            //            principalSchema: "std",
            //            principalTable: "Documents",
            //            principalColumn: "DocumentId",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_PageDocuments_Pages_PageId",
            //            column: x => x.PageId,
            //            principalSchema: "std",
            //            principalTable: "Pages",
            //            principalColumn: "PageId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "PageMarkups",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        PageId = table.Column<long>(nullable: false),
            //        CreatedOn = table.Column<DateTimeOffset>(nullable: false),
            //        CreatedBy = table.Column<string>(nullable: true),
            //        ModifiedOn = table.Column<DateTimeOffset>(nullable: true),
            //        ModifiedBy = table.Column<string>(nullable: true),
            //        Data = table.Column<byte[]>(nullable: true),
            //        MarkupLength = table.Column<long>(nullable: false),
            //        HtmlText = table.Column<string>(nullable: true),
            //        HtmlTextLength = table.Column<long>(nullable: false),
            //        HtmlStyles = table.Column<string>(nullable: true),
            //        HtmlScripts = table.Column<string>(nullable: true),
            //        ThumbNail = table.Column<byte[]>(nullable: true),
            //        SmallThumbNail = table.Column<byte[]>(nullable: true),
            //        MiddleThumbNail = table.Column<byte[]>(nullable: true),
            //        TimeStamp = table.Column<byte[]>(rowVersion: true, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_PageMarkups", x => x.PageId);
            //        table.ForeignKey(
            //            name: "FK_PageMarkups_Pages_PageId",
            //            column: x => x.PageId,
            //            principalSchema: "std",
            //            principalTable: "Pages",
            //            principalColumn: "PageId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "PagePages",
            //    schema: "std",
            //    columns: table => new
            //    {
            //        FromPageId = table.Column<long>(nullable: false),
            //        ToPageId = table.Column<long>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_PagePages", x => new { x.FromPageId, x.ToPageId });
            //        table.ForeignKey(
            //            name: "FK_PagePages_Pages_FromPageId",
            //            column: x => x.FromPageId,
            //            principalSchema: "std",
            //            principalTable: "Pages",
            //            principalColumn: "PageId",
            //            onDelete: ReferentialAction.Cascade);
            //        table.ForeignKey(
            //            name: "FK_PagePages_Pages_ToPageId",
            //            column: x => x.ToPageId,
            //            principalSchema: "std",
            //            principalTable: "Pages",
            //            principalColumn: "PageId",
            //            onDelete: ReferentialAction.Cascade);
            //    });

            //migrationBuilder.CreateIndex(
            //    name: "IX_Directories_ParentDirectoryId",
            //    schema: "std",
            //    table: "Directories",
            //    column: "ParentDirectoryId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_DirectoryGroups_GroupId",
            //    schema: "std",
            //    table: "DirectoryGroups",
            //    column: "GroupId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Documents_DirectoryId",
            //    schema: "std",
            //    table: "Documents",
            //    column: "DirectoryId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_FileChunks_UploadFileId",
            //    schema: "std",
            //    table: "FileChunks",
            //    column: "UploadFileId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_GroupMember_MemberId",
            //    schema: "std",
            //    table: "GroupMember",
            //    column: "MemberId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Groups_ParentGroupId",
            //    schema: "std",
            //    table: "Groups",
            //    column: "ParentGroupId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Images_Directory_DirectoryId",
            //    schema: "std",
            //    table: "Images",
            //    column: "Directory_DirectoryId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Menus_Page_PageId",
            //    schema: "std",
            //    table: "Menus",
            //    column: "Page_PageId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Menus_ParentMenu_Id",
            //    schema: "std",
            //    table: "Menus",
            //    column: "ParentMenu_Id");

            //migrationBuilder.CreateIndex(
            //    name: "IX_PageDocuments_DocumentId",
            //    schema: "std",
            //    table: "PageDocuments",
            //    column: "DocumentId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_PagePages_ToPageId",
            //    schema: "std",
            //    table: "PagePages",
            //    column: "ToPageId");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Pages_DirectoryId",
            //    schema: "std",
            //    table: "Pages",
            //    column: "DirectoryId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

            // COMMENTED OUT AS I ALREADY HAVE A DATBASE WITH THIS STUFF

            //migrationBuilder.DropTable(
            //    name: "Actions",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "DirectoryGroups",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "FileChunks",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "GroupMember",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Images",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Menus",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "PageDocuments",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "PageMarkups",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "PagePages",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "SageTransactions",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "SiteSettings",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Webtasks",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "UploadFiles",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Groups",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Members",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Documents",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Pages",
            //    schema: "std");

            //migrationBuilder.DropTable(
            //    name: "Directories",
            //    schema: "std");
        }
    }
}

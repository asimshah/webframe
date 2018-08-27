using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.CoreData2
{
    public enum LoadMethods
    {
        UseLoad,
        UseList
    }
    public static partial class Extensions
    {
        public static async Task<IEnumerable<Group>> GetGroupsForMember(this CoreDataContext ctx, Member m)
        {
            List<Group> groups = new List<Group>();
            Action<IEnumerable<Group>> addGroup = (list) =>
            {
                foreach (Group g in list)
                {
                    if (!groups.Contains(g))
                    {
                        groups.Add(g);
                    }
                }
            };
            Action<IEnumerable<Group>> processGroups = null;
            processGroups = (list) =>
            {
                addGroup(list);
                list = list.Where(pg => pg.ParentGroup != null).Select(l => l.ParentGroup);
                if (list.Count() > 0)
                {
                    processGroups(list);
                }
            };
            if (m != null)
            {
                await ctx.Entry(m).Collection(x => x.GroupMembers).LoadAsync();
                foreach (var item in m.GroupMembers)
                {
                    await ctx.Entry(item).Reference(x => x.Group).LoadAsync();
                }
                processGroups(m.GroupMembers.Select(x => x.Group));
            }
            else
            {
                groups.Add(ctx.GetSystemGroup(SystemGroups.Anonymous));
                groups.Add(ctx.GetSystemGroup(SystemGroups.Everyone));
            }
            return groups;
        }
        public static Member GetAnonymousMember(this CoreDataContext coreDataContext)
        {
            return coreDataContext.Members.OfType<Member>().Single(x => x.IsAnonymous);
        }
        public static Group GetSystemGroup(this CoreDataContext coreDataContext, SystemGroups sg)
        {
            return coreDataContext.Groups
                .Include(x => x.GroupMembers).ThenInclude(y => y.Member)
                .ToArray().Single(x => x.Name == sg.ToString() && x.Type.HasFlag(GroupTypes.System));
        }
        public static Group GetGroup(this CoreDataContext coreDataContext, string name)
        {
            return coreDataContext.Groups
                .Include(x => x.GroupMembers).ThenInclude(y => y.Member)
                .ToArray().Single(x => x.Name == name && x.Type.HasFlag(GroupTypes.User));
        }
        public static async Task LoadParentsAsync(this CoreDataContext coreDataContext, Directory dir)
        {
            if (dir.ParentDirectoryId > 0)
            {
                await coreDataContext.Entry(dir).Reference(r => r.ParentDirectory).LoadAsync();
                await coreDataContext.LoadParentsAsync(dir.ParentDirectory);
            }

        }
        public static async Task LoadGroups(this CoreDataContext coreDataContext, Directory dir, LoadMethods loadMethod = LoadMethods.UseLoad)
        {
            if (!dir.AreGroupsPresent())
            {
                switch (loadMethod)
                {
                    case LoadMethods.UseLoad:
                        await coreDataContext.Entry(dir).Collection(x => x.DirectoryGroups).LoadAsync();
                        break;
                    case LoadMethods.UseList:
                        throw new NotImplementedException();
                        //break;
                }
                foreach (var dg in dir.DirectoryGroups)
                {
                    await coreDataContext.Entry(dg).Reference(r => r.Group).LoadAsync();
                }
            }
        }
        public static async Task LoadGroupChildren(this CoreDataContext coreDataContext, Group group, LoadMethods loadMethod = LoadMethods.UseLoad)
        {
            if (!group.AreChildrenPresent())
            {
                switch (loadMethod)
                {
                    case LoadMethods.UseLoad:
                        await coreDataContext.Entry(group).Collection(x => x.Children).LoadAsync();
                        break;
                    case LoadMethods.UseList:
                        coreDataContext.Groups.Where(x => x.ParentGroupId == group.GroupId).ToList();
                        break;
                }
                foreach (var child in group.Children)
                {
                    await coreDataContext.LoadGroupChildren(child, loadMethod);
                }
            }
        }
        public static async Task LoadGroupMembersAsync(this CoreDataContext coreDataContext, Group group)
        {
            if (!group.AreMembersPresent())
            {
                await coreDataContext.LoadGroupChildren(group);
                foreach (var g in group.SelfAndDescendants)
                {
                    await coreDataContext.Entry(g).Collection(x => x.GroupMembers).LoadAsync();
                    foreach (var gm in g.GroupMembers)
                    {
                        await coreDataContext.Entry(gm).Reference(r => r.Member).LoadAsync();
                    }
                }
            }
        }
        public static Document CreateNewDocument(this CoreDataContext coreDataContext)
        {
            long largest = 0;
            if ((coreDataContext.Documents.Count() + coreDataContext.Documents.Local.Count()) > 0)
            {
                largest = coreDataContext.Documents.Select(x => x.DocumentId).Union(coreDataContext.Documents.Local.Select(x => x.DocumentId)).Max(x => x);
            }

            return new Document { DocumentId = largest + 1 };
        }
        public static Image CreateNewImage(this CoreDataContext coreDataContext)
        {
            long largest = 0;
            if ((coreDataContext.Images.Count() + coreDataContext.Images.Local.Count()) > 0)
            {
                largest = coreDataContext.Images.Select(x => x.ImageId).Union(coreDataContext.Images.Local.Select(x => x.ImageId)).Max(x => x);
            }
            //long? largest = this.Images.Select(x => x.ImageId).Union(this.Images.Local.Select(x => x.ImageId)).Max(x => x);
            return new Image { ImageId = largest + 1 };
        }
        public static Page CreateNewPage(this CoreDataContext coreDataContext)
        {
            long largest = 0;
            if ((coreDataContext.Pages.Count() + coreDataContext.Pages.Local.Count()) > 0)
            {
                largest = coreDataContext.Pages.Select(x => x.PageId).Union(coreDataContext.Pages.Local.Select(x => x.PageId)).Max(x => x);
            }
            //Debug.Print("Page: largest pk = {0}", largest);
            Page p = new Page { PageId = largest + 1 };
            p.PageMarkup = new PageMarkup();

            coreDataContext.Pages.Add(p);
            return p;
        }
        public static void RecordChanges(this CoreDataContext DataContext, DirectoryGroup dg, string actionBy, RestrictionAction.EditingActionTypes actionType)
        {
            //Func<RestrictionAction> getNewAction = () =>
            //{
            //    RestrictionAction ra = new RestrictionAction
            //    {
            //        Action = actionType,
            //        ActionBy = actionBy,
            //        Folder = dg.Directory.DisplayName,
            //        GroupName = dg.Group.Fullpath,
            //        View = dg.ViewAllowed,
            //        Edit = dg.EditAllowed
            //    };
            //    return ra;
            //};
            ////CoreDataContext DataContext = Core.GetDataContext();
            //switch (actionType)
            //{
            //    default:
            //        break;
            //    case RestrictionAction.EditingActionTypes.RestrictionAdded:
            //    case RestrictionAction.EditingActionTypes.RestrictionRemoved:
            //        DataContext.Actions.Add(getNewAction());
            //        break;
            //    case RestrictionAction.EditingActionTypes.RestrictionModified:
            //        PageAction.AddPropertyModificationActions(DataContext.Entry(this), getNewAction, (ra) =>
            //        {
            //            DataContext.Actions.Add(ra);
            //        });

            //        break;
            //}
        }
        public static async Task RecordChanges(this CoreDataContext ctx, string fromAddress, string toAddress, string subject, string body,
            bool redirected, string redirectedTo, string templateName, string remark, bool mailDisabled, string failure = null)
        {
            var ma = new MailAction
            {
                Subject = subject,
                To = toAddress,
                From = fromAddress,
                MailBody = body,
                Redirected = redirected,
                RedirectedTo = redirectedTo,
                MailTemplate = templateName,
                MailDisabled = mailDisabled,
                Remark = remark,
                Failure = failure
            };
            await ctx.Actions.AddAsync(ma);
        }
        public static async Task RecordChanges(this CoreDataContext ctx, Group group, string actionBy, GroupAction.GroupActionTypes actionType, Member m = null)
        {
            GroupAction ga = null;
            switch (actionType)
            {
                case GroupAction.GroupActionTypes.Deletion:
                case GroupAction.GroupActionTypes.New:
                    ga = new GroupAction
                    {
                        Action = actionType,
                        ActionBy = actionBy,
                        FullName = group.Shortenedpath,
                        GroupId = group.GroupId.ToString()
                    };
                    await ctx.Actions.AddAsync(ga);
                    break;
                case GroupAction.GroupActionTypes.Modification:
                    var changes = GetChanges(ctx.Entry(group));
                    foreach (var (property, oldValue, newValue) in changes)
                    {
                        ga = new GroupAction
                        {
                            Action = actionType,
                            ActionBy = actionBy,
                            FullName = group.Shortenedpath,
                            GroupId = group.GroupId.ToString(),
                            PropertyChanged = property,
                            OldValue = oldValue,
                            NewValue = newValue
                        };
                        await ctx.Actions.AddAsync(ga);
                    }
                    break;
                case GroupAction.GroupActionTypes.MemberAddition:
                case GroupAction.GroupActionTypes.MemberRemoval:
                    if (m != null)
                    {
                        ga = new GroupAction
                        {
                            Action = actionType,
                            ActionBy = actionBy,
                            FullName = group.Shortenedpath,
                            GroupId = group.GroupId.ToString(),
                            MemberEmailAddress = m.EmailAddress
                        };
                        await ctx.Actions.AddAsync(ga);
                    }
                    else
                    {
                        throw new Exception($"Group Actions of type {actionType.ToString()} need a Member instance");
                    }
                    break;
            }

        }
        public static async Task RecordChanges(this CoreDataContext ctx, Member m, string actionBy = null, MemberAction.MemberActionTypes actionType = MemberAction.MemberActionTypes.Modification)
        {
            switch (actionType)
            {
                default:
                case MemberAction.MemberActionTypes.New:
                case MemberAction.MemberActionTypes.Activation:
                case MemberAction.MemberActionTypes.PasswordResetRequest:
                case MemberAction.MemberActionTypes.PasswordReset:
                case MemberAction.MemberActionTypes.Deactivation:
                case MemberAction.MemberActionTypes.Deletion:
                    MemberAction ma = new MemberAction
                    {
                        MemberId = m.Id,
                        EmailAddress = m.EmailAddress,
                        FullName = m.Fullname,
                        ActionBy = actionBy ?? m.Fullname,
                        Action = actionType,
                    };
                    await ctx.Actions.AddAsync(ma);
                    return;
                case MemberAction.MemberActionTypes.Modification:
                    break;
            }
            var changes = GetChanges(ctx.Entry(m));
            foreach (var (property, oldValue, newValue) in changes)
            {
                switch (property)
                {
                    case "EmailAddressConfirmed":
                    case "ActivationCode":
                    case "ActivationEmailSentDate":
                    case "PasswordResetCode":
                    case "PasswordResetEmailSentDate":
                    case "PlainPassword":
                        break;
                    default:
                        MemberAction ma = new MemberAction
                        {
                            MemberId = m.Id,
                            EmailAddress = m.EmailAddress,
                            FullName = m.Fullname,
                            ActionBy = actionBy ?? m.Fullname,
                            Action = actionType,// MembershipAction.MembershipActionTypes.Modification,
                            PropertyChanged = property,
                            OldValue = oldValue,
                            NewValue = newValue
                        };
                        await ctx.Actions.AddAsync(ma);
                        break;
                }
            }
        }
        public static async Task RecordChanges(this CoreDataContext ctx, Directory dir, string actionBy, FolderAction.EditingActionTypes actionType)
        {
            switch (actionType)
            {
                case EditingAction.EditingActionTypes.NewFolder:
                case EditingAction.EditingActionTypes.FolderDeleted:
                    var fa1 = new FolderAction
                    {
                        Action = actionType,
                        ActionBy = actionBy,
                        Name = dir.DisplayName
                    };
                    await ctx.Actions.AddAsync(fa1);
                    break;
                case EditingAction.EditingActionTypes.FolderModified:
                    var changes = GetChanges(ctx.Entry(dir));
                    foreach (var (property, oldValue, newValue) in changes)
                    {
                        switch(property)
                        {
                            default:
                                FolderAction fa2 = new FolderAction
                                {
                                    ActionBy = actionBy,
                                    Action = actionType,
                                    PropertyChanged = property,
                                    OldValue = oldValue,
                                    NewValue = newValue
                                };
                                await ctx.Actions.AddAsync(fa2);
                                break;
                        }
                    }
                    break;
            }
            //await ctx.SaveChangesAsync();
        }
        public static async Task RecordChanges(this CoreDataContext ctx, Image image, string actionBy, FolderAction.EditingActionTypes actionType, Directory container)
        {
            switch(actionType)
            {
                case EditingAction.EditingActionTypes.NewImage:
                case EditingAction.EditingActionTypes.ImageDeleted:
                case EditingAction.EditingActionTypes.ImageReplaced:
                    var fa = new FolderAction
                    {
                        Action = actionType,
                        ActionBy = actionBy,
                        Name = $"{container.FullName}\\{image.Name}"
                    };
                    await ctx.Actions.AddAsync(fa);
                    break;
            }
            //await ctx.SaveChangesAsync();
        }
        public static async Task RecordChanges(this CoreDataContext ctx, Document doc, string actionBy, FolderAction.EditingActionTypes actionType, Directory container)
        {
            switch (actionType)
            {
                case EditingAction.EditingActionTypes.NewDocument:
                case EditingAction.EditingActionTypes.DocumentReplaced:
                case EditingAction.EditingActionTypes.DocumentDeleted:
                    var fa = new FolderAction
                    {
                        Action = actionType,
                        ActionBy = actionBy,
                        Name = $"{container.FullName}\\{doc.Name}"
                    };
                    await ctx.Actions.AddAsync(fa);
                    break;
            }
            //await ctx.SaveChangesAsync();
        }
        public static async Task RecordChanges(this CoreDataContext ctx, Page page, string actionBy, FolderAction.EditingActionTypes actionType, Directory container)
        {
            switch (actionType)
            {
                case EditingAction.EditingActionTypes.NewPage:
                case EditingAction.EditingActionTypes.PageDeleted:
                case EditingAction.EditingActionTypes.PageContentModified:
                    var fa = new FolderAction
                    {
                        Action = actionType,
                        ActionBy = actionBy,
                        Name = $"{container.FullName}\\{page.Url}"
                    };
                    await ctx.Actions.AddAsync(fa);
                    break;
                case EditingAction.EditingActionTypes.PageModified:
                    var changes = GetChanges(ctx.Entry(page));
                    foreach (var (property, oldValue, newValue) in changes)
                    {
                        switch (property)
                        {
                            default:
                                FolderAction fa2 = new FolderAction
                                {
                                    ActionBy = actionBy,
                                    Action = actionType,
                                    PropertyChanged = property,
                                    OldValue = oldValue,
                                    NewValue = newValue
                                };
                                await ctx.Actions.AddAsync(fa2);
                                break;
                        }
                    }
                    break;
            }
            //await ctx.SaveChangesAsync();
        }
        private static bool AreGroupsPresent(this Directory dir)
        {
            bool r = dir.DirectoryGroups == null || dir.DirectoryGroups.Any(dg => dg.Group == null);
            return !r;
        }
        private static bool AreChildrenPresent(this Group group)
        {
            if (group.Children == null)
            {
                return false;
            }
            foreach (var child in group.Children)
            {
                var r = child.AreChildrenPresent();
                if (!r)
                {
                    return r;
                }
            }
            return true;
        }
        private static bool AreMembersPresent(this Group group)
        {
            bool r = true;
            if (group.AreChildrenPresent())
            {
                foreach (var g in group.SelfAndDescendants)
                {
                    if (group.GroupMembers == null || group.GroupMembers.Any(x => x.Member == null))
                    {
                        r = false;
                        break;
                    }
                }

            }
            else
            {
                r = false;
            }
            return r;
        }
        private static IEnumerable<(string property, string oldValue, string newValue)> GetChanges(EntityEntry entry)
        {
            var list = new List<(string property, string oldValue, string newValue)>();
            foreach (var p in entry.CurrentValues.Properties)
            {
                if (entry.Property(p.Name).IsModified)
                {
                    object ov = entry.Property(p.Name).OriginalValue;
                    object cv = entry.Property(p.Name).CurrentValue;
                    list.Add((p.Name, ov == null ? "<null>" : ov.ToString(), cv == null ? "<null>" : cv.ToString()));
                }
            }
            return list;
        }
    }
}

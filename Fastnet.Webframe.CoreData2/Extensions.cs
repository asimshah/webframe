using Microsoft.EntityFrameworkCore;
using System;
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
        public static Member GetAnonymousMember(this CoreDataContext coreDataContext)
        {
            return coreDataContext.Members.OfType<Member>().Single(x => x.IsAnonymous);
        }
        public static Group GetSystemGroup(this CoreDataContext coreDataContext, SystemGroups sg)
        {
            return coreDataContext.Groups.ToArray().Single(x => x.Name == sg.ToString() && x.Type.HasFlag(GroupTypes.System));
        }
        public static Group GetGroup(this CoreDataContext coreDataContext, string name)
        {
            return coreDataContext.Groups.ToArray().Single(x => x.Name == name && x.Type.HasFlag(GroupTypes.User));
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
            if(!group.AreMembersPresent()) {
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
                foreach(var g in group.SelfAndDescendants)
                {
                    if(group.GroupMembers == null || group.GroupMembers.Any(x => x.Member == null))
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
    }
}

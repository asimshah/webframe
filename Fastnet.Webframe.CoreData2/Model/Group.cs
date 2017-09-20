using Fastnet.Webframe.Common2;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Fastnet.Webframe.CoreData2
{
    [Table("GroupMember")]
    public class GroupMember
    {
        public long GroupId { get; set; }
        [MaxLength(128)]
        public string MemberId { get; set; }
        public Group Group { get; set; }
        public Member Member { get; set; }
    }
    public partial class Group : Hierarchy<Group>
    {
        public long GroupId { get; set; }
        public long? ParentGroupId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Weight { get; set; }
        [Column("TypeCode")]
        public GroupTypes Type { get; set; }
        [Timestamp]
        public byte[] TimeStamp { get; set; }
        [ForeignKey("ParentGroupId")]
        public Group ParentGroup { get; set; }
        [InverseProperty("ParentGroup")]
        public ICollection<Group> Children { get; set; }
        public ICollection<DirectoryGroup> DirectoryGroups { get; set; }
        public ICollection<GroupMember> GroupMembers { get; set; }
        public override Group GetParent()
        {
            return this.ParentGroup;
        }
        public override IEnumerable<Group> GetChildren()
        {
            return Children;
        }
        [NotMapped]
        public string Fullpath
        {
            get { return getPath(); }
        }
        [NotMapped]
        public string Shortenedpath
        {
            get { return getPath(true); }
        }
        //public static Group Everyone
        //{
        //    get { return GetSystemGroup(SystemGroups.Everyone); }
        //}
        //public static Group AllMembers
        //{
        //    get { return GetSystemGroup(SystemGroups.AllMembers); }
        //}
        //public static Group Anonymous
        //{
        //    get { return GetSystemGroup(SystemGroups.Anonymous); }
        //}
        //public static Group Administrators
        //{
        //    get { return GetSystemGroup(SystemGroups.Administrators); }
        //}
        //public static Group Designers
        //{
        //    get { return GetSystemGroup(SystemGroups.Designers); }
        //}
        //public static Group Editors
        //{
        //    get { return GetSystemGroup(SystemGroups.Editors); }
        //}
        public static int GetWeightIncrement()
        {
            return 1000;// ApplicationSettings.Key("GroupWeightDefaultIncrement", 1000);
        }
        public bool IsChildOf(Group ultimateParent)
        {
            Group g = this.ParentGroup;
            while (g != null)
            {
                if (g == ultimateParent)
                {
                    return true;
                }
                g = g.ParentGroup;
            }
            return false;
        }
        public bool IsParentOf(Group ultimateChild)
        {
            return ultimateChild.IsChildOf(this);
        }
        public dynamic GetClientSideGroupDetails()
        {
            return new
            {
                Id = this.GroupId,
                Name = this.Name,
                FullName = this.Fullpath,
                Weight = this.Weight,
                ParentWeight = this.ParentGroup != null ? this.ParentGroup.Weight : 0,
                Description = this.Description,
                IsSystem = this.Type.HasFlag(GroupTypes.System),
                HasSystemDefinedMembers = this.Type.HasFlag(GroupTypes.SystemDefinedMembers),
                SubgroupTotal = this.Children.Count()
            };
        }
        public void RecordChanges(string actionBy, GroupAction.GroupActionTypes actionType = GroupAction.GroupActionTypes.Modification, string emailAddress = null)
        {
            //CoreDataContext DataContext = Core.GetDataContext();
            //switch (actionType)
            //{
            //    default:
            //    case GroupAction.GroupActionTypes.New:
            //    case GroupAction.GroupActionTypes.Deletion:
            //        GroupAction ga1 = new GroupAction
            //        {
            //            GroupId = this.GroupId.ToString(),
            //            FullName = this.Shortenedpath,// this.Fullpath,
            //            ActionBy = actionBy,
            //            Action = actionType,
            //        };
            //        DataContext.Actions.Add(ga1);
            //        return;
            //    case GroupAction.GroupActionTypes.MemberAddition:
            //    case GroupAction.GroupActionTypes.MemberRemoval:
            //        GroupAction ga2 = new GroupAction
            //        {
            //            GroupId = this.GroupId.ToString(),
            //            FullName = this.Shortenedpath,// this.Fullpath,
            //            ActionBy = actionBy,
            //            Action = actionType,
            //            MemberEmailAddress = emailAddress
            //        };
            //        DataContext.Actions.Add(ga2);
            //        return;
            //    case GroupAction.GroupActionTypes.Modification:
            //        break;
            //}
            //var entry = DataContext.Entry(this);
            //foreach (var p in entry.CurrentValues.PropertyNames)
            //{
            //    switch (p)
            //    {
            //        default:
            //            try
            //            {
            //                if (entry.Property(p).IsModified)
            //                {
            //                    object ov = entry.Property(p).OriginalValue;
            //                    object cv = entry.Property(p).CurrentValue;
            //                    GroupAction ga = new GroupAction
            //                    {
            //                        GroupId = this.GroupId.ToString(),
            //                        FullName = this.Shortenedpath,// this.Fullpath,
            //                        ActionBy = actionBy,
            //                        Action = actionType,
            //                        PropertyChanged = p,
            //                        OldValue = ov == null ? "<null>" : ov.ToString(),
            //                        NewValue = cv == null ? "<null>" : cv.ToString()
            //                    };
            //                    DataContext.Actions.Add(ga);
            //                }

            //            }
            //            catch (Exception xe)
            //            {
            //                Log.Write(xe);
            //                throw;
            //            }
            //            break;
            //    }
            //}
        }
        private string getPath(bool shortened = false)
        {
            Action<List<string>, Group> addParentName = null;
            addParentName = (l, d) =>
            {
                if (d != null && (shortened == false || !d.Type.HasFlag(GroupTypes.SystemDefinedMembers)))
                {
                    l.Add(d.Name);
                    addParentName(l, d.ParentGroup);
                }
            };
            List<string> fragments = new List<string>();
            addParentName(fragments, this);
            return string.Join("/", fragments.ToArray().Reverse());
        }
        //public static Group GetSystemGroup(SystemGroups sg, CoreDataContext ctx = null)
        //{
        //    if (ctx == null)
        //    {
        //        ctx = Core.GetDataContext();
        //    }
        //    return ctx.Groups.ToArray().Single(x => x.Name == sg.ToString() && x.Type.HasFlag(GroupTypes.System));
        //}
        //public static Group GetGroup(string name, CoreDataContext ctx = null)
        //{
        //    if (ctx == null)
        //    {
        //        ctx = Core.GetDataContext();
        //    }
        //    return ctx.Groups.ToArray().Single(x => x.Name == name && x.Type.HasFlag(GroupTypes.User));
        //}
    }
}

using System;
using System.Linq;

namespace Fastnet.Webframe.CoreData2
{
    public static partial class Extensions
    {
        public static MemberBase GetAnonymousMember(this CoreDataContext coreDataContext)
        {
            return coreDataContext.Members.OfType<MemberBase>().Single(x => x.IsAnonymous);
        }
        public static Group GetSystemGroup(this CoreDataContext coreDataContext, SystemGroups sg)
        {
            return coreDataContext.Groups.ToArray().Single(x => x.Name == sg.ToString() && x.Type.HasFlag(GroupTypes.System));
        }
        public static Group GetGroup(this CoreDataContext coreDataContext, string name)
        {
            return coreDataContext.Groups.ToArray().Single(x => x.Name == name && x.Type.HasFlag(GroupTypes.User));
        }
    }
}

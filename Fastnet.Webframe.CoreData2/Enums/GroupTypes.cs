using System;

namespace Fastnet.Webframe.CoreData2
{
    [Flags]
    public enum GroupTypes
    {
        None = 0,
        User = 1,
        System = 2,
        SystemDefinedMembers = 4
    }
}

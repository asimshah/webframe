using System;
using System.ComponentModel;

namespace Fastnet.Webframe.CoreData2
{
    [Flags]
    public enum Permission
    {
        [Description("View Pages")]
        ViewPages = 1,
        [Description("Edit Pages")]
        EditPages = 2
    }
}

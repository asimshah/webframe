using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.Webframe.CoreData2
{
    public partial class DirectoryGroup
    {
        //[Key, Column(Order = 0)]
        public long DirectoryId { get; set; }
        //[Key, Column(Order = 1)]
        public long GroupId { get; set; }        
        public Directory Directory { get; set; }
        public Group Group { get; set; }
        //[Mapped]
        public Permission Permission { get; set; }
        [NotMapped]
        public bool ViewAllowed { get { return Permission.HasFlag(Permission.ViewPages) || Permission.HasFlag(Permission.EditPages); } }
        [NotMapped]
        public bool EditAllowed { get { return Permission.HasFlag(Permission.EditPages); } }
        public string GetAccessDescription()
        {
            if (EditAllowed)
            {
                return "view+edit";
            }
            else
            {
                return "view only";
            }
        }
        public void SetView(bool tf)
        {
            if (tf)
            {
                Permission |= Permission.ViewPages;
                //Permission = Permission.Set(Permission.ViewPages);
            }
            else
            {
                Permission |= Permission.EditPages;
                //Permission = Permission.Set(Permission.EditPages);
            }
        }
        public void SetEdit(bool tf)
        {
            if (tf)
            {
                Permission |= Permission.EditPages;
                Permission |= Permission.ViewPages;
                //Permission = Permission.Set(Permission.EditPages);
                //Permission = Permission.Set(Permission.ViewPages);
            }
            else
            {
                Permission &= ~Permission.EditPages;
                //Permission = Permission.Unset(Permission.EditPages);
            }
        }

    }
}

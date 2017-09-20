using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.Webframe.CoreData2
{
    public static partial class Extensions
    {
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
    }
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

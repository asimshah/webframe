using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.Webframe.CoreData2
{
    // this entity was required in an earlier version of webframe which allowed
    // menus to be created in specific panels
    // for V5 (onwards?) I have parked this feature (and not implemented the code) as it has never been used
    // so menus are only put in the menu panel
    // I might remove this table in time ...
    public partial class MenuMaster
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public bool IsDisabled { get; set; }
        public string ClassName { get; set; }
        public PanelNames PanelName { get; set; }
        public long Page_PageId { get; set; }
        [ForeignKey("Page_PageId")]
        public Page Page { get; set; }
        public ICollection<Menu> Menus { get; set; }
        public string GetDescriptor()
        {
            if (PanelName == PanelNames.MenuPanel)
            {
                return "(for Menu Panel)";
            }
            else
            {
                if (Page != null)
                {
                    return string.Format("(for {1}: {0})", Page.Type.ToString(), Page.Url);
                }
                else
                {
                    return "(undefined)";
                }
            }
        }
    }
}

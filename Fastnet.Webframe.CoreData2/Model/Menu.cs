using Fastnet.Webframe.Common2;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.Webframe.CoreData2
{
    public partial class Menu : Hierarchy<Menu>
    {
        public long Id { get; set; }
        public int Index { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }

        public long? Page_PageId { get; set; }
        public virtual Page Page { get; set; }

        public long? ParentMenu_Id { get; set; }
        public virtual Menu ParentMenu { get; set; }

        //public long? MenuMaster_Id { get; set; }
        //public MenuMaster MenuMaster { get; set; }

        public virtual ICollection<Menu> Submenus { get; set; }
        public override Menu GetParent()
        {
            return ParentMenu;
        }
        public override IEnumerable<Menu> GetChildren()
        {
            return this.Submenus;
        }
    }
}

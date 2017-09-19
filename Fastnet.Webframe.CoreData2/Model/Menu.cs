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
        [ForeignKey("Page_PageId")]
        public Page Page { get; set; }
        public long? ParentMenu_Id { get; set; }
        [ForeignKey("ParentMenu_Id")]
        public Menu ParentMenu { get; set; }
        [ForeignKey("MenuMaster_Id")]
        public Menu MenuMaster { get; set; }
        public ICollection<Menu> Submenus { get; set; }
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

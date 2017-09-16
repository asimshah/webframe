using System.Collections.Generic;

namespace Fastnet.Webframe.CoreData2
{
    public partial class MenuMaster
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public bool IsDisabled { get; set; }
        public string ClassName { get; set; }
        public PanelNames PanelName { get; set; }
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

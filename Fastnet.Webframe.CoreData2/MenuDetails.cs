using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.CoreData2
{
    public class MenuDetails
    {
        public int Level { get; set; }
        public int Index { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
        public List<MenuDetails> SubMenus { get; set; }
    }
}

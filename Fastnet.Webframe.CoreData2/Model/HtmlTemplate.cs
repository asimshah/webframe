using System.ComponentModel.DataAnnotations;

namespace Fastnet.Webframe.CoreData2
{
    public class HtmlTemplate
    {
        public long Id { get; set; }
        [MaxLength(128)]
        public string Category { get; set; }
        [MaxLength(128)]
        public string Name { get; set; }
        public string HtmlText { get; set; }
    } 
}

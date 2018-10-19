using Fastnet.Webframe.Common2;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.BookingData2
{
    public class PriceStructure
    {
        public long PriceStructureId { get; set; }
        [Required]
        public string Name { get; set; }
        public virtual ICollection<Period> Periods { get; set; }
    }
}

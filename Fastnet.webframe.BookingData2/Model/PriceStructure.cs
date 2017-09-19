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
        //private ICollection<Period> periods;
        public long PriceStructureId { get; set; }
        [Required]
        public string Name { get; set; }
        public ICollection<Period> Periods { get; set; }
    }
    public class Price
    {
        [Key]
        public long PriceId { get; set; }
        //[Index("ptcc",  IsUnique = true, Order = 1)]
        public virtual Period Period { get; set; }
        //[Index("ptcc", IsUnique = true, Order = 2)]
        public AccomodationType Type { get; set; }
        //[Index("ptcc", IsUnique = true, Order = 3)]
        public AccomodationClass Class { get; set; }
        //[Index("ptcc", IsUnique = true, Order = 4)]
        public int Capacity { get; set; }
        [Required]
        public Decimal Amount { get; set; }
    }


}

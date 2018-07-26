using Fastnet.Webframe.Common2;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.BookingData2
{
    public class AccomodationExtra
    {
        public long AccomodationExtraId { get; set; }
        public OptionalExtras Extra { get; set; }
        [ForeignKey("Accomodation_AccomodationId")]
        public Accomodation Accomodation { get; set; }

        public long Accomodation_AccomodationId { get; set; }
    }
    [Table("Accomodations")]
    public class Accomodation : Hierarchy<Accomodation>
    {
        //private ICollection<Booking> bookings;
        //private ICollection<Accomodation> subAccomodationSet;
        //private ICollection<Availability> availabilities;
        public long AccomodationId { get; set; }
        public AccomodationType Type { get; set; }
        public AccomodationClass Class { get; set; }
        [MaxLength(32)]
        [Required]
        public string Name { get; set; } // e.g 12 for room 12, "Ocean View" for the villa called Ocean View, etc
        public string Fullname { get; set; }
        public bool SubAccomodationSeparatelyBookable { get; set; }
        public bool Bookable { get; set; } // if false, then SubAccomodationSeparatelyBookable should be true, else it is means this accomodation has been taken out of service
        [ForeignKey("ParentAccomodation_AccomodationId")]
        public Accomodation ParentAccomodation { get; set; }
        public ICollection<AccomodationExtra> Extras { get; set; }
        public ICollection<Accomodation> SubAccomodation { get; set; }
        public ICollection<Availability> Availabilities { get; set; }
        public ICollection<BookingAccomodation> BookingAccomodations { get; set; }

        internal long ParentAccomodation_AccomodationId { get; set; }

        public override Accomodation GetParent()
        {
            return this.ParentAccomodation;
        }
        public override IEnumerable<Accomodation> GetChildren()
        {
            return this.SubAccomodation;
        }
        [NotMapped]
        public string DisplayName
        {
            get { return Fullname?? Name; }
        }
    }




}


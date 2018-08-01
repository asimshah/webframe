using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.Webframe.CoreData2
{
    public partial class Recorder
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string RecorderId { get; set; } // from a guid
        public DateTime StartedOn { get; set; }
        public virtual ICollection<Record> Records { get; set; }
    }
}

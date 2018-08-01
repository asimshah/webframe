using System;

namespace Fastnet.Webframe.CoreData2
{
    public partial class Record
    {
        public long RecordId { get; set; }
        public long Sequence { get; set; }
        public DateTime RecordedOn { get; set; }
        public string Text { get; set; }
        public virtual Recorder Recorder { get; set; }
    }
}

using System.Collections.Generic;

namespace Fastnet.Webframe.CoreData2
{
    public partial class UploadFile
    {
        public long UploadFileId { get; set; }
        public string Name { get; set; }
        public string MimeType { get; set; }
        public long DirectoryId { get; set; }
        public string Guid { get; set; }
        public long TotalChunks { get; set; }
        public long BinaryLength { get; set; }
        public ICollection<FileChunk> FileChunks { get; set; }
    }
}

namespace Fastnet.Webframe.CoreData2
{
    public partial class FileChunk
    {
        public long FileChunkId { get; set; }
        public long UploadFileId { get; set; }
        public int ChunkNumber { get; set; }
        public string Base64String { get; set; }
        public virtual UploadFile UploadFile { get; set; }
    }
}

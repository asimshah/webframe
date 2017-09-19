using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Fastnet.Webframe.CoreData2
{
    public partial class Image
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long ImageId { get; set; }
        public string Name { get; set; }
        public byte[] Data { get; set; }
        public System.DateTimeOffset CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public ImageType ImageType { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        [Timestamp]
        public byte[] TimeStamp { get; set; }
        [ForeignKey("Directory_DirectoryId")]
        public long Directory_DirectoryId { get; set; }
        public Directory Directory { get; set; }
        [NotMapped]
        public string MimeType
        {
            get
            {
                switch (this.ImageType)
                {
                    default:
                    case ImageType.Jpeg:
                        //case ImageType.Emz:
                        return "image/jpeg";
                    case ImageType.Png:
                        return "image/png";
                    case ImageType.Gif:
                        return "image/gif";
                }
            }
        }
        [NotMapped]
        public string Url
        {
            get { return string.Format("image/{0}", ImageId); }
        }
        [NotMapped]
        public string Size
        {
            get { return string.Format("{0}w x {1}h", this.Width, this.Height); }
        }

        public string GetImageTypeImage()
        {
            return "content/images/image.png";
        }
    }
    public partial class CoreDataContext
    {
        public Image CreateNewImage()
        {
            long largest = 0;
            if ((this.Images.Count() + this.Images.Local.Count()) > 0)
            {
                largest = this.Images.Select(x => x.ImageId).Union(this.Images.Local.Select(x => x.ImageId)).Max(x => x);
            }
            //long? largest = this.Images.Select(x => x.ImageId).Union(this.Images.Local.Select(x => x.ImageId)).Max(x => x);
            return new Image { ImageId = largest + 1 };
        }
    }
}

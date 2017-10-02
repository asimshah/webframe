using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;

namespace Fastnet.Webframe.CoreData2
{
    public partial class Page
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long PageId { get; set; }
        public string Name { get; set; }
        public MarkupType MarkupType { get; set; }
        public PageType Type { get; set; }
        public long DirectoryId { get; set; }
        public bool IsLandingPage { get; set; }
        public PageMarkup PageMarkup { get; set; }
        public Directory Directory { get; set; }
        //public ICollection<MenuMaster> MenuMasters { get; set; }
        public ICollection<Menu> Menus { get; set; }
        public ICollection<PageDocument> PageDocuments { get; set; } // this page hyperlinks to these document
        public ICollection<PagePage> ForwardLinks { get; set; }// this page hyperlinks to these document
        public ICollection<PagePage> BackLinks { get; set; } // this page is hyperlinked from these pages
        [NotMapped]
        public string Url
        {
            get { return string.Format("page/{0}", PageId); }
        }
        [NotMapped]
        public System.DateTimeOffset CreatedOn { get { return this.PageMarkup.CreatedOn; } }
        [NotMapped]
        public string CreatedBy { get { return this.PageMarkup.CreatedBy; } }
        [NotMapped]
        public System.DateTimeOffset? ModifiedOn { get { return this.PageMarkup.ModifiedOn; } }
        [NotMapped]
        public string ModifiedBy { get { return this.PageMarkup.ModifiedBy; } }
        [NotMapped]
        public PageContent this[PageType index]
        {
            get { return GetContent(index); }
        }
        public Page FindSidePage(PageType type, bool search)
        {
            Debug.Assert(this.Type == PageType.Centre, "Only centre pages can be used to find side pages");
            Directory current = this.Directory;
            foreach (var dir in current.SelfAndParents)
            {
                var sp = dir.Pages.SingleOrDefault(x => x.Type == type);
                if (sp != null)
                {
                    return sp;
                }
                if (!search)
                {
                    break;
                }
            }
            return null;
        }
        public static string GetLandingPageImageUrl()
        {
            return "/content/images/homepage.png";
        }
        public string GetTypeImageUrl()
        {
            string r = null;
            switch (this.Type)
            {
                case PageType.Centre:
                    r = "/Content/images/centrepage.png";
                    break;
                case PageType.Left:
                    r = "/Content/images/leftpage.png";
                    break;
                case PageType.Right:
                    r = "/Content/images/rightpage.png";
                    break;
                case PageType.Banner:
                    r = "/Content/images/bannerpage.png";
                    break;
                default:
                    r = "/Content/images/panelwire.jpg";
                    break;
            }
            return r;
        }
        public string GetTypeTooltip()
        {
            string r = null;
            switch (this.Type)
            {
                case PageType.Centre:
                    r = "Centre page";
                    break;
                case PageType.Left:
                    r = "Left Panel page";
                    break;
                case PageType.Right:
                    r = "Right Panel page";
                    break;
                case PageType.Banner:
                    r = "Banner page";
                    break;
                default:
                    r = "Unknown!";
                    break;
            }
            return r;
        }
        public void RecordChanges(string actionBy, PageAction.EditingActionTypes actionType)
        {
            //Func<PageAction> getNewPageAction = () =>
            //{
            //    PageAction pa = new PageAction
            //    {
            //        Action = actionType,
            //        ActionBy = actionBy,
            //        Folder = this.Directory.DisplayName,
            //        Url = this.Url
            //    };
            //    return pa;
            //};
            //CoreDataContext DataContext = Core.GetDataContext();
            //switch (actionType)
            //{
            //    default:
            //        break;
            //    case PageAction.EditingActionTypes.NewPage:
            //    case PageAction.EditingActionTypes.PageDeleted:
            //    case PageAction.EditingActionTypes.PageContentModified:
            //        DataContext.Actions.Add(getNewPageAction());
            //        break;
            //    case PageAction.EditingActionTypes.PageModified:
            //        PageAction.AddPropertyModificationActions(DataContext.Entry(this), getNewPageAction, (pa) =>
            //        {
            //            DataContext.Actions.Add(pa);
            //        });
            //        break;
            //}
        }
        private PageContent GetContent(PageType index)
        {
            // replace this routine if I ever get rid of panel, panelpages and pagemarkups!
            Func<PageType, PageMarkup> findPageMarkup = (cp) =>
            {
                var page = this.FindSidePage(index, true);
                //string name = cp.ToString() + "Panel";
                //Panel panel = Core.GetDataContext().Panels.Single(p => p.Name == name);
                //var pp = this.SidePanelPages.SingleOrDefault(x => x.Panel.PanelId == panel.PanelId);
                if (page != null)
                {
                    return page.PageMarkup;
                }
                return null;
            };
            PageMarkup pm = null;
            switch (index)
            {
                case PageType.Centre:
                    pm = this.PageMarkup;
                    break;
                default:
                    pm = findPageMarkup(index);
                    break;
            }

            return pm == null ? null : new PageContent { HtmlStyles = pm.HtmlStyles, HtmlText = pm.HtmlText, HtmlTextLength = pm.HtmlTextLength };
        }
    }
    public class PageDocument
    {
        public long PageId { get; set; }
        public long DocumentId { get; set; }
        public Page Page { get; set; }
        public Document Document { get; set; }
    }
    public class PagePage
    {
        public long FromPageId { get; set; }
        public long ToPageId { get; set; }
        public Page FromPage { get; set; }
        public Page ToPage { get; set; }
    }
}

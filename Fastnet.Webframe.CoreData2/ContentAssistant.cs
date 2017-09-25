using HtmlAgilityPack;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Fastnet.Webframe.CoreData2
{

    public class PageKeys
    {
        public long CentrePanelPageId { get; set; }
        public long? BannerPanelPageId { get; set; }
        public long? LeftPanelPageId { get; set; }
        public long? RightPanelPageId { get; set; }
    }
    public class PageHtmlInformation
    {
        public long PageId { get; set; }
        public string Location { get; set; }
        public string HtmlText { get; set; }
        public IEnumerable<CSSRule> HtmlStyles { get; set; }
    }
    internal static class LayoutFiles
    {
        public static string GetDefaultCSS(string panelName)
        {
            panelName = NormalizePanelName(panelName);
            string filename = Path.Combine(GetMainStylesheetFolder(), panelName + ".css");
            return File.ReadAllText(filename);
        }
        public static string GetCustomLess(string panelName)
        {
            panelName = NormalizePanelName(panelName);
            string filename = Path.Combine(GetCustomStylesheetFolder(), panelName + ".less");
            if (File.Exists(filename))
            {
                return File.ReadAllText(filename);
            }
            else
            {
                return EmptyPanelLessFile(panelName);
            }
        }

        private static string EmptyPanelLessFile(string panelName)
        {
            return string.Format(".{0}\n{{\n\n}}\n", panelName);
        }
        public static string GetHelpText(string cmd)
        {
            string text = "";
            switch (cmd.ToLower())
            {
                case "sitepanel":
                    text = "These rules can be inherited by the entire site (if appropriate). Use width or max-width to control the width of the content. This is also a place to set global values such as font, background colour, foreground colour";
                    break;
                case "bannerpanel":
                    text = "For a banner to be displayed it must have a height. Display of the banner panel can be turned off";
                    break;
                case "menupanel":
                    text = "For a menu to be displayed it must have a height. Display of the menu panel can be turned off";
                    break;
                case "contentpanel":
                    text = "These rules can be inherited by the three child panels, left, centre and right (if appropriate). Do not set height or width";
                    break;
                case "leftpanel":
                    text = "For left panel to be displayed it must have a width. Do not set height. Display of the left panel can be turned off";
                    break;
                case "centrepanel":
                    text = "Do not set the width of the centre panel and do not turn off its display. Site width is best controlled vis the Site panel.";
                    break;
                case "rightpanel":
                    text = "For right panel to be displayed it must have a width. Do not set height. Display of the right panel can be turned off";
                    break;
                default:
                    break;
            }
            return text;
        }
        public static void SaveCustomLess(string panelName, string lessText, string cssText)
        {
            panelName = NormalizePanelName(panelName);
            string filename = Path.Combine(GetCustomStylesheetFolder(), panelName + ".less");
            File.WriteAllText(filename, lessText);
            filename = Path.Combine(GetMainStylesheetFolder(), panelName + ".user.css");
            File.WriteAllText(filename, cssText);
        }
        private static string NormalizePanelName(string name)
        {
            switch (name.ToLower())
            {
                case "site-panel":
                    name = "SitePanel";
                    break;
                case "banner-panel":
                    name = "BannerPanel";
                    break;
                case "menu-panel":
                    name = "MenuPanel";
                    break;
                case "content-panel":
                    name = "ContentPanel";
                    break;
                case "left-panel":
                    name = "LeftPanel";
                    break;
                case "centre-panel":
                    name = "CentrePanel";
                    break;
                case "right-panel":
                    name = "RightPanel";
                    break;
                default:
                    break;
            }
            return name;
        }
        public static string GetMainStylesheetFolder()
        {
            return Path.Combine(ContentAssistant.contentRoot, "Content/Main/DefaultCSS");
            //return HostingEnvironment.MapPath("~/Content/Main/DefaultCSS");
        }
        public static string GetCustomStylesheetFolder()
        {
            string folder = Path.Combine(ContentAssistant.contentRoot, "Content/Main/CustomLess");
            //string folder = HostingEnvironment.MapPath("~/Content/Main/CustomLess");
            if (!System.IO.Directory.Exists(folder))
            {
                System.IO.Directory.CreateDirectory(folder);
            }
            return folder;// HostingEnvironment.MapPath("~/Content/Main/CustomLess");
        }
    }
    public class CSSRule
    {
        private static Regex comments = new Regex(@"/\*.*?\*/", RegexOptions.Compiled);
        private static Regex rule = new Regex(@"(.*?)({.*?})", RegexOptions.Compiled | RegexOptions.Singleline);
        public string Selector { get; set; }
        public List<string> Rules { get; set; }
        public CSSRule()
        {
            Rules = new List<string>();
        }
        public void AddRule(string fmt, params object[] args)
        {
            Rules.Add(string.Format(fmt, args));
        }
        public void RemoveRule(string name)
        {
            string rule = Rules.SingleOrDefault(x => x.StartsWith(name.ToLower()));
            if (rule != null)
            {
                Rules.Remove(rule);
            }
        }
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("{0}", Selector).AppendLine();

            sb.AppendFormat("{{").AppendLine();
            foreach (string r in Rules)
            {
                sb.AppendFormat("    {0};", r).AppendLine();
            }
            sb.AppendFormat("}}").AppendLine();
            return sb.ToString();
        }
        public static string GetUserImagesFolder()
        {
            return Path.Combine(ContentAssistant.contentRoot, "UserImages");
        }
        public static List<CSSRule> ParseForRules(string cssRuleText)
        {
            List<CSSRule> rules = new List<CSSRule>();
            cssRuleText = cssRuleText.Replace("<!--", " ");
            cssRuleText = cssRuleText.Replace("-->", " ");
            cssRuleText = cssRuleText.Replace("\r\n", " ");

            cssRuleText = comments.Replace(cssRuleText, "");

            foreach (Match m in rule.Matches(cssRuleText))
            {
                CSSRule cr = new CSSRule();
                cr.Selector = m.Groups[1].Value.Trim();
                string body = m.Groups[2].Value.Trim();
                body = body.Substring(1, body.Length - 2);
                string[] bodyParts = body.Split(';');

                foreach (string bp in bodyParts)
                {
                    if (bp.Trim().Length > 0)
                    {

                        cr.Rules.Add(bp.Trim());
                    }
                }
                rules.Add(cr);
            }
            return rules;
        }
    }
    internal class HtmlParser
    {
        private HtmlDocument _htmlDoc;
        protected HtmlDocument HtmlDoc
        {
            get
            {
                if (_htmlDoc == null)
                {
                    _htmlDoc = new HtmlDocument();
                    _htmlDoc.LoadHtml(HtmlString);
                }
                return _htmlDoc;
            }
        }
        public string HtmlString { get; set; }
        public HtmlParser(string htmlText)
        {
            HtmlString = htmlText;
        }
        public HtmlParser(byte[] htmlData)
        {
            string htmlText = Encoding.Default.GetString(htmlData);
            HtmlString = htmlText;
        }
        /// <summary>
        /// Use this to obtain the list of CSSRule lists from the HtmlStyles property
        /// of PageMarkup (which is placed there by parsing Word Docx content). Each
        /// CSSRule list is the body of a separate Html style. The order of the
        /// list is important.
        /// </summary>
        /// <returns></returns>
        public IEnumerable<List<CSSRule>> GetLegacyStyleRules()
        {
            HtmlNodeCollection headStyles = HtmlDoc.DocumentNode.SelectNodes("/styles/style");
            var styleBodies = headStyles.Select(x => x.InnerText);
            return styleBodies.Select(x => CSSRule.ParseForRules(x));
        }
    }
    public class ContentAssistant
    {
        internal static string contentRoot;

        private readonly ILogger log;
        private readonly CoreDataContext coreDataContext;
        private readonly IHostingEnvironment environment;
        public ContentAssistant(IHostingEnvironment environment ,ILogger<ContentAssistant> logger, CoreDataContext coreDataContext)
        {
            this.log = logger;
            this.coreDataContext = coreDataContext;
            this.environment = environment;
            ContentAssistant.contentRoot = environment.ContentRootPath;
        }
        public async Task<AccessResult> GetAccessResultAsync(Member member, Image image)
        {
            //await LoadRelatedEntities(image);
            TraceAccess("Access: member {0}, {1}", member.Fullname, image.Url);
            await coreDataContext.Entry(image).Reference(x => x.Directory).LoadAsync();
            Directory dir = image.Directory;
            return await GetAccessResultAsync(member, dir);
        }
        public async Task<AccessResult> GetAccessResultAsync(Member member, Document doc)
        {
            //await LoadRelatedEntities(doc);
            TraceAccess("Access: member {0}, {1}", member.Fullname, doc.Url);

            await coreDataContext.Entry(doc).Reference(x => x.Directory).LoadAsync();
            Directory dir = doc.Directory;
            return await GetAccessResultAsync(member, dir);
        }
        public async Task<AccessResult> GetAccessResultAsync(Member member, Page page)
        {
            TraceAccess("Access: member {0}, {1}", member.Fullname, page.Url);
            //await LoadRelatedEntities(page);
            //coreDataContext.Directories.Where(d => d.DirectoryId == page.DirectoryId).Load();
            await coreDataContext.Entry(page).Reference(x => x.Directory).LoadAsync();
            Directory dir = page.Directory;
            return await GetAccessResultAsync(member, dir);
        }
        public async Task<Page> FindLandingPageAsync(Member member)
        {
            Func<AccessResult, bool> canAccess = (ar) =>
            {
                return ar == AccessResult.ViewAllowed || ar == AccessResult.EditAllowed;
            };
            Page result = null;
            var lps = await coreDataContext.Pages.Where(x => x.IsLandingPage).ToArrayAsync();
            TraceAccess("Access: defined landing page(s) {0}", string.Join(", ", lps.Select(x => x.Url).ToArray()));
            var pages = lps.Where(x => canAccess(GetAccessResultAsync(member, x).Result)).ToArray();
            TraceAccess("Access: member {0} can access landing page(s) {1}", member.Fullname, string.Join(", ", pages.Select(x => x.Url).ToArray()));
            if (pages.Count() > 1)
            {
                var pagesWithWeight = pages.Select(x => new { Page = x, Weight = FindWeight(member, x) });
                TraceAccess("Access: member {0}, page weights are: {1}", member.Fullname, string.Join(", ", pagesWithWeight.Select(x => string.Format("{0}, weight {1:#0.00}", x.Page.Url, x.Weight)).ToArray()));
                var maxWeight = pagesWithWeight.Max(x => x.Weight);
                var heaviest = pagesWithWeight.Where(x => x.Weight == maxWeight);
                if (heaviest.Count() > 1)
                {
                    log.LogTrace("Multiple landing pages found for {0}: {1}", member.Fullname, string.Join(", ", heaviest.Select(x => string.Format("{0}, weight {1:#0.00}", x.Page.Url, x.Weight)).ToArray()));
                }
                TraceAccess("Access: member {0}, selected landing page {1}", member.Fullname, string.Format("{0} weight {1:#0.00}", heaviest.First().Page.Url, heaviest.First().Weight));
                result = heaviest.First().Page;
            }
            else
            {
                result = pages.First();
                TraceAccess("Access: member {0}, selected landing page {1}", member.Fullname, result.Url);
            }

            return result;
        }
        public async Task<PageKeys> GetPageKeys(Page centrePage)
        {
            async Task<Page> findSidePage(Page cp, PageType pt)
            {
                foreach (var dir in cp.Directory.SelfAndParents)
                {
                    await coreDataContext.Entry(dir).Collection(x => x.Pages).LoadAsync();
                    var sidepage = dir.Pages.SingleOrDefault(p => p.Type == pt);
                    if (sidepage != null)
                    {
                        return sidepage;
                    }
                }
                return null;
            }
            Debug.Assert(centrePage.Type == PageType.Centre);
            await coreDataContext.Entry(centrePage).Reference(x => x.Directory).LoadAsync();
            await coreDataContext.LoadParentsAsync(centrePage.Directory);
            var bannerPage = await findSidePage(centrePage, PageType.Banner);
            var leftPage = await findSidePage(centrePage, PageType.Left);
            var rightPage = await findSidePage(centrePage, PageType.Right);
            var result = new PageKeys
            {
                CentrePanelPageId = centrePage.PageId,
                BannerPanelPageId = bannerPage?.PageId,
                LeftPanelPageId = leftPage?.PageId,
                RightPanelPageId = rightPage?.PageId
            };
            return result;
        }
        public async Task<PageHtmlInformation> PrepareDocXPage(Page page)
        {
            //await LoadRelatedEntities(page);
            await coreDataContext.Entry(page).Reference(x => x.PageMarkup).LoadAsync();
            string htmlText = page.PageMarkup.HtmlText;
            string htmlStyles = page.PageMarkup.HtmlStyles;
            HtmlParser hp = new HtmlParser(htmlStyles);
            var styleRules = hp.GetLegacyStyleRules();
            // now merge multiple styles into one
            var allRules = styleRules.SelectMany(x => x);
            var location = page.Directory.DisplayName;
            return new PageHtmlInformation { PageId = page.PageId, Location = location, HtmlText = htmlText, HtmlStyles = allRules };
        }
        public async Task<PageHtmlInformation> PrepareHTMLPage(Page page)
        {
            await coreDataContext.Entry(page).Reference(x => x.PageMarkup).LoadAsync();
            string htmlText = page.PageMarkup.HtmlText;
            var location = page.Directory.DisplayName;
            return new PageHtmlInformation { PageId = page.PageId, Location = location, HtmlText = htmlText, HtmlStyles = null };
        }
        public bool IsMemberOf(Member member, Group group)
        {
            coreDataContext.LoadGroupMembersAsync(group).Wait();
            var temp = group.SelfAndDescendants.ToArray();
            var result = group.SelfAndDescendants.Any(x => x.Members.Contains(member));
            return result;
        }
        private void TraceAccess(string fmt, params object[] args)
        {
            bool trace = false;// ApplicationSettings.Key("Trace:Access", false);
            if (trace)
            {
                log.LogDebug(fmt, args);
            }

        }
        private async Task<AccessResult> GetAccessResultAsync(Member member, Directory dir)
        {
            await coreDataContext.LoadGroups(dir);
            AccessResult ar = AccessResult.Rejected;
            TraceAccess("Access: member {0}, directory {1}", member.Fullname, dir.DisplayName);
            if(dir.Groups.Count() == 0)
            {
                TraceAccess("Access: member {0}, directory {1}, no direct restrictions (going to parent ...)", member.Fullname, dir.DisplayName);
                await coreDataContext.LoadParentsAsync(dir);
                dir = dir.ParentDirectory;
                ar = await GetAccessResultAsync(member, dir);
            }
            TraceAccess("Access: member {0}, directory {1}, direct restriction group(s): {2}", member.Fullname, dir.DisplayName, string.Join(", ", dir.Groups.Select(x => x.Fullpath).ToArray()));
            var groupsWhereIsMember = dir.DirectoryGroups.Where(x => IsMemberOf(member, x.Group)).Select(x => new { x.Group, x.Permission });
            if (groupsWhereIsMember.Count() > 0)
            {
                TraceAccess("Access: member {0}, directory {1}, member of group(s): {2}", member.Fullname, dir.DisplayName, string.Join(", ", groupsWhereIsMember.Select(x => x.Group.Fullpath).ToArray()));
                if (groupsWhereIsMember.Any(x => x.Permission.HasFlag(Permission.EditPages)))
                {
                    TraceAccess("Access: member {0}, directory {1}, edit allowed for group(s): {2} ", member.Fullname, dir.DisplayName,
                        string.Join(", ", groupsWhereIsMember.Where(x => x.Permission.HasFlag(Permission.EditPages)).Select(x => x.Group.Fullpath).ToArray()));
                    ar = AccessResult.EditAllowed;
                }
                else if(groupsWhereIsMember.Any(x => x.Permission.HasFlag(Permission.ViewPages)))
                {
                    TraceAccess("Access: member {0}, directory {1}, view allowed for group(s): {2} ", member.Fullname, dir.DisplayName,
                        string.Join(", ", groupsWhereIsMember.Where(x => x.Permission.HasFlag(Permission.ViewPages)).Select(x => x.Group.Fullpath).ToArray()));
                    ar = AccessResult.ViewAllowed;
                }
            }
            TraceAccess("Access: member {0}, directory {1}, access result: {2}", member.Fullname, dir.DisplayName, ar.ToString());
            return ar;
        }
        private double FindWeight(Member member, Page p)
        {
            double result = -1.0;
            Directory dir = p.Directory;
            foreach (var d in dir.SelfAndParents)
            {
                var dgs = d.DirectoryGroups.Where(x => IsMemberOf(member, x.Group));
                if (dgs.Count() > 0)
                {
                    result = dgs.Average(x => x.Group.Weight);
                    break;
                }
            }
            Debug.Assert(result >= 0);
            return result;
        }

    }
}

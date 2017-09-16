using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace Fastnet.Webframe.CoreData2
{
    public class ContentAssistant
    {
        private readonly ILogger log;
        private readonly CoreDataContext coreDataContext;
        public ContentAssistant(ILogger<ContentAssistant> logger, CoreDataContext coreDataContext)
        {
            this.log = logger;
            this.coreDataContext = coreDataContext;
        }

        public AccessResult GetAccessResult(MemberBase member, Image image)
        {
            TraceAccess("Access: member {0}, {1}", member.Fullname, image.Url);
            Directory dir = image.Directory;
            return GetAccessResult(member, dir);
        }
        public AccessResult GetAccessResult(MemberBase member, Document doc)
        {
            TraceAccess("Access: member {0}, {1}", member.Fullname, doc.Url);
            Directory dir = doc.Directory;
            return GetAccessResult(member, dir);
        }
        public AccessResult GetAccessResult(MemberBase member, Page page)
        {
            TraceAccess("Access: member {0}, {1}", member.Fullname, page.Url);
            Directory dir = page.Directory;
            return GetAccessResult(member, dir);
        }
        public Page FindLandingPage(MemberBase member)
        {
            Func<AccessResult, bool> canAccess = (ar) =>
            {
                return ar == AccessResult.ViewAllowed || ar == AccessResult.EditAllowed;
            };
            Page result = null;
            //CoreDataContext DataContext = Core.GetDataContext();
            var lps = coreDataContext.Pages.Where(x => x.IsLandingPage).ToArray();
            TraceAccess("Access: defined landing page(s) {0}", string.Join(", ", lps.Select(x => x.Url).ToArray()));
            var pages = lps.Where(x => canAccess(GetAccessResult(member, x))).ToArray();
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
        public bool IsMemberOf(MemberBase member, Group group)
        {
            return group.SelfAndDescendants.Any(x => x.Members.Contains(member));
            //return group.Members.Contains(this);
        }
        private void TraceAccess(string fmt, params object[] args)
        {
            bool trace = false;// ApplicationSettings.Key("Trace:Access", false);
            if (trace)
            {
                log.LogTrace(fmt, args);
            }
        }
        private AccessResult GetAccessResult(MemberBase member, Directory dir)
        {
            AccessResult ar = AccessResult.Rejected;
            TraceAccess("Access: member {0}, directory {1}", member.Fullname, dir.DisplayName);
            var drgSet = dir.DirectoryGroups;
            if (drgSet.Count() == 0)
            {
                TraceAccess("Access: member {0}, directory {1}, no direct restrictions (going to parent ...)", member.Fullname, dir.DisplayName);
                dir = dir.ParentDirectory;
                ar = GetAccessResult(member, dir);
            }
            TraceAccess("Access: member {0}, directory {1}, direct restriction group(s): {2}", member.Fullname, dir.DisplayName, string.Join(", ", drgSet.Select(x => x.Group.Fullpath).ToArray()));
            if (drgSet.Select(x => x.Group).Any(x => IsMemberOf(member, x)))
            {
                var dgs = drgSet.Where(x => IsMemberOf(member, x.Group));
                TraceAccess("Access: member {0}, directory {1}, member of group(s): {2}", member.Fullname, dir.DisplayName, string.Join(", ", dgs.Select(x => x.Group.Fullpath).ToArray()));
                if (dgs.Any(x => x.EditAllowed))
                {
                    TraceAccess("Access: member {0}, directory {1}, edit allowed for group(s): {2} ", member.Fullname, dir.DisplayName, string.Join(", ", dgs.Where(x => x.EditAllowed).Select(x => x.Group.Fullpath).ToArray()));
                    ar = AccessResult.EditAllowed;
                }
                else if (dgs.Any(x => x.ViewAllowed))
                {
                    //var xx = dgs.Where(x => x.ViewAllowed).Select(x => x.Group.Fullpath).ToArray();
                    TraceAccess("Access: member {0}, directory {1}, view allowed for group(s): {2} ", member.Fullname, dir.DisplayName, string.Join(", ", dgs.Where(x => x.ViewAllowed).Select(x => x.Group.Fullpath).ToArray()));
                    ar = AccessResult.ViewAllowed;
                }
            }
            TraceAccess("Access: member {0}, directory {1}, access result: {2}", member.Fullname, dir.DisplayName, ar.ToString());
            return ar;
        }
        private double FindWeight(MemberBase member, Page p)
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

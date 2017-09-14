using System;
using System.Web;
using System.Web.Security;

namespace Fastnet.EventSystem
{
    // some comment
    public partial class Event
    {
        public Event()
        {
            this.Url = this.IPAddress = ExceptionType = MachineName = DomainName = UserName = SessionId = "";
            DomainName = Environment.UserDomainName.ToLower();
            MachineName = Environment.MachineName.ToLower();
            ProcessId = System.Diagnostics.Process.GetCurrentProcess().Id;
            ThreadId = System.Threading.Thread.CurrentThread.ManagedThreadId;
            UserName = Environment.UserName.ToString();
            try
            {
                if (HttpContext.Current != null)
                {
                    if (HttpContext.Current.ApplicationInstance.ToString() != "ASP.global_asax" && HttpContext.Current.Request != null)
                    {
                        if (HttpContext.Current.Request.Url != null && !string.IsNullOrEmpty(HttpContext.Current.Request.Url.PathAndQuery))
                        {
                            Url = HttpContext.Current.Request.Url.PathAndQuery;
                        }

                        if (HttpContext.Current.Request.IsAuthenticated)
                        {
                            MembershipUser user = Membership.GetUser();
                            UserName = user.UserName;
                        }
                        else if (HttpContext.Current.Request.LogonUserIdentity != null && !string.IsNullOrEmpty(HttpContext.Current.Request.LogonUserIdentity.Name))
                        {
                            UserName = HttpContext.Current.Request.LogonUserIdentity.Name;
                        }
                        if (!string.IsNullOrEmpty(HttpContext.Current.Request.UserHostAddress))
                        {
                            IPAddress = HttpContext.Current.Request.UserHostAddress;
                        }
                    }
                    if (HttpContext.Current.Session != null && !string.IsNullOrEmpty(HttpContext.Current.Session.SessionID))
                    {
                        SessionId = HttpContext.Current.Session.SessionID;
                    }
                }

            }
            catch { }
        }
        public long EventId { get; set; }
        public Nullable<long> Sequence { get; set; }
        //public Nullable<System.DateTime> EventTime { get; set; }
        //[NotMapped]
        public string DateTimeString { get; set; }
        public string EventType { get; set; }
        public Nullable<int> EventCode { get; set; }
        public string Message { get; set; }
        public string StackTrace { get; set; }
        public string ApplicationName { get; set; }
        public string Url { get; set; }
        public string IPAddress { get; set; }
        public string ExceptionType { get; set; }
        public Nullable<int> EventSeverity { get; set; }
        public Nullable<int> ThreadId { get; set; }
        public Nullable<int> ProcessId { get; set; }
        public string MachineName { get; set; }
        public string DomainName { get; set; }
        public string UserName { get; set; }
        public string SessionId { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.Runtime.Serialization.Formatters.Soap;
using System.IO;
using System.Web;
using System.Web.Security;

namespace Fastnet.EventSystem
{

    ///// <summary>
    ///// The possible types of an <see cref="Event"/>.
    ///// </summary>
    //public enum EventTypes
    //{
    //    /// <summary>
    //    /// An unknown type - this is probably an error.
    //    /// </summary>
    //    Unknown,
    //    /// <summary>
    //    /// Use this type, when recording events to help with diagnosing issues with code.
    //    /// </summary>
    //    Diagnostic,
    //    /// <summary>
    //    /// Use this for an error detected in the application (rather than a <see cref="SystemError"/>).
    //    /// </summary>
    //    ApplicationError,
    //    /// <summary>
    //    /// Use this for an error detected by the .Net Framework (rather than a <see cref="ApplicationError"/>).
    //    /// </summary>
    //    SystemError,
    //    VerboseDiagnostic
    //}
    ///// <summary>
    ///// The possible severities of an <see cref="Event"/>.
    ///// </summary>
    //public enum EventSeverities
    //{
    //    /// <summary>
    //    /// An unknown severity - this is probably an error.
    //    /// </summary>
    //    Unknown,
    //    /// <summary>
    //    /// An informational event - processing is normal.
    //    /// </summary>
    //    Information,
    //    /// <summary>
    //    /// A warning that something should not have occurred but processing is able to continue.
    //    /// </summary>
    //    Warning,
    //    /// <summary>
    //    /// An error has occurred - processing may continue but something is definitely wrong.
    //    /// </summary>
    //    Error,
    //    /// <summary>
    //    /// An error has occurred which is sufficiently serious that all processing needs to stop.
    //    /// </summary>
    //    Fatal
    //}
    ///// <summary>
    ///// This class encapsulates all the information that can be recorded as a single event
    ///// and sent to the EventSystem.
    ///// </summary>
    [Serializable]
    public class Event //: Packet//, IEventData
    {
        private long id;
        private long sequence;

        //private DateTime timeUtc;
        private DateTime time;
        private EventTypes type;
        private int code;
        private string message = "";
        private string applicationName = "";
        private string exceptionType = "";
        private string machineName = "";
        private string userName = "";
        private int threadId;
        private int processId;
        private string domainName = "";
        private EventSeverities severity;
        private string stackTrace = "";
        private string url = "";
        private string ipAddress = "";
        private string sessionId = "";


        /// <summary>
        /// Use this constructor to create a new instance of an Event that will be recorded.
        /// </summary>
        /// <remarks>
        /// The following properties will be automatically assigned:
        /// <list type="table">
        /// <item>
        /// <see cref="MachineName"/>
        /// </item>
        /// <item>
        /// <see cref="UserName"/>
        /// </item>
        /// <item>
        /// <see cref="DomainName"/>
        /// </item>
        /// <item>
        /// <see cref="ThreadId"/>
        /// </item>
        /// <item>
        /// <see cref="Id"/>
        /// </item>
        /// </list>
        /// <para>The following additional properties will be set if the HTTP context is true (i.e. the event is recorded from an ASP page).</para>
        /// <list type="table">
        /// <item>
        /// <see cref="IPAddress"/>
        /// </item>
        /// <item>
        /// <see cref="Url"/>
        /// </item>
        /// </list>
        /// </remarks>
        public Event()
        {
            this.machineName = Environment.MachineName.ToLower();
            this.userName = Environment.UserName;
            this.domainName = Environment.UserDomainName;

            this.threadId = System.Threading.Thread.CurrentThread.ManagedThreadId;
            this.processId = System.Diagnostics.Process.GetCurrentProcess().Id;
            this.url = "not found";
            this.ipAddress = "not found";
            this.sessionId = "not found";
            if (System.Threading.Thread.CurrentThread.Name != null && System.Threading.Thread.CurrentThread.Name.Length > 0)
            {
                this.ApplicationName = System.Threading.Thread.CurrentThread.Name;
            }
            try
            {
                if (HttpContext.Current != null)
                {
                    if (HttpContext.Current.Request != null)
                    {
                        if (HttpContext.Current.Request.Url != null && !string.IsNullOrEmpty(HttpContext.Current.Request.Url.PathAndQuery))
                        {
                            this.url = HttpContext.Current.Request.Url.PathAndQuery;
                        }

                        if (HttpContext.Current.Request.IsAuthenticated)
                        {
                            MembershipUser user = Membership.GetUser();
                            this.userName = user.UserName;
                        }
                        else if (HttpContext.Current.Request.LogonUserIdentity != null && !string.IsNullOrEmpty(HttpContext.Current.Request.LogonUserIdentity.Name))
                        {
                            this.userName = HttpContext.Current.Request.LogonUserIdentity.Name;
                        }
                        if (!string.IsNullOrEmpty(HttpContext.Current.Request.UserHostAddress))
                        {
                            this.ipAddress = HttpContext.Current.Request.UserHostAddress;
                        }
                    }
                    if (HttpContext.Current.Session != null && !string.IsNullOrEmpty(HttpContext.Current.Session.SessionID))
                    {
                        this.sessionId = HttpContext.Current.Session.SessionID;
                    }
                }

            }
            catch { }
        }
        /// <summary>
        /// This constructor is used internally when reloading an Event from the database.
        /// Internal use only.
        /// </summary>
        /// <param name="row">The <see cref="DataRow"/> from which to instantiated an Event.</param>
        //public Event(DataRow row)
        //{
        //    this.applicationName = row["ApplicationName"].ToString();
        //    this.code = Convert.ToInt32(row["EventCode"]);
        //    this.domainName = row["DomainName"].ToString();
        //    this.exceptionType = row["ExceptionType"].ToString();
        //    this.id = Convert.ToInt64(row["EventId"]);
        //    this.ipAddress = row["IPAddress"].ToString();
        //    this.machineName = row["MachineName"].ToString();
        //    this.message = row["Message"].ToString();
        //    this.processId = Convert.ToInt32(row["ProcessId"]);
        //    this.sequence = Convert.ToInt32(row["Sequence"]);
        //    this.severity = (EventSeverities)Convert.ToInt32(row["EventSeverity"]);
        //    this.stackTrace = row["StackTrace"].ToString();
        //    this.threadId = Convert.ToInt32(row["ThreadId"]);
        //    this.time = Convert.ToDateTime(row["EventTime"]);
        //    this.type = (EventTypes)Enum.Parse(typeof(EventTypes), row["EventType"].ToString());
        //    this.url = row["Url"].ToString();
        //    this.userName = row["UserName"].ToString();
        //    this.sessionId = row["SessionId"].ToString();
        //}
        /// <summary>
        /// The IP address of the current request. Only valid in an HTTP context.
        /// </summary>
        public virtual string IPAddress
        {
            get { return ipAddress; }
            set { ipAddress = value; }
        }
        /// <summary>
        /// The URL of the request. Only valid in an HTTP context.
        /// </summary>
        public virtual string Url
        {
            get { return url; }
            set { url = value; }
        }
        /// <summary>
        /// Initialises internal data in preparation for a database write.
        /// </summary>
        public void PrepareForDatabase()
        {
            // this code is to ensure that there are no write failures to the database
            if (time == DateTime.MinValue)
            {
                time = DateTime.Now;
            }
            if (message == null)
            {
                message = "";
            }
            if (exceptionType == null)
            {
                exceptionType = "";
            }
            if (machineName == null)
            {
                machineName = "";
            }
            if (applicationName == null)
            {
                applicationName = "";
            }
            if (userName == null)
            {
                userName = "";
            }
            if (domainName == null)
            {
                domainName = "";
            }
            if (stackTrace == null)
            {
                stackTrace = "";
            }
            if (url == null)
            {
                url = "";
            }
            if (ipAddress == null)
            {
                ipAddress = "";
            }
            if (sessionId == null)
            {
                sessionId = "";
            }
        }
        /// <summary>
        /// Stack details at the point the <see cref="Event"/> is written.
        /// </summary>
        public string StackTrace
        {
            get { return stackTrace; }
            set { stackTrace = value; }
        }
        /// <summary>
        /// Deserializes the source data into an instance of an <see cref="Event"/>. Internal uyse only.
        /// </summary>
        /// <remarks>The data is assumed to be in SOAP format.</remarks>
        /// <param name="data">The data to be deserialized.</param>
        /// <returns></returns>
        public static Event FromData(byte[] data)
        {
            MemoryStream ms = new MemoryStream(data);
            SoapFormatter sf = new SoapFormatter();
            Event e = sf.Deserialize(ms) as Event;
            return e;
        }
        /// <summary>
        /// The primary key of this instance in the database.
        /// </summary>
        /// <remarks> Note that this is only allocated
        /// when the Event is written to the database (and is therefore only available when the <see cref="Event"/> is read from the database).
        /// </remarks>
        public long Id
        {
            get { return id; }
            set { id = value; }

        }
        /// <summary>
        /// A sequence number for this <see cref="Event"/>.
        /// </summary>
        /// <remarks>
        /// A sequence number is assigned from the sending context. It is incremented each time an Event is sent from the same context.
        /// The context is the sending process (i.e. the number is only meaningful for sequential Events from the same process).
        /// </remarks>
        public long Sequence
        {
            get { return sequence; }
            set { sequence = value; }
        }
        //public DateTime TimeUtc
        //{
        //    get { return timeUtc; }
        //    internal set { timeUtc = value; }
        //}
        /// <summary>
        /// The managed thread id of the sending thread.
        /// </summary>
        public int ThreadId
        {
            get { return threadId; }
            set { threadId = value; }
        }
        /// <summary>
        /// The process id of the sending process.
        /// </summary>
        public int ProcessId
        {
            get { return processId; }
            set { processId = value; }
        }
        /// <summary>
        /// The user name (lgged in name) of the sending thread.
        /// </summary>
        public string UserName
        {
            get { return userName; }
            set { userName = value; }
        }
        /// <summary>
        /// The domain name of the sending thread.
        /// </summary>
        public virtual string DomainName
        {
            get { return domainName; }
            set { this.domainName = value; }
        }
        /// <summary>
        /// The time at the sending moment.
        /// </summary>
        public virtual DateTime Time
        {
            get { return time; }
            set { time = value; }
        }
        /// <summary>
        /// The type of this <see cref="Event"/>.
        /// </summary>
        public EventTypes Type
        {
            get { return type; }
            set { type = value; }
        }
        /// <summary>
        /// A user supplied numeric code for this <see cref="Event"/>.
        /// </summary>
        public int Code
        {
            get { return code; }
            set { code = value; }
        }
        /// <summary>
        /// The user supplied text of this event.
        /// </summary>
        public string Message
        {
            get { return message; }
            set { message = value; }
        }
        /// <summary>
        /// The name of the application sending this <see cref="Event"/>.
        /// </summary>
        /// <remarks>
        /// The application name is any name supplied by the user - the Event Viewer selects on the basis
        /// of this name. The <see cref="Log"/> class automatically sets this name.
        /// </remarks>
        public string ApplicationName
        {
            get { return applicationName; }
            set { applicationName = value; }
        }
        /// <summary>
        /// The name of the exception class for this <see cref="Event"/> (if it is an exception).
        /// </summary>
        public string ExceptionType
        {
            get
            {
                return exceptionType;
            }
            set { exceptionType = value; }
        }
        /// <summary>
        /// The name of the computer sending this <see cref="Event"/>.
        /// </summary>
        public virtual string MachineName
        {
            get { return machineName; }
            set { this.machineName = value; }
        }
        /// <summary>
        /// The severity of this <see cref="Event"/>.
        /// </summary>
        public EventSeverities Severity
        {
            get { return severity; }
            set { severity = value; }
        }
        //public byte[] ToBytes()
        //{
        //    SoapFormatter sf = new SoapFormatter();
        //    MemoryStream ms = new MemoryStream();
        //    sf.Serialize(ms, this);
        //    byte[] data = ms.GetBuffer();
        //    ms.Dispose();
        //    return data;
        //}
        public string SessionId
        {
            get { return sessionId; }
            set { sessionId = value; }
        }
        /// <summary>
        /// A string representation of this <see cref="Event"/>.
        /// </summary>
        /// <remarks>Uses <see cref="DumpObject"/>.</remarks>
        /// <returns></returns>
        public override string ToString()
        {
            return DumpObject(this);
        }
        /// <summary>
        /// Sends this <see cref="Event"/> using <see cref="Log"/>.
        /// </summary>
        //public virtual void Send()
        //{
        //    try
        //    {
        //        Log l = Log.GetInstance();
        //        l.LogEvent(this);
        //    }
        //    catch { }
        //}
        //protected void SendRaw()
        //{
        //    try
        //    {
        //        Log l = Log.GetInstance();
        //        l.LogEvent(this);
        //    }
        //    catch { }
        //}
        /// <summary>
        /// Returns a string representation of the provided object using Reflection.
        /// </summary>
        /// <param name="obj">The object to dump.</param>
        /// <returns>A comma separated string of properties and their values.</returns>
        private string DumpObject(object obj)
        {
            string text = "";
            foreach (System.Reflection.PropertyInfo pi in obj.GetType().GetProperties())
            {
                if (text.Length > 0)
                {
                    text += ", ";
                }
                object t = pi.GetValue(obj, null);
                if (t == null)
                {
                    text += pi.Name + "=(null)";
                }
                else
                {
                    text += pi.Name + "=" + t.ToString();
                }
            }
            return text;
        }

    }
}

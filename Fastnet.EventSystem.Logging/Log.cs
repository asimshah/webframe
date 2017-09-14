using Fastnet.EventSystem.Metatron;
using log4net.Appender;
using log4net.Core;
using log4net.Layout;
using log4net.Repository.Hierarchy;
using System;
//using Fastnet.EventSystem.EventService;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
// NOTE: the reference to System.Web makes it impossible for a .Net 4 Client profile app to use this dll!!!!
using System.Web;
using System.Web.UI;
using sd = System.Diagnostics;


namespace Fastnet.EventSystem
{
    //public class EventLogger
    //{
    //    private static Log logInstance;
    //    public EventLogger(Log l)
    //    {
    //        logInstance = l;
    //    }
    //    public void Write(Exception xe, EventTypes type = EventTypes.Application)
    //    {
    //        if (xe.InnerException != null)
    //        {
    //            Write(xe.InnerException, type);
    //        }
    //        Write(EventSeverities.Error, type, xe.Message, xe.StackTrace, 0);
    //        if (xe is SqlException)
    //        {
    //            SqlException sqe = xe as SqlException;
    //            foreach (SqlError se in sqe.Errors)
    //            {
    //                string text = string.Format("SqlError: {0} [{1}: {4}, {3}, {2}]", se.Message, se.LineNumber, se.Source, se.Procedure, se.Server);
    //                Write(EventSeverities.Error, type, text, "", 0);
    //            }
    //        }
    //    }
    //    public void Write(string fmt, params object[] args)
    //    {
    //        string text = string.Format(fmt, args);
    //        Write(text);
    //    }
    //    public void Write(EventSeverities severity, string fmt, params object[] args)
    //    {
    //        string text = string.Format(fmt, args);
    //        Write(text, severity);
    //    }
    //    private void Write(string text, EventSeverities severity)
    //    {
    //        Write(severity, EventTypes.Application, text, "", 0);
    //    }
    //    private void Write(string text)
    //    {
    //        Write(EventSeverities.Information, EventTypes.Application, text, "", 0);
    //    }
    //    private void Write(EventSeverities severity, EventTypes type, string message, string stackTrace, int code)
    //    {
    //        Event e = new Event();
    //        e.EventSeverity = (int)severity;
    //        e.EventType = type.ToString();
    //        e.Message = message;
    //        e.StackTrace = stackTrace;
    //        e.EventCode = code;
    //        Write(e);
    //    }
    //    private void Write(Event e)
    //    {
    //        Log.Log4NetWrite(e);
    //        logInstance.LogEvent(e);
    //    }
    //}
    public class Log
    {
        public class Log4NetConfig
        {
            private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
            public static void Setup(string logFolder)
            {

                Hierarchy hierarchy = (Hierarchy)log4net.LogManager.GetRepository();
                PatternLayout patternLayout = new PatternLayout();
                patternLayout.ConversionPattern = "%date{ddMMMyy HH:mm:ss} [%02thread] %-5level %message%newline";
                patternLayout.ActivateOptions();

                RollingFileAppender roller = new RollingFileAppender();
                roller.AppendToFile = true;
                roller.File = logFolder + @"/";// @"%property{app_data}/Logs/";
                roller.Layout = patternLayout;
                roller.MaxSizeRollBackups = 10;
                roller.MaximumFileSize = "1GB";
                roller.RollingStyle = RollingFileAppender.RollingMode.Date;
                roller.DatePattern = @"yyyy-MM-dd.lo\g";
                roller.StaticLogFileName = false;

                roller.ActivateOptions();
                hierarchy.Root.AddAppender(roller);
                hierarchy.Root.Level = Level.Debug;
                hierarchy.Configured = true;
                CleanLogFolder(logFolder);
            }
            public static void CleanLogFolder(string logFolder)
            {
                int purgeInterval = 30;// ApplicationSettings.Key("RollingFilePurgeInterval", 30);
                DateTime purgeBefore = DateTime.Today.AddDays(-purgeInterval);
                foreach (string fileName in Directory.EnumerateFiles(logFolder).ToArray())
                {
                    try
                    {
                        string name = Path.GetFileName(fileName);
                        name = name.Split('.')[0];
                        //string name = Path.GetFileNameWithoutExtension(fileName);
                        string[] parts = name.Split('-');
                        DateTime dt = new DateTime(Convert.ToInt32(parts[0]), Convert.ToInt32(parts[1]), Convert.ToInt32(parts[2]));
                        if (dt < purgeBefore)
                        {
                            File.Delete(fileName);
                            log.InfoFormat("{0} deleted", Path.GetFileName(fileName));
                        }
                    }
                    catch { }
                }
            }
        }
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private static bool initialised;
        private static string logFolder;
        private static string applicationName = "";
        //private bool UseEventService = false;
        //private string EventServiceUri;
        //private PolarisClient pc;
        private Log()
        {

        }

        public static void SetLogFolder(string folder)
        {
            logFolder = folder;
        }
        public static void SetApplicationName(string name)
        {
            try
            {
                applicationName = name;
            }
            catch { }
        }
        public static void Debug(string fmt, params object[] args)
        {
            string text = args.Length > 0 ? string.Format(fmt, args) : fmt;
            Log4NetDebug(text);
        }
        public static void Trace(string fmt, params object[] args)
        {
            string text = args.Length > 0 ? string.Format(fmt, args) : fmt;
            Log4NetDebug(text);
        }
        public static void Write(string text)
        {
            Write(EventSeverities.Information, EventTypes.Application, text, "", 0);
        }
        public static void Write(string fmt, params object[] args)
        {
            string text = args.Length > 0 ? string.Format(fmt, args) : fmt;
            Write(text);
        }
        public static void Write(EventSeverities severity, string fmt, params object[] args)
        {
            string text =  args.Length > 0 ? string.Format(fmt, args) : fmt;
            Write(text, severity);
        }
        public static void Write(Exception xe, string fmt, params object[] args)
        {
            string text = args.Length > 0 ? string.Format(fmt, args) : fmt;
            text = string.Format("Exception {0}: {1}", xe.GetType().Name, text);
            Write(text, EventSeverities.Error);
            Write(xe);
        }
        public static void Write(Exception xe, EventTypes type = EventTypes.Application)
        {
            if (xe.InnerException != null)
            {
                Write(xe.InnerException, type);
            }
            Write(EventSeverities.Error, type, xe.Message, xe.StackTrace, 0);
            if (xe is SqlException)
            {
                SqlException sqe = xe as SqlException;
                foreach (SqlError se in sqe.Errors)
                {
                    string text = string.Format("SqlError: {0} [{1}: {4}, {3}, {2}]", se.Message, se.LineNumber, se.Source, se.Procedure, se.Server);
                    Write(EventSeverities.Error, type, text, "", 0);
                }
            }
        }
        public static void CallTrace()
        {
            const string fmt = "{0}::{1}() called";
            sd.StackFrame sf = new sd.StackFrame(1);
            MethodBase method = sf.GetMethod();
            System.Diagnostics.Debug.WriteLine(string.Format(fmt, method.DeclaringType.Name, method.Name));
        }
        public static void CallTrace(string text)
        {
            const string fmt = "{0}::{1}() called - {2}";
            sd.StackFrame sf = new sd.StackFrame(1);
            MethodBase method = sf.GetMethod();
            System.Diagnostics.Debug.WriteLine(string.Format(fmt, method.DeclaringType.Name, method.Name, text));
        }
        public static string GetAspInfo(Page page)
        {
            if (page != null)
            {
                string fmt = "postback={0}";
                string text = string.Format(fmt, page.IsPostBack);
                return text;
            }
            else
            {
                return "(no page)";
            }
        }
        private static void Write(string text, EventSeverities severity)
        {
            Write(severity, EventTypes.Application, text, "", 0);
        }
        private static void Write(EventSeverities severity, EventTypes type, string message, string stackTrace, int code)
        {
            Event e = new Event();
            e.EventSeverity = (int)severity;
            e.EventType = type.ToString();
            e.Message = message;
            e.StackTrace = stackTrace;
            e.EventCode = code;
            Write(e);


        }
        private static void Write(Event e)
        {
            if (string.IsNullOrEmpty(e.ApplicationName))
            {
                try
                {
                    e.ApplicationName = applicationName;

                    if (string.IsNullOrEmpty(e.ApplicationName) && HttpContext.Current != null)
                    {
                        if (HttpContext.Current.Request != null)
                        {
                            e.ApplicationName = HttpContext.Current.Request.Url.ToString();
                        }
                    }
                }
                catch { }
            }
            try
            {
                if (!initialised)
                {
                    Initialise();
                }
                Log4NetWrite(e);
                //if (ApplicationSettings.Key("CopyLogToDebugWindow", false))

                //{
                //    Print(e);
                //}
            }
            catch
            {
                //System.Diagnostics.Debug.Print("error skipped");
            }
        }

        private static void Print(Event e)
        {
            switch ((EventSeverities)e.EventSeverity)
            {
                case EventSeverities.Error:
                    sd.Debug.Print("[{0}:{1:000}] {2}{3}{4}", "Error", e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
                case EventSeverities.Fatal:
                    sd.Debug.Print("[{0}:{1:000}] {2}{3}{4}", "Fatal", e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
                case EventSeverities.Unknown:
                case EventSeverities.Information:
                    sd.Debug.Print("[{0}:{1:000}] {2}{3}{4}", "Info ",  e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
                case EventSeverities.Warning:
                    sd.Debug.Print("[{0}:{1:000}] {2}{3}{4}", "Warn ", e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
            }
        }

        private static void Initialise()
        {
            var dd = AppDomain.CurrentDomain.GetData("DataDirectory");
            string path = dd != null ? dd.ToString() : null;
            if (string.IsNullOrWhiteSpace(path))
            {
                if (logFolder != null)
                {
                    path = logFolder;
                }
                else
                {
                    Assembly assembly = Assembly.GetEntryAssembly() ?? Assembly.GetCallingAssembly();
                    string name = assembly != null ? assembly.GetName().Name : "Unknown";
                    path = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
                    path = Path.Combine(path, "Fastnet Event Logs", name);
                }
            }
            else
            {
                path = Path.Combine(path, "Logs");
            }
            Log4NetConfig.Setup(path);
            log.InfoFormat("[{0}] log4net setup using path {1}", sd.Process.GetCurrentProcess().Id, path);
            initialised = true;
        }
        private static EventData CreateEventData(Event e)
        {
            EventData ed = new EventData
            {
                ApplicationName = e.ApplicationName,
                //Code = e.Code,
                DomainName = e.DomainName,
                ExceptionType = e.ExceptionType,
                IPAddress = e.IPAddress,
                MachineName = e.MachineName,
                ProcessId = e.ProcessId,
                Message = e.Message,
                Sequence = e.Sequence,
                SessionId = e.SessionId,
                EventSeverity = (int)e.EventSeverity,
                StackTrace = e.StackTrace,
                ThreadId = e.ThreadId,
                //EventTime = e.DateTimeString,
                EventType = e.EventType.ToString(),
                Url = e.Url,
                UserName = e.UserName
            };
            return ed;
        }
        private static void Log4NetDebug(string text)
        {
            log.DebugFormat(text);
        }
        internal static void Log4NetWrite(Event e)
        {
            switch ((EventSeverities)e.EventSeverity)
            {
                case EventSeverities.Error:
                    log.ErrorFormat("[{0}] {2}{3}{4}", e.ProcessId, e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
                case EventSeverities.Fatal:
                    log.FatalFormat("[{0}] {2}{3}{4}", e.ProcessId, e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
                case EventSeverities.Unknown:
                case EventSeverities.Information:
                    log.InfoFormat("[{0}] {2}{3}{4}", e.ProcessId, e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
                case EventSeverities.Warning:
                    log.WarnFormat("[{0}] {2}{3}{4}", e.ProcessId, e.ThreadId, e.Message,
                        string.IsNullOrWhiteSpace(e.ExceptionType) ? "" : " " + e.ExceptionType,
                        string.IsNullOrWhiteSpace(e.StackTrace) ? "" : " " + e.StackTrace);
                    break;
            }
        }
    }

}


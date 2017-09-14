using Fastnet.EventSystem;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Tracing;

namespace Fastnet.Web.Common
{
    public class WebApiTracer : ITraceWriter
    {
        public void Trace(System.Net.Http.HttpRequestMessage request, string category, System.Web.Http.Tracing.TraceLevel level, Action<TraceRecord> traceAction)
        {
            TraceRecord rec = new TraceRecord(request, category, level);
            traceAction(rec);
            WriteTrace(rec);
        }
        protected void WriteTrace(TraceRecord rec)
        {
            try
            {
                string fmt = "webapi: [{0}:{1}:{2}] {3}";

                string text = string.Format(fmt, rec.Operator, rec.Operation, rec.Category, rec.Message);
                EventSeverities sev = mapSeverity(rec.Level);
                Log.Write(sev, text);
            }
            catch (Exception xe)
            {
                Log.Write(xe);
                //Debugger.Break();
                throw;
            }
        }

        private EventSeverities mapSeverity(System.Web.Http.Tracing.TraceLevel traceLevel)
        {
            switch (traceLevel)
            {
                default:
                    return EventSeverities.Information;
                case System.Web.Http.Tracing.TraceLevel.Error:
                    return EventSeverities.Error;
                case System.Web.Http.Tracing.TraceLevel.Fatal:
                    return EventSeverities.Fatal;
                case System.Web.Http.Tracing.TraceLevel.Warn:
                    return EventSeverities.Warning;
            }
        }
    }
}

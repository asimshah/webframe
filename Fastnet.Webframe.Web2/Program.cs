using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
//using Microsoft.ApplicationInsights.Extensibility;
//using Microsoft.ApplicationInsights.Extensibility.Implementation;
using Fastnet.Core.Web.Logging;

namespace Fastnet.Webframe.Web2
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //TelemetryConfiguration.Active.DisableTelemetry = true;
            //TelemetryDebugWriter.IsTracingDisabled = true;
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration(x =>
            {
                x.AddJsonFile("customisation.json", optional: true, reloadOnChange: false);
            })
            .ConfigureLogging(lb => lb.AddWebRollingFile())
                .UseStartup<Startup>()
                .Build();
    }
}

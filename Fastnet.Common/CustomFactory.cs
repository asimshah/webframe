using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Hosting;
using System.IO;
using Fastnet.Common;

namespace Fastnet.Web.Common
{
    public enum FactoryName
    {
        None,
        DonWhillansHut
    }
    public abstract class CustomFactory
    {
        public static FactoryName FactoryName { get; private set; }
        public static dynamic Settings { get; set; }
        static CustomFactory()
        {
            Settings = GetSettings();
            if (Settings != null)
            {
                string factory = Settings.factory ?? "None";
                FactoryName = (FactoryName)Enum.Parse(typeof(FactoryName), factory, true);
            }
            else
            {
                FactoryName = FactoryName.None;
            }
        }
        public CustomFactory()
        {
            ////string setting = ApplicationSettings.Key("Customisation:Factory", "None");
            //Settings = GetSettings();
            //if (Settings != null)
            //{
            //    string factory = Settings.factory ?? "None";
            //    FactoryName = (FactoryName)Enum.Parse(typeof(FactoryName), factory, true);
            //} else
            //{
            //    FactoryName = FactoryName.None;
            //}
        }
        private static dynamic GetSettings()
        {
            var customisationSettingsFile = ApplicationSettings.Key<string>("Customisation:Settings", null);
            if (customisationSettingsFile != null)
            {
                var customisationFile = HostingEnvironment.MapPath(string.Format("~/{0}", customisationSettingsFile));// "~/customisation.json");
                if (File.Exists(customisationFile))
                {
                    string text = File.ReadAllText(customisationFile);
                    return text.ToJsonDynamic();
                }
            }
            return null;
        }
    }

}

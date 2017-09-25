using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.Common2
{
    public enum FactoryName
    {
        None,
        DonWhillansHut
    }
    public abstract class CustomFactory : ICustomFactory
    {
        public FactoryName FactoryName { get; private set; }
        //public static dynamic Settings { get; set; }
        //static CustomFactory()
        //{
        //    Settings = GetSettings();
        //    if (Settings != null)
        //    {
        //        string factory = Settings.factory ?? "None";
        //        FactoryName = (FactoryName)Enum.Parse(typeof(FactoryName), factory, true);
        //    }
        //    else
        //    {
        //        FactoryName = FactoryName.None;
        //    }
        //}
        private readonly CustomisationOptions options;
        public CustomFactory(IOptions<CustomisationOptions> options)
        {
            this.options = options.Value;
            var name = this.options.factory ?? "None";
            this.FactoryName = (FactoryName)Enum.Parse(typeof(FactoryName), name, true);
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
        //private static dynamic GetSettings()
        //{
        //    var customisationSettingsFile = ApplicationSettings.Key<string>("Customisation:Settings", null);
        //    if (customisationSettingsFile != null)
        //    {
        //        var customisationFile = HostingEnvironment.MapPath(string.Format("~/{0}", customisationSettingsFile));// "~/customisation.json");
        //        if (File.Exists(customisationFile))
        //        {
        //            string text = File.ReadAllText(customisationFile);
        //            return text.ToJsonDynamic();
        //        }
        //    }
        //    return null;
        //}
    }
}

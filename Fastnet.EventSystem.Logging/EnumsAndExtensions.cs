namespace Fastnet.EventSystem
{
    //public class AppSettings
    //{
    //    public static bool Key(string name, bool defaultValue)
    //    {
    //        string valueSetting = System.Configuration.ConfigurationManager.AppSettings[name];
    //        if (valueSetting == null)
    //        {
    //            return defaultValue;
    //        }
    //        return Convert.ToBoolean(valueSetting);
    //    }
    //    public static string Key(string name, string defaultValue)
    //    {
    //        string valueSetting = System.Configuration.ConfigurationManager.AppSettings[name];
    //        if (valueSetting == null)
    //        {
    //            return defaultValue;
    //        }
    //        return valueSetting;
    //    }
    //    public static int Key(string name, int defaultValue)
    //    {
    //        string valueSetting = System.Configuration.ConfigurationManager.AppSettings[name];
    //        if (valueSetting == null)
    //        {
    //            return defaultValue;
    //        }
    //        return int.Parse(valueSetting);
    //    }
    //}
    public enum EventTypes
    {
        Unknown,
        Diagnostic,
        Application//,
        //SystemError,
        //VerboseDiagnostic
    }

    public enum EventSeverities
    {
        Unknown,
        Information,
        Warning,
        Error,
        Fatal
    }
}

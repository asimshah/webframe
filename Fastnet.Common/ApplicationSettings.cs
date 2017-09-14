using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace Fastnet.Common
{
    public static class ApplicationSettings
    {
        /// <summary>
        /// Get key value from current Application Settings
        /// </summary>
        /// <typeparam name="T">Type of value - probably a primitive type</typeparam>
        /// <param name="name">Key Name</param>
        /// <param name="defaultValue">Default value of key if not set in Application Settings</param>
        /// <returns></returns>
        public static T Key<T>(string name, T defaultValue)
        {
            string valueSetting = ConfigurationManager.AppSettings[name];
            if (valueSetting == null)
            {
                return defaultValue;
            }
            return TConverter.ChangeType<T>(valueSetting);
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;


namespace Fastnet.Common
{
    public static class Extensions
    {
        public static T Set<T>(this Enum value, T flag) 
        {
            return (T)(object)((int)(object)value | (int)(object)flag);
        }
        public static T Unset<T>(this Enum value, T flag)
        {
            return (T)(object)((int)(object)value & ~(int)(object)flag);
        }
        public static string GetDescription(this Enum value)
        {
            Type type = value.GetType();
            string name = Enum.GetName(type, value);
            if (name != null)
            {
                FieldInfo field = type.GetField(name);
                if (field != null)
                {
                    DescriptionAttribute attr =
                           Attribute.GetCustomAttribute(field,
                             typeof(DescriptionAttribute)) as DescriptionAttribute;
                    if (attr != null)
                    {
                        return attr.Description;
                    }
                }
            }
            return name;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="value">initial value</param>
        /// <param name="existingValues">list of strings that cannot be used</param>
        /// <param name="format">ensure that both {0} and {1} exist</param>
        /// <returns></returns>
        public static string MakeUnique(this string value, IEnumerable<string> existingValues, string format = "{0}{1}")
        {
            string fmt = value;// "New Group";
            int count = 1;
            bool finished = false;
            string result = fmt;
            do
            {
                if (!existingValues.Contains(result, StringComparer.InvariantCultureIgnoreCase))
                {
                    finished = true;
                }
                else
                {
                    result = string.Format(format, fmt, ++count);
                }
            } while (!finished);
            return result;
        }
        public static dynamic ToJsonDynamic(this string value)
        {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(value);
        }
        public static string ToDefault(this DateTime d)
        {
            return d.ToString("ddMMMyyyy");
        }
    }
}

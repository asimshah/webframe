using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel;

namespace Fastnet.Common
{
    //[Obsolete] // has been moved to Fastnet.dll
    public static class TConverter
    {
        public static T ChangeType<T>(object value)
        {
            return (T)ChangeType(typeof(T), value);
        }
        public static object ChangeType(Type t, object value)
        {
            TypeConverter tc = TypeDescriptor.GetConverter(t);
            if (tc.CanConvertTo(t))
            {
                return tc.ConvertTo(value, t);
            }
            else if (tc.CanConvertFrom(value.GetType()))
            {
                return tc.ConvertFrom(value);
            }
            throw new ApplicationException(string.Format("Cannot convert {0} to {1}", value.GetType().Name, t.Name));
        }
        public static void RegisterTypeConverter<T, TC>() where TC : TypeConverter
        {

            TypeDescriptor.AddAttributes(typeof(T), new TypeConverterAttribute(typeof(TC)));

        }

    }
}

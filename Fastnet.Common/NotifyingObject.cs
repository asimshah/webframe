using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace Fastnet.Common
{
    public abstract class NotifyingObject : INotifyPropertyChanged
    {
        private Dictionary<string, object> properties = new Dictionary<string, object>();
        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChangedEventHandler handler = PropertyChanged;
            if (handler != null)
            {
                handler(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        protected T Get<T>([CallerMemberName] string name = null)
        {
            Debug.Assert(name != null);
            object value = null;
            if (properties.TryGetValue(name, out value))
            {
                return value == null ? default(T) : (T)value;
            }
            return default(T);
        }
        protected void Set<T>(T value, [CallerMemberName] string name = null)
        {
            Debug.Assert(name != null);
            if (Equals(value, Get<T>(name)))
            {
                return;
            }
            properties[name] = value;
            OnPropertyChanged(name);
        }
        //protected bool SetField<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        //{
        //    if (EqualityComparer<T>.Default.Equals(field, value))
        //    {
        //        return false;
        //    }
        //    field = value;
        //    OnPropertyChanged(propertyName);
        //    return true;
        //}
    }
}

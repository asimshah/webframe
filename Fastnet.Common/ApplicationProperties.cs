using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Common
{
    public abstract class ApplicationProperties : NotifyingObject
    {
        private static ApplicationProperties _instance;
        [JsonIgnore]
        private string PropertyFile { get; set; }
        [JsonIgnore]
        private static bool _loading;// = true;
        protected static T Load<T>(string filename) where T : ApplicationProperties, new()
        {
            // ApplicationProperties instance = null;
            _loading = true;
            try
            {
                if (File.Exists(filename))
                {
                    string text = File.ReadAllText(filename);
                    _instance = JsonConvert.DeserializeObject<T>(text);
                }
                else
                {
                    string folder = Path.GetDirectoryName(filename);
                    if (!Directory.Exists(folder))
                    {
                        Directory.CreateDirectory(folder);
                    }
                    _instance = new T();
                }
                _instance.PropertyFile = filename;
                _instance.loading = false;
            }
            finally
            {
                _loading = false;
            }
            return (T)_instance;
        }
        public ApplicationProperties()
        {


        }
        protected bool loading { get { return _loading; }  set { _loading = value; } }
        protected override void OnPropertyChanged(string propertyName)
        {
            base.OnPropertyChanged(propertyName);
            Save();
        }
        public void Save()
        {
            if (!loading)
            {
                string text = JsonConvert.SerializeObject(this, Formatting.Indented);
                File.WriteAllText(PropertyFile, text);
            }
        }

    }
}

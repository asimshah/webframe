using Fastnet.Common;
using Fastnet.EventSystem;
using Fastnet.Web.Common;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace Fastnet.Web.Common
{
    public class TemplateLibrary //: CustomFactory !! add this when customisinig for DWH
    {
        private class TemplateFactory : CustomFactory
        {
            public string CustomTemplateFolder { get; private set; }
            public bool HasCustomFolder { get; private set; }
            public TemplateFactory()
            {
                if (FactoryName != FactoryName.None)
                {
                    CustomTemplateFolder = Settings.templateFolder;
                    HasCustomFolder = CustomTemplateFolder != null;
                }
                else
                {
                    HasCustomFolder = false;
                }
            }
        }
        private class Templates
        {
            // key = template name, value fullpath
            internal Dictionary<string, string> dict = new Dictionary<string, string>();
            public void Add(string name, string path)
            {
                if (dict.ContainsKey(name))
                {
                    dict[name] = path;
                }
                else
                {
                    dict.Add(name, path);
                }
            }
            public string Get(string name)
            {
                if (dict.ContainsKey(name))
                {
                    return dict[name];
                }
                return null;
            }
        }
        // key = location, value = list of templates
        private Dictionary<string, Templates> templatesByLocation = new Dictionary<string, Templates>();
        public static void ScanForTemplates()
        {
            Action<string> scan = (t) =>
            {
                var mainTemplateFolder = new DirectoryInfo(HostingEnvironment.MapPath("~/" + t));
                if (Directory.Exists(mainTemplateFolder.FullName))
                {
                    // location starts with "main"
                    LoadTemplateInfo(mainTemplateFolder);
                }
                var areasDi = new DirectoryInfo(HostingEnvironment.MapPath("~/Areas"));
                if (areasDi.Exists)
                {
                    foreach (DirectoryInfo di in areasDi.GetDirectories())
                    {
                        //Debug.Print("area {0} found", di.Name);
                        var tf = Path.Combine(di.FullName, t);
                        if (Directory.Exists(tf))
                        {
                            LoadTemplateInfo(new System.IO.DirectoryInfo(tf));
                        }
                    }
                }
            };
            scan("Templates");
            //LogTemplates();
            TemplateFactory tfac = new TemplateFactory();
            if (tfac.HasCustomFolder)
            {
                scan("CustomTemplates\\" + tfac.CustomTemplateFolder);
                //LogTemplates();
            }
        }
        public static TemplateLibrary GetInstance()
        {
            var app = HttpContext.Current.Application;
            if (app.Get("template-library") == null)
            {
                app.Set("template-library", new TemplateLibrary());
            }
            return app.Get("template-library") as TemplateLibrary;
        }
        private TemplateLibrary()
        {

        }
        public void AddTemplate(string location, string name, string path)
        {
            location = location.ToLower();
            name = name.ToLower();
            if (!templatesByLocation.ContainsKey(location))
            {
                templatesByLocation.Add(location, new Templates());
            }
            Templates templates = templatesByLocation[location];
            templates.Add(name, path);
        }
        public string GetTemplate(string location, string name)
        {
            FileInfo file;
            return GetTemplate(location, name, out file);
        }
        public string GetTemplate(string location, string name, out FileInfo file)
        {
            location = location.ToLower();
            name = name.ToLower();
            if (templatesByLocation.ContainsKey(location))
            {
                Templates templates = templatesByLocation[location];
                string text = ReadText(templates.Get(name), out file);
                return text;
            }
            file = null;
            return null;
        }
        private static string ReadText(string fn, out FileInfo file)
        {
            if (fn != null)
            {
                file = new FileInfo(fn);
                return File.ReadAllText(file.FullName);
            }
            else
            {
                file = null;
                return string.Empty;
            }
        }
        private static void LoadTemplateInfo(DirectoryInfo templateFolder)
        {
            try
            {
                var templateLibrary = TemplateLibrary.GetInstance();
                Action<string, System.IO.DirectoryInfo> findHtmlFiles = (location, di) =>
                {
                    var files = di.EnumerateFiles("*.html");
                    foreach (System.IO.FileInfo file in files)
                    {
                    //Debug.Print("Add location {0}, file {1}", location, System.IO.Path.GetFileNameWithoutExtension(file.Name));
                    templateLibrary.AddTemplate(location, System.IO.Path.GetFileNameWithoutExtension(file.Name), file.FullName);
                    }
                };
                string[] tfParts = templateFolder.FullName.Split('\\');
                string appName = "main";
                if(tfParts.Contains("Areas"))
                {
                    appName = tfParts.SkipWhile(x => x != "Areas").Skip(1).First().ToLower();
                }
                //if (string.Compare(templateFolder.Parent.Parent.Name, "Areas", true) == 0)
                //{
                //    appName = templateFolder.Parent.Name.ToLower();
                //}
                
                findHtmlFiles(appName, templateFolder);
                var directories = templateFolder.EnumerateDirectories("*", System.IO.SearchOption.AllDirectories);
                foreach (System.IO.DirectoryInfo dir in directories)
                {
                    string[] dirParts = dir.FullName.Split('\\');
                    string temp = string.Join("-", dirParts.Skip(tfParts.Length).ToArray()).ToLower();
                    string location = string.Format("{0}-{1}", appName, temp);
                    //string location = appName + "-" + dir.FullName.Substring(dir.FullName.ToLower().IndexOf("templates\\") + 10);
                    //location = location.Replace("\\", "-").ToLower();
                    //Debug.Print("Old: {0}, new: {1}", location, location2);
                    findHtmlFiles(location, dir);
                }
            }
            catch (Exception xe)
            {
                Log.Write(xe);
                //Debugger.Break();
                throw;
            }

        }
        private static void LogTemplates()
        {
            var templateLibrary = TemplateLibrary.GetInstance();
            foreach (var entry in templateLibrary.templatesByLocation)
            {
                string location = entry.Key;
                Templates templates = entry.Value;
                foreach (var te in templates.dict)
                {
                    string name = te.Key;
                    var template = te.Value;
                    Debug.Print("Template: location {0}, Name {1}, Template {2}", location, name, template);
                }
            }
        }
    }
}

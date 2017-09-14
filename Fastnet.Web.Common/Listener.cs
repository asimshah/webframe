using Fastnet.Common;
using Fastnet.EventSystem;
using Microsoft.AspNet.SignalR.Client;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Web.Common
{
    public class Listener
    {
        private static bool traceConnections = ApplicationSettings.Key("MessageHub:TraceConnections", false);
        private static bool traceMessages = ApplicationSettings.Key("MessageHub:TraceMessages", false);
        private static Dictionary<string, ListenerConnection> listeners = new Dictionary<string, ListenerConnection>();
        private class ListenerConnection
        {
            public string Url { get; set; }
            public string Name { get; set; }
            public string ConnectionId { get; set; }
            public HubConnection HubConnection { get; set; }
            public IHubProxy Proxy { get; set; }
        }
        private ListenerConnection _listener;
        public Listener()
        {
        }
        public async Task Connect(string url, string name)
        {
            if (!listeners.ContainsKey(url))
            {
                var connection = new HubConnection(url);
                ListenerConnection lc = new ListenerConnection
                {
                    Url = url,
                    Name = name,
                    HubConnection = connection,
                    Proxy = connection.CreateHubProxy("MessageHub")
                };
                listeners.Add(url, lc);
                await lc.HubConnection.Start();
                await lc.Proxy.Invoke("Register", new { name = name, connectionId = lc.HubConnection.ConnectionId, clientType = "DotNet" });
                if (traceConnections)
                {
                    Log.Write("Listener connected to {0}, {1} (connectionId {2})", url, name, lc.HubConnection.ConnectionId);
                }
            }
            _listener = listeners[url];
        }
        public IDisposable Add(Action<dynamic> onNotification)
        {
            return _listener.Proxy.On<dynamic>("receiveMessage", data =>
            {
                string ident = data.Ident;
                if (ident == "MessageHubInformation")
                {
                    JsonSerializerSettings settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };
                    //Testy tt = JsonConvert.DeserializeObject<Testy>(data.ToString());
                    //string connectionId = data.ConnectionId;
                    MessageHubInformation mhi = JsonConvert.DeserializeObject<MessageHubInformation>(data.ToString(), settings);
                    Log.Write("Listener recd: {0}", mhi.ToString());
                    MessageHubInformation wrapper = new MessageHubInformation();
                    wrapper.InnerMessage = mhi;
                    wrapper.Send();
                }
                else
                {
                    if (traceMessages)
                    {
                        string connectionId = data.ConnectionId;
                        int index = data.Index;
                        string machine = data.Machine;
                        int processId = data.ProcessId;
                        switch (ident)
                        {
                            default:
                                Log.Write("connection {0} recd {1}({2}) from {3}:{4}",
                                     connectionId, ident, index, machine, processId);
                                break;
                        }

                    }
                    onNotification(data);
                }
            });
        }
        public IDisposable Add<T>(Action<T> onNotification)
        {
            return Add(onNotification);
            //return _listener.Proxy.On<T>("receiveMessage", data => onNotification(data));
        }
        //private async Task Start()
        //{            
        //    await connection.Start();
        //}
    }
}

using Fastnet.Common;
using Fastnet.EventSystem;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Web.Common
{
    public static class HubRegister
    {
        public enum ClientType
        {
            Browser,
            DotNet
        }
        public class HubClient
        {
            public string ConnectionId { get; set; }
            public ClientType ClientType { get; set; }
            public string Name { get; set; }
        }
        public static Dictionary<string, HubClient> Connections = new Dictionary<string, HubClient>();
    }
    public class MessageHub : Hub
    {
        private static bool traceConnections = ApplicationSettings.Key("MessageHub:TraceConnections", false);
        public static void Initialise()
        {
            if (ApplicationSettings.Key("MessageHub:SendInformationMessages", false))
            {
                int interval = 2;
                Log.Write("MessageHub: starting MessageHubInformation every {0} seconds", interval);
                Task.Run(async () =>
                {
                    //int count = 100;
                    var delay = TimeSpan.FromSeconds(interval);
                    while (true)
                    {
                        await Task.Delay(delay);
                        MessageHubInformation mhi = new MessageHubInformation();
                        mhi.Send();
                    }
                });
            }
        }
        public override Task OnConnected()
        {
            if (traceConnections)
            {
                Log.Write("MessageHub::OnConnected() {0}", this.Context.ConnectionId);
            }
            //Debug.Print("MessageHub: OnConnected - {0}", this.Context.ConnectionId);
            return base.OnConnected();
        }
        public override Task OnDisconnected(bool stopCalled)
        {
            if (traceConnections)
            {
                Log.Write("MessageHub::OnDisconnected() {0}", this.Context.ConnectionId);
            }
            //Debug.Print("MessageHub: OnDisconnected - {0}", this.Context.ConnectionId);
            if (HubRegister.Connections.ContainsKey(this.Context.ConnectionId))
            {
                HubRegister.Connections.Remove(this.Context.ConnectionId);
            }
            return base.OnDisconnected(stopCalled);
        }
        public override Task OnReconnected()
        {
            if (traceConnections)
            {
                Log.Write("MessageHub::OnReconnected() {0}", this.Context.ConnectionId);
            }
            //Debug.Print("MessageHub: OnReconnected - {0}", this.Context.ConnectionId);
            return base.OnReconnected();
        }
        public void Register(dynamic data)
        {
            string connectionId = data.connectionId;
            string clientType = data.clientType;
            string name = data.name;
            HubRegister.ClientType ct = (HubRegister.ClientType)Enum.Parse(typeof(HubRegister.ClientType), clientType, true);
            var client = new HubRegister.HubClient { Name = name, ConnectionId = connectionId, ClientType = ct };
            HubRegister.Connections.Add(connectionId, client);
            if (traceConnections)
            {
                Log.Write("MessageHub::Register() client {0} registered: {1}, {2} [total now {3}]", connectionId, clientType, name, HubRegister.Connections.Count());
            }
        }
    }
}

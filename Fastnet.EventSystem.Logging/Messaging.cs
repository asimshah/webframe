using System;
using System.Collections.Generic;
using System.Configuration;
using System.Text;
using System.Messaging;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Diagnostics;

namespace Fastnet.EventSystem
{
    /// <summary>
    /// Utility class for sending and receiving data (<see cref="Packet"/>) using multicast MessageQueues.
    /// </summary>
    public class Messaging
    {
        private const string messageQueueFormat = @".\Private$\{0}";
        //private PerformanceCounter waitingBroadcast;
        //private PerformanceCounter broadcast;
        //private PerformanceCounter received;
        //private PerformanceCounter waitingProcessing;
        private class StateObject
        {
            //public const int BufferSize = 8192;
            //public byte[] buffer = new byte[BufferSize];
            public PacketQueue dataQueue;
            //public AutoResetEvent signal;
            public bool StopRequest = false;
            public MessageQueue messageQueue;
            public bool StopComplete;
        }
        private string multicastAddress = "230.0.0.1";
        private int multicastPort = 8899;
        private MessageQueue sendQueue;
        private Thread sender;
        StateObject sendState;
        StateObject receiveState;
        /// <summary>
        /// Simple constructor. Uses default multicast address 230.0.0.1 and default multicast port 8899.
        /// </summary>
        public Messaging()
        {

        }
        /// <summary>
        /// Initialise using the specified multicast address and port.
        /// </summary>
        /// <param name="multicastAddress">The multicast address to use - must be 230.*.*.*</param>
        /// <param name="multicastPort">The port to use.</param>
        public Messaging(string multicastAddress, int multicastPort)
        {
            this.multicastAddress = multicastAddress;
            this.multicastPort = multicastPort;
        }
        /// <summary>
        /// Initialise using the default multicast address 230.0.0.1 and the specified port.
        /// </summary>
        /// <param name="multicastPort">The port to use.</param>
        public Messaging(int multicastPort)
        {
            this.multicastPort = multicastPort;
        }
        /// <summary>
        /// Initialise using the default port 8899 and the specified multicast address.
        /// </summary>
        /// <param name="multicastAddress">The multicast address to use - must be 230.*.*.*</param>
        public Messaging(string multicastAddress)
        {
            this.multicastAddress = multicastAddress;
        }
        /// <summary>
        /// Clean up if instnce is destroyed
        /// </summary>
        ~Messaging()
        {
            if (receiveState != null)
            {
                if (receiveState.messageQueue != null)
                {
                    if (MessageQueue.Exists(receiveState.messageQueue.Path))
                    {
                        //receiveState.messageQueue.SetPermissions("Everyone", MessageQueueAccessRights.GenericRead | MessageQueueAccessRights.GenericWrite);
                        //receiveState.messageQueue.SetPermissions("Domain Admins", MessageQueueAccessRights.FullControl);
                        //receiveState.messageQueue.SetPermissions("BUILTIN\\Administrators", MessageQueueAccessRights.FullControl);
                        //receiveState.messageQueue.Purge();
                        MessageQueue.Delete(receiveState.messageQueue.Path);
                    }
                }
            }
        }
        /// <summary>
        /// Start the sending thread using the provided <see cref="PacketQueue"/>.
        /// </summary>
        /// <param name="dataQueue">The <see cref="PacketQueue"/> to use.</param>
        /// <remarks>
        /// As items are placed on the specified <see cref="PacketQueue"/>, they will be automatically de-queued and sent
        /// over the specified multicast address and port. Sending proceeds until such time as <see cref="StopSend"/> is called.
        /// </remarks>
        public void StartSend(PacketQueue dataQueue)
        {
            try
            {
                //int pid = Process.GetCurrentProcess().Id;
                //Instrumentation.SetupBroadcastingCounters();
                //waitingBroadcast = Instrumentation.CreateCounter(Instrumentation.EventCounters.WaitingToBroadcast, pid);
                //broadcast = Instrumentation.CreateCounter(Instrumentation.EventCounters.Broadcast, pid);

                sendState = new StateObject();
                sendState.dataQueue = dataQueue;
                //sendState.signal = signal;
                //string mqPath = string.Format(messageQueueFormat, "S" + pid.ToString());
                sendState.messageQueue = new MessageQueue("FormatName:MULTICAST=" + multicastAddress + ":" + multicastPort);
                sendState.messageQueue.SetPermissions("Everyone", MessageQueueAccessRights.FullControl);
                sendState.messageQueue.Formatter = new BinaryMessageFormatter();
                sender = new Thread(new ParameterizedThreadStart(Send));
                sender.Start(sendState);
            }
            catch (Exception xe)
            {
                Debug.WriteLine(xe.Message);
                EventLog.WriteEntry("EventLogging", xe.Message);
                throw xe;
            }
        }
        /// <summary>
        /// Causes sending to be stopped.
        /// </summary>
        public void StopSend()
        {
            sendState.StopRequest = true;
        }
        /// <summary>
        /// Start receiving Packets.
        /// </summary>
        /// <param name="dataQueue">The <see cref="PacketQueue"/> on which received packets will be placed.</param>
        /// <remarks>
        /// As packets are received on the specified multicast address and port, they are placed at the end of the specified
        /// <see cref="PacketQueue"/>. Use the <see cref="PacketQueue.Dequeue"/> method of the <see cref="PacketQueue"/> to read the Packets.
        /// <para>Receiving will continue until <see cref="StopReceive"/> is called.</para>
        /// <para>A multicast queue is created automatically. Creation of this queue is reported to the Windows EventLog. The calling process credentials will be used to create the queue. If this queue is left "orphaned" - due to an error, or becuase the process was killed in an abnormal way
        /// then take ownership of the queue to delete it. The queue name includes the calling process' processId.</para>
        /// </remarks>
        public void StartReceive(PacketQueue dataQueue)
        {
            try
            {
                int pid = Process.GetCurrentProcess().Id;

                receiveState = new StateObject();
                receiveState.dataQueue = dataQueue;
                string mqPath = string.Format(messageQueueFormat, "R" + pid.ToString());
                string queueName = ConfigurationManager.AppSettings["ReceiveQueue"];
                if (queueName != null)
                {
                    mqPath = string.Format(messageQueueFormat, queueName);
                }
                if (MessageQueue.Exists(mqPath))
                {
                    receiveState.messageQueue = new MessageQueue(mqPath);
                }
                else
                {
                    receiveState.messageQueue = MessageQueue.Create(mqPath);
                    //receiveState.messageQueue.SetPermissions("Everyone", MessageQueueAccessRights.GenericRead | MessageQueueAccessRights.GenericWrite);
                    receiveState.messageQueue.SetPermissions("Everyone", MessageQueueAccessRights.FullControl);
                    receiveState.messageQueue.SetPermissions("BUILTIN\\Administrators", MessageQueueAccessRights.FullControl);
                    EventLog.WriteEntry("EventRecordingService", "Created private queue " + mqPath);
                    receiveState.messageQueue.Formatter = new BinaryMessageFormatter();
                    receiveState.messageQueue.MulticastAddress = multicastAddress + ":" + multicastPort;
                }
                receiveState.messageQueue.ReceiveCompleted += new ReceiveCompletedEventHandler(messageQueue_ReceiveCompleted);

                Receive(receiveState);
            }
            catch (Exception xe)
            {
                Debug.WriteLine(xe.Message);
                EventLog.WriteEntry("EventRecordingService", "Error: " + xe.Message, EventLogEntryType.Error);
                throw xe;
            }
        }
        /// <summary>
        /// Receive Handler for the underlying MessageQueue. Internal use only.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void messageQueue_ReceiveCompleted(object sender, ReceiveCompletedEventArgs e)
        {
            MessageQueue queue = (MessageQueue)sender;
            try
            {
                //Debug.WriteLine(e.AsyncResult.IsCompleted + ", " + e.Message == null ? "null" : "not null");

                Message msg = queue.EndReceive(e.AsyncResult);
                Packet p = msg.Body as Packet;
                receiveState.dataQueue.Enqueue(p);
            }
            catch (Exception xe)// exception will be a timeout
            {
                Debug.WriteLine("messageQueue_ReceiveCompleted exception: " + xe.Message);
            }
            if (receiveState.StopRequest == false)
            {
                Receive(receiveState);
                //queue.BeginReceive(new TimeSpan(0, 0, 0, 0, 3000));
            }
            else
            {
                string mqPath = receiveState.messageQueue.Path;
                MessageQueue.Delete(mqPath);
                EventLog.WriteEntry("EventRecordingService", "Removed private queue " + mqPath);
                receiveState.StopComplete = true;
            }
        }
        /// <summary>
        /// Stop receiving Packets.
        /// </summary>
        /// <remarks>The multicast queue used for receiving Packets will be deleted.</remarks>
        public void StopReceive()
        {
            receiveState.StopComplete = false;
            receiveState.StopRequest = true;
            while (receiveState.StopComplete == false)
            {
                Thread.Sleep(100);
            }

        }
        /// <summary>
        /// Initiates the receive cycle.
        /// </summary>
        /// <param name="state"></param>
        private void Receive(StateObject state)
        {
            try
            {
                //IPEndPoint LocalIPEndPoint = new
                //IPEndPoint(IPAddress.Any, multicastPort);
                //EndPoint LocalEndPoint = (EndPoint)LocalIPEndPoint;


                // Begin receiving the data from the remote device. 

                //UDPReceiveSocket.BeginReceiveFrom(state.buffer, 0, StateObject.BufferSize, 0,
                //    ref LocalEndPoint, new AsyncCallback(ReceiveCallback), state);
                state.messageQueue.BeginReceive(new TimeSpan(0, 0, 0, 0, 3000));

            }
            catch (Exception xe)
            {
                Debug.WriteLine(xe.Message);
                EventLog.WriteEntry("EventLogging", xe.Message);
                throw xe;
            }
        }
        /// <summary>
        /// This is the entry point for the sending thread.
        /// </summary>
        /// <param name="state">Internal state object.</param>
        /// <remarks>
        /// The send thread will continue to send items placed on the <see cref="PacketQueue"/> specified during the <see cref="StartSend"/>
        /// call until <see cref="StopSend"/> is called.
        /// <para>A check is made to see if StopSend has been called every 100 milliseconds.</para>
        /// <para>If <see cref="StopSend"/> is called when there are items unsent in the queue, an event is written to the Windows EventLog.</para>
        /// </remarks>
        private void Send(object state)
        {
            try
            {
                StateObject so = (StateObject)state;
                try
                {
                    while (so.StopRequest == false)
                    {
                        //waitingBroadcast.RawValue = so.dataQueue.Count;
                        Packet p = so.dataQueue.Dequeue(100);
                        if (p != null)
                        {
                            try
                            {
                                sendState.messageQueue.Send(p);
                            }
                            catch //(InvalidOperationException ioe)
                            {
                                //this can occur when Message Queue is not installed
                                // one case I allow is when the current machine is an ISA server
                                // 'cos I can't get MSMQ installed on it!!
                                //EventLog.WriteEntry("EventLogging", xe.GetType().Name);
                                Event ev = p as Event;
                                if (ev != null)
                                {
                                    EventLog.WriteEntry("EventLogging", ev.Message);
                                }
                            }
                            //broadcast.Increment();
                        }
                        //so.signal.WaitOne(100, false);
                        //if (so.dataQueue.Count > 0)
                        //{
                        //    waitingBroadcast.RawValue = so.dataQueue.Count;
                        //    Packet p = so.dataQueue.Dequeue();
                        //    //byte[] data = p.GetBytes();
                        //    sendState.messageQueue.Send(p);
                        //    broadcast.Increment();
                        //}
                    }
                }
                catch (Exception xe)
                {
                    Debug.WriteLine(xe.Message);
                    EventLog.WriteEntry("EventLogging", xe.Message);
                    throw xe;
                }
                if (so.dataQueue.Count > 0)
                {
                    string msgFmt = "Process {0}: Broadcast stopped with {1} pending - messages will probably be lost";
                    EventLog.WriteEntry("EventRecordingService", string.Format(msgFmt,
                        Process.GetCurrentProcess().Id, so.dataQueue.Count), EventLogEntryType.Warning);
                }
            }
            catch (Exception xe)
            {
                Debug.WriteLine(xe.Message);
                EventLog.WriteEntry("EventLogging", xe.Message);
                throw xe;
            }
            finally
            {
                //waitingBroadcast.RemoveInstance();
                //broadcast.RemoveInstance();
            }
        }
        //private void SendCallback(IAsyncResult ar)
        //{
        //    try
        //    {
        //        // Retrieve the socket from the state object. 
        //        Socket client = (Socket)ar.AsyncState;

        //        // Complete sending the data to the remote device. 
        //        int bytesSent = client.EndSendTo(ar);

        //    }
        //    catch (Exception xe)
        //    {
        //        EventLog.WriteEntry("EventSystem", xe.Message);
        //        Debug.WriteLine(xe.Message);
        //        throw xe;
        //    }
        //}

        internal void Send(Event e)
        {
            try
            {
                if (sendQueue == null)
                {
                    sendQueue = new MessageQueue("FormatName:MULTICAST=" + multicastAddress + ":" + multicastPort);
                    sendQueue.Formatter = new BinaryMessageFormatter();

                }
                sendQueue.Send(e);
                //Debug.Print("Sent: {0}", e.ToString());
            }
            catch (Exception xe)
            {
                EventLog.WriteEntry("EventLogging", xe.Message, EventLogEntryType.Error);
            }
        }
    }
}

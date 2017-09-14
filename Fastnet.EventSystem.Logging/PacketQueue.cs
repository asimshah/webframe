using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace Fastnet.EventSystem
{
    /// <summary>
    /// A queue of Packets for use by <see cref="Messaging"/>.
    /// </summary>
    /// <remarks>
    /// This class uses <see cref="Queue"/> and implements both thread safety and thread synchronisation between
    /// <see cref="Enqueue"/> and <see cref="Dequeue"/> operations. Dequeue will wait for an item to be available to de-queue - Enqueue
    /// will signal that an item has been added to the queue.
    /// </remarks>
    public class PacketQueue
    {
        private AutoResetEvent signal;
        private object syncRoot = new object();
        Queue<Packet> queue;
        /// <summary>
        /// Simple constructor.
        /// </summary>
        public PacketQueue()
        {
            queue = new Queue<Packet>();
            signal = new AutoResetEvent(false);
        }
        /// <summary>
        /// Queue a <see cref="Packet"/> and signal <see cref="Dequeue"/>.
        /// </summary>
        /// <param name="item">the <see cref="Packet"/> to add to the queue.</param>
        public void Enqueue(Packet item)
        {
            lock (syncRoot)
            {
                queue.Enqueue(item);
            }
            signal.Set();
        }
        /// <summary>
        /// Get a <see cref="Packet"/> from the queue.
        /// </summary>
        /// <param name="timeout">The timeout period, in milliseconds, to wait for an item to be put on the queue. use -1 to wait indefinitely.</param>
        /// <returns>The <see cref="Packet" which is first in the queue, or possibly null./></returns>
        /// <remarks>If at least one item already exists in the queue, the first item is immediately returned.
        /// If the queue is empty, then wait for the timeout period or a signal whichver is first. If an item is one the after the wait, return the first item, otherwise return null.</remarks>
        public Packet Dequeue(int timeout)
        {
            Packet item = null;
            lock (syncRoot)
            {
                if (queue.Count > 0)
                {
                    item = queue.Dequeue();
                }
            }
            if (item == null)
            {
                signal.WaitOne(timeout, false);
                lock (syncRoot)
                {
                    if (queue.Count > 0)
                    {
                        item = queue.Dequeue();
                    }
                }
            }
            return item;
        }
        /// <summary>
        /// The number of items in the queue.
        /// </summary>
        public int Count
        {
            get { return queue.Count; }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.EventSystem
{
    /// <summary>
    /// Base class for all data that can be sent using <see cref="Messaging"/>.
    /// </summary>
    [Serializable]
    public abstract class Packet
    {
    }
    /// <summary>
    /// Class for using <see cref="Messaging"/> with byte arrays, i.e. arbitrary data.
    /// </summary>
    /// <remarks>
    /// There are no helper classes to uwe with RawData - avoid using this if possible.
    /// </remarks>
    [Serializable]
    public class RawData : Packet
    {
        private byte[] data;

        /// <summary>
        /// Simple constructor.
        /// </summary>
        public RawData()
        {
        }
        /// <summary>
        /// The raw data itself.
        /// </summary>
        public byte[] Data
        {
            get { return data; }
            set { data = value; }
        }
        /// <summary>
        /// Simple constructor with a data array parameter.
        /// </summary>
        /// <param name="data">The raw data itself</param>
        public RawData(byte[] data)
        {
            this.data = data;
        }
        //public override byte[] GetBytes()
        //{
        //    return data;
        //}
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public class BookingGlobals
    {
        public static DateTime GetToday()
        {
            //bool rollManually = Settings.bookingApp.rollDayManually;
            //if (rollManually)
            //{
            //    return new DateTime(2015, 9, 6);// DateTime.Today;// for now
            //}
            //else
            //{
            //    return DateTime.Today;
            //}
            return DateTime.Today;
        }
    }
}

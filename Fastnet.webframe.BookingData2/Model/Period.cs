using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.BookingData2
{
    public class LongSpan
    {
        public int Days { get; set; }
        public int Months { get; set; }
        public int Years { get; set; }
    }
    public class Period
    {
        public Period()
        {
            //Interval = new LongSpan();
        }
        public long PeriodId { get; set; }

        [ForeignKey("ParentPeriod_PeriodId")]
        public virtual Period ParentPeriod { get; set; }
        public PeriodType PeriodType { get; set; }

        [ForeignKey("PriceStructure_PriceStructureId")]
        public virtual PriceStructure PriceStructure { get; set; }
        public DateTime? StartDate { get; set; } // must be non-null if PeriodType == Fixed
        public DateTime? EndDate { get; set; } // endless if null, if PeriodType == fixed
        public DaysOfTheWeek DaysOfTheWeek { get; set; } // if PeriodType == DaysInWeek
        internal int Interval_Days { get; set; }
        internal int Interval_Months { get; set; }
        internal int Interval_Years { get; set; }

        public bool Includes(DateTime day)
        {
            bool result = false;
            switch (PeriodType)
            {
                case PeriodType.Fixed:
                    result = day >= StartDate && (EndDate == null || day <= EndDate);
                    break;
                case PeriodType.Rolling:
                    DateTime today = DateTime.Today;// BookingGlobals.GetToday();
                    DateTime endDate = GetRollingEndDate(today);// today.AddYears(Interval.Years).AddMonths(Interval.Months).AddDays(Interval.Days);
                    result = day >= today && day <= endDate;
                    break;
                case PeriodType.DaysInWeek:
                    int dn = (int)day.DayOfWeek; // Sunday is dn 0
                    dn = 1 << dn;
                    DaysOfTheWeek dtw = (DaysOfTheWeek)dn;
                    result = DaysOfTheWeek.HasFlag(dtw);
                    break;
            }
            return result;
        }
        public DateTime GetStartDate()
        {
            return this.StartDate ?? DateTime.Today;// BookingGlobals.GetToday();
        }
        public DateTime GetEndDate()
        {
            DateTime result = DateTime.Today;// BookingGlobals.GetToday();
            switch (PeriodType)
            {
                case PeriodType.Fixed:
                    result = this.EndDate ?? DateTime.MaxValue;
                    break;
                case PeriodType.Rolling:
                    result = GetRollingEndDate();
                    break;
            }
            return result;
        }
        public DateTime GetRollingEndDate()
        {
            Debug.Assert(PeriodType == PeriodType.Rolling);
            DateTime today = DateTime.Today;// BookingGlobals.GetToday();
            return GetRollingEndDate(today);
        }
        public DateTime GetRollingEndDate(DateTime relativeTo)
        {
            Debug.Assert(PeriodType == PeriodType.Rolling);
            if (Interval.Years == 0 && Interval.Months == 0 && Interval.Days == 0)
            {
                return DateTime.MaxValue;
            }
            DateTime endDate = relativeTo.AddYears(Interval.Years).AddMonths(Interval.Months).AddDays(Interval.Days).AddDays(-1);
            return endDate;
        }
        public TimeSpan GetDuration()
        {
            TimeSpan ts = this.GetEndDate() - this.GetStartDate();
            return ts;
        }
        public virtual ICollection<Period> Subperiods { get; set; }
        public long? PriceStructure_PriceStructureId { get; set; }
        public long? ParentPeriod_PeriodId { get; set; }

        [NotMapped]
        public LongSpan Interval // if PeriodType == Rolling, if LongSpan is all zeroes then thsi is an indefinite period
        {
            get
            {
                return new LongSpan
                {
                    Days = this.Interval_Days,
                    Months = this.Interval_Months,
                    Years = this.Interval_Years
                };
            }
        }
    }
}

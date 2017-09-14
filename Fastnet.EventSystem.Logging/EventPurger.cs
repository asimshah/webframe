using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Threading;

namespace Fastnet.EventSystem
{
    /// <summary>
    /// A class to purge Events from the database.
    /// </summary>
    /// <remarks>
    /// This class is used by the Event Recording Service to periodically purge Events from the database.
    /// No separate use of this class is required (or recommended!).
    /// </remarks>
    internal class EventPurger
    {
        private bool stopRequested;
        private bool stopCompleted;
        //private EventLog eventLog;
        private Thread purger;
        private string connectionString;
        private DateTime timeLastPurged;
        private TimeSpan purgeFrequency;
        //private TimeSpan purgeInterval;
        private bool trace = false;
        /// <summary>
        /// Creates a new instance of this class.
        /// </summary>
        /// <remarks>
        /// The following information is read from the config file:
        /// <list type="table">
        /// <listheader>
        /// <term>Config Item</term>
        /// <term>Description</term>
        /// </listheader>
        /// <item>
        /// <term>EventDatabase</term>
        /// <description>a ConnectionString for the database.</description>
        /// </item>
        /// <item>
        /// <term>Trace</term>
        /// <description>True or False. Default is False.</description>
        /// </item>
        /// <item>
        /// <term>PurgeFrequency</term>
        /// <description>In whole numbers of minutes. Default is 60.</description>
        /// </item>
        /// </list>
        /// </remarks>
        public EventPurger()
        {
            //this.eventLog = eventLog;
            connectionString = @"Data Source=.\SqlExpress;Initial Catalog=Events;Integrated Security=True;Connection Timeout=60";
            System.Configuration.Configuration config =
                ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            if (config.ConnectionStrings.ConnectionStrings["EventDatabase"] != null)
            {
                connectionString = config.ConnectionStrings.ConnectionStrings["EventDatabase"].ToString();
            }
            purgeFrequency = new TimeSpan(1, 0, 0);
            //purgeInterval = new TimeSpan(7, 0, 0, 0);

            timeLastPurged = DateTime.Now - new TimeSpan(7, 0, 0, 0); // so that it will always purge on start up
            if (config.AppSettings.Settings["Trace"] != null)
            {
                trace = bool.Parse(config.AppSettings.Settings["Trace"].Value);
            }
            if (config.AppSettings.Settings["PurgeFrequency"] != null) // in minutes
            {
                purgeFrequency = TimeSpan.FromMinutes(int.Parse(config.AppSettings.Settings["PurgeFrequency"].Value));
            }
            //if (config.AppSettings.Settings["PurgeInterval"] != null) // in hours
            //{
            //    purgeInterval = TimeSpan.FromHours(int.Parse(config.AppSettings.Settings["PurgeInterval"].Value));
            //    //multicastPort = int.Parse(config.AppSettings.Settings["MulticastPort"].Value);
            //}

        }
        /// <summary>
        /// Perform a purge of Events for each application in turn.
        /// </summary>
        private void DoPurge()
        {

            if ((timeLastPurged + purgeFrequency) < DateTime.Now)
            {
                string[] names = GetApplications();
                foreach (string s in names)
                {
                    PurgeApplication(s);
                }
                timeLastPurged = DateTime.Now;
                ReportDatabaseTotal();
            }
        }
        private void ReportDatabaseTotal()
        {
            string sql = @"select count(*) from Events";
            SqlCommand cmd = new SqlCommand(sql);
            SqlConnection connection = GetSqlConnection();//new SqlConnection(this.connectionString);
            try
            {
                connection.Open();
                cmd.Connection = connection;
                int count = (int)cmd.ExecuteScalar();
                string msg = string.Format("Event database now has {0} records in total", count);
                EventLog.WriteEntry("EventRecordingService", msg, EventLogEntryType.Information);
            }
            finally
            {
                connection.Close();
                cmd.Dispose();

            }

        }
        /// <summary>
        /// Purge Events from the database for the application name provided.
        /// </summary>
        /// <param name="name">The name of the application whose Events are tobe purged.</param>
        /// <remarks>All Events older than the purge interval are removed for the application name in question.
        /// The default purge interval is 7 days. It may be modified, on a per application name basis, by setting
        /// a config item with name applicationname_Interval to a specified number of days.
        /// <para>An event is written to the Windows EventLog for each application purge action.</para>
        /// <para>
        /// Note that a new (diagnostic/informational) <see cref="Event"/> is written to the database for each application that has been purged specifying
        /// the number of Events removed by the purge. (This has the effect that there is always at least one <see cref="Event"/> per application
        /// in the database).
        /// </para>
        /// </remarks>
        private void PurgeApplication(string name)
        {
            string logApplicationName = "Event Purge";
            EventLog.WriteEntry("EventRecordingService", "Purging Application " + name);
            TimeSpan purgeInterval = new TimeSpan(7, 0, 0, 0);
            System.Configuration.Configuration config =
                ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            if (config.AppSettings.Settings[name + " Interval"] != null)
            {
                int days = int.Parse(config.AppSettings.Settings[name + " Interval"].Value);
                purgeInterval = new TimeSpan(days, 0, 0, 0);
            }
            DateTime date = DateTime.Today - purgeInterval;
            string sql = @"delete from Events where ApplicationName = @ApplicationName and EventTime < @Time";
            SqlCommand cmd = new SqlCommand(sql);
            cmd.Parameters.AddWithValue("@ApplicationName", name);
            cmd.Parameters.AddWithValue("@Time", date);
            SqlConnection connection = GetSqlConnection();//new SqlConnection(this.connectionString);
            string serverName = connection.DataSource;
            string databaseName = connection.Database;
            int count = 0;
            try
            {
                connection.Open();
                cmd.Connection = connection;
                count = cmd.ExecuteNonQuery();
            }
            catch (Exception xe)
            {
                EventLog.WriteEntry("EventRecordingService", "Purging Application " + name, EventLogEntryType.Error);
                throw xe;
            }
            finally
            {
                connection.Close();
                cmd.Dispose();
            }
            if (count > 0)
            {
                Event e = new Event();
                e.ApplicationName = logApplicationName;
                e.EventCode = 0;
                e.Message = string.Format("{2} events earlier than {5} purged from server {0}, database {1} for application {3}",
                    serverName,
                    databaseName,
                    count, name,
                    date.ToString("ddMMMyyyy HH:mm:ss"));
                //e.Sequence = sequence++;
                e.EventSeverity = (int)EventSeverities.Information;
                //e.Time = DateTime.Now;
                e.EventType = EventTypes.Diagnostic.ToString();
                //Log.Write(e);
            }
            else
            {
                Event e = new Event();
                e.ApplicationName = logApplicationName;
                e.EventCode = 0;
                e.Message = string.Format("No events earlier than {3} found to purge from server {0}, database {1} for application {2}",
                    serverName,
                    databaseName,
                     name, date.ToString("ddMMMyyyy HH:mm:ss"));
                //e.Sequence = sequence++;
                e.EventSeverity = (int)EventSeverities.Information;
                //e.Time = DateTime.Now;
                e.EventType = EventTypes.Diagnostic.ToString();
                //Log.Write(e);

            }

        }
        /// <summary>
        /// Get a list of applications which have Events in the database.
        /// </summary>
        /// <returns></returns>
        private string[] GetApplications()
        {
            string sql = @"select distinct ApplicationName from Events";
            SqlCommand cmd = GetSqlCommand(sql);
            DataTable table = ExecuteReadCommand(cmd);
            string[] names = new string[table.Rows.Count];
            int index = 0;
            foreach (DataRow r in table.Rows)
            {
                names[index++] = r[0].ToString();
            }
            return names;
        }

        /// <summary>
        /// Perform a <see cref="DoPurge"/> operation every 100 milliseconds until a thread stop request occurs.
        /// </summary>
        /// <remarks>This is the purge thread entry point.</remarks>
        private void Purge()
        {
            while (stopRequested == false)
            {
                Thread.Sleep(100);
                DoPurge();
            }
            stopCompleted = true;

        }
        /// <summary>
        /// Start a purge thread.
        /// </summary>
        /// <remarks>This action is reported to the Windows EventLog.</remarks>
        public void Start()
        {
            try
            {
                purger = new Thread(new ThreadStart(Purge));
                purger.Start();
                EventLog.WriteEntry("EventRecordingService", "Periodic event purge started");
            }
            catch (Exception xe)
            {
                EventLog.WriteEntry("EventRecordingService", xe.Message);
            }

        }
        /// <summary>
        /// Request the purge thread to stop and wait for it to stop.
        /// </summary>
        /// <remarks>This action is reported to the Windows EventLog</remarks>
        public void Stop()
        {
            stopCompleted = false;
            stopRequested = true;
            while (stopCompleted == false)
            {
                Thread.Sleep(100);
            }
            EventLog.WriteEntry("EventRecordingService", "Periodic event purge stopped");
        }
        /// <summary>
        /// Execute the provided Sql read command.
        /// </summary>
        /// <param name="cmd">The command to execute.</param>
        /// <returns>The <see cref="DataTable"/> conating the results.</returns>
        private DataTable ExecuteReadCommand(SqlCommand cmd)
        {
            SqlConnection connection = GetSqlConnection();
            cmd.Connection = connection;
            DataTable table = new DataTable();
            SqlDataAdapter adapter = new SqlDataAdapter(cmd);
            adapter.Fill(table);
            adapter.Dispose();
            connection.Close();
            return table;
        }

        private SqlConnection GetSqlConnection()
        {
            SqlConnection connection = new SqlConnection(this.connectionString);
            //connection.ConnectionTimeout = 60;
            return connection;
        }
        private static SqlCommand GetSqlCommand(string sql)
        {
            SqlCommand cmd = new SqlCommand(sql);
            cmd.CommandTimeout = 120;
            return cmd;
        }

    }
}

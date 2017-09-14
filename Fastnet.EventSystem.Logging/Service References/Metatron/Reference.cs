﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.18033
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Fastnet.EventSystem.Metatron {
    using System.Runtime.Serialization;
    using System;
    
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Runtime.Serialization", "4.0.0.0")]
    [System.Runtime.Serialization.DataContractAttribute(Name="EventData", Namespace="http://schemas.datacontract.org/2004/07/Fastnet.Services.Events", IsReference=true)]
    [System.SerializableAttribute()]
    public partial class EventData : System.Data.Objects.DataClasses.EntityObject, System.Runtime.Serialization.IExtensibleDataObject {
        
        [System.NonSerializedAttribute()]
        private System.Runtime.Serialization.ExtensionDataObject extensionDataField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ApplicationNameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string DomainNameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.Nullable<int> EventCodeField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private long EventIdField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.Nullable<int> EventSeverityField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.Nullable<System.DateTime> EventTimeField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string EventTypeField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ExceptionTypeField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string IPAddressField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string MachineNameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string MessageField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.Nullable<int> ProcessIdField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.Nullable<long> SequenceField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string SessionIdField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string StackTraceField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.Nullable<int> ThreadIdField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string UrlField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string UserNameField;
        
        [global::System.ComponentModel.BrowsableAttribute(false)]
        public System.Runtime.Serialization.ExtensionDataObject ExtensionData {
            get {
                return this.extensionDataField;
            }
            set {
                this.extensionDataField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string ApplicationName {
            get {
                return this.ApplicationNameField;
            }
            set {
                this.ApplicationNameField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string DomainName {
            get {
                return this.DomainNameField;
            }
            set {
                this.DomainNameField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.Nullable<int> EventCode {
            get {
                return this.EventCodeField;
            }
            set {
                this.EventCodeField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public long EventId {
            get {
                return this.EventIdField;
            }
            set {
                this.EventIdField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.Nullable<int> EventSeverity {
            get {
                return this.EventSeverityField;
            }
            set {
                this.EventSeverityField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.Nullable<System.DateTime> EventTime {
            get {
                return this.EventTimeField;
            }
            set {
                this.EventTimeField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string EventType {
            get {
                return this.EventTypeField;
            }
            set {
                this.EventTypeField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string ExceptionType {
            get {
                return this.ExceptionTypeField;
            }
            set {
                this.ExceptionTypeField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string IPAddress {
            get {
                return this.IPAddressField;
            }
            set {
                this.IPAddressField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string MachineName {
            get {
                return this.MachineNameField;
            }
            set {
                this.MachineNameField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string Message {
            get {
                return this.MessageField;
            }
            set {
                this.MessageField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.Nullable<int> ProcessId {
            get {
                return this.ProcessIdField;
            }
            set {
                this.ProcessIdField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.Nullable<long> Sequence {
            get {
                return this.SequenceField;
            }
            set {
                this.SequenceField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string SessionId {
            get {
                return this.SessionIdField;
            }
            set {
                this.SessionIdField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string StackTrace {
            get {
                return this.StackTraceField;
            }
            set {
                this.StackTraceField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.Nullable<int> ThreadId {
            get {
                return this.ThreadIdField;
            }
            set {
                this.ThreadIdField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string Url {
            get {
                return this.UrlField;
            }
            set {
                this.UrlField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string UserName {
            get {
                return this.UserNameField;
            }
            set {
                this.UserNameField = value;
            }
        }
    }
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    [System.ServiceModel.ServiceContractAttribute(ConfigurationName="Metatron.IEventRecordingService")]
    public interface IEventRecordingService {
        
        [System.ServiceModel.OperationContractAttribute(IsOneWay=true, Action="http://tempuri.org/IEventRecordingService/WriteEvent")]
        void WriteEvent(Fastnet.EventSystem.Metatron.EventData data);
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/IEventRecordingService/GetAllEvents", ReplyAction="http://tempuri.org/IEventRecordingService/GetAllEventsResponse")]
        Fastnet.EventSystem.Metatron.EventData[] GetAllEvents();
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/IEventRecordingService/GetEventsForApplication", ReplyAction="http://tempuri.org/IEventRecordingService/GetEventsForApplicationResponse")]
        Fastnet.EventSystem.Metatron.EventData[] GetEventsForApplication(string applicationName, int maxNumber);
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/IEventRecordingService/GetAvailableApplications", ReplyAction="http://tempuri.org/IEventRecordingService/GetAvailableApplicationsResponse")]
        string[] GetAvailableApplications();
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/IEventRecordingService/PurgeEvents", ReplyAction="http://tempuri.org/IEventRecordingService/PurgeEventsResponse")]
        void PurgeEvents();
    }
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    public interface IEventRecordingServiceChannel : Fastnet.EventSystem.Metatron.IEventRecordingService, System.ServiceModel.IClientChannel {
    }
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    public partial class EventRecordingServiceClient : System.ServiceModel.ClientBase<Fastnet.EventSystem.Metatron.IEventRecordingService>, Fastnet.EventSystem.Metatron.IEventRecordingService {
        
        public EventRecordingServiceClient() {
        }
        
        public EventRecordingServiceClient(string endpointConfigurationName) : 
                base(endpointConfigurationName) {
        }
        
        public EventRecordingServiceClient(string endpointConfigurationName, string remoteAddress) : 
                base(endpointConfigurationName, remoteAddress) {
        }
        
        public EventRecordingServiceClient(string endpointConfigurationName, System.ServiceModel.EndpointAddress remoteAddress) : 
                base(endpointConfigurationName, remoteAddress) {
        }
        
        public EventRecordingServiceClient(System.ServiceModel.Channels.Binding binding, System.ServiceModel.EndpointAddress remoteAddress) : 
                base(binding, remoteAddress) {
        }
        
        public void WriteEvent(Fastnet.EventSystem.Metatron.EventData data) {
            base.Channel.WriteEvent(data);
        }
        
        public Fastnet.EventSystem.Metatron.EventData[] GetAllEvents() {
            return base.Channel.GetAllEvents();
        }
        
        public Fastnet.EventSystem.Metatron.EventData[] GetEventsForApplication(string applicationName, int maxNumber) {
            return base.Channel.GetEventsForApplication(applicationName, maxNumber);
        }
        
        public string[] GetAvailableApplications() {
            return base.Channel.GetAvailableApplications();
        }
        
        public void PurgeEvents() {
            base.Channel.PurgeEvents();
        }
    }
}

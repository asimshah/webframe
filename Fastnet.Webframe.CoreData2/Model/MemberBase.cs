using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Fastnet.Webframe.CoreData2
{
    [Table("Members")]
    public partial class Member
    {
        // I do not use the Email Confirmation scheme that ias part of the Asp.Net Identity system
        // because the UserManager.GenerateEmailConfirmationTokenAsync method produces a ridiculously
        // long string!
        // As a result I have EmailAddressConfirmed, and ActivationCode here in this table
        // The EmailAddress is a convenience property as it avoids my having to keep looking up
        // the aspnet table for an email address
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        [MaxLength(128)]
        public string Id { get; set; }
        [MaxLength(256)]
        public string EmailAddress { get; set; }
        public bool EmailAddressConfirmed { get; set; }
        [MaxLength(128)]
        public string FirstName { get; set; }
        [MaxLength(128)]
        public string LastName { get; set; }
        [MaxLength(128)]
        public string PhoneNumber { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool Disabled { get; set; }
        [MaxLength(128)]
        public string ActivationCode { get; set; }
        public DateTime? ActivationEmailSentDate { get; set; }
        public string PasswordResetCode { get; set; }
        public DateTime? PasswordResetEmailSentDate { get; set; }
        public string PlainPassword { get; set; }
        public bool IsAdministrator { get; set; }
        public bool IsAnonymous { get; set; }
        public MemberCreationMethod CreationMethod { get; set; }
        //
        public ICollection<GroupMember> GroupMembers { get; set; }
        [NotMapped]
        public string Fullname
        {
            get { return string.Format("{0} {1}", this.FirstName, this.LastName).Trim(); }
        }
        //public static Member Anonymous
        //{
        //    get
        //    {
        //        // use cts.GetAnonymousMember() instead
        //        //CoreDataContext ctx = Core.GetDataContext();
        //        return null;// ctx.Members.OfType<Member>().Single(x => x.IsAnonymous);
        //    }
        //}
        //
        public static string HashPassword(string password)
        {
            byte[] salt;
            byte[] buffer2;
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, 0x10, 0x3e8))
            {
                salt = bytes.Salt;
                buffer2 = bytes.GetBytes(0x20);
            }
            byte[] dst = new byte[0x31];
            Buffer.BlockCopy(salt, 0, dst, 1, 0x10);
            Buffer.BlockCopy(buffer2, 0, dst, 0x11, 0x20);
            return Convert.ToBase64String(dst);
        }
        public static bool VerifyHashedPassword(string hashedPassword, string password)
        {
            Func<byte[], byte[], bool> byteArraysEqual = (b1, b2) =>
            {
                bool result = true;
                if (b1.Length == b2.Length)
                {
                    for (int index = 0; index < b1.Length; ++index)
                    {
                        if (b1[index] != b2[index])
                        {
                            result = false;
                            break;
                        }
                    }
                }
                else
                {
                    result = false;
                }
                return result;
            };
            byte[] buffer4;
            if (hashedPassword == null)
            {
                return false;
            }
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            byte[] src = Convert.FromBase64String(hashedPassword);
            if ((src.Length != 0x31) || (src[0] != 0))
            {
                return false;
            }
            byte[] dst = new byte[0x10];
            Buffer.BlockCopy(src, 1, dst, 0, 0x10);
            byte[] buffer3 = new byte[0x20];
            Buffer.BlockCopy(src, 0x11, buffer3, 0, 0x20);
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, dst, 0x3e8))
            {
                buffer4 = bytes.GetBytes(0x20);
            }

            return byteArraysEqual(buffer3, buffer4);
        }
        //public abstract dynamic GetMinimumDetails();
        public virtual ExpandoObject GetMinimumDetails()
        {
            dynamic details = new ExpandoObject();
            details.Id = this.Id;
            details.EmailAddress = this.EmailAddress;
            details.Name = this.Fullname;
            details.Disabled = this.Disabled;
            details.IsAdministrator = this.IsAdministrator;
            details.EmailConfirmed = this.EmailAddressConfirmed;
            return details;
        }
        public virtual ExpandoObject GetMemberListDetails()
        {
            Func<string> getStatus = () =>
            {
                string st = "";
                if (Disabled)
                {
                    st = "Disabled";
                }
                else if (!EmailAddressConfirmed)
                {
                    st = "Waiting Activation";
                }
                return st;
            };
            dynamic details = GetMinimumDetails();// new ExpandoObject();
            //details.Id = this.Id;
            //details.EmailAddress = this.EmailAddress;
            //details.Disabled = this.Disabled;
            //details.EmailConfirmed = this.EmailAddressConfirmed;
            details.FirstName = this.FirstName;
            details.LastName = this.LastName;
            details.CreationDate = this.CreationDate;
            details.LastLoginDate = this.LastLoginDate;
            details.Status = getStatus();
            details.Groups = this.GroupMembers.Select(x => x.Group).OrderBy(x => x.Name).ToArray().Where(g => !g.Type.HasFlag(GroupTypes.SystemDefinedMembers))
                .Select(g => new { Name = g.Shortenedpath });
            return details;
        }
        public virtual async Task<ExpandoObject> Update(dynamic data)
        {
            string newEmailAddress = data.emailAddress;
            string newFirstName = data.firstName;
            string newLastName = data.lastName;
            bool newDisabled = data.isDisabled;
            Update(newEmailAddress, newFirstName, newLastName, newDisabled);
            dynamic result = new ExpandoObject();
            result.Success = true;
            result.Error = "";
            return await Task.FromResult(result);
        }

        protected void Update(string newEmailAddress, string newFirstName, string newLastName, bool newDisabled)
        {
            EmailAddress = newEmailAddress;
            FirstName = newFirstName;
            LastName = newLastName;
            Disabled = newDisabled;
        }
        public void RecordChanges(string actionBy = null, MemberAction.MemberActionTypes actionType = MemberAction.MemberActionTypes.Modification)
        {
            //CoreDataContext DataContext = Core.GetDataContext();
            //switch (actionType)
            //{
            //    default:
            //    case MemberAction.MemberActionTypes.New:
            //    case MemberAction.MemberActionTypes.Activation:
            //    case MemberAction.MemberActionTypes.PasswordResetRequest:
            //    case MemberAction.MemberActionTypes.PasswordReset:
            //    case MemberAction.MemberActionTypes.Deactivation:
            //    case MemberAction.MemberActionTypes.Deletion:
            //        MemberAction ma = new MemberAction
            //        {
            //            MemberId = this.Id,
            //            EmailAddress = this.EmailAddress,
            //            FullName = this.Fullname,
            //            ActionBy = actionBy ?? this.Fullname,
            //            Action = actionType,
            //        };
            //        DataContext.Actions.Add(ma);
            //        return;
            //    case MemberAction.MemberActionTypes.Modification:
            //        break;
            //}
            //var entry = DataContext.Entry(this);
            //foreach (var p in entry.CurrentValues.PropertyNames)
            //{
            //    switch (p)
            //    {
            //        case "EmailAddressConfirmed":
            //        case "ActivationCode":
            //        case "ActivationEmailSentDate":
            //        case "PasswordResetCode":
            //        case "PasswordResetEmailSentDate":
            //        case "PlainPassword":
            //            break;
            //        default:
            //            try
            //            {
            //                if (entry.Property(p).IsModified)
            //                {
            //                    object ov = entry.Property(p).OriginalValue;
            //                    object cv = entry.Property(p).CurrentValue;
            //                    MemberAction ma = new MemberAction
            //                    {
            //                        MemberId = this.Id,
            //                        EmailAddress = this.EmailAddress,
            //                        FullName = this.Fullname,
            //                        ActionBy = actionBy ?? this.Fullname,
            //                        Action = actionType,// MembershipAction.MembershipActionTypes.Modification,
            //                        PropertyChanged = p,
            //                        OldValue = ov == null ? "<null>" : ov.ToString(),
            //                        NewValue = cv == null ? "<null>" : cv.ToString()
            //                    };
            //                    DataContext.Actions.Add(ma);
            //                }
            //            }
            //            catch (Exception xe)
            //            {
            //                //Debugger.Break();
            //                Log.Write(xe);
            //                throw;
            //            }
            //            break;
            //    }
            //}
        }
        private IEnumerable<Group> GetAllGroups()
        {
            // this returns a flat list of all groups this member is in 
            // including parent groups all the way to the root
            List<Group> list = new List<Group>();
            foreach (var g in this.GroupMembers.Select(x => x.Group))
            {
                foreach (var pg in g.SelfAndParents)
                {
                    list.Add(pg);
                }
            }
            return list;
        }        
    }
}

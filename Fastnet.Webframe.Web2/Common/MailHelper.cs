using Fastnet.Core;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public class MailHelper
    {
        private readonly ILogger log;
        private readonly CoreDataContext coreDataContext;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly CustomisationOptions customOptions;
        private readonly MailOptions mailOptions;
        public MailHelper(ILogger<MailHelper> logger, CoreDataContext coreDataContext, IHttpContextAccessor httpContextAccessor,
            IOptions<CustomisationOptions> custOptions, IOptions<MailOptions> mailOptions)
        {
            this.log = logger;
            this.coreDataContext = coreDataContext;
            this.httpContextAccessor = httpContextAccessor;
            this.customOptions = custOptions.Value;
            this.mailOptions = mailOptions.Value;
        }
        public async Task SendAccountActivationAsync(string destination, string userId, string activationCode)
        {
            var siteurl = GetSiteUrl();
            string subject = $"Welcome to {siteurl}";
            string callbackUrl = $"{siteurl}/activate/{userId}/{activationCode}";
            string htmlText = GetTemplate("main", "AccountActivation-Email");
            string body = string.Format(htmlText, siteurl, callbackUrl, GetAdminEmailAddress());
            await Send(destination, subject, body, "AccountActivation");
        }
        public async Task SendEmailAddressChangedAsync(string destination, string userId, string activationCode)
        {
            var siteurl = GetSiteUrl();
            string subject = $"New email address for {siteurl}";
            string callbackUrl = $"{siteurl}/activate/{userId}/{activationCode}";
            string htmlText = GetTemplate("main", "EmailAddressChanged-Email");
            string body = string.Format(htmlText, siteurl, callbackUrl, GetAdminEmailAddress());
            await Send(destination, subject, body, "EmailAddressChanged");
        }
        public async Task SendPasswordResetAsync(string destination, string userId, string resetCode)
        {
            string siteUrl = GetSiteUrl();
            string subject = $"Password Reset for {siteUrl}";
            string callbackUrl = $"{siteUrl}/passwordreset/{userId}/{resetCode}";
            string htmlText = GetTemplate("main", "PasswordReset-Email");
            string body = string.Format(htmlText, siteUrl, callbackUrl, GetAdminEmailAddress());
            await Send(destination, subject, body, "PasswordReset");
        }
        public async Task SendMailAsync(string destination, string subject, string body)
        {
            await Send(destination, subject, body, "No Template");
        }
        //public void SendAccountActivationAsync(CoreDataContext ctx, string destination, string UrlScheme, string UrlAuthority, string userId, string activationCode)
        //{
        //    string siteUrl = GetSiteUrl(UrlScheme, UrlAuthority);// string.Format("{0}://{1}", UrlScheme, UrlAuthority);
        //    string subject = string.Format("Welcome to {0}", siteUrl);
        //    string callbackUrl = string.Format("{0}/activate/{1}/{2}", siteUrl, userId, activationCode);
        //    var tl = TemplateLibrary.GetInstance();
        //    string text = tl.GetTemplate("main-emails", "AccountActivation");
        //    string body = string.Format(text, siteUrl, callbackUrl, Globals.AdminEmailAddress);
        //    Log.Write($"Account activation email prepared for {destination}");
        //    SendAndForget(ctx, new SendMailObject(destination, subject, body, "AccountActivation"));
        //}
        //public void SendPasswordResetAsync(CoreDataContext ctx, string destination, string UrlScheme, string UrlAuthority, string userId, string code)
        //{
        //    string siteUrl = GetSiteUrl(UrlScheme, UrlAuthority);// string.Format("{0}://{1}", UrlScheme, UrlAuthority);
        //    string subject = string.Format("Password Reset for {0}", siteUrl);
        //    string callbackUrl = string.Format("{0}/passwordreset/{1}/{2}", siteUrl, userId, code);
        //    var tl = TemplateLibrary.GetInstance();
        //    string text = tl.GetTemplate("main-emails", "PasswordReset");
        //    string body = string.Format(text, siteUrl, callbackUrl, Globals.AdminEmailAddress);
        //    Log.Write($"PasswordReset email prepared for {destination}");
        //    SendAndForget(ctx, new SendMailObject(destination, subject, body, "PasswordReset"));
        //}
        //public void SendEmailAddressChangedAsync(CoreDataContext ctx, string destination, string UrlScheme, string UrlAuthority, string userId, string activationCode)
        //{
        //    string siteUrl = GetSiteUrl(UrlScheme, UrlAuthority);// string.Format("{0}://{1}", UrlScheme, UrlAuthority);
        //    string subject = string.Format("New email address for {0}", siteUrl);
        //    string callbackUrl = string.Format("{0}/activate/{1}/{2}", siteUrl, userId, activationCode);
        //    var tl = TemplateLibrary.GetInstance();
        //    string text = tl.GetTemplate("main-emails", "EmailAddressChanged");
        //    string body = string.Format(text, siteUrl, callbackUrl, Globals.AdminEmailAddress);
        //    Log.Write($"EmailAddressChanged email prepared for {destination}");
        //    SendAndForget(ctx, new SendMailObject(destination, subject, body, "EmailAddressChanged"));
        //}

        //private void SendAndForget(CoreDataContext ctx, SendMailObject smo)
        //{
        //    Task.Run(async () => {
        //        try
        //        {
        //            var dctx = new CoreDataContext();
        //            var ms = new MailSender(smo);
        //            var exception = await ms.SendMailAsync(dctx);
        //            if (exception != null)
        //            {
        //                Log.Write(exception);
        //            }
        //        }
        //        catch (Exception xe)
        //        {
        //            Log.Write(xe);
        //        }
        //    });
        //}
        private string GetTemplate(string category, string templateName)
        {
            var t = coreDataContext.HtmlTemplates.Single(x => string.Compare(category, x.Category, true) == 0 && string.Compare(templateName, x.Name, true) == 0);
            return t.HtmlText;
        }
        private string GetAdminEmailAddress()
        {
            return coreDataContext.Members.Single(x => x.IsAdministrator).EmailAddress;
        }
        private string GetSiteUrl()
        {
            return $"{httpContextAccessor.HttpContext.Request.Scheme}://{httpContextAccessor.HttpContext.Request.Host.ToString()}";
        }
        private async Task Send(string destination, string subject, string body, string templateName)
        {
            var redirected = false;
            var remark = string.Empty;
            var failure = string.Empty;
            var originalDestination = destination;
            var ms = new MailSender(mailOptions);
            if (!string.IsNullOrWhiteSpace(customOptions.RedirectMailTo))
            {
                destination = customOptions.RedirectMailTo;
                redirected = true;
            }
            if (customOptions.MailEnabled)
            {
                try
                {
                    ms.Send(customOptions.MailFromAddress, destination, subject, body);
                }
                catch (SmtpFailedRecipientsException sfres)
                {
                    log.Error(sfres);
                    failure = $"Delivery failed: {sfres.Message}";
                }
                catch (SmtpFailedRecipientException sfre)
                {
                    var status = sfre.StatusCode;
                    switch (status)
                    {
                        case SmtpStatusCode.MailboxBusy:
                        case SmtpStatusCode.MailboxUnavailable:
                            failure = "Mailbox busy or unavailable, mail delayed";
                            break;
                        default:
                            failure = $"Delivery failed: {status.ToString()}";
                            break;
                    }
                }
                catch (Exception xe)
                {
                    log.Error(xe);
                    failure = $"{xe.Message} - how should this be handled?";
                }
            }
            await coreDataContext.RecordChanges(customOptions.MailFromAddress, originalDestination, subject, body,
                redirected, redirected ? customOptions.RedirectMailTo : "", templateName, remark, customOptions.MailEnabled, failure);
            await coreDataContext.SaveChangesAsync();
        }
    }
}

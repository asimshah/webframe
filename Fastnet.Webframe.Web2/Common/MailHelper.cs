using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public class MailHelper
    {
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
        //public void SendTestMailAsync(CoreDataContext ctx, string destination, string subject, string body)
        //{
        //    Log.Write($"TestMail email prepared for {destination}");
        //    SendAndForget(ctx, new SendMailObject(destination, subject, body, "TestMail"));
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
        //private string GetSiteUrl(string UrlScheme, string UrlAuthority)
        //{
        //    return string.Format("{0}://{1}", UrlScheme, UrlAuthority);
        //}
    }
}

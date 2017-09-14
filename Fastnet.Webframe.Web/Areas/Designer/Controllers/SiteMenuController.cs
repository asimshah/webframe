﻿using Fastnet.Webframe.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Fastnet.Webframe.Web.Areas.Designer.Controllers
{
    [RouteArea("designer")]
    [RoutePrefix("menus")]
    public class SiteMenuController : BaseMvcController
    {
        [Route("")]
        public ActionResult Index()
        {
            return View();
        }
    }
}
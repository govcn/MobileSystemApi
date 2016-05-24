﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;

public partial class Slots_ClubApollo : BasePage
{
    protected XElement xeErrors = null;
    private XElement xeResources = null;
    private string _selectedLanguage;

    protected void Page_Load(object sender, EventArgs e)
    {
        commonCulture.appData.GetRootResourceNonLanguage("/Slots/ClubApollo.aspx", out xeResources);

        CheckSupportedCurrency();

        if (Page.IsPostBack) return;

        _selectedLanguage = commonVariables.SelectedLanguage;
        SetTitle(commonCulture.ElementValues.getResourceXPathString("/Products/ClubApollo/Label", commonVariables.ProductsXML));
        StringBuilder sbGames = new StringBuilder();

        XElement xeCategories = xeResources.Element("Category");

        foreach (XElement xeCategory in xeCategories.Elements())
        {
            var header = GetHeadTranslation(xeCategory);

            sbGames.AppendFormat("<div data-role='collapsible' data-collapsed='false' data-theme='b' data-content-theme='a' data-mini='true'><h4>{0}</h4>", header);

            sbGames.AppendFormat("<div id='div{0}' class='div-product'><div><ul>", xeCategory.Name);

            List<XElement> topgames = xeCategory.Elements().Where(m => m.Attribute("Top") != null).OrderBy(f => f.Attribute("Top").Value).ToList();

            IEnumerable<XElement> sortedGame = xeCategory.Elements().Where(m => m.Attribute("Top") == null).OrderBy(game => game.Name.ToString());

            topgames.AddRange(sortedGame);

            foreach (XElement xeGame in topgames)
            {
                sbGames.AppendFormat("<li class='bkg-game'><div rel='{0}.jpg'><div class='div-links'>", commonCulture.ElementValues.getResourceString("ImageName", xeGame));

                if (string.IsNullOrEmpty(commonVariables.CurrentMemberSessionId)) 
                { 
                    sbGames.AppendFormat("<a class='btn-primary' target='_blank' href='/_Secure/Login.aspx?redirect=" + Server.UrlEncode("/ClubApollo") + "' data-rel='dialog' data-transition='slidedown'>"); 
                }
                else 
                {
                    sbGames.AppendFormat("<a href='{0}' target='_blank'>",  CommonClubApollo.GetRealUrl.Replace("{GAME}", Convert.ToString(xeGame.Name)).Replace("{LANG}", _selectedLanguage).Replace("{TOKEN}", commonVariables.CurrentMemberSessionId)).Replace("{LOBBYURL}", commonIp.DomainName + "/ClubApollo").Replace("{cashier}", commonIp.DomainName + "/fundtransfer"); 
                }

                sbGames.Append("<i class='icon-play_arrow'></i></a>");
                sbGames.AppendFormat("<a class='btn-secondary' target='_blank' href='{0}' data-ajax='false'><i class='icon-fullscreen'></i></a></div>", CommonClubApollo.GetFunUrl.Replace("{GAME}", Convert.ToString(xeGame.Name)).Replace("{LANG}", _selectedLanguage).Replace("{TOKEN}", commonVariables.CurrentMemberSessionId)).Replace("{CURCODE}", GetCurrencyByLanguage()).Replace("{LOBBYURL}", commonIp.DomainName + "/ClubApollo");
                sbGames.Append("</div></li>");
            }

            sbGames.Append("</ul></div></div></div>");
        }

        divContainer.InnerHtml = Convert.ToString(sbGames);
    }

    private static string GetCurrencyByLanguage()
    {
        string currency;
        switch (commonVariables.SelectedLanguage)
        {
            case "zh-cn":
                currency = "CNY";
                break;
            case "ko-kr":
                currency = "KRW";
                break;
            case "ja-jp":
                currency = "JPY";
                break;
            default:
                currency = "USD";
                break;
        }

        if (HttpContext.Current.Session["LanguageCode"] != null && HttpContext.Current.Session["CurrencyCode"] != null)
        {
            if ((string)HttpContext.Current.Session["LanguageCode"] == "en-us" && ((string)HttpContext.Current.Session["CurrencyCode"] == "MY"))
            {
                currency = "MYR";
            }
        }

        return currency;
    }

    private string GetHeadTranslation(XElement element)
    {
        string headerText;
        var lang = commonVariables.SelectedLanguage;

        if (string.IsNullOrEmpty(lang))
        {
            headerText = element.Attribute("Label").Value;
        }
        else
        {
            if (element.Attribute(lang) != null && element.Attribute(lang).Value.Length > 0)
            {
                headerText = element.Attribute(lang).Value;    
            }
            else
            {
                headerText = element.Attribute("Label").Value;
            }
        }

        return headerText;
    }

    private void CheckSupportedCurrency()
    {
        var currency = commonVariables.GetSessionVariable("CurrencyCode");
        if (currency.Contains("KRW") || currency.Contains("VND") || currency.Contains("IDR"))
        {
            Response.Redirect("~/Slots.aspx", true);
        }
    }
}
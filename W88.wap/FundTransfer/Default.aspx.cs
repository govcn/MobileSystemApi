﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class FundTransfer_Default : BasePage
{
    protected System.Xml.Linq.XElement xeErrors = null;
    protected string strStatusCode = string.Empty;
    protected string strAlertCode = string.Empty;
    protected string strAlertMessage = string.Empty;
    
    protected void Page_Load(object sender, EventArgs e)
    {
        string arrStrProductsSelection = string.Empty;
        string strCurrencyCode = string.Empty;
        string strProduct = string.Empty;
        string strWalletName = string.Empty;

        System.Xml.Linq.XElement xeFTCurrencySettings = null;
        customConfig.OperatorSettings opSettings = null;
        System.Xml.Linq.XElement xeResources = null;
        List<string> lstProductsSelection = null;

        xeErrors = commonVariables.ErrorsXML;
        xeResources = commonCulture.appData.getRootResource("/Cashier");

        opSettings = new customConfig.OperatorSettings("W88");
        arrStrProductsSelection = opSettings.Values.Get("Products");
        lstProductsSelection = arrStrProductsSelection.Split(new char[] { '|' }, StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList();

        if (!Page.IsPostBack)
        {
            foreach (string product in lstProductsSelection)
            {
                strProduct = product.Trim();
                strWalletName = Convert.ToString(commonCulture.ElementValues.getResourceXPathString("Wallets/" + strProduct, commonVariables.ProductsXML));

                customConfig.WalletVariables walletVar = System.Configuration.ConfigurationManager.GetSection("WalletGroupSettings/" + strProduct) as customConfig.WalletVariables;

                if (string.Compare(commonCulture.ElementValues.getResourceXPathAttribute("Currencies/" + strCurrencyCode + "/" + strProduct.ToUpper(), "disabledfundout", xeFTCurrencySettings), "true", true) != 0)
                {
                    drpTransferFrom.Items.Add(new ListItem(commonCulture.ElementValues.getResourceXPathString("Wallets/" + strProduct, commonVariables.ProductsXML), walletVar.walletId));
                }

                if (string.Compare(commonCulture.ElementValues.getResourceXPathAttribute("Currencies/" + strCurrencyCode + "/" + strProduct.ToUpper(), "disabledfundin", xeFTCurrencySettings), "true", true) != 0)
                {
                    drpTransferTo.Items.Add(new ListItem(commonCulture.ElementValues.getResourceXPathString("Wallets/" + strProduct, commonVariables.ProductsXML), walletVar.walletId));
                }
            }

            lblTransferFrom.InnerText = commonCulture.ElementValues.getResourceString("lblTransferFrom", xeResources);
            lblTransferTo.InnerText = commonCulture.ElementValues.getResourceString("lblTransferTo", xeResources);
            lblTransferAmount.InnerText = commonCulture.ElementValues.getResourceString("lblTransferAmount", xeResources);
            lblPromoCode.InnerText = commonCulture.ElementValues.getResourceString("lblPromoCode", xeResources);
            btnSubmit.Value = commonCulture.ElementValues.getResourceString("btnSubmit", xeResources);
            btnBack.Value = commonCulture.ElementValues.getResourceString("btnCancel", xeResources);

            drpTransferTo.SelectedIndex = 1;
        }
    }

    protected void btnSubmit_Click(object sender, EventArgs e) 
    {
        #region initialiseVariables
        int intProcessSerialId = 0;
        string strProcessId = Guid.NewGuid().ToString().ToUpper();
        string strPageName = "FundTransfer";

        string strResultCode = string.Empty;
        string strResultDetail = string.Empty;
        string strErrorCode = string.Empty;
        string strErrorDetail = string.Empty;
        string strProcessRemark = string.Empty;
        bool isProcessAbort = false;
        bool isSystemError = false;

        System.Xml.Linq.XElement xeResponse = null;

        string strStatusCode = string.Empty;
        string strStatusText = string.Empty;

        string strOperatorId = string.Empty;
        string strMemberCode = string.Empty;
        string strSiteCode = string.Empty;
        string strCurrencyCode = string.Empty;
        string strSessionToken = string.Empty;

        string strTransferFrom = string.Empty;
        string strTransferTo = string.Empty;
        string strTransferAmount = string.Empty;
        string strPromoCode = string.Empty;

        string strTransferId = string.Empty;
        string strTransferStatus = string.Empty;

        bool includeStatus = false;
        bool sessionExpired = false;
        #endregion

        #region populateVariables
        strTransferFrom = drpTransferFrom.Value;
        strTransferTo = drpTransferTo.Value;
        strTransferAmount = txtTransferAmount.Value;
        strPromoCode = txtPromoCode.Value;

        strOperatorId = commonVariables.OperatorId;
        strSiteCode = commonVariables.SiteUrl.ToLower();
        strMemberCode = commonVariables.GetSessionVariable("MemberCode");
        strCurrencyCode = commonVariables.GetSessionVariable("CurrencyCode");
        strSessionToken = commonVariables.GetSessionVariable("MemberSessionId");
        #endregion

        #region parametersValidation
        if (string.Compare(strTransferFrom, "-1", true) == 0)
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/SelectTransferFrom", xeErrors);
            isProcessAbort = true;
        }
        else if (string.Compare(strTransferTo, "-1", true) == 0)
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/SelectTransferFrom", xeErrors);
            isProcessAbort = true;
        }
        else if (string.Compare(strTransferFrom, strTransferTo, true) == 0)
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/InvalidFundTransfer", xeErrors);
            isProcessAbort = true;
        }
        else if (string.IsNullOrEmpty(strMemberCode))
        {
            strAlertCode = "-1";
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/SessionExpired", xeErrors);
            isProcessAbort = true; 
            sessionExpired = true;
        }
        else if (string.IsNullOrEmpty(strCurrencyCode))
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/SessionExpired", xeErrors);
            isProcessAbort = true;
            sessionExpired = true;
        }
        else if (string.IsNullOrEmpty(strSessionToken))
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/SessionExpired", xeErrors);
            isProcessAbort = true;
            sessionExpired = true;
        }
        else if (string.IsNullOrEmpty(strTransferAmount))
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/SessionExpired", xeErrors);
            isProcessAbort = true;
            sessionExpired = true;
        }
        else if (commonValidation.isInjection(strTransferAmount))
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/TransferAmountDisallowed", xeErrors);
            isProcessAbort = true;
        }
        else if (!commonValidation.isNumeric(strTransferAmount))
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/FundTransfer/TransferAmountDisallowed", xeErrors);
            isProcessAbort = true;
        }
        else if (commonValidation.isInjection(strPromoCode))
        {
            strAlertMessage = commonCulture.ElementValues.getResourceXPathString("/Promotion/InvalidPromo", xeErrors);
            isProcessAbort = true;
        }

        strProcessRemark = string.Format("TransferFrom: {0} | TransferTo: {1} | TransferAmount: {2} | PromoCode: {3} | MemberCode: {4} | CurrencyCode: {5} | SessionToken: {6}", strTransferFrom, strTransferTo, strTransferAmount, strPromoCode, strMemberCode, strCurrencyCode, strSessionToken);

        intProcessSerialId += 1;
        commonAuditTrail.appendLog("system", strPageName, "ParameterValidation", "DataBaseManager.DLL", strResultCode, strResultDetail, strErrorCode, strErrorDetail, strProcessRemark, Convert.ToString(intProcessSerialId), strProcessId, isSystemError);
        #endregion
        
        #region initiateFundTransfer
        if (!isProcessAbort)
        {
            try
            {
                using (svcFundTransfer.FundTransferClient svcInstance = new svcFundTransfer.FundTransferClient())
                {
                    xeResponse = svcInstance.initiateTransfer(strTransferFrom, strTransferTo, strOperatorId, strSiteCode, strMemberCode, strCurrencyCode, strSessionToken, Math.Abs(Convert.ToDecimal(strTransferAmount)), strPromoCode, svcFundTransfer.transferOrigin.WAP);
                }
            }

            catch (Exception ex)
            {
                strResultCode = Convert.ToString(ex.HResult);
                strResultDetail = ex.Message;
            }

            switch (strStatusCode)
            {
                case "00":
                    string strPokerAddOn = string.Empty;

                    strTransferId = commonCulture.ElementValues.getResourceString("transferId", xeResponse);
                    strTransferStatus = commonCulture.ElementValues.getResourceString("transferStatus", xeResponse);

                    if (string.Compare(strTransferFrom, "6", true) == 0)
                    {
                        strPokerAddOn = "[break]" + commonVariables.GetSessionVariable("CurrencyCode") + " " + commonCulture.ElementValues.getResourceString("transferAmount", xeResponse) + commonCulture.ElementValues.getResourceXPathString("FundTransfer/USDDeposited", xeErrors);
                    }
                    else if (string.Compare(strTransferTo, "6", true) == 0)
                    {
                        strPokerAddOn = "[break]USD " + commonValidation.roundDown(commonCulture.ElementValues.getResourceString("transferAmount", xeResponse), 2) + commonCulture.ElementValues.getResourceXPathString("FundTransfer/USDDeposited", xeErrors);
                    }

                    strAlertMessage = string.Format("{0}{1}", commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferSuccess", xeErrors),
                        commonCulture.ElementValues.getResourceXPathString("FundTransfer/BalanceBeforeAfter", xeErrors)
                        .Replace("{walletFrom}", string.Format("{0} => {1}", Convert.ToDecimal(commonCulture.ElementValues.getResourceString("transferFromBalanceBefore", xeResponse)).ToString(commonVariables.DecimalFormat), Convert.ToDecimal(commonCulture.ElementValues.getResourceString("transferFromBalanceAfter", xeResponse)).ToString(commonVariables.DecimalFormat)))
                        .Replace("{walletTo}", string.Format("{0} => {1}", Convert.ToDecimal(commonCulture.ElementValues.getResourceString("transferToBalanceBefore", xeResponse)).ToString(commonVariables.DecimalFormat), Convert.ToDecimal(commonCulture.ElementValues.getResourceString("transferToBalanceAfter", xeResponse)).ToString(commonVariables.DecimalFormat))),
                        strPokerAddOn);

                    drpTransferFrom.SelectedIndex = 0;
                    drpTransferTo.SelectedIndex = 1;

                    txtTransferAmount.Value = string.Empty;
                    txtPromoCode.Value = string.Empty;
                    break;

                case "12":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/InvalidFundTransfer", xeErrors);
                    break;
                case "13":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferAmountDisallowed", xeErrors);
                    break;
                case "36":
                    sessionExpired = true;
                    break;
                case "51": // "Transfer Declined - Reference ID already in used";
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferFailed", xeErrors);
                    break;
                case "53":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferDeclined", xeErrors) + "[break]" + commonCulture.ElementValues.getResourceXPathString("FundTransfer/InsufficientFunds", xeErrors);
                    break;
                case "54":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/UnderMaintenance", xeErrors);
                    break;
                case "55": // "Transfer Declined - Funds refunded"
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("ServerError", xeErrors);
                    break;
                case "70":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferFailed", xeErrors) + "[break]" + commonCulture.ElementValues.getResourceXPathString("ServerError", xeErrors);
                    break;

                case "100":
                case "101":
                case "107":
                case "108":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("Promotion/InvalidPromo", xeErrors);
                    break;
                case "102":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/MinTransferNotMet", xeErrors);
                    break;
                case "105":
                case "106":
                case "109":
                    string strTransferAmountAllowed = commonCulture.ElementValues.getResourceString("transferAmountAllowed", xeResponse);
                    string strTotalStakeAmount = commonCulture.ElementValues.getResourceString("totalStakeAmount", xeResponse);
                    string strRolloverAmount = commonCulture.ElementValues.getResourceString("rolloverAmount", xeResponse);
                    decimal decRolloverAmountNeeded = Convert.ToDecimal(strRolloverAmount) - Convert.ToDecimal(strTotalStakeAmount);

                    strAlertMessage = string.Format("{0} ({1}) [break]{2} [break]{3}", commonCulture.ElementValues.getResourceXPathString("FundTransfer/RolloverNotMet", xeErrors), strStatusCode, commonCulture.ElementValues.getResourceXPathString("FundTransfer/RolloverAmountNeeded", xeErrors) + commonValidation.roundDown(decRolloverAmountNeeded, 2), commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferAmountAllowed", xeErrors) + commonValidation.roundDown(strTransferAmountAllowed, 2));
                    includeStatus = false;
                    break;
                case "103":
                case "104":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("Promotion/PromoAlreadyClaimed", xeErrors);
                    break;
                case "ERR01":
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/ERR01", xeErrors);
                    break;
                default:
                    strAlertMessage = commonCulture.ElementValues.getResourceXPathString("FundTransfer/TransferFailed", xeErrors);
                    break;
            }
            if (includeStatus) { strAlertMessage = string.Format("{0} {1}", strAlertMessage, strStatusCode); }

            strErrorCode = strStatusCode;
            strErrorDetail = strAlertMessage;
            strProcessRemark = string.Format("TransferFrom: {0} | TransferTo: {1} | TransferAmount: {2} | PromoCode: {3} | MemberCode: {4} | CurrencyCode: {5} | SessionToken: {6} | TransferId: {7} | TransferStatus: {8} | Response: {9}",
                strTransferFrom, strTransferTo, strTransferAmount, strPromoCode, strMemberCode, strCurrencyCode, strSessionToken, strTransferId, strTransferStatus, xeResponse == null ? string.Empty : xeResponse.ToString());

            intProcessSerialId += 1;
            commonAuditTrail.appendLog("system", strPageName, "InitiateFundTransfer", "DataBaseManager.DLL", strResultCode, strResultDetail, strErrorCode, strErrorDetail, strProcessRemark, Convert.ToString(intProcessSerialId), strProcessId, isSystemError);
        }

        #region Response
        txtMessage.InnerHtml = strAlertMessage.Replace("\\n", "<br />");
        #endregion

        #endregion

        if (sessionExpired) { Response.Redirect("/Expire"); }
    }
}
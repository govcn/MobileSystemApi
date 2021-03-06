﻿<%@ Page Title="" Language="C#" MasterPageFile="~/v2/MasterPages/Payment.master" AutoEventWireup="true" CodeFile="Pay999996.aspx.cs" Inherits="v2_Deposit_Pay999996" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PaymentMainContent" runat="Server">
    <div class="form-group">
        <asp:Label ID="lblAmount" runat="server" AssociatedControlID="txtAmount" />
        <asp:TextBox ID="txtAmount" runat="server" CssClass="form-control" required data-paylimit="true" data-numeric />
    </div>
    <div class="form-group">
        <div class="checkbox checkbox-custom">
            <label>
                <input type="checkbox" id="isSwitchLine">
                <span id="lblSwitchLine"></span>
            </label>
        </div>
    </div>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ScriptsHolder" runat="Server">
    <script src="<%=ConfigurationManager.AppSettings.Get("AssetsPath") %>/assets/js/gateways/alipay.js?v=<%=ConfigurationManager.AppSettings.Get("scriptVersion") %>"></script>
    <script src="<%=ConfigurationManager.AppSettings.Get("AssetsPath") %>/assets/js/gateways/autoroute.js?v=<%=ConfigurationManager.AppSettings.Get("scriptVersion") %>"></script>
    <script src="<%=ConfigurationManager.AppSettings.Get("AssetsPath") %>/assets/js/gateways/banner.js?v=<%=ConfigurationManager.AppSettings.Get("scriptVersion") %>"></script>

    <script type="text/javascript">
        $(document).ready(function () {
            _w88_paymentbanner.init("Alipay");

            _w88_paymentSvcV2.setPaymentTabs("<%=base.PaymentType %>", "<%=base.PaymentMethodId %>");
            _w88_paymentSvcV2.DisplaySettings("<%=base.PaymentMethodId %>", { type: "<%=base.PaymentType %>" });

            _w88_alipay.init();

            $('#form1').validator().on('submit', function (e) {
                if (!e.isDefaultPrevented()) {
                    e.preventDefault();

                    var data = {
                        Amount: $('input[id$="txtAmount"]').autoNumeric('get'),
                        ThankYouPage: location.protocol + "//" + location.host + "/Index",
                        SwitchLine: $('input[id$="isSwitchLine"]').is(':checked'),
                        MethodId: "<%=base.PaymentMethodId%>",
                    };

                    var params = decodeURIComponent($.param(data));
                    window.open(_w88_paymentSvcV2.payRoute + "?" + params, "<%=base.PageName%>");
                    _w88_paymentSvcV2.onTransactionCreated($(this));
                    return;
                }
            });
        });
    </script>
</asp:Content>

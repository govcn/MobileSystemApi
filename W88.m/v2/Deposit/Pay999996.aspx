﻿<%@ Page Title="" Language="C#" MasterPageFile="~/v2/MasterPages/Payment.master" AutoEventWireup="true" CodeFile="Pay999996.aspx.cs" Inherits="v2_Deposit_Pay999996" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PaymentMainContent" runat="Server">
    <div class="form-group pay-note">
        <span id="paymentNote"></span>
        <p id="paymentNoteContent"></p>
    </div>
    <div class="form-group">
        <asp:Label ID="lblAmount" runat="server" AssociatedControlID="txtAmount" />
        <asp:TextBox ID="txtAmount" runat="server" type="number" step="any" min="1" CssClass="form-control" required data-paylimit="0" />
    </div>
    <div class="form-group">
        <asp:CheckBox type="checkbox" ID="isSwitchLine" runat="server" />
        <asp:Label ID="lblSwitchLine" runat="server" AssociatedControlID="isSwitchLine" />
    </div>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ScriptsHolder" runat="Server">
    <script type="text/javascript" src="/_static/v2/assets/js/gateways/alipay.js?v=<%=ConfigurationManager.AppSettings.Get("scriptVersion") %>"></script>
    <script type="text/javascript" src="/_static/v2/assets/js/gateways/autoroute.js?v=<%=ConfigurationManager.AppSettings.Get("scriptVersion") %>"></script>

    <script type="text/javascript">
        $(document).ready(function () {
            _w88_paymentSvcV2.setPaymentTabs("<%=base.PaymentType %>", "<%=base.PaymentMethodId %>");
            _w88_paymentSvcV2.DisplaySettings("<%=base.PaymentMethodId %>", { type: "<%=base.PaymentType %>" });

            window.w88Mobile.Gateways.AlipayV2.init();

            $('#form1').validator().on('submit', function (e) {

                if (!e.isDefaultPrevented()) {
                    e.preventDefault();
                    var data = {
                        Amount: $('input[id$="txtAmount"]').val(),
                        ThankYouPage: location.protocol + "//" + location.host + "/Index",
                        SwitchLine: $('input[id$="isSwitchLine"]').is(':checked'),
                        MethodId: "<%=base.PaymentMethodId%>",
                        AutoRoute: true
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


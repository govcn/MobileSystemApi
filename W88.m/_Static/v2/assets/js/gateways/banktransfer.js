﻿window.w88Mobile.Gateways.BankTransferv2 = BankTransferv2();
var _w88_banktransfer = window.w88Mobile.Gateways.BankTransferv2;

function BankTransferv2() {

    var banktransfer;
    var defaultSelect;

    try {
        banktransfer = Object.create(new w88Mobile.Gateway(_w88_paymentSvcV2));
    } catch (err) {
        banktransfer = {};
    }

    banktransfer.init = function () {
        if (_.isEqual(siteCookie.getCookie('language').toLowerCase(), 'vi-vn') && _.isEqual(siteCookie.getCookie('currencyCode'), 'VND')) {
            $(".pay-note").show();
            $("#paymentNote").text(_w88_contents.translate("LABEL_PAYMENT_NOTE"));
            $("#paymentNoteContent").html(_w88_contents.translate("LABEL_PAYMENT_NOTE_FASTDEPOSIT"));
        } else if (siteCookie.getCookie('currencyCode') == 'KRW') {
            $(".depositDatetime").hide();
        }

        $('label[id$="lblReferenceId"]').text(_w88_contents.translate("LABEL_REFERENCE_ID"));
        $('label[id$="lblSystemAccount"]').text(_w88_contents.translate("LABEL_BANK_ACCOUNT"));
        $('label[id$="lblDepositDateTime"]').text(_w88_contents.translate("LABEL_DEPOSIT_DATETIME"));
        $('label[id$="lblDepositChannel"]').text(_w88_contents.translate("LABEL_DEPOSIT_CHANNEL"));
        $('label[id$="lblBank"]').text(_w88_contents.translate("LABEL_BANK"));
        $('label[id$="lblBankName"]').text(_w88_contents.translate("LABEL_BANK_NAME"));
        $('label[id$="lblAccountName"]').text(_w88_contents.translate("LABEL_ACCOUNT_NAME"));
        $('label[id$="lblAccountNumber"]').text(_w88_contents.translate("LABEL_ACCOUNT_NUMBER"));

        var select = _w88_contents.translate("LABEL_SELECT_DEFAULT");

        _w88_paymentSvcV2.Send("/Banks/system", "GET", "", function (response) {
            var banks = response.ResponseData;
            $('select[id$="drpSystemAccount"]').append($('<option>').text(select).attr('value', '-1'));

            _.forOwn(banks, function (data) {
                $('select[id$="drpSystemAccount"]').append($('<option>').text(data.Text).attr('value', data.Value));
            });
        });

        _w88_paymentSvcV2.Send("/Banks/member", "GET", "", function (response) {
            var banks = response.ResponseData;
            $('select[id$="drpBank"]').append($('<option>').text(select).attr('value', '-1'));

            _.forOwn(banks, function (data) {
                $('select[id$="drpBank"]').append($('<option>').text(data.Text).attr('value', data.Value));
            });

            _w88_paymentSvcV2.Send("/user/banks", "GET", "", function (response) {
                if (!_.isEqual(response.ResponseCode, 0)) {
                    if (!_.isEmpty(response.ResponseData.Bank)) $('select[id$="drpBank"]').val(response.ResponseData.Bank.Value).change();

                    _w88_banktransfer.toogleBank($('select[id$="drpBank"]').val());
                    $('input[id$="txtBankName"]').val(response.ResponseData.BankName);
                    $('input[id$="txtAccountName"]').val(response.ResponseData.AccountName);
                    $('input[id$="txtAccountNumber"]').val(response.ResponseData.AccountNumber);
                }
            });
        });

        _w88_paymentSvcV2.Send("/depositchannel", "GET", "", function (response) {
            var banks = response.ResponseData;
            $('select[id$="drpDepositChannel"]').append($('<option>').text(select).attr('value', '-1'));

            _.forOwn(banks, function (data) {
                if (_.isEqual(siteCookie.getCookie('currencyCode'), 'THB') && _.isEqual(data.Value, 'cBanking'))
                    return;

                $('select[id$="drpDepositChannel"]').append($('<option>').text(data.Text).attr('value', data.Value));
            });
        });

        $('input[id$="txtDepositDate"]').datebox({
            mode: 'calbox',
            showInitialValue: true,
            overrideDateFormat: '%m/%d/%Y',
            minDays: 3,
            maxDays: 3
        });

        $('input[id$="txtDepositTime"]').datebox({
            mode: 'timebox',
            showInitialValue: true,
        });

        $('select[id$="drpBank"]').change(function () {
            banktransfer.toogleBank(this.value);
        });

        $('select[id$="drpDepositChannel"]').change(function () {
            banktransfer.toogleDepositChannel(this.value);
        });
    };

    banktransfer.toogleBank = function (id) {
        if (!_.isEmpty(id)) {
            if (_.isEqual(id.toUpperCase(), "OTHER")) {
                $('.bankName').show();
                $('input[id$="txtBankName"]').attr({ required: '', 'data-require': '' });
            } else {
                $('.bankName').hide();
                $('input[id$="txtBankName"]').removeAttr('required data-require');
            }

            $('#form1').validator('update')
        }
    };

    banktransfer.toogleDepositChannel = function (id) {
        if (!_.isEmpty(id)) {
            if ((_.isEqual(id.toUpperCase(), "CDM")) || _.isEqual(id.toUpperCase(), "CBANKING")) {
                $('.accountNumber').hide();
                $('input[id$="txtAccountNumber"]').removeAttr('required data-require');
            } else {
                $('.accountNumber').show();
                $('input[id$="txtAccountNumber"]').attr({ required: '', 'data-require': '' });
            }

            $('#form1').validator('update')
        }
    };

    banktransfer.createDeposit = function () {
        var _self = this;
        var params = _self.getUrlVars();
        var data = {
            Amount: params.Amount,
            Bank: { Text: params.BankText, Value: params.BankValue },
            AccountName: params.AccountName,
            AccountNumber: params.AccountNumber,
            SystemBank: { Text: params.SystemBankText, Value: params.SystemBankValue },
            BankName: params.BankName,
            ReferenceId: params.ReferenceId,
            DepositChannel: { Text: params.DepositChannelText, Value: params.DepositChannelValue },
            DepositDateTime: params.DepositDateTime,
        };

        _self.methodId = params.MethodId;
        _self.changeRoute();
        _self.deposit(data, function (response) {

            if (_.isArray(response.ResponseMessage))
                w88Mobile.Growl.shout(w88Mobile.Growl.bulletedList(response.ResponseMessage), _self.shoutCallback);
            else
                w88Mobile.Growl.shout(response.ResponseMessage, _self.shoutCallback);

            _w88_banktransfer.toogleBank($('select[id$="drpBank"]').val());

        },
        function () {
            pubsub.publish('stopLoadItem', { selector: "" });
        });
    };


    banktransfer.initWidraw = function () {

        setTranslations();

        function setTranslations() {
            $('label[id$="lblBank"]').text(_w88_contents.translate("LABEL_BANK"));
            $('label[id$="lblSecondBank"]').text(_w88_contents.translate("LABEL_BANK_OTHER"));
            $('label[id$="lblBankLocation"]').text(_w88_contents.translate("LABEL_BANK_LOCATION"));
            $('label[id$="lblBankName"]').text(_w88_contents.translate("LABEL_BANK_NAME"));
            $('label[id$="lblBranch"]').text(_w88_contents.translate("LABEL_BANK_BRANCH"));
            $('label[id$="lblBankBranch"]').text(_w88_contents.translate("LABEL_BANK_BRANCH"));
            $('label[id$="lblAddress"]').text(_w88_contents.translate("LABEL_BANK_ADDRESS"));
            $('label[id$="lblAccountName"]').text(_w88_contents.translate("LABEL_ACCOUNT_NAME"));
            $('label[id$="lblAccountNumber"]').text(_w88_contents.translate("LABEL_ACCOUNT_NUMBER"));
            $('label[id$="lblContact"]').text(_w88_contents.translate("LABEL_CONTACT"));

            _w88_paymentSvcV2.Send("/Banks/member", "GET", "", function (response) {
                if (!_.isEqual(response.ResponseCode, 0)) {
                    var banks = response.ResponseData;
                    defaultSelect = _w88_contents.translate("LABEL_SELECT_DEFAULT");
                    $('select[id$="drpBank"]').append($('<option>').text(defaultSelect).attr('value', '-1'));
                    $('select[id$="drpBank"]').val("-1").change();

                    _.forOwn(banks, function (data) {
                        $('select[id$="drpBank"]').append($('<option>').text(data.Text).attr('value', data.Value));
                    });
                }
            });

            _w88_paymentSvcV2.Send("/CountryPhoneList", "GET", "", function (response) {
                if (!_.isEqual(response.ResponseCode, 0)) {
                    $('select[id$="drpCountryCode"]').append($('<option>').text(defaultSelect).attr('value', '-1'));
                    $('select[id$="drpCountryCode"]').val("-1").change();

                    _.forOwn(response.ResponseData.PhoneList, function (data) {
                        $('select[id$="drpCountryCode"]').append($('<option>').text(data.Text).attr('value', data.Value));
                    });

                    $('select[id$="drpCountryCode"]').val(response.ResponseData.PhoneSelected).change();
                }
            });
        }

    };

    banktransfer.reloadValuesWidraw = function (bankLocationId, bankBranchId) {
        _w88_banktransfer.setOriginStateWidraw();
        _w88_banktransfer.setWithTransactStateWidraw();

        if (bankLocationId.length > 0) {
            _w88_banktransfer.loadBankLocationWidraw(bankLocationId);
            _w88_banktransfer.enableLocationWidraw();
            _w88_banktransfer.disableBranchWidraw();
        }

        if (bankBranchId.length > 0) {
            _w88_banktransfer.disableBranchWidraw();
            _w88_banktransfer.loadBankBranchWidraw(bankLocationId, bankBranchId);
            _w88_banktransfer.enableBranchWidraw();
        }
    };

    banktransfer.toggleBankWidraw = function (bankId, currency) {
        if (bankId == "OTHER") {

            if (currency == "vnd") {

                _w88_banktransfer.setWithTransactStateWidraw();
                _w88_banktransfer.disableLocationWidraw();
                _w88_banktransfer.disableBranchWidraw();

                if (sessionStorage.getItem("hfBLId") == null) {
                    $('select[id$="drpSecondaryBank"]').val("-1").change();
                }

            } else {
                $('[id$="divBankName"]').show();
            }
        } else {
            _w88_banktransfer.setOriginStateWidraw();
        }
    };

    banktransfer.toggleSecondaryBankWidraw = function (bankId, bankLocationId) {
        _w88_banktransfer.setWithTransactStateWidraw();
        _w88_banktransfer.disableLocationWidraw();
        _w88_banktransfer.disableBranchWidraw();

        if (bankId == "OTHER") {

            _w88_banktransfer.setOriginStateWidraw();
            $('[id$="divOtherBank"]').show();
            $('[id$="divBankName"]').show();
            $('input[id$="txtBankBranch"]').attr("required", true).trigger("change");
            $('input[id$="txtAddress"]').attr("required", true).trigger("change");

        } else if (bankId != "-1") {

            _w88_banktransfer.loadBankLocationWidraw(bankLocationId);
            _w88_banktransfer.disableBranchWidraw();
            $('input[id$="txtBankBranch"]').attr("required", false).trigger("change");
            $('input[id$="txtAddress"]').attr("required", false).trigger("change");

        }
    };

    banktransfer.toogleBankBranchWidraw = function (bankLocationId, bankBranchId) {
        _w88_banktransfer.loadBankBranchWidraw(bankLocationId, bankBranchId);
    };

    banktransfer.setOriginStateWidraw = function () {
        $('[id$="divBankName"]').hide();
        $('[id$="divBankBranch"]').show();
        $('[id$="divAddress"]').show();
        $('[id$="divOtherBank"]').hide();
        $('[id$="divBankLocation"]').hide();
        $('[id$="divBankNameSelection"]').hide();

        $('select[id$="drpSecondaryBank"]').removeAttr("data-bankequals");
        $('select[id$="drpBankLocation"]').removeAttr("data-bankequals");
        $('select[id$="drpBankBranchList"]').removeAttr("data-bankequals");
    };

    banktransfer.setWithTransactStateWidraw = function () {
        $('[id$="divBankName"]').hide();
        $('[id$="divBankBranch"]').hide();
        $('[id$="divAddress"]').hide();
        $('[id$="divOtherBank"]').show();
        $('[id$="divBankLocation"]').show();
        $('[id$="divBankNameSelection"]').show();

        $('select[id$="drpSecondaryBank"]').attr("data-bankequals", "-1");
        $('select[id$="drpBankLocation"]').attr("data-bankequals", "-1");
        $('select[id$="drpBankBranchList"]').attr("data-bankequals", "-1");
    };

    banktransfer.disableLocationWidraw = function () {
        $('select[id$="drpBankLocation"]').attr('disabled', 'disabled');
        $('select[id$="drpBankLocation"]').append($('<option>').text(defaultSelect).attr('value', '-1'));
        $('select[id$="drpBankLocation"]').val("-1").change();
    };

    banktransfer.enableLocationWidraw = function () {
        $('select[id$="drpBankLocation"]').removeAttr('disabled', 'disabled');
    };

    banktransfer.disableBranchWidraw = function () {
        $('select[id$="drpBankBranchList"]').attr('disabled', 'disabled');
        $('select[id$="drpBankBranchList"]').append($('<option>').text(defaultSelect).attr('value', '-1'));
        $('select[id$="drpBankBranchList"]').val("-1").change();
    };

    banktransfer.enableBranchWidraw = function () {
        $('select[id$="drpBankBranchList"]').removeAttr('disabled', 'disabled');
    };

    banktransfer.loadBankLocationWidraw = function (blId) {
        var bankId = $('select[id$="drpSecondaryBank"]').val();

        if (bankId != '-1') {
            _w88_paymentSvcV2.Send("/Banks/member/location/" + bankId, "GET", { selector: "location" }, function (response) {
                if (!_.isEqual(response.ResponseCode, 0)) {

                    $('select[id$="drpBankLocation"]').append($('<option>').text(defaultSelect).attr('value', '-1'));
                    $('select[id$="drpBankLocation"]').children('option:not(:first)').remove();

                    $.each(response.ResponseData, function (index, v) {
                        $('select[id$="drpBankLocation"]').append($('<option>').text(v.Text).attr('value', v.Value));
                    });

                    if (!_.isEmpty(blId)) {
                        $('select[id$="drpBankLocation"]').val(blId).change();
                    } else {
                        $('select[id$="drpBankLocation"]').val('-1').change();
                    }

                    _w88_banktransfer.enableLocationWidraw();
                }

            });
        }
    };

    banktransfer.loadBankBranchWidraw = function (bankLocationId, bankBranchId) {
        var bankId = $('select[id$="drpSecondaryBank"]').val();

        if (bankId != '-1') {
            _w88_paymentSvcV2.Send("/Banks/member/branch/" + bankId + "/" + bankLocationId, "GET", { selector: "branch" }, function (response) {
                if (!_.isEqual(response.ResponseCode, 0)) {

                    $('select[id$="drpBankBranchList"]').append($('<option>').text(defaultSelect).attr('value', '-1'));
                    $('select[id$="drpBankBranchList"]').children('option:not(:first)').remove();

                    $.each(response.ResponseData, function (index, v) {
                        $('select[id$="drpBankBranchList"]').append($('<option>').text(v.Text).attr('value', v.Value));
                    });

                    if (!_.isEmpty(bankBranchId)) {
                        $('select[id$="drpBankBranchList"]').val(bankBranchId).change();
                    } else {
                        $('select[id$="drpBankBranchList"]').val("-1").change();
                    }

                    _w88_banktransfer.enableBranchWidraw();
                }

            });
        }
    };

    banktransfer.loadSecondaryBankWidraw = function () {

        _w88_paymentSvcV2.Send("/Banks/member/secondary", "GET", "", function (response) {
            if (!_.isEqual(response.ResponseCode, 0)) {

                $('select[id$="drpSecondaryBank"]').append($('<option>').text(_w88_banktransfer.defaultSelect).attr('value', '-1'));
                $('select[id$="drpSecondaryBank"]').children('option:not(:first)').remove();

                $.each(response.ResponseData, function (index, v) {
                    $('select[id$="drpSecondaryBank"]').append($('<option>').text(v.Text).attr('value', v.Value));
                });

            }

        });
    };


    return banktransfer;
}
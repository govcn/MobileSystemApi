﻿var _w88_paymentSvcV2 = window.w88Mobile.Gateways.DefaultPaymentsV2 = DefaultPaymentsV2();

function DefaultPaymentsV2() {

    var autorouteIds = {
        QuickOnline: "999999",
        UnionPay: "999998",
        TopUpCard: "999997",
        AliPay: "999996",
        WeChat: "999995",
    };

    var defaultpayments = {
        AutoRouteIds: autorouteIds,
        DisplaySettings: displaySettings,
        setPaymentTabs: setPaymentTabs,
        onTransactionCreated: onTransactionCreated,
        formatDateTime: formatDateTime,
        init: init,
        payRoute: "/v2/Deposit/Pay.aspx",
    };

    var paymentCache = {};

    var paymentOptions = {};

    return defaultpayments;

    function init(isDeposit) {

        var type = isDeposit ? "deposit" : "withdrawal";

        fetchSettings(type, function () { });
    }

    function formatDateTime(dateTime) {
        //MM/DD/YYYY h:m:s
        var month = (dateTime.getMonth() + 1).toString().length == 1 ? "0" + (dateTime.getMonth() + 1).toString() : (dateTime.getMonth() + 1).toString();
        var day = (dateTime.getDate()).toString().length == 1 ? "0" + dateTime.getDate().toString() : dateTime.getDate().toString();
        var year = dateTime.getFullYear();

        var hours = dateTime.getHours();
        var minutes = dateTime.getMinutes();
        var seconds = dateTime.getSeconds();

        return month + "/" + day + "/" + year + " " + hours + ":" + minutes + ":" + seconds
    }

    function displaySettings(methodId, options) {
        paymentOptions = options;
        fetchSettings(paymentOptions.type, function () {
            if (!_.isEmpty(paymentCache)) {
                var setting = _.find(paymentCache.settings, function (data) {
                    return data.Id == methodId;
                });

                if (setting) {
                    $('#txtMode').text(": " + setting.PaymentMode);
                    $('#txtMinMaxLimit').text(": " + setting.MinAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) + " / " + setting.MaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }));
                    $('#txtDailyLimit').text(": " + setting.LimitDaily);
                    $('#txtTotalAllowed').text(": " + setting.TotalAllowed);

                    $('#lblTotalAllowed').html($.i18n("LABEL_TOTAL_ALLOWED"));
                    $('#lblDailyLimit').html($.i18n("LABEL_DAILY_LIMIT"));
                    $('#lblMinMaxLimit').html($.i18n("LABEL_MINMAX_LIMIT"));
                    $('#lblMode').html($.i18n("LABEL_MODE"));
                }

                setTranslations(paymentOptions.type);

                _w88_validator.initiateValidator("#form1", setting);
            }
        });

    }

    function setTranslations(paymentOptions) {
        $('label[id$="lblAmount"]').text($.i18n("LABEL_AMOUNT"));

        var headerTitle = paymentOptions == "Deposit" ? $.i18n("LABEL_FUNDS_DEPOSIT") : $.i18n("LABEL_FUNDS_WIDRAW");
        $("header .header-title").text(headerTitle);
        $('span[id$="lblMode"]').text($.i18n("LABEL_MODE"));
        $('span[id$="lblMinMaxLimit"]').text($.i18n("LABEL_MINMAX_LIMIT"));
        $('span[id$="lblDailyLimit"]').text($.i18n("LABEL_DAILY_LIMIT"));
        $('span[id$="lblTotalAllowed"]').text($.i18n("LABEL_TOTAL_ALLOWED"));

        $('#btnSubmitPlacement').text($.i18n("BUTTON_SUBMIT"));
    }

    function setPaymentTabs(type, activeMethodId, method) {
        if (type.toLowerCase() == "deposit") {
            fetchSettings(type, function () {
                if (paymentCache.settings.length == 0) {
                    // track accounts with no gateways
                    w88Mobile.PiwikManager.trackEvent({
                        category: type,
                        action: window.User.countryCode,
                        name: window.User.memberId
                    });

                    nogateway();
                }
                else {
                    // payment cache variable is now present once callback is triggered
                    setDepositPaymentTab(paymentCache.settings, activeMethodId, method);
                }
            });
        } else {
            fetchSettings(type, function () {
                if (paymentCache.settings.length == 0) {
                    nogateway();
                }
                else {

                    _w88_send("/payments/withdrawal/pending", "GET", "", function (response) {
                        switch (response.ResponseCode) {
                            case 1:

                                var pendingWithdrawal = {
                                    Name: response.ResponseData.Name,
                                    TransactionId: response.ResponseData.TransactionId,
                                    MethodId: response.ResponseData.MethodId,
                                    Amount: response.ResponseData.Amount,
                                    RequestDateTime: response.ResponseData.RequestDateTime
                                };

                                var widrawKey = w88Mobile.Keys.withdrawalSettings + "-pending";
                                amplify.store(widrawKey, pendingWithdrawal, User.storageExpiration);

                                window.location = "/v2/Withdrawal/Pending.aspx";
                                break;

                            default:
                                setWithdrawalPaymentTab(paymentCache.settings, activeMethodId);
                                break;
                        }
                    });

                }
            });
        }
    }

    function fetchSettings(type, callback) {

        var url = "/payments/settings/" + type;
        cacheKey = (type.toLowerCase() == "deposit") ? w88Mobile.Keys.depositSettings : w88Mobile.Keys.withdrawalSettings;

        paymentCache = amplify.store(cacheKey);

        if (!_.isEmpty(paymentCache) && User.lang == paymentCache.language) {
            callback();
        } else {
            _w88_send(url, "GET", {}, function (response) {
                switch (response.ResponseCode) {
                    case 1:
                        paymentCache = {
                            settings: response.ResponseData
                            , language: window.User.lang
                        };
                        amplify.store(cacheKey, paymentCache, User.storageExpiration);
                        callback();
                    default:
                        break;
                }
            });
        }
    }

    function onTransactionCreated(form) {

        var historyBtn = "<a href='/v2/History/Default.aspx' class='btn btn-block btn-primary' data-ajax='false'>" + $.i18n("LABEL_FUNDS_HISTORY") + "</a>";
        var message = "<p>" + $.i18n("MESSAGES_CHECK_HISTORY") + "</p>" + historyBtn;
        if (!_.isUndefined(form)) _.first(form).reset();
        w88Mobile.Growl.shout(message);
    }

    function setDepositPaymentTab(responseData, activeTabId, method) {
        if (responseData.length > 0) {
            var routing = [
                autorouteIds.QuickOnline,
                autorouteIds.UnionPay,
                autorouteIds.TopUpCard,
                autorouteIds.AliPay,
                autorouteIds.WeChat
            ];

            var isAutoRoute = false, title = "", page = null, deposit = "/v2/Deposit/";

            if (_.isEmpty(method))
                method = "";

            activeTabId = activeTabId + method;

            for (var i = 0; i < responseData.length; i++) {
                var data = responseData[i];

                data.Method = _.isEmpty(data.Method) ? "" : data.Method;
                data.Id = data.Id + data.Method;

                if (_.isEmpty(data.Method) && _.isEqual(data.Name, "Baokim"))
                    continue;

                page = setPaymentPage(data.Id, data.Method);

                if (page)
                    page = deposit + page;
                else
                    continue;

                if (activeTabId) {
                    if (!_.isEmpty(data.Method) && _.isEqual(data.Name, "Baokim")) {
                        if (_.isEqual(data.Id, activeTabId) && _.isEqual(data.Method, method)) {
                            title = data.Title;
                        }
                    } else {
                        if (_.isEqual(data.Id, activeTabId))
                            title = data.Title;
                    }

                    var anchor = $('<a />', { class: 'list-group-item', id: data.Id, href: page }).text(data.Title);

                    if ($('#paymentTabs').length > 0)
                        $('#paymentTabs').append(anchor);

                }
            }

            if (activeTabId) {
                if (title) {
                    if ($('#activeTab').length > 0)
                        $('#activeTab').text(title);

                    $('#' + activeTabId).addClass('active');

                    $('header .header-title').append(' - ' + title);
                } else {
                    window.location.href = deposit;
                }

                if (_.includes(routing, activeTabId)) {
                    $('.dailyLimit').hide()
                    $('.totalAllowed').hide()
                }
            }
            else {
                page = setPaymentPage(_.first(responseData).Id);
                if (page)
                    window.location.href = deposit + page;
            }

        } else {
            if (activeTabId) {
                window.location.href = deposit;
            }
            else {

                // track accounts with no gateways
                w88Mobile.PiwikManager.trackEvent({
                    category: "Deposit",
                    action: window.User.countryCode,
                    name: window.User.memberId
                });

                nogateway();
            }
        }
    }

    function setWithdrawalPaymentTab(responseData, activeTabId) {
        if (responseData.length > 0) {
            var title = "", withdraw = "/v2/Withdrawal/";
            _.forEach(responseData, function (data) {
                var page = setPaymentPage(data.Id);

                if (page)
                    page = withdraw + page;
                else
                    return;

                if (activeTabId) {
                    if (_.isEqual(data.Id, activeTabId))
                        title = data.Title;

                    var anchor = $('<a />', { class: 'list-group-item', id: data.Id, href: page }).text(data.Title);

                    if ($('#paymentTabs').length > 0)
                        $('#paymentTabs').append(anchor);

                    $('#' + activeTabId).addClass('active');
                }
            })

            if (activeTabId) {
                if ($('#activeTab').length > 0)
                    $('#activeTab').text(title);

                $('header .header-title').append(' - ' + title);
            }
            else {
                page = setPaymentPage(_.first(responseData).Id);
                if (!_.isEmpty(page))
                    window.location.href = withdraw + page;
            }

        } else {
            if (activeTabId) {
                window.location.href = withdraw;
            }
            else {
                nogateway();
            }
        }
    }

    function nogateway() {
        $('.empty-state').show();
        $('#btnSubmitPlacement').hide();
        $('#paymentSettings').hide();
        $('#paymentList').hide();
        $('.gateway-select').hide();
        $('.gateway-restrictions').hide();

        pubsub.publish('stopLoadItem', { selector: "" });
    }

    function setPaymentPage(id) {
        if (_.isEmpty(id))
            return "";

        return "Pay" + id + ".aspx";
    }
}
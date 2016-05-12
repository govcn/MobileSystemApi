﻿function Slots() {
    var Slots = {
        club: 'ClubBravado',
        init: function () {
            var self = this;
            $('.bkg-game > div').each(function () {
                var $this = $(this);
                $this.prepend('<img src="/_Static/Images/' + self.club + '/' + $this.attr('rel') + '" class="img-responsive-full">')
            });
            $("img").error(function () {
                $(this).unbind("error").attr("src", "/_Static/Images/broken-lt.gif");
            });
            self.reCalcSpaces();
        },
        filterDisplay: function () {
            (function (a) { (jQuery.browser = jQuery.browser || {}).android = /android|(android|bb\d+|meego).+mobile/i.test(a) })(navigator.userAgent || navigator.vendor || window.opera);
            (function (a) { (jQuery.browser = jQuery.browser || {}).wp = /iemobile|windows (ce|phone)/i.test(a) })(navigator.userAgent || navigator.vendor || window.opera);
            (function (a) { (jQuery.browser = jQuery.browser || {}).ios = /ip(hone|od|ad)/i.test(a) })(navigator.userAgent || navigator.vendor || window.opera);

            if ($.browser.mobile) {
                $('div[type="IOS"]').hide();
                $('div[type="ANDROID"]').hide();
                $('div[type="WP"]').hide();
                switch (true) {
                    case ($.browser.ios):
                        $('div[type="IOS"]').show();
                        break;
                    case ($.browser.wp):
                        $('div[type="WP"]').show();
                        break;
                    default:
                        $('div[type="ANDROID"]').show();
                        break;
                }

            } else {
                // old logic, but is it necessary?
                $('div[type="ANDROID"]').show();
            }
        },
        reCalcSpaces: function () {
            var parent = $('.bkg-game').parent().width();
            var box = $('.bkg-game').width();

                var columns = Math.floor(parent / box);

                var space = (parent - (box * columns)) / columns;
                if (space == 0) {
                    space = (parent - (box * columns)) / columns;
                }

                $('.bkg-game').css('margin-left', space / 2);
                $('.bkg-game').css('margin-right', space / 2);
        },
        initPalazzo: function () {
            self = this;
            self.init();

            var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 && navigator.userAgent.indexOf('Android') == -1;
            if (isSafari) {
                var palazzoDL = Cookies().getCookie('palazzo_download')

                if (palazzoDL == '' || palazzoDL == '0' || parseInt(palazzoDL) == 0) {
                    $('#palazzoModal').popup();
                    $('#palazzoModal').popup('open');
                }
                else {
                    $('#noShowPalazzoModal').attr('checked', 'checked');
                }
            }

            $('#noShowPalazzoModal').click(function () {
                if ($('#noShowPalazzoModal').is(':checked')) {
                    Cookies().setCookie('palazzo_download', '1', 365);
                }
                else {
                    Cookies().setCookie('palazzo_download', '0', 0);
                }
            });

            var isCloseByClicked = false;

            $('#palazzoModalClose').click(function () {
                isCloseByClicked = true;
            });

            $("#palazzoModal").on("popupafterclose", function () {
                if (!isCloseByClicked) {
                    $('#palazzoModal').popup('open');
                }
            });
        }
    }

    return Slots;
}

window.w88Mobile.Slots = Slots();
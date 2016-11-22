﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="Default" Async="true"%>
<%@ Import Namespace="W88.BusinessLogic.Rewards.Helpers" %>
<%@ Import Namespace="W88.BusinessLogic.Rewards.Models" %>

<!DOCTYPE html>
<html>
<head>
    <title><%=RewardsHelper.GetTranslation(TranslationKeys.Label.Brand)%></title>
    <!--#include virtual="~/_static/head.inc" -->
    <script>
        var ids = [];
    </script>
</head>
<body>
    <div data-role="page" data-theme="b">
        <!--#include virtual="~/_static/header.shtml" -->
        <div class="main-content has-footer" role="main">
            <div id="divLevel" class="wallet-box" runat="server" visible="False">
                <h4 id="usernameLabel" runat="server"></h4>
                <a id="pointsLabel" runat="server" data-ajax="false" href="/Account"></a>                
                <span id="pointLevelLabel" runat="server"></span>
            </div>        
            <div class="container">
                <div class="row">             
                    <asp:Label ID="lblnodata" runat="server" CssClass="nodata" Text="Label" Visible="false"></asp:Label>
                    <div id="listContainer" runat="server"></div>
                </div>
            </div>
        </div>
        <div class="footer footer-generic">
            <div class="btn-group btn-group-justified btn-group-sliding" role="group">
                <asp:ListView ID="CategoryListView" runat="server">
                    <ItemTemplate>
                        <div id="category_<%#DataBinder.Eval(Container.DataItem,"categoryId")%>" class="btn-group" role="group">
                            <script>
                                ids.push('<%#DataBinder.Eval(Container.DataItem,"categoryId")%>');
                            </script>
                            <a class="btn" data-ajax="false" href="/Catalogue?categoryId=<%#DataBinder.Eval(Container.DataItem,"categoryId")%>&sortBy=2">
                                <%#DataBinder.Eval(Container.DataItem,"categoryName")%>
                            </a>
                        </div>
                    </ItemTemplate>
                </asp:ListView>      
            </div>
        </div>
    </div>
    <script>
        var index = 1,
            isSearching = false;

        function reset() {
            $.mobile.loading('hide');
            isSearching = false;
        }

        $(function () {
            $(window).scroll(function () {
                if (($(window).scrollTop() + $(window).height() < $(document).height() - 20)
                    || isSearching) {
                    return;
                }

                $.mobile.loading('show');
                isSearching = true;
                $.ajax({
                    type: 'GET',
                    url: '/api/rewards/search/',
                    headers: {
                        'token': !_.isEmpty(window.user) ? window.user.Token : null
                    },
                    dataType: 'json',
                    data: {
                        CategoryId: '<%=CategoryId%>',
                        Index: index.toString(),
                        MinPoints: <%=MinPoints%>,
                        MaxPoints: <%=MaxPoints%>,
                        PageSize: '<%=PageSize%>',
                        SearchText: '<%=SearchText%>',
                        SortBy: '<%=SortBy%>'
                    },
                    success: function (response) {
                        if (response.ResponseCode != 1 || response.ResponseData == null) {
                            reset();
                            return;
                        }
                        $.ajax({
                            type: 'POST',
                            url: 'Default.aspx/CreateHtml',
                            contentType: 'application/json',
                            data: JSON.stringify({ products: response.ResponseData }),
                            success: function(result) {
                                reset();

                                if (!result) return;
                                var children = $('#listContainer').children(),
                                    count = children.length;
                                if (count == 0) return;
                                $(children[count-1]).after(result.d);
                                index++;
                            }, 
                            error: function() {
                                reset();
                            }
                        });
                    },
                    error: function () {
                        reset();
                    }
                });          
            });

            var children = $('div.btn-group.btn-group-justified.btn-group-sliding').children();
            _.find(ids, function(id) {
                var selector = '#category_' + id,
                    categoryId = selector.substring(1);

                if (_.endsWith(window.location.href, 'categoryId=' + id + '&sortBy=2')) {
                    if (!$(selector).hasClass('active'))
                        $(selector).addClass('active');

                    var index = _.findIndex(children, { id: categoryId }),
                        width = 0;
                    for (var i = 0; i < index; i++) {
                        width += $($(children[i]).find('a')[0]).width();
                    }
                    $('div.footer.footer-generic').scrollLeft(width);
                    return id;
                } 
            });
        });
    </script>
</body>
</html>

﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="About.aspx.cs" Inherits="_Info_About" %>


<!DOCTYPE html>
<html>
<head>
    <title>About Rewards</title>
    <!--#include virtual="~/_static/head.inc" -->
    <script type="text/javascript" src="/_Static/Js/Main.js"></script>
</head>

<body>
    <!--#include virtual="~/_static/splash.shtml" -->
    <div data-role="page" data-theme="b">
        <!--#include virtual="~/_static/header.shtml" -->
        <div class="ui-content" role="main">
            	<asp:Literal ID="htmltext" runat="server"></asp:Literal>
        </div>
        <!-- /content -->
        <!--#include virtual="~/_static/footer.shtml" -->
        <!--#include virtual="~/_static/navMenu.shtml" -->
    </div>
    <!-- /page -->
</body>
</html>

﻿using System;

public partial class v2_Deposit_Pay1202168 : PaymentBasePage
{
    protected void Page_Init(object sender, EventArgs e)
    {
        base.PageName = Convert.ToString(commonVariables.DepositMethod.AllDebitWeChat);
        base.PaymentType = commonVariables.PaymentTransactionType.Deposit;
        base.PaymentMethodId = Convert.ToString((int)commonVariables.DepositMethod.AllDebitWeChat);
    }

    protected void Page_Load(object sender, EventArgs e)
    {
    }

}
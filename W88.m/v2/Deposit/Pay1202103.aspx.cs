﻿using System;

public partial class v2_Deposit_Pay1202103 : PaymentBasePage
{
    protected void Page_Init(object sender, EventArgs e)
    {
        base.PageName = Convert.ToString(commonVariables.DepositMethod.IWallet);
        base.PaymentType = commonVariables.PaymentTransactionType.Deposit;
        base.PaymentMethodId = Convert.ToString((int)commonVariables.DepositMethod.IWallet);
    }

    protected void Page_Load(object sender, EventArgs e)
    {
    }
}
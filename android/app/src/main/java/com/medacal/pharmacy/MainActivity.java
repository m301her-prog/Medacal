package com.medacal.pharmacy;

import com.getcapacitor.BridgeActivity;
import com.medacal.pharmacy.thermal.ThermalPrinterPlugin;

public class MainActivity extends BridgeActivity {
    public MainActivity() {
        registerPlugin(ThermalPrinterPlugin.class);
    }
}

import {registerPlugin} from '@capacitor/core';

export const ThermalPrinter = registerPlugin('ThermalPrinter');

export async function requestPrinterPermissions(){return ThermalPrinter.requestPermissions();}
export async function listPairedPrinters(){const result=await ThermalPrinter.listPairedPrinters();return result.printers||[];}
export async function connectPrinter(address){return ThermalPrinter.connect({address});}
export async function disconnectPrinter(){return ThermalPrinter.disconnect();}
export async function printText(text,{paperSize='58mm',cut=true,bold=false}={}){return ThermalPrinter.print({text,paperSize,cut,bold});}
export async function printReceipt({invoiceNumber,date,payment,total,items,header,footer,paperSize='58mm',cut=true}){return ThermalPrinter.printReceipt({invoiceNumber,date,payment,total,items,header,footer,paperSize,cut});}

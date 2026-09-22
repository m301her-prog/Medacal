import html2pdf from 'html2pdf.js';
import {Capacitor} from '@capacitor/core';
import {Directory, Filesystem} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';

const defaultOptions = {
  margin: [8, 8, 8, 8],
  filename: 'invoice.pdf',
  image: {type: 'jpeg', quality: 0.98},
  html2canvas: {scale: 2, useCORS: true, backgroundColor: '#ffffff'},
  jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'},
};

/**
 * تصدير ومشاركة موحد للويب وتطبيقات Capacitor.
 * في الويب: تنزيل مباشر للملف.
 * في Android/iOS: حفظ مؤقت ثم فتح Share Sheet الأصلي.
 */
export const saveAndExportPDF = async (element, fileName, opt = {}) => {
  if (!element) throw new Error('عنصر الفاتورة غير موجود لإنشاء PDF.');

  const safeName = `${String(fileName || 'invoice').replace(/[^\w\u0600-\u06FF.-]+/g, '_').replace(/\.pdf$/i, '')}.pdf`;
  const options = {
    ...defaultOptions,
    ...opt,
    filename: safeName,
    image: {...defaultOptions.image, ...(opt.image || {})},
    html2canvas: {...defaultOptions.html2canvas, ...(opt.html2canvas || {})},
    jsPDF: {...defaultOptions.jsPDF, ...(opt.jsPDF || {})},
  };

  if (!Capacitor.isNativePlatform()) {
    try {
      await html2pdf().set(options).from(element).save();
      return {saved: true, shared: false, fileName: safeName};
    } catch (err) {
      console.error('خطأ أثناء تحضير PDF للويب:', err);
      throw err;
    }
  }

  try {
    const pdfDataUri = await html2pdf().set(options).from(element).outputPdf('datauristring');
    const base64Data = pdfDataUri.split(',')[1];
    if (!base64Data) throw new Error('لم يتم إنشاء محتوى PDF صالح.');

    const savedFile = await Filesystem.writeFile({
      path: safeName,
      data: base64Data,
      directory: Directory.Cache,
      recursive: true,
    });

    const canShare = await Share.canShare();
    if (canShare.value) {
      await Share.share({
        title: safeName,
        text: 'إليك فاتورة فرما تيك بصيغة PDF',
        url: savedFile.uri,
        dialogTitle: 'فتح أو مشاركة ملف PDF',
      });
    }

    return {saved: true, shared: canShare.value, uri: savedFile.uri, fileName: safeName};
  } catch (error) {
    console.error('حدث خطأ أثناء حفظ أو مشاركة الملف:', error);
    throw error;
  }
};

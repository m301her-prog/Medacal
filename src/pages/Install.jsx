import {Download, ExternalLink, Monitor, Smartphone, Tablet, Wifi, CheckCircle2, Copy, Share2} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';

const APK_URL = 'https://github.com/m301her-prog/Medacal/releases/latest/download/Medacal-debug.apk';

function detectDevice(){
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/ipad|tablet/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'tablet';
  return 'desktop';
}

export default function Install(){
  const [device] = useState(detectDevice);
  const [installEvent, setInstallEvent] = useState(() => window.__deferredInstallPrompt || null);
  const [copied, setCopied] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(()=>{
    const onAvailable = ()=>setInstallEvent(window.__deferredInstallPrompt || null);
    window.addEventListener('pwa-install-available', onAvailable);
    window.addEventListener('appinstalled', ()=>setInstalled(true));
    return ()=>window.removeEventListener('pwa-install-available', onAvailable);
  },[]);
  const title = useMemo(()=>({android:'هاتف Android',tablet:'تابلت أو iPad',desktop:'كمبيوتر أو لابتوب'}[device]),[device]);
  const installPwa = async()=>{
    if(!installEvent){ window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'}); return; }
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if(result.outcome === 'accepted') setInstalled(true);
    window.__deferredInstallPrompt = null;
    setInstallEvent(null);
  };
  const copyLink = async()=>{ await navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),1800); };
  return <main className="module-page install-page">
    <div className="page-title"><div><div className="eyebrow"><Download size={15}/> مركز التثبيت</div><h1>ثبّت فرما تيك على جهازك</h1><p>تطبيق واحد للصيدلية، يعمل على الهاتف والتابلت والكمبيوتر.</p></div><button className="primary" onClick={copyLink}>{copied?<CheckCircle2 size={17}/>:<Copy size={17}/>} {copied?'تم نسخ الرابط':'نسخ رابط التثبيت'}</button></div>
    <section className="install-hero panel"><div><span className="install-kicker"><Wifi size={14}/> رابط تثبيت موحد</span><h2>أنت تستخدم <b>{title}</b></h2><p>لأفضل تجربة، اختر الطريقة المناسبة لجهازك. لا يمكن للمتصفح تثبيت برنامج سطح مكتب بصمت، لذلك نستخدم التثبيت الرسمي الآمن.</p><div className="install-actions">{device==='android'&&<a className="primary" href={APK_URL}><Download size={17}/> تحميل APK لأندرويد</a>}<button className="primary" onClick={installPwa} disabled={installed}><Download size={17}/> {installed?'تم تثبيت فرما تيك':'تثبيت التطبيق على هذا الجهاز'}</button></div></div><div className="install-device-icon">{device==='android'?<Smartphone size={72}/>:device==='tablet'?<Tablet size={72}/>:<Monitor size={72}/>}<small>{title}</small></div></section>
    <div className="install-grid"><InstallCard icon={Smartphone} title="Android" tone="mint"><p>حمّل APK وثبّته على الهاتف أو التابلت. فعّل السماح بالتثبيت من هذا المصدر عند الطلب.</p><a className="outline-button" href={APK_URL}><Download size={15}/> تحميل APK</a></InstallCard><InstallCard icon={Monitor} title="Windows / macOS / Linux" tone="blue"><p>افتح الرابط من Chrome أو Edge ثم اضغط زر التثبيت ليعمل فرما تيك كتطبيق مستقل.</p><button className="outline-button" onClick={installPwa}><Download size={15}/> تثبيت كتطبيق سطح مكتب</button></InstallCard><InstallCard icon={Tablet} title="تابلت و iPad" tone="violet"><p>على Android استخدم APK، وعلى iPad افتح قائمة المشاركة ثم اختر «إضافة إلى الشاشة الرئيسية».</p><button className="outline-button" onClick={()=>navigator.share?.({title:'فرما تيك',url:window.location.href})}><Share2 size={15}/> مشاركة الرابط</button></InstallCard></div>
    <section className="panel install-help"><h2>طريقة التثبيت</h2><div className="steps"><span><b>1</b> أرسل هذا الرابط للجهاز المطلوب</span><span><b>2</b> اختر الطريقة المناسبة لنوع الجهاز</span><span><b>3</b> افتح فرما تيك من الأيقونة بعد التثبيت</span></div><small>الرابط يعمل عبر HTTPS. تثبيت PWA متاح من المتصفحات الحديثة، أما APK فهو لأجهزة Android فقط.</small></section>
  </main>
}
function InstallCard({icon:Icon,title,children,tone}){return <article className={`install-card ${tone}`}><div className="install-card-icon"><Icon size={24}/></div><h3>{title}</h3>{children}</article>}

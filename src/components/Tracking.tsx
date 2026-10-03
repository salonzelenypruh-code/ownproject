"use client";
import Script from "next/script";
import { useConsent } from "@/lib/consent";

/** GA4 + Facebook Pixel – načtou se až po souhlasu „Přijmout vše“. ID se zadávají v adminu (Nastavení). */
export function Tracking({ gaId, fbPixelId }: { gaId: string; fbPixelId: string }) {
  const consent = useConsent();
  const ga = /^G-[A-Z0-9]+$/.test(gaId) ? gaId : "";
  const fb = /^\d{6,20}$/.test(fbPixelId) ? fbPixelId : "";
  if (consent !== "all" || (!ga && !fb)) return null;
  return (
    <>
      {ga && (
        <>
          <Script id="ga-consent" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
            gtag('js', new Date()); gtag('config', '${ga}');
          `}</Script>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
        </>
      )}
      {fb && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fb}'); fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}

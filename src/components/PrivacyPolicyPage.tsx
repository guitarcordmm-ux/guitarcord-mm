import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const updatedOn = '၂၀၂၆ ခုနှစ်၊ အောက်တိုဘာလ ၁၃ ရက်';

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="space-y-2 text-sm leading-7 text-white/65">{children}</div>
    </section>
  );
}

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-2xl px-5 pt-safe pt-5 pb-12">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Privacy Policy</h1>
            <p className="text-xs text-white/35">GuitarCordMM · ပြင်ဆင်သည့်နေ့ {updatedOn}</p>
          </div>
        </header>

        <main className="mt-7 space-y-6">
          <p className="text-sm leading-7 text-white/65">
            GuitarCordMM (“GuitarCord”, “ကျွန်ုပ်တို့”) က GuitarCord ဝဘ်ဆိုက်နှင့် mobile app (“ဝန်ဆောင်မှု”) ကို အသုံးပြုသူများ၏ အချက်အလက်ကို ဘယ်လိုရယူ၊ အသုံးပြု၊ သိမ်းဆည်း၊ မျှဝေပြီး ကာကွယ်သည်ကို ဒီ Privacy Policy မှာ ရှင်းပြထားပါတယ်။ ဝန်ဆောင်မှုကို အသုံးပြုခြင်းမပြုမီ ဖတ်ရှုပါ။
          </p>

          <PolicySection title="၁။ တာဝန်ရှိသူနှင့် ဆက်သွယ်ရန်">
            <p>ထုတ်ဝေသူနှင့် ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ ဆက်သွယ်ရန်အဖွဲ့မှာ GuitarCordMM ဖြစ်ပါတယ်။</p>
            <p>
              Privacy၊ ကိုယ်ရေးအချက်အလက်ကြည့်ရှု/ပြင်ဆင်/ဖျက်ပေးရန်၊ အကောင့်ဖျက်ရန် သို့မဟုတ် မူဝါဒနှင့်ပတ်သက်သည့် မေးခွန်းများအတွက်{' '}
              <a className="text-[#FFD600] underline" href="mailto:support@guitarcordmm.com">support@guitarcordmm.com</a>{' '}
              သို့ ဆက်သွယ်ပါ။ တောင်းဆိုမှုကို ဆောင်ရွက်ရာတွင် အကောင့်ပိုင်ရှင်ဖြစ်ကြောင်း အတည်ပြုရန် ထပ်မံမေးမြန်းနိုင်ပါတယ်။
            </p>
          </PolicySection>

          <PolicySection title="၂။ ဘယ်ဝန်ဆောင်မှုတွေမှာ သက်ဆိုင်သလဲ">
            <p>
              ဒီမူဝါဒသည် GuitarCord ဝဘ်ဆိုက်၊ Android app၊ နောက်ပိုင်းထုတ်ဝေမည့် iOS app (ရှိပါက) နှင့် GuitarCord က စီမံခန့်ခွဲသည့် ဆက်စပ်ဝန်ဆောင်မှုများအပေါ် သက်ဆိုင်ပါတယ်။ ပြင်ပ website သို့မဟုတ် ဝန်ဆောင်မှုသို့ link ဖြင့်သွားပါက ထိုပြင်ပအဖွဲ့အစည်း၏ သီးခြားမူဝါဒကို လိုက်နာရပါမယ်။
            </p>
          </PolicySection>

          <PolicySection title="၃။ ကျွန်ုပ်တို့ ရယူနိုင်သည့် အချက်အလက်များ">
            <ul className="list-disc space-y-2 pl-5">
              <li><span className="text-white/80">အကောင့်အချက်အလက် —</span> email လိပ်စာ၊ username/display name၊ Supabase account ID နှင့် login နည်းလမ်း။ Email/password သို့မဟုတ် Google sign-in ကို သုံးပါက အကောင့်ဝင်ရန်လိုအပ်သည့် အချက်အလက်ကို Supabase နှင့် သက်ဆိုင်ရာ sign-in provider က ဆောင်ရွက်ပါတယ်။</li>
              <li><span className="text-white/80">သင်တင်သွင်းသည့် အကြောင်းအရာ —</span> သီချင်းအမည်၊ အဆိုတော်/တေးရေးအမည်၊ chord နှင့် lyrics စာသား၊ genre၊ tags၊ image/tutorial URL နှင့် တင်သွင်းသူအကောင့် ID သို့မဟုတ် email စသည်တို့။ တင်သွင်းသည့် အကြောင်းအရာကို စစ်ဆေးအတည်ပြုပြီးနောက် အများမြင်နိုင်အောင် ထုတ်ပြနိုင်ပါတယ်။</li>
              <li><span className="text-white/80">အသုံးပြုမှုနှင့် ရှာဖွေမှု —</span> app ထဲတွင် သင်ရှာဖွေသည့် စကားလုံးများနှင့် တောင်းဆိုသည့် သီချင်း/စာမျက်နှာများကို သက်ဆိုင်ရာရလဒ် ပြန်ပေးရန် ဝန်ဆောင်မှုဆီ ပို့နိုင်ပါတယ်။</li>
              <li><span className="text-white/80">စက်နှင့် ချိတ်ဆက်မှုဆိုင်ရာ အချက်အလက် —</span> app/website ကို တင်ပို့ပေးသည့် hosting provider က IP address၊ browser/device အမျိုးအစား၊ အချိန်၊ တောင်းဆိုသည့် URL၊ error နှင့် လုံခြုံရေး/စွမ်းဆောင်ရည်ဆိုင်ရာ log များကို ပုံမှန် server လုပ်ငန်းဆောင်ရွက်မှုအဖြစ် လက်ခံရရှိနိုင်ပါတယ်။</li>
              <li><span className="text-white/80">စက်ထဲသိမ်းထားသည့် အချက်အလက် —</span> သီချင်းစာရင်း cache၊ login session/token နှင့် Supabase မရနိုင်ချိန် fallback အတွက် အချို့အချက်အလက်ကို browser သို့မဟုတ် app ၏ local storage တွင် သိမ်းနိုင်ပါတယ်။</li>
            </ul>
          </PolicySection>

          <PolicySection title="၄။ အချက်အလက်ကို ဘာအတွက်သုံးသလဲ">
            <ul className="list-disc space-y-2 pl-5">
              <li>အကောင့်ဖန်တီးခြင်း၊ login စစ်ဆေးခြင်းနှင့် session ကို ဆက်လက်ထိန်းသိမ်းခြင်း။</li>
              <li>သီချင်း၊ အနုပညာရှင်နှင့် chord များကို ရှာဖွေ၊ ဖော်ပြ၊ စီစဉ်ပေးခြင်း။</li>
              <li>အသုံးပြုသူတင်သွင်းသော သီချင်းများကို ချိတ်ဆက်ဖော်ပြခြင်း၊ review/approve လုပ်ခြင်းနှင့် အလွဲသုံးစားမှုကို စစ်ဆေးခြင်း။</li>
              <li>app ၏ လုံခြုံရေး၊ အမှားရှာဖွေမှု၊ တည်ငြိမ်မှုနှင့် စွမ်းဆောင်ရည်ကို ထိန်းသိမ်း/ပြုပြင်ခြင်း။</li>
              <li>သင်ပေးပို့သော အကူအညီတောင်းခံမှု သို့မဟုတ် privacy request ကို ဖြေရှင်းခြင်း။</li>
              <li>သက်ဆိုင်ရာဥပဒေ၊ တရားဝင်တောင်းဆိုမှုနှင့် ဝန်ဆောင်မှုစည်းကမ်းများကို လိုက်နာခြင်း။</li>
            </ul>
            <p>GuitarCord သည် လက်ရှိတွင် ကြော်ငြာပစ်မှတ်ထားရန်အတွက် ကိုယ်ရေးအချက်အလက်ကို မရောင်းချပါ။</p>
          </PolicySection>

          <PolicySection title="၅။ သီချင်းတင်သွင်းမှုနှင့် အများမြင်နိုင်သော အကြောင်းအရာ">
            <p>
              သင်တင်သွင်းသည့် သီချင်းကို စစ်ဆေးရန်အတွက် အရင်သိမ်းဆည်းနိုင်ပြီး အတည်ပြုပြီးပါက အခြားအသုံးပြုသူများ မြင်နိုင်ပါတယ်။ အများမြင်သည့် သီချင်းစာမျက်နှာတွင် အမည်၊ အဆိုတော်၊ chord၊ lyrics၊ tags၊ ပုံ/သင်ခန်းစာ link နှင့် သက်ဆိုင်ရာစာရင်းအချက်အလက်များ ပါနိုင်ပါတယ်။ အများသိရှိစေရန် မရည်ရွယ်သော ကိုယ်ရေးအချက်အလက်ကို သီချင်းစာသား၊ tags သို့မဟုတ် URL ထဲ မထည့်ပါနှင့်။
            </p>
            <p>
              သင်တင်သွင်းသော အကြောင်းအရာကို ဖယ်ရှားရန် သို့မဟုတ် ပြင်ဆင်ရန် support email ကို ဆက်သွယ်ပြီး သီချင်းအမည်/link နှင့် လိုချင်သည့်လုပ်ဆောင်ချက်ကို ရေးပို့ပါ။ အခြားအသုံးပြုသူများ၏ မိတ္တူ၊ cache သို့မဟုတ် ဥပဒေအရ ထိန်းသိမ်းရမည့် မှတ်တမ်းများသည် ဖယ်ရှားမှုအပြီး ချက်ချင်းမပျောက်နိုင်ပါ။
            </p>
          </PolicySection>

          <PolicySection title="၆။ ပြင်ပဝန်ဆောင်မှုပေးသူများနှင့် မျှဝေခြင်း">
            <p>ဝန်ဆောင်မှုကို လည်ပတ်နိုင်ရန် လိုအပ်သည့် အတိုင်းအတာအတွင်း အောက်ပါပြင်ပဝန်ဆောင်မှုများနှင့် အချက်အလက်ကို ဆောင်ရွက်စေနိုင်ပါတယ်—</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><span className="text-white/80">Supabase —</span> authentication နှင့် song database/API လုပ်ဆောင်ချက်များ။</li>
              <li><span className="text-white/80">Vercel —</span> website hosting၊ API delivery နှင့် လုံခြုံရေး/စွမ်းဆောင်ရည်ဆိုင်ရာ infrastructure logs။</li>
              <li><span className="text-white/80">Google —</span> သင် Google sign-in ရွေးချယ်ပါက authentication အတွက်၊ ထို့အပြင် Google Fonts ကို app စာလုံးပုံစံဖော်ပြရန် တောင်းဆိုနိုင်ပါတယ်။</li>
            </ul>
            <p>
              ဝန်ဆောင်မှုပေးသူတစ်ခုချင်းစီ၏ ကိုယ်ရေးအချက်အလက်ကို ဆောင်ရွက်ပုံသည် ၎င်းတို့၏ မူဝါဒနှင့် စည်းကမ်းများအပေါ်လည်း မူတည်ပါတယ်။ ဝန်ဆောင်မှုပေးသူများနှင့် မျှဝေမှုသည် app လည်ပတ်ရေးအတွက် လိုအပ်သည့်အတိုင်းသာ ဖြစ်စေရန် ရည်ရွယ်ပါတယ်။ ဥပဒေလိုအပ်ချက်၊ လုံခြုံရေး၊ အခွင့်အရေးကာကွယ်ရေး သို့မဟုတ် တရားဝင်တောင်းဆိုမှုအတွက် လိုအပ်ပါက အချက်အလက်ကို သက်ဆိုင်ရာအာဏာပိုင်/အဖွဲ့အစည်းထံ ပေးအပ်ရနိုင်ပါတယ်။
            </p>
          </PolicySection>

          <PolicySection title="၇။ Cookies၊ local storage နှင့် app permissions">
            <p>
              ဝဘ်ဆိုက်သည် login session ထိန်းသိမ်းရန်နှင့် သီချင်းစာရင်းကို cache လုပ်ရန် browser local storage ကို အသုံးပြုနိုင်ပါတယ်။ Android/iOS app တွင်လည်း webview/app storage ကို အသုံးပြုနိုင်ပါတယ်။ Browser/app settings မှ site data ကိုရှင်းလင်းနိုင်ပေမဲ့ ထိုသို့လုပ်လျှင် session ပျောက်ပြီး ပြန်လည် login ဝင်ရန်လိုနိုင်ပါတယ်။
            </p>
            <p>
              လက်ရှိ code အရ GuitarCord ၏ အဓိကသီချင်းကြည့်ရှုမှုအတွက် location သို့မဟုတ် contacts permission မလိုအပ်ပါ။ Device OS က ခွင့်ပြုချက်ပြောင်းလဲနိုင်ပြီး နောက်ပိုင်း feature အသစ်ထည့်ပါက လိုအပ်သည့် permission နှင့် အကြောင်းရင်းကို သက်ဆိုင်ရာနေရာတွင် ရှင်းပြပါမယ်။
            </p>
          </PolicySection>

          <PolicySection title="၈။ ကြော်ငြာ၊ analytics နှင့် ငွေပေးချေမှု">
            <p>
              ဒီမူဝါဒ ပြင်ဆင်သည့်နေ့တွင် GuitarCord app ထဲတွင် AdMob/ကြော်ငြာ SDK၊ paid subscription၊ in-app purchase သို့မဟုတ် payment processor မထည့်ရသေးပါ။ ထို့ကြောင့် ကြော်ငြာ ID၊ ကြော်ငြာကြည့်ရှုမှုမှတ်တမ်း သို့မဟုတ် ဝယ်ယူမှုအချက်အလက်ကို GuitarCord က ထို feature များအတွက် မရယူသေးပါ။
            </p>
            <p>
              အနာဂတ်တွင် ကြော်ငြာ၊ analytics သို့မဟုတ် paid feature များထည့်ပါက မည်သည့် SDK/provider သုံးသည်၊ မည်သည့် data များကို ဘာအတွက်သုံးသည်၊ consent ရွေးချယ်မှုနှင့် ပိတ်/ပြင်ဆင်နည်းတို့ကို feature မဖွင့်မီ ဒီမူဝါဒနှင့် သက်ဆိုင်ရာ Google Play/App Store data disclosures တွင် update လုပ်ပါမယ်။ Store အတွင်း digital content သို့မဟုတ် app feature ရောင်းချပါက သက်ဆိုင်ရာ store billing rules ကို လိုက်နာပါမယ်။
            </p>
          </PolicySection>

          <PolicySection title="၉။ နိုင်ငံတကာ data processing">
            <p>
              Hosting၊ database နှင့် authentication provider များ၏ infrastructure တည်နေရာနှင့် backup တည်နေရာပေါ်မူတည်ပြီး အချက်အလက်ကို သင့်နေထိုင်ရာနိုင်ငံပြင်ပတွင် ဆောင်ရွက်/သိမ်းဆည်းနိုင်ပါတယ်။ နိုင်ငံတစ်ခုနှင့်တစ်ခု၏ data protection စည်းမျဉ်းများ မတူနိုင်ပါ။ Backend project ၏ region နှင့် provider terms ကို အကောင့်ပိုင်ရှင်က သီးခြားစစ်ဆေးထားသင့်ပါတယ်။
            </p>
          </PolicySection>

          <PolicySection title="၁၀။ သိမ်းဆည်းထားမည့်ကာလ">
            <p>
              အချက်အလက်ကို ဖော်ပြထားသည့် ရည်ရွယ်ချက်အတွက် လိုအပ်သမျှကာလ၊ အကောင့်အသုံးပြုနေသည့်ကာလ၊ သီချင်းအကြောင်းအရာကို ဝန်ဆောင်မှုပေးရန်လိုအပ်သည့်ကာလ သို့မဟုတ် ဥပဒေ/လုံခြုံရေးဆိုင်ရာ မှတ်တမ်းထိန်းသိမ်းရန်လိုအပ်သည့်ကာလအထိ ထိန်းသိမ်းနိုင်ပါတယ်။ Local သီချင်းစာရင်း cache သည် စက်ထဲတွင် အများဆုံး ၇ ရက်သာ သက်တမ်းရှိပြီး app က သက်တမ်းကုန် cache ကို ပြန်မသုံးပါ။ Provider ၏ server log နှင့် backup များအတွက် ထိန်းသိမ်းကာလသည် provider ၏ configuration နှင့် စည်းကမ်းများပေါ် မူတည်နိုင်ပါတယ်။
            </p>
          </PolicySection>

          <PolicySection title="၁၁။ အချက်အလက်လုံခြုံရေး">
            <p>
              အကောင့်နှင့် database access ကို ကာကွယ်ရန် authentication၊ access control နှင့် hosting/database provider များ၏ လုံခြုံရေးလုပ်ဆောင်ချက်များကို အသုံးပြုပါတယ်။ သို့သော် အင်တာနက်မှတစ်ဆင့် ပို့လွှတ်ခြင်း သို့မဟုတ် အီလက်ထရွန်နစ်သိမ်းဆည်းမှုစနစ်တစ်ခုခုသည် လုံးဝအန္တရာယ်ကင်းသည်ဟု အာမခံမပေးနိုင်ပါ။ Password ကို အခြားသူများနှင့် မမျှဝေပါနှင့်၊ သံသယရှိ login ဖြစ်ပါက support ကို ချက်ချင်းဆက်သွယ်ပါ။
            </p>
          </PolicySection>

          <PolicySection title="၁၂။ သင့်ရွေးချယ်ခွင့်နှင့် ကိုယ်ရေးအချက်အလက်တောင်းဆိုမှုများ">
            <p>
              သင့်နေထိုင်ရာဒေသ၏ ဥပဒေအရ သင့်အကောင့် သို့မဟုတ် ကိုယ်ရေးအချက်အလက်ကို ကြည့်ရှုရန်၊ မမှန်ကန်သည့်အချက်ကို ပြင်ဆင်ရန်၊ ဖျက်ရန်၊ အချို့ processing ကို ကန့်သတ်ရန် သို့မဟုတ် ကန့်ကွက်ရန် အခွင့်အရေး ရှိနိုင်ပါတယ်။ တောင်းဆိုမှုများကို support@guitarcordmm.com သို့ ပို့ပါ။ တောင်းဆိုချက်၏ အမျိုးအစား၊ အကောင့်ပိုင်ရှင်စစ်ဆေးမှု၊ သက်ဆိုင်ရာဥပဒေနှင့် ကျွန်ုပ်တို့ ထိန်းချုပ်နိုင်သည့် data ပေါ်မူတည်ပြီး ဆောင်ရွက်ပါမယ်။
            </p>
          </PolicySection>

          <PolicySection title="၁၃။ အကောင့်နှင့် data ဖျက်ရန်">
            <p>
              အကောင့်ဖျက်ရန် app ထဲရှိ Settings → Delete Account ကိုဖွင့်ပါ၊ သို့မဟုတ်{' '}
              <Link className="text-[#FFD600] underline" to="/delete-account">အများသုံး Account Deletion စာမျက်နှာ</Link>{' '}
              ကိုဖွင့်ပြီး အကောင့်ဝင်ကာ အတည်ပြုပါ။ ဝင်မရပါက support@guitarcordmm.com သို့ account email ကိုဖော်ပြပြီး တောင်းဆိုနိုင်ပါတယ်။ အတည်ပြုလိုက်သည်နှင့် GuitarCord sign-in account ကို ဖျက်ပါမယ်။ ထိုအကောင့်မှ တင်သွင်းထားသော သီချင်းများ—အတည်ပြုပြီးသားများအပါအဝင်—ကို public library မှဖယ်ရှားပြီး ကျွန်ုပ်တို့၏ private database archive ထဲတွင် နောက်ပိုင်းပြန်အသုံးပြုနိုင်ရန် သိမ်းထားပါမယ်။ သီချင်း record များမှ account ID နှင့် email ကို ဖယ်ရှားပါမယ်။ Archived သီချင်းများကို အများမြင်နိုင်မည်မဟုတ်ပါ။ ဥပဒေအရ မဖြစ်မနေသိမ်းဆည်းရသည့် မှတ်တမ်း သို့မဟုတ် provider backup များအတွက် ယာယီမိတ္တူများ ကျန်နိုင်ပါတယ်။
            </p>
            <p>
              အကောင့်ဖျက်ပြီးနောက် သီချင်းများကို user dashboard မှ ပြန်မရနိုင်တော့သလို account ကိုလည်း ပြန်ယူလို့မရပါ။ GuitarCord က private archive ထဲရှိ သီချင်းအကြောင်းအရာကို အများသုံး library သို့ ပြန်တင်မည်ဆိုပါက သီးခြားစစ်ဆေးပြီး သင့်လျော်သည့် ခွင့်ပြုချက်နှင့် မူပိုင်ခွင့်လိုအပ်ချက်များကို လိုက်နာပါမယ်။
            </p>
          </PolicySection>

          <PolicySection title="၁၄။ ကလေးသူငယ်များ၏ ကိုယ်ရေးအချက်အလက်">
            <p>
              GuitarCord ကို အသက်မပြည့်သေးသူများအတွက် အထူးရည်ရွယ်ဖန်တီးထားသည့် ဝန်ဆောင်မှုအဖြစ် မကြော်ငြာထားပါ။ မိဘ/အုပ်ထိန်းသူတစ်ဦးက ကလေး၏ ကိုယ်ရေးအချက်အလက်ကို ခွင့်ပြုချက်မရှိဘဲ ပေးပို့ထားကြောင်း သိရှိပါက support@guitarcordmm.com သို့ ဆက်သွယ်ပါ။ သက်ဆိုင်ရာအခြေအနေနှင့် ဥပဒေခွင့်ပြုချက်အရ စစ်ဆေးပြီး သင့်လျော်သည့် အရေးယူမှု ပြုလုပ်ပါမယ်။
            </p>
          </PolicySection>

          <PolicySection title="၁၅။ မူဝါဒပြောင်းလဲမှု">
            <p>
              ဝန်ဆောင်မှု၊ data အသုံးပြုပုံ၊ ပြင်ပ provider သို့မဟုတ် ဥပဒေလိုအပ်ချက် ပြောင်းလဲပါက ဒီမူဝါဒကို ပြင်ဆင်နိုင်ပါတယ်။ ပြင်ဆင်သည့်နေ့ကို စာမျက်နှာထိပ်တွင် update လုပ်ပါမယ်။ အရေးကြီးသော ပြောင်းလဲမှုရှိပါက app ထဲတွင် သတိပေးနိုင်ပြီး၊ သက်ဆိုင်ရာဥပဒေက တောင်းဆိုပါက ထပ်မံသဘောတူညီချက် ရယူပါမယ်။
            </p>
          </PolicySection>

          <div className="border-t border-white/10 pt-5 text-xs leading-6 text-white/40">
            <p>မေးခွန်း သို့မဟုတ် privacy request — <a className="text-[#FFD600] underline" href="mailto:support@guitarcordmm.com">support@guitarcordmm.com</a></p>
            <Link to="/delete-account" className="mt-2 inline-block text-[#FFD600] underline">အကောင့်ဖျက်ရန်</Link>
            <Link to="/settings" className="mt-3 inline-block text-[#FFD600] underline">Settings သို့ပြန်ရန်</Link>
          </div>
        </main>
      </div>
    </div>
  );
}

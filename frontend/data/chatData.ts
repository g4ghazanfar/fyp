export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "support";
  text: string;
  time: string;
  isRead: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  role: "AI Assistant" | "Support" | "Nutritionist";
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

const now = new Date();
const timeAgo = (mins: number) => {
  const d = new Date(now.getTime() - mins * 60000);
  return d.toLocaleTimeString("ur-PK", { hour: "2-digit", minute: "2-digit" });
};

export const CHAT_CONTACTS: ChatContact[] = [
  {
    id: "ai",
    name: "SmartEats AI",
    role: "AI Assistant",
    avatar: "🤖",
    lastMessage: "آپ کے لیے صحت مند کھانا تجویز کرنے کے لیے حاضر ہوں",
    lastTime: timeAgo(5),
    unread: 1,
    online: true,
    messages: [
      {
        id: "ai_1",
        sender: "ai",
        text: "السلام علیکم! میں SmartEats AI ہوں۔ آپ کی صحت کے مطابق کھانا تجویز کرنا میری خدمت ہے۔",
        time: timeAgo(60),
        isRead: true,
      },
      {
        id: "ai_2",
        sender: "user",
        text: "مجھے ذیابطیس ہے، کیا کھاؤں؟",
        time: timeAgo(55),
        isRead: true,
      },
      {
        id: "ai_3",
        sender: "ai",
        text: "ذیابطیس کے لیے آپ کو کم گلائسیمک انڈیکس والے کھانے کھانے چاہئیں۔ مسور دال، گرل مچھلی، سبزیاں اور بھوری روٹی بہترین انتخاب ہے۔ چاول اور میٹھے سے پرہیز کریں۔",
        time: timeAgo(54),
        isRead: true,
      },
      {
        id: "ai_4",
        sender: "ai",
        text: "آپ کے لیے آج کی تجویز: صبح ابلے انڈے + چھاچھ، دوپہر مسور دال + چپاتی، رات گرل مچھلی + سبزیاں ✅",
        time: timeAgo(5),
        isRead: false,
      },
    ],
  },
  {
    id: "support",
    name: "Customer Support",
    role: "Support",
    avatar: "👩‍💼",
    lastMessage: "آپ کا آرڈر 25 منٹ میں پہنچ جائے گا",
    lastTime: timeAgo(15),
    unread: 0,
    online: true,
    messages: [
      {
        id: "s1",
        sender: "support",
        text: "آداب! SmartEats سپورٹ میں خوش آمدید۔ ہم کس طرح آپ کی مدد کر سکتے ہیں؟",
        time: timeAgo(120),
        isRead: true,
      },
      {
        id: "s2",
        sender: "user",
        text: "میرا آرڈر کہاں ہے؟",
        time: timeAgo(20),
        isRead: true,
      },
      {
        id: "s3",
        sender: "support",
        text: "آپ کا آرڈر 25 منٹ میں پہنچ جائے گا۔ رائیڈر بلال حسین راستے میں ہے۔",
        time: timeAgo(15),
        isRead: true,
      },
    ],
  },
  {
    id: "nutritionist",
    name: "Dr. Ayesha Khan",
    role: "Nutritionist",
    avatar: "👩‍⚕️",
    lastMessage: "آپ کی اس ہفتے کی غذائی رپورٹ بہت اچھی رہی!",
    lastTime: timeAgo(180),
    unread: 2,
    online: false,
    messages: [
      {
        id: "n1",
        sender: "ai",
        text: "السلام علیکم! میں ڈاکٹر عائشہ خان ہوں، آپ کی غذائی ماہر۔",
        time: timeAgo(1440),
        isRead: true,
      },
      {
        id: "n2",
        sender: "user",
        text: "ڈاکٹر صاحبہ، کیا میں بریانی کھا سکتا ہوں؟",
        time: timeAgo(300),
        isRead: true,
      },
      {
        id: "n3",
        sender: "ai",
        text: "ہفتے میں ایک بار چھوٹی مقدار میں کھا سکتے ہیں، لیکن اس دن ورزش ضرور کریں اور پانی خوب پئیں۔",
        time: timeAgo(295),
        isRead: true,
      },
      {
        id: "n4",
        sender: "ai",
        text: "آپ کی اس ہفتے کی غذائی رپورٹ بہت اچھی رہی! آپ نے 5 دن صحت مند کھانا کھایا۔ شاباش! 🌟",
        time: timeAgo(180),
        isRead: false,
      },
      {
        id: "n5",
        sender: "ai",
        text: "اگلے ہفتے پروٹین کی مقدار بڑھانے کی کوشش کریں۔ صبح کے ناشتے میں انڈے ضرور شامل کریں۔",
        time: timeAgo(175),
        isRead: false,
      },
    ],
  },
];

export const AI_RESPONSES: { [key: string]: string } = {
  default: "میں آپ کی مدد کے لیے حاضر ہوں۔ اپنی صحت کے بارے میں کچھ بھی پوچھیں!",
  hello: "السلام علیکم! آپ کا SmartEats AI میں خیرمقدم ہے۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
  diabetes: "ذیابطیس کے لیے: کم کاربوہائیڈریٹ والی غذا کھائیں۔ مسور دال، ابلے انڈے، گرل مچھلی اور سبزیاں بہترین ہیں۔ چاول، میٹھا اور سفید آٹا کم کریں۔",
  weight: "وزن کم کرنے کے لیے: کیلوری کم کریں، پروٹین بڑھائیں۔ سلاد، دال، چکن کڑاہی بغیر تیل کے اچھے ہیں۔ دن میں 3 بار کم مقدار میں کھائیں۔",
  heart: "دل کی صحت کے لیے: اومیگا-3 والی مچھلی، سبزیاں اور ثابت اناج کھائیں۔ نمک اور گھی کم کریں۔ لسی پینا فائدہ مند ہے۔",
  recommend: "آج کے لیے میری تجویز:\n🌅 صبح: ابلے انڈے + چھاچھ\n🌞 دوپہر: مسور دال + چپاتی + سلاد\n🌙 رات: گرل مچھلی + سبزیاں",
};

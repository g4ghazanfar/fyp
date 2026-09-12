import { theme } from "@/constants/theme";

export interface HealthTip {
  id: string;
  title: string;
  titleUrdu: string;
  description: string;
  descriptionUrdu: string;
  category: string;
  icon: string;
  color: string;
}

export interface WeeklyReport {
  week: string;
  healthyMeals: number;
  totalMeals: number;
  points: number;
  streak: number;
  calories: { day: string; value: number }[];
  achievements: string[];
}

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: "t1",
    title: "Hydration Reminder",
    titleUrdu: "پانی پیئں",
    description: "Drink 8 glasses of water daily to improve metabolism and flush toxins.",
    descriptionUrdu: "روزانہ 8 گلاس پانی پینے سے میٹابولزم بہتر ہوتا ہے اور زہریلے مادے خارج ہوتے ہیں۔",
    category: "General",
    icon: "💧",
    color: theme.colors.info,
  },
  {
    id: "t2",
    title: "Protein Power",
    titleUrdu: "پروٹین کی طاقت",
    description: "Include protein in every meal to keep you full and build muscle.",
    descriptionUrdu: "ہر کھانے میں پروٹین شامل کریں تاکہ پیٹ بھرا رہے اور مسلز مضبوط ہوں۔",
    category: "Nutrition",
    icon: "💪",
    color: theme.colors.health,
  },
  {
    id: "t3",
    title: "Reduce Sugar",
    titleUrdu: "چینی کم کریں",
    description: "Limit sugar intake to reduce risk of diabetes and obesity.",
    descriptionUrdu: "چینی کم کھانے سے ذیابطیس اور موٹاپے کا خطرہ کم ہوتا ہے۔",
    category: "Diabetes",
    icon: "🚫",
    color: theme.colors.error,
  },
  {
    id: "t4",
    title: "Eat More Vegetables",
    titleUrdu: "سبزیاں زیادہ کھائیں",
    description: "Colorful vegetables provide vitamins, minerals and fiber essential for health.",
    descriptionUrdu: "رنگ برنگی سبزیاں وٹامنز، معدنیات اور فائبر فراہم کرتی ہیں جو صحت کے لیے ضروری ہیں۔",
    category: "General",
    icon: "🥦",
    color: theme.colors.success,
  },
  {
    id: "t5",
    title: "Walk After Meals",
    titleUrdu: "کھانے کے بعد چلیں",
    description: "A 10-minute walk after meals helps digestion and controls blood sugar.",
    descriptionUrdu: "کھانے کے بعد 10 منٹ چلنے سے ہاضمہ بہتر ہوتا ہے اور بلڈ شوگر کنٹرول میں رہتی ہے۔",
    category: "Diabetes",
    icon: "🚶",
    color: theme.colors.warning,
  },
  {
    id: "t6",
    title: "Sleep Well",
    titleUrdu: "اچھی نیند لیں",
    description: "7-8 hours of sleep is essential for healthy metabolism and weight management.",
    descriptionUrdu: "7-8 گھنٹے کی نیند صحت مند میٹابولزم اور وزن کے لیے ضروری ہے۔",
    category: "General",
    icon: "😴",
    color: theme.colors.secondary,
  },
];

export const WEEKLY_REPORT: WeeklyReport = {
  week: "April 7-13, 2026",
  healthyMeals: 16,
  totalMeals: 21,
  points: 340,
  streak: 5,
  calories: [
    { day: "Mon", value: 1800 },
    { day: "Tue", value: 1650 },
    { day: "Wed", value: 2100 },
    { day: "Thu", value: 1750 },
    { day: "Fri", value: 1900 },
    { day: "Sat", value: 2200 },
    { day: "Sun", value: 1600 },
  ],
  achievements: [
    "5 Day Streak",
    "Protein Goal Met",
    "Sugar Free Day",
    "Hydration Champion",
  ],
};

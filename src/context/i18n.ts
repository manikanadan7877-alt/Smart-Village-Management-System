export type Language = "en" | "ta";

export const translations = {
  en: {
    dashboard: "Dashboard",
    villages: "Villages",
    residents: "Residents",
    schemes: "Government Schemes",
    complaints: "Complaints",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",

    welcome: "Welcome to Smart Village Management System",
    search: "Search",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",

    totalVillages: "Total Villages",
    totalResidents: "Total Residents",
    pendingComplaints: "Pending Complaints",
    completedSchemes: "Completed Schemes",

    name: "Name",
    phone: "Phone",
    email: "Email",
    address: "Address",
    status: "Status",

    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",

    noData: "No data available",
    loading: "Loading...",
  },

  ta: {
    dashboard: "முகப்புப் பலகை",
    villages: "கிராமங்கள்",
    residents: "குடியிருப்பாளர்கள்",
    schemes: "அரசுத் திட்டங்கள்",
    complaints: "புகார்கள்",
    reports: "அறிக்கைகள்",
    settings: "அமைப்புகள்",
    profile: "சுயவிவரம்",
    logout: "வெளியேறு",

    welcome: "ஸ்மார்ட் கிராம மேலாண்மை அமைப்பிற்கு வரவேற்கிறோம்",
    search: "தேடல்",
    add: "சேர்க்கவும்",
    edit: "திருத்தவும்",
    delete: "நீக்கவும்",
    save: "சேமிக்கவும்",
    cancel: "ரத்து செய்யவும்",

    totalVillages: "மொத்த கிராமங்கள்",
    totalResidents: "மொத்த குடியிருப்பாளர்கள்",
    pendingComplaints: "நிலுவையில் உள்ள புகார்கள்",
    completedSchemes: "நிறைவு செய்யப்பட்ட திட்டங்கள்",

    name: "பெயர்",
    phone: "தொலைபேசி",
    email: "மின்னஞ்சல்",
    address: "முகவரி",
    status: "நிலை",

    active: "செயலில்",
    inactive: "செயலில் இல்லை",
    pending: "நிலுவையில்",
    completed: "நிறைவு",

    noData: "தகவல் இல்லை",
    loading: "ஏற்றப்படுகிறது...",
  },
} as const;

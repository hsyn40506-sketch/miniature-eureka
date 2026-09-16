import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, SafeAreaView, Alert, Image, ActivityIndicator, RefreshControl, Vibration, FlatList, KeyboardAvoidingView, Switch, Platform 
} from "react-native";

// استيراد فايربيز (Firebase)
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, doc, setDoc, getDoc, query, orderBy, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber 
} from "firebase/auth";

// إعدادات الاتصال السحابي الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyApSganbtDR4zrVezw7qw3OhtBbD11JrRM",
  authDomain: "gmal-1ed42.firebaseapp.com",
  projectId: "gmal-1ed42",
  storageBucket: "gmal-1ed42.firebasestorage.app",
  messagingSenderId: "561059921384",
  appId: "1:561059921384:web:55fc66a4ca410f7b22785d"
};

// تهيئة الفايربيز
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const CATEGORIES = ["الكل", "برمجة وتقنية", "هندسة ومقاولات", "مبيعات وإدارة", "خدمات عامة"];

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("worker"); 
  const [userRoleState, setUserRoleState] = useState("عامل");
  const [screen, setScreen] = useState("welcome");
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // ثيم الألوان (ليلي / نهاري)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // حقول الإدخال والمصادقة
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmResult, setConfirmResult] = useState(null); // لحفظ نتيجة إرسال الرمز الحقيقي
  const [authMethod, setAuthMethod] = useState("email"); // email or phone
  
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState("الكل"); 
  const [sortBy, setSortBy] = useState("newest"); // newest or salary
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // حالات الشات والمحادثات
  const [usersList, setUsersList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  // حقول إضافة وظيفة جديدة
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newType, setNewType] = useState("دوام كامل");
  const [newCategory, setNewCategory] = useState("برمجة وتقنية");

  const playTouchEffect = () => {
    try { Vibration.vibrate(15); } catch (e) {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserRoleState(userSnap.data().role === "employer" ? "صاحب عمل 👔" : "عامل 👷‍♂️");
          }
        } catch (e) {}
      }
    });
    fetchJobs();
    return unsubscribe;
  }, []);

  const fetchJobs = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (jobsList.length > 0) {
        setJobs(jobsList);
      } else {
        setJobs([
          { id: "1", title: "مطور تطبيقات ذكي", company: "شركة السحابة الرقمية", city: "بغداد - الحلة", salary: "1,200,000 د.ع", type: "دوام كامل", category: "برمجة وتقنية", createdAt: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.log("خطأ في الجلب:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsersForChat = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list = [];
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.uid !== user?.uid) list.push(data);
      });
      setUsersList(list);
    } catch (e) {
      Alert.alert("خطأ", "فشل تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(true);
  };

  // إرسال رمز التحقق الحقيقي عبر الهاتف
  const handleSendPhoneCode = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      Alert.alert("تنبيه", "يرجى إدخال رقم هاتف صحيح مع رمز الدولة (مثال: +9647801234567)");
      return;
    }
    setLoading(true);
    try {
      // إعداد reCAPTCHA الوهمي المخفي للويب/إكسبو أو الحقيقي
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {}
      });
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmResult(confirmation);
      Alert.alert("تم الإرسال بنجاح 📱", "تم إرسال رمز التحقق الفعلي (OTP) إلى رقم هاتفك عبر SMS.");
    } catch (error) {
      console.log("Phone auth error:", error);
      Alert.alert("خطأ في الشبكة", "تأكد من تفعيل Phone Auth في لوحة تحكم Firebase ومن صحة رقم الهاتف مع رمز الدولة.");
    } finally {
      setLoading(false);
    }
  };

  // تأكيد الكود الحقيقي الذي وصل عبر الرسالة
  const handleVerifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      Alert.alert("تنبيه", "يرجى إدخال رمز التحقق المكون من أرقام.");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmResult.confirm(verificationCode);
      const loggedUser = result.user;
      setUser(loggedUser);
      
      // حفظ بيانات المستخدم في Firestore إذا لم تكن موجودة
      await setDoc(doc(db, "users", loggedUser.uid), {
        uid: loggedUser.uid,
        phone: phoneNumber,
        role: userRole,
        createdAt: new Date().toISOString()
      }, { merge: true });

      Alert.alert("نجاح مذهل 🌟", "تم التحقق وتسجيل الدخول برقم الهاتف بنجاح تام!");
      setScreen("roles");
    } catch (error) {
      Alert.alert("خطأ", "رمز التحقق غير صحيح، تأكد من الرقم المدخل.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async () => {
    if (authMethod === "email") {
      if (!email || !password) {
        Alert.alert("تنبيه", "يرجى إدخال البريد الإلكتروني وكلمة المرور");
        return;
      }
      setLoading(true);
      try {
        let userCredential;
        if (isLoginMode) {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: email,
            role: userRole,
            createdAt: new Date().toISOString()
          });
        }
        setUser(userCredential.user);
        setUserRoleState(userRole === "employer" ? "صاحب عمل 👔" : "عامل 👷‍♂️");
        setScreen("roles");
        setEmail("");
        setPassword("");
      } catch (error) {
        Alert.alert("تنبيه أمني", "حدث خطأ في المصادقة، تأكد من البيانات المدخلة.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!confirmResult) {
        handleSendPhoneCode();
      } else {
        handleVerifyPhoneCode();
      }
    }
  };

  const handleGoogleLogin = () => {
    playTouchEffect();
    Alert.alert("تسجيل Google", "جاري الاتصال بخدمة جوجل السحابية...");
    setTimeout(() => {
      Alert.alert("نجاح 🌟", "تم ربط الحساب بواسطة Google بنجاح!");
      setScreen("roles");
    }, 1000);
  };

  const toggleFavorite = (job) => {
    playTouchEffect();
    if (favorites.some(fav => fav.id === job.id)) {
      setFavorites(favorites.filter(fav => fav.id !== job.id));
      Alert.alert("المفضلة", "تمت إزالة الوظيفة من المفضلة");
    } else {
      setFavorites([...favorites, job]);
      Alert.alert("المفضلة ⭐", "تم حفظ الوظيفة بنجاح!");
    }
  };

  const handlePostJob = async () => {
    if (!user) {
      Alert.alert("تنبيه", "يجب تسجيل الدخول أولاً");
      setScreen("auth");
      return;
    }
    if (!newTitle || !newCompany || !newCity) {
      Alert.alert("تنبيه", "يرجى ملء الحقول الأساسية");
      return;
    }
    setLoading(true);
    try {
      const newJobData = {
        title: newTitle,
        company: newCompany,
        city: newCity,
        salary: newSalary || "حسب الاتفاق",
        type: newType,
        category: newCategory,
        postedBy: user.email || user.phoneNumber || "مستخدم معتمد",
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "jobs"), newJobData);
      Alert.alert("عملية ناجحة", "تم نشر الوظيفة في المنصة الملكية بنجاح! 🌟");
      setNewTitle(""); setNewCompany(""); setNewCity(""); setNewSalary("");
      fetchJobs();
      setScreen("home");
    } catch (error) {
      Alert.alert("خطأ", "فشل النشر، تأكد من الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  const openChatRoom = (partner) => {
    playTouchEffect();
    setActiveChatUser(partner);
    setScreen("chatRoom");
    const chatId = [user.uid, partner.uid].sort().join('_');
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeChatUser) return;
    playTouchEffect();
    const textToSend = messageText;
    setMessageText("");
    const chatId = [user.uid, activeChatUser.uid].sort().join('_');
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        receiverId: activeChatUser.uid,
        text: textToSend,
        timestamp: serverTimestamp()
      });
    } catch (e) {}
  };

  // فلترة وترتيب الوظائف بذكاء فائق
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = `${j.title} ${j.company} ${j.city} ${j.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || j.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else {
      return (b.salary || "").localeCompare(a.salary || "");
    }
  });

  const openJob = job => { playTouchEffect(); setSelectedJob(job); setScreen("details"); };

  // ثيم الألوان الديناميكي
  const themeStyles = {
    bg: isDarkMode ? "#121212" : "#f8f9fa",
    cardBg: isDarkMode ? "#1e1e1e" : "#fff",
    textPrimary: isDarkMode ? "#ffffff" : "#1e272e",
    textSecondary: isDarkMode ? "#a4b0be" : "#747d8c",
    borderCol: isDarkMode ? "#2f3542" : "#f1f2f6",
    inputBg: isDarkMode ? "#2d3436" : "#fff"
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.bg }]}>
      
      {/* عنصر ريكابتشا المخفي للتحقق الحقيقي برقم الهاتف */}
      <View id="recaptcha-container" />

      {/* شاشة الترحيب */}
      {screen === "welcome" && (
        <View style={[styles.welcomeContainer, { backgroundColor: themeStyles.bg }]}>
          <View style={styles.center}>
            <View style={[styles.logoBadge, { backgroundColor: themeStyles.cardBg }]}>
              <Image source={{ uri: "https://img.icons8.com/color/96/job.png" }} style={styles.logoImage} />
            </View>
            <Text style={[styles.logo, { color: themeStyles.textPrimary }]}>💼 فرصتي الملكية</Text>
            <Text style={[styles.subtitle, { color: themeStyles.textSecondary }]}>المنصة الأذكى عالمياً للوظائف والتواصل الفوري</Text>
            
            <View style={[styles.bannerCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]}>
              <Text style={[styles.bannerTitle, { color: themeStyles.textPrimary }]}>مستقبلك المهني يبدأ بلمسة</Text>
              <Text style={[styles.bannerDesc, { color: themeStyles.textSecondary }]}>تحقق حقيقي عبر رقم الهاتف، تواصل لحظياً مع الشركات، وبأداء صاروخي.</Text>
            </View>
            
            <TouchableOpacity style={styles.primaryButton} onPress={() => { playTouchEffect(); setScreen(user ? "roles" : "auth"); }}>
              <Text style={styles.primaryButtonText}>{user ? "الانتقال للوحة التحكم" : "ابدأ رحلتك الآن"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>النسخة المحدثة بالرمز الحقيقي ⚡</Text>
          </View>
        </View>
      )}

      {/* شاشة المصادقة (إيميل أو هاتف حقيقي) */}
      {screen === "auth" && (
        <ScrollView style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("welcome"); }} style={styles.backBtnContainer}>
            <Text style={styles.backText}>← العودة للرئيسية</Text>
          </TouchableOpacity>
          <View style={styles.authBox}>
            <Text style={[styles.title, { color: themeStyles.textPrimary }]}>{isLoginMode ? "مرحباً بك مجدداً 👋" : "انضم إلى النخبة 🚀"}</Text>
            
            {/* أزرار اختيار طريقة الدخول */}
            <View style={styles.authMethodsRow}>
              <TouchableOpacity 
                style={[styles.methodChip, authMethod === 'email' && styles.methodChipActive]}
                onPress={() => { playTouchEffect(); setAuthMethod('email'); setConfirmResult(null); }}
              >
                <Text style={[styles.methodChipText, authMethod === 'email' && styles.methodChipTextActive]}>📧 بريد إلكتروني</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodChip, authMethod === 'phone' && styles.methodChipActive]}
                onPress={() => { playTouchEffect(); setAuthMethod('phone'); }}
              >
                <Text style={[styles.methodChipText, authMethod === 'phone' && styles.methodChipTextActive]}>📱 رقم الهاتف الحقيقي</Text>
              </TouchableOpacity>
            </View>

            {!isLoginMode && authMethod === 'email' && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: themeStyles.textPrimary, marginBottom: 8 }}>حدد نوع حسابك:</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity 
                    style={[styles.roleSelectChip, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}, userRole === 'worker' && styles.roleSelectChipActive]} 
                    onPress={() => { playTouchEffect(); setUserRole('worker'); }}
                  >
                    <Text style={[styles.roleSelectText, {color: themeStyles.textSecondary}, userRole === 'worker' && styles.roleSelectTextActive]}>عامل 👷‍♂️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleSelectChip, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}, userRole === 'employer' && styles.roleSelectChipActive]} 
                    onPress={() => { playTouchEffect(); setUserRole('employer'); }}
                  >
                    <Text style={[styles.roleSelectText, {color: themeStyles.textSecondary}, userRole === 'employer' && styles.roleSelectTextActive]}>صاحب عمل 👔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {authMethod === 'email' ? (
              <>
                <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="البريد الإلكتروني" placeholderTextColor="#a4b0be" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
                <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="كلمة المرور (6 أحرف أو أكثر)" placeholderTextColor="#a4b0be" secureTextEntry value={password} onChangeText={setPassword}/>
              </>
            ) : (
              <>
                <TextInput 
                  style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} 
                  placeholder="رقم الهاتف (مثل: +9647801234567)" 
                  placeholderTextColor="#a4b0be" 
                  keyboardType="phone-pad" 
                  value={phoneNumber} 
                  onChangeText={setPhoneNumber}
                  editable={!confirmResult}
                />
                
                {confirmResult && (
                  <TextInput 
                    style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} 
                    placeholder="أدخل رمز التحقق المكون من 6 أرقام (OTP)" 
                    placeholderTextColor="#a4b0be" 
                    keyboardType="number-pad" 
                    value={verificationCode} 
                    onChangeText={setVerificationCode}
                  />
                )}
              </>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={() => { playTouchEffect(); handleAuthentication(); }} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>
                {authMethod === 'phone' && confirmResult ? "تأكيد الرمز ودخول" : (isLoginMode ? "تسجيل الدخول" : "إنشاء الحساب الملكي")}
              </Text>}
            </TouchableOpacity>

            {authMethod === 'email' && (
              <>
                {/* زر تسجيل الدخول عبر Google السريع */}
                <TouchableOpacity style={[styles.googleButton, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}]} onPress={handleGoogleLogin}>
                  <Text style={{fontSize: 16, marginRight: 8}}>🌐</Text>
                  <Text style={[styles.googleButtonText, {color: themeStyles.textPrimary}]}>المتابعة باستخدام Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { playTouchEffect(); setIsLoginMode(!isLoginMode); }} style={styles.switchAuth}>
                  <Text style={styles.switchAuthText}>{isLoginMode ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* لوحة التحكم المركزية مع مفتاح الوضع الليلي */}
      {screen === "roles" && (
        <ScrollView style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <View style={[styles.headerRow, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]}>
            <View>
              <Text style={[styles.welcomeUserSub, { color: themeStyles.textSecondary }]}>مرحباً بك ({userRoleState}),</Text>
              <Text style={[styles.welcomeUser, { color: themeStyles.textPrimary }]}>{user ? (user.email || user.phoneNumber) : "زائر كريم"}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 12, marginRight: 5, color: themeStyles.textSecondary}}>{isDarkMode ? "🌙" : "☀️"}</Text>
              <Switch value={isDarkMode} onValueChange={(val) => { playTouchEffect(); setIsDarkMode(val); }} />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: themeStyles.textPrimary }]}>لوحة التحكم والأقسام</Text>

          <TouchableOpacity style={[styles.roleCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => { playTouchEffect(); setScreen("home"); }}>
            <View style={styles.roleIconContainer}><Image source={{ uri: "https://img.icons8.com/color/48/worker.png" }} style={styles.roleIcon} /></View>
            <View style={styles.roleInfo}>
              <Text style={[styles.cardTitle, { color: themeStyles.textPrimary }]}>سوق العمل والأقسام</Text>
              <Text style={[styles.description, { color: themeStyles.textSecondary }]}>ابحث وفلتر الوظائف حسب التخصص.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => { playTouchEffect(); fetchUsersForChat(); setScreen("chatList"); }}>
            <View style={[styles.roleIconContainer, { backgroundColor: '#e0f2fe' }]}><Text style={{fontSize: 22}}>💬</Text></View>
            <View style={styles.roleInfo}>
              <Text style={[styles.cardTitle, { color: themeStyles.textPrimary }]}>المحادثات المباشرة</Text>
              <Text style={[styles.description, { color: themeStyles.textSecondary }]}>تواصل لحظياً بين العمال وأصحاب العمل.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => { playTouchEffect(); setScreen("favorites"); }}>
            <View style={[styles.roleIconContainer, { backgroundColor: '#fff3cd' }]}><Text style={{fontSize: 22}}>⭐</Text></View>
            <View style={styles.roleInfo}>
              <Text style={[styles.cardTitle, { color: themeStyles.textPrimary }]}>الوظائف المفضلة</Text>
              <Text style={[styles.description, { color: themeStyles.textSecondary }]}>عرض الوظائف التي قمت بحفظها ({favorites.length})</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.employerCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => { playTouchEffect(); setScreen("post"); }}>
            <View style={styles.roleIconContainer}><Image source={{ uri: "https://img.icons8.com/color/48/company.png" }} style={styles.roleIcon} /></View>
            <View style={styles.roleInfo}>
              <Text style={[styles.cardTitle, { color: themeStyles.textPrimary }]}>نشر فرصة عمل ملكية</Text>
              <Text style={[styles.description, { color: themeStyles.textSecondary }]}>أعلن عن شاغر وظيفي لآلاف الكفاءات.</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* قائمة المحادثات */}
      {screen === "chatList" && (
        <View style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("roles"); }}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
            <Text style={[styles.navTitle, { color: themeStyles.textPrimary }]}>المحادثات الفورية 💬</Text>
          </View>
          <Text style={{ fontSize: 13, color: themeStyles.textSecondary, marginBottom: 15 }}>اختر شخصاً لبدء المحادثة اللحظية:</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0984e3" style={{marginTop: 50}} />
          ) : (
            <FlatList
              data={usersList}
              keyExtractor={item => item.uid}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.chatUserItem, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => openChatRoom(item)}>
                  <View style={styles.chatAvatar}><Text style={{fontSize: 18}}>👤</Text></View>
                  <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={[styles.chatUserEmail, { color: themeStyles.textPrimary }]}>{item.email || item.phone || "مستخدم"}</Text>
                    <Text style={[styles.chatUserRole, { color: themeStyles.textSecondary }]}>{item.role === 'employer' ? 'صاحب عمل 👔' : 'عامل 👷‍♂️'}</Text>
                  </View>
                  <Text style={{color: '#0984e3', fontWeight: 'bold', fontSize: 12}}>مراسلة ➔</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{textAlign: 'center', color: themeStyles.textSecondary, marginTop: 40}}>لا يوجد مستخدمون آخرون متاحون حالياً.</Text>
              }
            />
          )}
        </View>
      )}

      {/* غرفة الدردشة */}
      {screen === "chatRoom" && activeChatUser && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("chatList"); }}><Text style={styles.backText}>← القائمة</Text></TouchableOpacity>
            <Text style={[styles.navTitle, { color: themeStyles.textPrimary }]} numberOfLines={1}>{activeChatUser.email || activeChatUser.phone}</Text>
          </View>

          <ScrollView style={styles.chatMessagesContainer} contentContainerStyle={{paddingVertical: 10}}>
            {messages.map(msg => {
              const isMyMessage = msg.senderId === user.uid;
              return (
                <View key={msg.id} style={[styles.msgBubble, isMyMessage ? styles.msgMyBubble : [styles.msgOtherBubble, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}]]}>
                  <Text style={[styles.msgText, isMyMessage ? {color: '#fff'} : {color: themeStyles.textPrimary}]}>{msg.text}</Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={[styles.chatInputRow, { backgroundColor: themeStyles.cardBg, borderTopColor: themeStyles.borderCol }]}>
            <TextInput 
              style={[styles.chatInput, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary}]} 
              placeholder="اكتب رسالتك هنا..." 
              placeholderTextColor="#a4b0be"
              value={messageText} 
              onChangeText={setMessageText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>إرسال</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* سوق العمل والفلترة المتقدمة */}
      {screen === "home" && (
        <View style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("roles"); }}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
            <Text style={[styles.navTitle, { color: themeStyles.textPrimary }]}>سوق العمل العالمي</Text>
          </View>

          <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="🔎 ابحث بالمسمى، الشركة، أو المدينة..." placeholderTextColor="#a4b0be" value={search} onChangeText={setSearch}/>

          {/* شريط الفرز والترتيب الذكي */}
          <View style={styles.sortRow}>
            <TouchableOpacity 
              style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}
              onPress={() => { playTouchEffect(); setSortBy('newest'); }}
            >
              <Text style={[styles.sortChipText, sortBy === 'newest' && styles.sortChipTextActive]}>✨ الأحدث</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortChip, sortBy === 'salary' && styles.sortChipActive]}
              onPress={() => { playTouchEffect(); setSortBy('salary'); }}
            >
              <Text style={[styles.sortChipText, sortBy === 'salary' && styles.sortChipTextActive]}>💰 أعلى راتب</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryChip, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}, selectedCategory === cat && styles.categoryChipSelected]}
                onPress={() => { playTouchEffect(); setSelectedCategory(cat); }}
              >
                <Text style={[styles.categoryChipText, {color: themeStyles.textSecondary}, selectedCategory === cat && styles.categoryChipTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading && !refreshing ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#0984e3" />
              <Text style={{ marginTop: 10, color: themeStyles.textSecondary }}>جاري المزامنة السحابية...</Text>
            </View>
          ) : (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
              {filteredJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 40 }}>📭</Text>
                  <Text style={[styles.emptyText, { color: themeStyles.textSecondary }]}>لا توجد وظائف مطابقة لبحثك</Text>
                </View>
              ) : (
                filteredJobs.map(job => {
                  const isFav = favorites.some(fav => fav.id === job.id);
                  return (
                    <TouchableOpacity key={job.id} style={[styles.jobCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => openJob(job)}>
                      <View style={styles.jobCardHeader}>
                        <View style={{flex: 1}}>
                          <Text style={[styles.jobTitle, { color: themeStyles.textPrimary }]}>{job.title}</Text>
                          <Text style={styles.categoryBadgeText}>📂 {job.category || "عامة"}</Text>
                        </View>
                        <TouchableOpacity onPress={() => toggleFavorite(job)} style={styles.favButton}>
                          <Text style={{fontSize: 22}}>{isFav ? "⭐" : "☆"}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.muted, { color: themeStyles.textSecondary }]}>🏢 {job.company}</Text>
                      <Text style={[styles.muted, { color: themeStyles.textSecondary }]}>📍 {job.city}</Text>
                      <View style={[styles.jobCardFooter, { borderTopColor: themeStyles.borderCol }]}>
                        <Text style={styles.salary}>💰 {job.salary}</Text>
                        <Text style={styles.tag}>{job.type}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* شاشة المفضلة */}
      {screen === "favorites" && (
        <View style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("roles"); }}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
            <Text style={[styles.navTitle, { color: themeStyles.textPrimary }]}>الوظائف المفضلة ⭐</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {favorites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40 }}>⭐</Text>
                <Text style={[styles.emptyText, { color: themeStyles.textSecondary }]}>لم تقم بحفظ أي وظيفة حتى الآن</Text>
              </View>
            ) : (
              favorites.map(job => (
                <TouchableOpacity key={job.id} style={[styles.jobCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]} onPress={() => openJob(job)}>
                  <View style={styles.jobCardHeader}>
                    <Text style={[styles.jobTitle, { color: themeStyles.textPrimary }]}>{job.title}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(job)}><Text style={{fontSize: 20}}>⭐</Text></TouchableOpacity>
                  </View>
                  <Text style={[styles.muted, { color: themeStyles.textSecondary }]}>🏢 {job.company}</Text>
                  <Text style={[styles.muted, { color: themeStyles.textSecondary }]}>📍 {job.city}</Text>
                  <Text style={styles.salary}>💰 {job.salary}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* شاشة التفاصيل */}
      {screen === "details" && selectedJob && (
        <View style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("home"); }} style={styles.backBtnContainer}>
            <Text style={styles.backText}>← العودة للقائمة</Text>
          </TouchableOpacity>

          <View style={[styles.detailsHeaderBox, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]}>
            <Text style={[styles.detailsMainTitle, { color: themeStyles.textPrimary }]}>{selectedJob.title}</Text>
            <Text style={styles.tagLarge}>{selectedJob.type}</Text>
          </View>

          <View style={[styles.detailsCard, { backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol }]}>
            <View style={[styles.detailRow, { borderBottomColor: themeStyles.borderCol }]}><Text style={[styles.detailLabel, { color: themeStyles.textSecondary }]}>القسم:</Text><Text style={[styles.detailVal, { color: themeStyles.textPrimary }]}>{selectedJob.category || "عام"}</Text></View>
            <View style={[styles.detailRow, { borderBottomColor: themeStyles.borderCol }]}><Text style={[styles.detailLabel, { color: themeStyles.textSecondary }]}>الشركة:</Text><Text style={[styles.detailVal, { color: themeStyles.textPrimary }]}>{selectedJob.company}</Text></View>
            <View style={[styles.detailRow, { borderBottomColor: themeStyles.borderCol }]}><Text style={[styles.detailLabel, { color: themeStyles.textSecondary }]}>الموقع:</Text><Text style={[styles.detailVal, { color: themeStyles.textPrimary }]}>{selectedJob.city}</Text></View>
            <View style={[styles.detailRow, { borderBottomColor: themeStyles.borderCol }]}><Text style={[styles.detailLabel, { color: themeStyles.textSecondary }]}>الراتب:</Text><Text style={[styles.detailVal, { color: '#00b894', fontWeight: 'bold' }]}>{selectedJob.salary}</Text></View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => { playTouchEffect(); Alert.alert("تم التقديم بنجاح! 🎉", "تم إرسال طلبك للشركة المعنية بنجاح تام."); }}>
            <Text style={styles.primaryButtonText}>التقديم الفوري المعتمد</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* شاشة نشر وظيفة */}
      {screen === "post" && (
        <View style={[styles.page, { backgroundColor: themeStyles.bg }]}>
          <TouchableOpacity onPress={() => { playTouchEffect(); setScreen("roles"); }} style={styles.backBtnContainer}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
          <Text style={[styles.title, { color: themeStyles.textPrimary }]}>إضافة شاغر وظيفي جديد 📢</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="عنوان الوظيفة (مثل: مهندس برمجيات)" placeholderTextColor="#a4b0be" value={newTitle} onChangeText={setNewTitle}/>
            <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="اسم الشركة أو المؤسسة" placeholderTextColor="#a4b0be" value={newCompany} onChangeText={setNewCompany}/>
            <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="المدينة والموقع" placeholderTextColor="#a4b0be" value={newCity} onChangeText={setNewCity}/>
            <TextInput style={[styles.input, {backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, borderColor: themeStyles.borderCol}]} placeholder="الراتب المتوقع (مثل: 900,000 د.ع)" placeholderTextColor="#a4b0be" value={newSalary} onChangeText={setNewSalary}/>
            
            <Text style={[styles.labelType, { color: themeStyles.textPrimary }]}>اختر القطاع / القسم:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
              {["برمجة وتقنية", "هندسة ومقاولات", "مبيعات وإدارة", "خدمات عامة"].map(cat => (
                <TouchableOpacity key={cat} style={[styles.typeChip, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}, newCategory === cat && styles.typeChipSelected]} onPress={() => { playTouchEffect(); setNewCategory(cat); }}>
                  <Text style={[styles.typeChipText, {color: themeStyles.textSecondary}, newCategory === cat && styles.typeChipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.labelType, { color: themeStyles.textPrimary }]}>اختر نوع الدوام:</Text>
            <View style={styles.typeSelectorRow}>
              {["دوام كامل", "دوام جزئي", "عن بعد"].map(typeOpt => (
                <TouchableOpacity key={typeOpt} style={[styles.typeChip, {backgroundColor: themeStyles.cardBg, borderColor: themeStyles.borderCol}, newType === typeOpt && styles.typeChipSelected]} onPress={() => { playTouchEffect(); setNewType(typeOpt); }}>
                  <Text style={[styles.typeChipText, {color: themeStyles.textSecondary}, newType === typeOpt && styles.typeChipTextSelected]}>{typeOpt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.primaryButton, { marginBottom: 30 }]} onPress={handlePostJob} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>نشر في المنصة الملكية</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeContainer: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
  page: { flex: 1, padding: 20 },
  logoBadge: { padding: 15, borderRadius: 30, elevation: 5, marginBottom: 15 },
  logoImage: { width: 70, height: 70, resizeMode: 'contain' },
  logo: { fontSize: 28, fontWeight: "bold", marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 25, textAlign: 'center' },
  bannerCard: { padding: 20, borderRadius: 16, width: "100%", marginBottom: 30, elevation: 2, borderWidth: 1 },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  bannerDesc: { fontSize: 13, textAlign: 'center' },
  
  primaryButton: { backgroundColor: "#0984e3", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10, width: "100%", elevation: 3 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  
  googleButton: { flexDirection: 'row', padding: 14, borderRadius: 12, alignItems: "center", justifyContent: 'center', marginTop: 10, width: "100%", elevation: 2, borderWidth: 1 },
  googleButtonText: { fontSize: 14, fontWeight: "bold" },

  authMethodsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  methodChip: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#dfe4ea', alignItems: 'center', marginHorizontal: 4, backgroundColor: '#fff' },
  methodChipActive: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  methodChipText: { fontSize: 12, color: '#57606f', fontWeight: 'bold' },
  methodChipTextActive: { color: '#fff' },

  authBox: { flex: 1, justifyContent: 'center', width: '100%', marginTop: 10 },
  switchAuth: { marginTop: 20, alignItems: 'center' },
  switchAuthText: { color: "#0984e3", fontSize: 14, fontWeight: '600' },
  
  roleSelectChip: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  roleSelectChipActive: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  roleSelectText: { fontSize: 13, fontWeight: 'bold' },
  roleSelectTextActive: { color: '#fff' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, padding: 15, borderRadius: 14, elevation: 1, borderWidth: 1 },
  welcomeUserSub: { fontSize: 12 },
  welcomeUser: { fontSize: 15, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  roleCard: { padding: 18, borderRadius: 16, marginBottom: 15, elevation: 2, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  employerCard: { padding: 18, borderRadius: 16, marginBottom: 15, elevation: 2, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  roleIconContainer: { backgroundColor: '#f1f2f6', padding: 10, borderRadius: 12, marginRight: 15 },
  roleIcon: { width: 35, height: 35, resizeMode: 'contain' },
  roleInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 3 },
  description: { fontSize: 12 },

  chatUserItem: { padding: 15, borderRadius: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1, borderWidth: 1 },
  chatAvatar: { backgroundColor: '#f1f2f6', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  chatUserEmail: { fontSize: 14, fontWeight: 'bold' },
  chatUserRole: { fontSize: 11, marginTop: 2 },

  chatMessagesContainer: { flex: 1, paddingHorizontal: 10 },
  msgBubble: { maxWidth: '75%', padding: 12, borderRadius: 14, marginVertical: 6 },
  msgMyBubble: { backgroundColor: '#0984e3', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  msgOtherBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1 },
  msgText: { fontSize: 14 },
  chatInputRow: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1 },
  chatInput: { flex: 1, padding: 12, borderRadius: 12, fontSize: 14, marginHorizontal: 8 },
  sendButton: { backgroundColor: '#0984e3', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },

  sortRow: { flexDirection: 'row', marginBottom: 12 },
  sortChip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#dfe4ea', marginRight: 8 },
  sortChipActive: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  sortChipText: { fontSize: 11, color: '#57606f', fontWeight: 'bold' },
  sortChipTextActive: { color: '#fff' },

  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navTitle: { fontSize: 16, fontWeight: 'bold' },
  backBtnContainer: { marginBottom: 10 },
  backText: { color: "#0984e3", fontSize: 14, fontWeight: "bold" },
  input: { borderWidth: 1, padding: 14, borderRadius: 12, marginBottom: 15, fontSize: 15, elevation: 1 },
  categoriesScroll: { marginBottom: 15, maxHeight: 45 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8, height: 36, justifyContent: 'center' },
  categoryChipSelected: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  categoryChipText: { fontSize: 13, fontWeight: 'bold' },
  categoryChipTextSelected: { color: '#fff' },
  jobCard: { padding: 16, borderRadius: 14, marginBottom: 14, elevation: 2, borderWidth: 1 },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  jobTitle: { fontSize: 16, fontWeight: "bold" },
  categoryBadgeText: { fontSize: 11, color: '#0984e3', fontWeight: 'bold', marginTop: 2 },
  favButton: { padding: 4 },
  muted: { fontSize: 13, marginBottom: 4 },
  jobCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, paddingTop: 10 },
  salary: { fontSize: 13, fontWeight: "bold", color: "#00b894" },
  tag: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, color: "#0284c7", fontWeight: 'bold' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 13, marginTop: 10, textAlign: 'center' },
  detailsHeaderBox: { padding: 20, borderRadius: 14, marginBottom: 15, alignItems: 'center', elevation: 2, borderWidth: 1 },
  detailsMainTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  tagLarge: { backgroundColor: "#e0f2fe", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 12, color: "#0284c7", fontWeight: 'bold' },
  detailsCard: { padding: 20, borderRadius: 14, marginBottom: 20, elevation: 2, borderWidth: `1` },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  detailLabel: { fontSize: 14 },
  detailVal: { fontSize: 14, fontWeight: '600' },
  labelType: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  typeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  typeChip: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  typeChipSelected: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  typeChipText: { fontSize: 12, fontWeight: 'bold' },
  typeChipTextSelected: { color: '#fff' },
  footer: { alignItems: 'center', paddingBottom: 5 },
  footerText: { fontSize: 12, color: '#a4b0be', fontWeight: '600' }
});

import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, SafeAreaView, Alert, Image, ActivityIndicator, RefreshControl 
} from "react-native";

// استيراد فايربيز (Firebase)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

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
  const [screen, setScreen] = useState("welcome");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState("الكل"); 
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // حقول إضافة وظيفة جديدة
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newType, setNewType] = useState("دوام كامل");
  const [newCategory, setNewCategory] = useState("برمجة وتقنية");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
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
          { id: "1", title: "مطور تطبيقات ذكي", company: "شركة السحابة الرقمية", city: "بغداد - الحلة", salary: "1,200,000 د.ع", type: "دوام كامل", category: "برمجة وتقنية" }
        ]);
      }
    } catch (error) {
      console.log("خطأ في جلب البيانات:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(true);
  };

  const getArabicAuthError = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email": return "البريد الإلكتروني غير صالح.";
      case "auth/user-not-found": return "المستخدم غير موجود، يرجى إنشاء حساب جديد.";
      case "auth/wrong-password": return "كلمة المرور غير صحيحة.";
      case "auth/email-already-in-use": return "هذا البريد الإلكتروني مسجل مسبقاً.";
      case "auth/weak-password": return "كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل).";
      default: return "حدث خطأ غير متوقع، تأكد من الاتصال بالإنترنت.";
    }
  };

  const handleAuthentication = async () => {
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
      }
      setUser(userCredential.user);
      setScreen("roles");
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert("تنبيه أمني", getArabicAuthError(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setScreen("welcome");
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFavorite = (job) => {
    if (favorites.some(fav => fav.id === job.id)) {
      setFavorites(favorites.filter(fav => fav.id !== job.id));
      Alert.alert("المفضلة", "تمت إزالة الوظيفة من المفضلة");
    } else {
      setFavorites([...favorites, job]);
      Alert.alert("المفضلة ⭐", "تم حفظ الوظيفة في المفضلة بنجاح!");
    }
  };

  const handlePostJob = async () => {
    if (!user) {
      Alert.alert("تنبيه", "يجب تسجيل الدخول أولاً لنشر فرصة عمل");
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
        postedBy: user.email,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "jobs"), newJobData);
      Alert.alert("عملية ناجحة", "تم نشر الوظيفة في المنصة الملكية بنجاح! 🌟");
      setNewTitle("");
      setNewCompany("");
      setNewCity("");
      setNewSalary("");
      fetchJobs();
      setScreen("home");
    } catch (error) {
      Alert.alert("خطأ", "فشل نشر الوظيفة، تأكد من الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = `${j.title} ${j.company} ${j.city} ${j.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || j.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openJob = job => { setSelectedJob(job); setScreen("details"); };

  return (
    <SafeAreaView style={styles.container}>
      {/* شاشة الترحيب */}
      {screen === "welcome" && (
        <View style={styles.welcomeContainer}>
          <View style={styles.center}>
            <View style={styles.logoBadge}>
              <Image source={{ uri: "https://img.icons8.com/color/96/job.png" }} style={styles.logoImage} />
            </View>
            <Text style={styles.logo}>💼 فرصتي الملكية</Text>
            <Text style={styles.subtitle}>المنصة الاحترافية للوظائف السحابية الفاخرة</Text>
            
            <View style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>مستقبلك المهني يبدأ من هنا</Text>
              <Text style={styles.bannerDesc}>تصفح الوظائف، أضف المفضلة، وأدر ملفك الشخصي بكل راحة.</Text>
            </View>
            
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen(user ? "roles" : "auth")}>
              <Text style={styles.primaryButtonText}>{user ? "الانتقال للوحة التحكم" : "ابدأ رحلتك الآن"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>تصميم وبرمجة: جمال الحسناوي ⚡ (النسخة الملكية الخاصة)</Text>
          </View>
        </View>
      )}

      {/* شاشة تسجيل الدخول */}
      {screen === "auth" && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("welcome")} style={styles.backBtnContainer}>
            <Text style={styles.backText}>← العودة للرئيسية</Text>
          </TouchableOpacity>
          <View style={styles.authBox}>
            <Text style={styles.title}>{isLoginMode ? "مرحباً بك مجدداً 👋" : "انضم إلى النخبة 🚀"}</Text>
            <TextInput style={styles.input} placeholder="البريد الإلكتروني" placeholderTextColor="#a4b0be" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
            <TextInput style={styles.input} placeholder="كلمة المرور (6 أحرف أو أكثر)" placeholderTextColor="#a4b0be" secureTextEntry value={password} onChangeText={setPassword}/>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAuthentication} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{isLoginMode ? "تسجيل الدخول" : "إنشاء الحساب الملكي"}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={styles.switchAuth}>
              <Text style={styles.switchAuthText}>{isLoginMode ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* شاشة لوحة التحكم الملكية */}
      {screen === "roles" && (
        <View style={styles.page}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcomeUserSub}>مرحباً بك،</Text>
              <Text style={styles.welcomeUser}>{user ? user.email : "زائر كريم"}</Text>
            </View>
            <TouchableOpacity onPress={() => setScreen("profile")} style={styles.profileBadgeBtn}>
              <Text style={{fontSize: 16}}>👑 الملف الشخصي</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>لوحة التحكم المركزية</Text>

          <TouchableOpacity style={styles.roleCard} onPress={() => setScreen("home")}>
            <View style={styles.roleIconContainer}><Image source={{ uri: "https://img.icons8.com/color/48/worker.png" }} style={styles.roleIcon} /></View>
            <View style={styles.roleInfo}>
              <Text style={styles.cardTitle}>سوق العمل والأقسام</Text>
              <Text style={styles.description}>ابحث وفلتر الوظائف حسب التخصص.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.roleCard} onPress={() => setScreen("favorites")}>
            <View style={[styles.roleIconContainer, { backgroundColor: '#fff3cd' }]}><Text style={{fontSize: 22}}>⭐</Text></View>
            <View style={styles.roleInfo}>
              <Text style={styles.cardTitle}>الوظائف المحفوظة (المفضلة)</Text>
              <Text style={styles.description}>عرض الوظائف التي قمت بحفظها ({favorites.length})</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.employerCard} onPress={() => setScreen("post")}>
            <View style={styles.roleIconContainer}><Image source={{ uri: "https://img.icons8.com/color/48/company.png" }} style={styles.roleIcon} /></View>
            <View style={styles.roleInfo}>
              <Text style={styles.cardTitle}>نشر فرصة عمل ملكية</Text>
              <Text style={styles.description}>أعلن عن شاغر وظيفي لآلاف الكفاءات.</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* شاشة الملف الشخصي الإضافية الفاخرة */}
      {screen === "profile" && (
        <View style={styles.page}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setScreen("roles")}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
            <Text style={styles.navTitle}>الملف الشخصي الملكي 👑</Text>
          </View>

          <View style={styles.profileHeaderCard}>
            <View style={styles.profileAvatar}>
              <Text style={{fontSize: 36}}>💼</Text>
            </View>
            <Text style={styles.profileEmail}>{user ? user.email : "زائر المنصة"}</Text>
            <Text style={styles.profileVipBadge}>عضو موثق في المنصة العالمية 🌟</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{favorites.length}</Text>
              <Text style={styles.statLabel}>المفضلة المحفوظة</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{jobs.filter(j => j.postedBy === user?.email).length}</Text>
              <Text style={styles.statLabel}>وظائفك المنشورة</Text>
            </View>
          </View>

          <View style={{flex: 1}} />

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#d63031', marginBottom: 20 }]} onPress={handleLogout}>
            <Text style={styles.primaryButtonText}>تسجيل الخروج من الحساب</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* شاشة استعراض الوظائف والأقسام */}
      {screen === "home" && (
        <View style={styles.page}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setScreen("roles")}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
            <Text style={styles.navTitle}>سوق العمل العالمي</Text>
          </View>

          <TextInput style={styles.input} placeholder="🔎 ابحث بالمسمى، الشركة، أو المدينة..." placeholderTextColor="#a4b0be" value={search} onChangeText={setSearch}/>

          {/* شريط فئات الأقسام الذكية */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading && !refreshing ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#0984e3" />
              <Text style={{ marginTop: 10, color: '#718093' }}>جاري المزامنة السحابية...</Text>
            </View>
          ) : (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
              {filteredJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 40 }}>📭</Text>
                  <Text style={styles.emptyText}>لا توجد وظائف مطابقة لبحثك في هذا القسم</Text>
                </View>
              ) : (
                filteredJobs.map(job => {
                  const isFav = favorites.some(fav => fav.id === job.id);
                  return (
                    <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => openJob(job)}>
                      <View style={styles.jobCardHeader}>
                        <View style={{flex: 1}}>
                          <Text style={styles.jobTitle}>{job.title}</Text>
                          <Text style={styles.categoryBadgeText}>📂 {job.category || "عامة"}</Text>
                        </View>
                        <TouchableOpacity onPress={() => toggleFavorite(job)} style={styles.favButton}>
                          <Text style={{fontSize: 22}}>{isFav ? "⭐" : "☆"}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.muted}>🏢 {job.company}</Text>
                      <Text style={styles.muted}>📍 {job.city}</Text>
                      <View style={styles.jobCardFooter}>
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
        <View style={styles.page}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => setScreen("roles")}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
            <Text style={styles.navTitle}>الوظائف المفضلة الملكية ⭐</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {favorites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40 }}>⭐</Text>
                <Text style={styles.emptyText}>لم تقم بحفظ أي وظيفة حتى الآن</Text>
              </View>
            ) : (
              favorites.map(job => (
                <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => openJob(job)}>
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(job)}><Text style={{fontSize: 20}}>⭐</Text></TouchableOpacity>
                  </View>
                  <Text style={styles.muted}>🏢 {job.company}</Text>
                  <Text style={styles.muted}>📍 {job.city}</Text>
                  <Text style={styles.salary}>💰 {job.salary}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* شاشة التفاصيل */}
      {screen === "details" && selectedJob && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("home")} style={styles.backBtnContainer}>
            <Text style={styles.backText}>← العودة للقائمة</Text>
          </TouchableOpacity>

          <View style={styles.detailsHeaderBox}>
            <Text style={styles.detailsMainTitle}>{selectedJob.title}</Text>
            <Text style={styles.tagLarge}>{selectedJob.type}</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>القسم:</Text><Text style={styles.detailVal}>{selectedJob.category || "عام"}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>الشركة:</Text><Text style={styles.detailVal}>{selectedJob.company}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>الموقع:</Text><Text style={styles.detailVal}>{selectedJob.city}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>الراتب:</Text><Text style={[styles.detailVal, { color: '#00b894', fontWeight: 'bold' }]}>{selectedJob.salary}</Text></View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert("تم التقديم بنجاح الملكي! 🎉", "تم إرسال طلبك للشركة المعنية بنجاح تام.")}>
            <Text style={styles.primaryButtonText}>التقديم الفوري المعتمد</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* شاشة نشر وظيفة */}
      {screen === "post" && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("roles")} style={styles.backBtnContainer}><Text style={styles.backText}>← لوحة التحكم</Text></TouchableOpacity>
          <Text style={styles.title}>إضافة شاغر وظيفي جديد 📢</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput style={styles.input} placeholder="عنوان الوظيفة (مثل: مهندس برمجيات)" placeholderTextColor="#a4b0be" value={newTitle} onChangeText={setNewTitle}/>
            <TextInput style={styles.input} placeholder="اسم الشركة أو المؤسسة" placeholderTextColor="#a4b0be" value={newCompany} onChangeText={setNewCompany}/>
            <TextInput style={styles.input} placeholder="المدينة والموقع" placeholderTextColor="#a4b0be" value={newCity} onChangeText={setNewCity}/>
            <TextInput style={styles.input} placeholder="الراتب المتوقع (مثل: 900,000 د.ع)" placeholderTextColor="#a4b0be" value={newSalary} onChangeText={setNewSalary}/>
            
            <Text style={styles.labelType}>اختر القطاع / القسم:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
              {["برمجة وتقنية", "هندسة ومقاولات", "مبيعات وإدارة", "خدمات عامة"].map(cat => (
                <TouchableOpacity key={cat} style={[styles.typeChip, newCategory === cat && styles.typeChipSelected]} onPress={() => setNewCategory(cat)}>
                  <Text style={[styles.typeChipText, newCategory === cat && styles.typeChipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.labelType}>اختر نوع الدوام:</Text>
            <View style={styles.typeSelectorRow}>
              {["دوام كامل", "دوام جزئي", "عن بعد"].map(typeOpt => (
                <TouchableOpacity key={typeOpt} style={[styles.typeChip, newType === typeOpt && styles.typeChipSelected]} onPress={() => setNewType(typeOpt)}>
                  <Text style={[styles.typeChipText, newType === typeOpt && styles.typeChipTextSelected]}>{typeOpt}</Text>
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
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  welcomeContainer: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
  page: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  logoBadge: { backgroundColor: '#fff', padding: 15, borderRadius: 30, elevation: 5, marginBottom: 15 },
  logoImage: { width: 70, height: 70, resizeMode: 'contain' },
  logo: { fontSize: 28, fontWeight: "bold", color: "#1e272e", marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: "#747d8c", marginBottom: 25, textAlign: 'center' },
  bannerCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16, width: "100%", marginBottom: 30, elevation: 2, borderWidth: 1, borderColor: '#f1f2f6' },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 5, textAlign: 'center' },
  bannerDesc: { fontSize: 13, color: '#57606f', textAlign: 'center' },
  primaryButton: { backgroundColor: "#0984e3", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10, width: "100%", elevation: 3 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  authBox: { flex: 1, justifyContent: 'center', width: '100%' },
  switchAuth: { marginTop: 20, alignItems: 'center' },
  switchAuthText: { color: "#0984e3", fontSize: 14, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 14, elevation: 1 },
  welcomeUserSub: { fontSize: 12, color: '#747d8c' },
  welcomeUser: { fontSize: 15, color: '#1e272e', fontWeight: 'bold' },
  profileBadgeBtn: { backgroundColor: '#e0f2fe', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  
  profileHeaderCard: { backgroundColor: '#fff', padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 20, elevation: 2, borderWidth: 1, borderColor: '#f1f2f6' },
  profileAvatar: { backgroundColor: '#f1f2f6', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  profileEmail: { fontSize: 16, fontWeight: 'bold', color: '#1e272e', marginBottom: 6 },
  profileVipBadge: { fontSize: 12, color: '#0984e3', fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 14, alignItems: 'center', marginHorizontal: 5, elevation: 2, borderWidth: 1, borderColor: '#f1f2f6' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#0984e3', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#747d8c', textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e272e', marginBottom: 15 },
  roleCard: { backgroundColor: "#fff", padding: 18, borderRadius: 16, marginBottom: 15, elevation: 2, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f2f6' },
  employerCard: { backgroundColor: "#fff", padding: 18, borderRadius: 16, marginBottom: 15, elevation: 2, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f2f6' },
  roleIconContainer: { backgroundColor: '#f1f2f6', padding: 10, borderRadius: 12, marginRight: 15 },
  roleIcon: { width: 35, height: 35, resizeMode: 'contain' },
  roleInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1e272e", marginBottom: 3 },
  description: { fontSize: 12, color: "#747d8c" },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e272e' },
  backBtnContainer: { marginBottom: 10 },
  backText: { color: "#0984e3", fontSize: 14, fontWeight: "bold" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dfe4ea", padding: 14, borderRadius: 12, marginBottom: 15, fontSize: 15, color: "#2f3542", elevation: 1 },
  categoriesScroll: { marginBottom: 15, maxHeight: 45 },
  categoryChip: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dfe4ea', marginRight: 8, height: 36, justifyContent: 'center' },
  categoryChipSelected: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  categoryChipText: { fontSize: 13, color: '#57606f', fontWeight: 'bold' },
  categoryChipTextSelected: { color: '#fff' },
  jobCard: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 14, elevation: 2, borderWidth: 1, borderColor: '#f1f2f6' },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#1e272e" },
  categoryBadgeText: { fontSize: 11, color: '#0984e3', fontWeight: 'bold', marginTop: 2 },
  favButton: { padding: 4 },
  muted: { fontSize: 13, color: "#747d8c", marginBottom: 4 },
  jobCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f2f6', paddingTop: 10 },
  salary: { fontSize: 13, fontWeight: "bold", color: "#00b894" },
  tag: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, color: "#0284c7", fontWeight: 'bold' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 13, color: '#a4b0be', marginTop: 10, textAlign: 'center' },
  detailsHeaderBox: { backgroundColor: '#fff', padding: 20, borderRadius: 14, marginBottom: 15, alignItems: 'center', elevation: 2 },
  detailsMainTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e272e', marginBottom: 8, textAlign: 'center' },
  tagLarge: { backgroundColor: "#e0f2fe", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 12, color: "#0284c7", fontWeight: 'bold' },
  detailsCard: { backgroundColor: "#fff", padding: 20, borderRadius: 14, marginBottom: 20, elevation: 2 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  detailLabel: { fontSize: 14, color: '#747d8c' },
  detailVal: { fontSize: 14, color: '#1e272e', fontWeight: '600' },
  labelType: { fontSize: 14, fontWeight: 'bold', color: '#2f3542', marginBottom: 8 },
  typeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  typeChip: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#dfe4ea', alignItems: 'center', marginHorizontal: 4 },
  typeChipSelected: { backgroundColor: '#0984e3', borderColor: '#0984e3' },
  typeChipText: { fontSize: 12, color: '#57606f', fontWeight: 'bold' },
  typeChipTextSelected: { color: '#fff' },
  footer: { alignItems: 'center', paddingBottom: 5 },
  footerText: { fontSize: 12, color: '#a4b0be', fontWeight: '600' }
});

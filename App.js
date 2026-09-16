import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from "react-native";

// استيراد فايربيز (Firebase)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

// إعدادات الاتصال بقاعدة البيانات السحابية (Firebase Config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة الفايربيز
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  
  // حقول إضافة وظيفة جديدة
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newSalary, setNewSalary] = useState("");

  // جلب الوظائف من سحابة Firebase عند فتح التطبيق
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (jobsList.length > 0) {
        setJobs(jobsList);
      } else {
        // وظائف افتراضية في حال كانت القاعدة فارغة
        setJobs([
          { id: "1", title: "عامل صيانة", company: "شركة الأمل", city: "الحلة - بابل", salary: "600,000 د.ع", type: "دوام كامل" }
        ]);
      }
    } catch (error) {
      console.log("خطأ في جلب البيانات:", error);
    }
  };

  const handlePostJob = async () => {
    if (!newTitle || !newCompany) {
      Alert.alert("تنبيه", "يرجى ملء الحقول الأساسية على الأقل");
      return;
    }
    try {
      const newJobData = {
        title: newTitle,
        company: newCompany,
        city: newCity || "الحلة - بابل",
        salary: newSalary || "حسب الاتفاق",
        type: "دوام كامل",
        createdAt: new Date().toISOString()
      };
      
      // إرسال الوظيفة إلى سحابة Firebase لتظهر لكل المستخدمين
      await addDoc(collection(db, "jobs"), newJobData);
      
      Alert.alert("نجاح", "تم نشر الوظيفة في السحابة بنجاح!");
      setNewTitle("");
      setNewCompany("");
      setNewCity("");
      setNewSalary("");
      fetchJobs();
      setScreen("home");
    } catch (error) {
      Alert.alert("خطأ", "فشل نشر الوظيفة، تأكد من الاتصال بالإنترنت");
    }
  };

  const filteredJobs = jobs.filter(j => `${j.title} ${j.company} ${j.city}`.includes(search));
  const openJob = job => { setSelectedJob(job); setScreen("details"); };

  return (
    <SafeAreaView style={styles.container}>
      {screen === "welcome" && (
        <View style={styles.welcomeContainer}>
          <View style={styles.center}>
            <Text style={styles.logo}>💼 فرصتي</Text>
            <Text style={styles.subtitle}>فرص عمل سحابية وعالمية</Text>
            <Text style={styles.bigIcon}>🌐</Text>
            <Text style={styles.title}>أهلاً بيك بفرصتي</Text>
            <Text style={styles.description}>ابحث عن عمل أو انشر فرصة لتصل لكل الباحثين.</Text>
            
            <TouchableOpacity style={styles.button} onPress={() => setScreen("roles")}>
              <Text style={styles.buttonText}>ابدأ الآن</Text>
            </TouchableOpacity>
          </View>

          {/* حقوق البرمجة */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>تصميم وبرمجة: جمال الحسناوي ⚡</Text>
          </View>
        </View>
      )}

      {screen === "roles" && (
        <View style={styles.page}>
          <Text style={styles.title}>شنو تريد تستخدم التطبيق؟</Text>
          <TouchableOpacity style={styles.roleCard} onPress={() => setScreen("home")}>
            <Text style={styles.bigIcon}>👷</Text>
            <Text style={styles.cardTitle}>أريد أبحث عن عمل</Text>
            <Text style={styles.description}>تصفح الوظائف المتاحة بالسحابة.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.employerCard} onPress={() => setScreen("post")}>
            <Text style={styles.bigIcon}>🏢</Text>
            <Text style={styles.cardTitle}>أريد أنشر وظيفة</Text>
            <Text style={styles.description}>أعلن عن وظيفة لتظهر للجميع.</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "home" && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("roles")}>
            <Text style={styles.backText}>← رجوع</Text>
          </TouchableOpacity>
          <Text style={styles.title}>الوظائف المتاحة 🌍</Text>
          <TextInput 
            style={styles.input} 
            placeholder="🔎 ابحث عن وظيفة" 
            placeholderTextColor="#888" 
            value={search} 
            onChangeText={setSearch}
          />
          <ScrollView>
            {filteredJobs.map(job => (
              <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => openJob(job)}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.muted}>🏢 {job.company}</Text>
                <Text style={styles.muted}>📍 {job.city}</Text>
                <Text style={styles.salary}>💰 {job.salary}</Text>
                <Text style={styles.tag}>{job.type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {screen === "details" && selectedJob && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.backText}>← رجوع للقائمة</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedJob.title}</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.muted}>🏢 الشركة: {selectedJob.company}</Text>
            <Text style={styles.muted}>📍 الموقع: {selectedJob.city}</Text>
            <Text style={styles.salary}>💰 الراتب: {selectedJob.salary}</Text>
            <Text style={styles.tag}>{selectedJob.type}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => Alert.alert("تم التقديم", "تم إرسال طلبك للشركة بنجاح!")}>
            <Text style={styles.buttonText}>قدم على الوظيفة</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "post" && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("roles")}>
            <Text style={styles.backText}>← رجوع</Text>
          </TouchableOpacity>
          <Text style={styles.title}>انشر فرصة عمل (سحابي)</Text>
          <TextInput style={styles.input} placeholder="عنوان الوظيفة (مثال: فني صيانة)" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle}/>
          <TextInput style={styles.input} placeholder="اسم الشركة أو المحل" placeholderTextColor="#888" value={newCompany} onChangeText={setNewCompany}/>
          <TextInput style={styles.input} placeholder="المدينة (مثال: الحلة - المحاويل)" placeholderTextColor="#888" value={newCity} onChangeText={setNewCity}/>
          <TextInput style={styles.input} placeholder="الراتب (مثال: 700,000 د.ع)" placeholderTextColor="#888" value={newSalary} onChangeText={setNewSalary}/>
          <TouchableOpacity style={styles.button} onPress={handlePostJob}>
            <Text style={styles.buttonText}>نشر في السحابة</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  welcomeContainer: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 30, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
  page: { flex: 1, padding: 20 },
  logo: { fontSize: 32, fontWeight: "bold", color: "#2f3640", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#718093", marginBottom: 20 },
  bigIcon: { fontSize: 40, textAlign: "center", marginVertical: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#2f3640", marginBottom: 15, textAlign: "center" },
  description: { fontSize: 14, color: "#718093", textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#0984e3", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 15, width: "100%" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  roleCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  employerCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#2f3640", textAlign: "center" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dcdde1", padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16, color: "#333" },
  jobCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#dcdde1" },
  jobTitle: { fontSize: 18, fontWeight: "bold", color: "#2f3640", marginBottom: 5 },
  muted: { fontSize: 14, color: "#718093", marginBottom: 3 },
  salary: { fontSize: 14, fontWeight: "bold", color: "#00b894", marginVertical: 5 },
  tag: { alignSelf: "flex-start", backgroundColor: "#dfe6e9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, fontSize: 12, color: "#2d3436" },
  detailsCard: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginBottom: 20 },
  backText: { color: "#0984e3", fontSize: 16, marginBottom: 10, fontWeight: "bold" },
  footer: { alignItems: 'center', paddingBottom: 10 },
  footerText: { fontSize: 14, color: '#b2bec3', fontWeight: '600' }
});

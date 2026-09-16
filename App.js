import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from "react-native";

const initialJobs = [
  { id: 1, title: "عامل صيانة", company: "شركة الأمل", city: "الحلة - بابل", salary: "600,000 - 800,000 د.ع", type: "دوام كامل" },
  { id: 2, title: "سائق", company: "مؤسسة النور", city: "الحلة - بابل", salary: "700,000 د.ع", type: "دوام كامل" },
  { id: 3, title: "كهربائي", company: "شركة البناء", city: "الحلة - بابل", salary: "500,000 - 700,000 د.ع", type: "دوام كامل" }
];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  
  // حقول إضافة وظيفة جديدة
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newSalary, setNewSalary] = useState("");

  const filteredJobs = jobs.filter(j => `${j.title} ${j.company} ${j.city}`.includes(search));
  const openJob = job => { setSelectedJob(job); setScreen("details"); };

  const handlePostJob = () => {
    if (!newTitle || !newCompany) {
      Alert.alert("تنبيه", "يرجى ملء الحقول الأساسية على الأقل");
      return;
    }
    const newJ = {
      id: jobs.length + 1,
      title: newTitle,
      company: newCompany,
      city: newCity || "الحلة - بابل",
      salary: newSalary || "حسب الاتفاق",
      type: "دوام كامل"
    };
    setJobs([newJ, ...jobs]);
    Alert.alert("نجاح", "تم نشر الوظيفة بنجاح!");
    setScreen("home");
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === "welcome" && (
        <View style={styles.center}>
          <Text style={styles.logo}>💼 فرصتي</Text>
          <Text style={styles.subtitle}>فرص عمل أقرب إلك</Text>
          <Text style={styles.bigIcon}>🔎</Text>
          <Text style={styles.title}>أهلاً بيك بفرصتي</Text>
          <Text style={styles.description}>دور على شغل مناسب أو انشر فرصة عمل بسهولة.</Text>
          <TouchableOpacity style={styles.button} onPress={() => setScreen("roles")}>
            <Text style={styles.buttonText}>ابدأ الآن</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "roles" && (
        <View style={styles.page}>
          <Text style={styles.title}>شنو تريد تستخدم التطبيق؟</Text>
          <TouchableOpacity style={styles.roleCard} onPress={() => setScreen("home")}>
            <Text style={styles.bigIcon}>👷</Text>
            <Text style={styles.cardTitle}>أريد أبحث عن عمل</Text>
            <Text style={styles.description}>تصفح الوظائف وقدم عليها.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.employerCard} onPress={() => setScreen("post")}>
            <Text style={styles.bigIcon}>🏢</Text>
            <Text style={styles.cardTitle}>أريد أنشر وظيفة</Text>
            <Text style={styles.description}>أعلن عن وظيفة ووصل للمتقدمين.</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "home" && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("roles")}>
            <Text style={styles.backText}>← رجوع</Text>
          </TouchableOpacity>
          <Text style={styles.title}>هلا بيك 👋</Text>
          <TextInput 
            style={styles.input} 
            placeholder="🔎 ابحث عن وظيفة" 
            placeholderTextColor="#888" 
            value={search} 
            onChangeText={setSearch}
          />
          <Text style={styles.sectionTitle}>أحدث فرص العمل</Text>
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
          <TouchableOpacity style={styles.button} onPress={() => Alert.alert("تم التقديم", "تم إرسال طلبك بنجاح!")}>
            <Text style={styles.buttonText}>قدم على الوظيفة</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "post" && (
        <View style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("roles")}>
            <Text style={styles.backText}>← رجوع</Text>
          </TouchableOpacity>
          <Text style={styles.title}>انشر فرصة عمل</Text>
          <TextInput style={styles.input} placeholder="عنوان الوظيفة (مثال: عامل صيانة)" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle}/>
          <TextInput style={styles.input} placeholder="اسم الشركة أو المحل" placeholderTextColor="#888" value={newCompany} onChangeText={setNewCompany}/>
          <TextInput style={styles.input} placeholder="المدينة (مثال: الحلة - المحاويل)" placeholderTextColor="#888" value={newCity} onChangeText={setNewCity}/>
          <TextInput style={styles.input} placeholder="الراتب (مثال: 600,000 د.ع)" placeholderTextColor="#888" value={newSalary} onChangeText={setNewSalary}/>
          <TouchableOpacity style={styles.button} onPress={handlePostJob}>
            <Text style={styles.buttonText}>نشر الوظيفة</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  page: { flex: 1, padding: 20 },
  logo: { fontSize: 32, fontWeight: "bold", color: "#2f3640", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#718093", marginBottom: 20 },
  bigIcon: { fontSize: 40, textAlign: "center", marginVertical: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#2f3640", marginBottom: 15, textAlign: "center" },
  description: { fontSize: 14, color: "#718093", textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#0984e3", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 15 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  roleCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  employerCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#2f3640", textAlign: "center" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dcdde1", padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16, color: "#333" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2f3640", marginVertical: 10 },
  jobCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#dcdde1" },
  jobTitle: { fontSize: 18, fontWeight: "bold", color: "#2f3640", marginBottom: 5 },
  muted: { fontSize: 14, color: "#718093", marginBottom: 3 },
  salary: { fontSize: 14, fontWeight: "bold", color: "#00b894", marginVertical: 5 },
  tag: { alignSelf: "flex-start", backgroundColor: "#dfe6e9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, fontSize: 12, color: "#2d3436" },
  detailsCard: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginBottom: 20 },
  backText: { color: "#0984e3", fontSize: 16, marginBottom: 10, fontWeight: "bold" }
});

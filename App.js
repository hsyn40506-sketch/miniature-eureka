import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

const initialJobs = [
  {
    id: 1,
    title: "عامل صيانة",
    company: "شركة الأمل",
    city: "الحلة - بابل",
    salary: "600,000 - 800,000 د.ع",
    type: "دوام كامل",
    description: "• خبرة في الصيانة العامة\n• الالتزام بمواعيد العمل\n• حسن التعامل مع الزبائن",
    phone: "07800000000"
  },
  {
    id: 2,
    title: "سائق",
    company: "مؤسسة النور",
    city: "الحلة - بابل",
    salary: "700,000 د.ع",
    type: "دوام كامل",
    description: "• رخصة قيادة سارية المفعول\n• معرفة جيدة بمناطق بابل والمحافظات القريبة",
    phone: "07700000000"
  },
  {
    id: 3,
    title: "كهربائي",
    company: "شركة البناء",
    city: "الحلة - بابل",
    salary: "500,000 - 700,000 د.ع",
    type: "دوام كامل",
    description: "• خبرة في التمديدات الكهربائية المنزلية والصناعية",
    phone: "07500000000"
  },
];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [jobList, setJobList] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");

  // حقول نموذج نشر وظيفة جديدة
  const [postTitle, setPostTitle] = useState("");
  const [postCompany, setPostCompany] = useState("");
  const [postCity, setPostCity] = useState("");
  const [postSalary, setPostSalary] = useState("");
  const [postType, setPostType] = useState("دوام كامل");
  const [postPhone, setPostPhone] = useState("");
  const [postDescription, setPostDescription] = useState("");

  // حقول نموذج التقديم على وظيفة
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyExperience, setApplyExperience] = useState("");
  const [applyMessage, setApplyMessage] = useState("");

  // تصفية الوظائف بناءً على البحث (العنوان، الشركة، أو المدینة)
  const filteredJobs = jobList.filter(
    (job) =>
      job.title.includes(search) ||
      job.company.includes(search) ||
      job.city.includes(search)
  );

  const openJob = (job) => {
    setSelectedJob(job);
    setScreen("details");
  };

  const handlePostJob = () => {
    if (!postTitle || !postCity) {
      alert("يرجى إدخال عنوان الوظيفة ومكان العمل على الأقل.");
      return;
    }

    const newJob = {
      id: jobList.length + 1,
      title: postTitle,
      company: postCompany || "شركة محلية",
      city: postCity,
      salary: postSalary ? `${postSalary} د.ع` : "يُحدد لاحقاً",
      type: postType || "دوام كامل",
      phone: postPhone,
      description: postDescription || "• الالتزام بمتطلبات العمل",
    };

    setJobList([newJob, ...jobList]);

    // تفريغ الحقول بعد النشر
    setPostTitle("");
    setPostCompany("");
    setPostCity("");
    setPostSalary("");
    setPostPhone("");
    setPostDescription("");

    alert("تم نشر الوظيفة بنجاح ✅");
    setScreen("home");
  };

  const handleApply = () => {
    if (!applyName || !applyPhone) {
      alert("يرجى إدخال الاسم ورقم الهاتف على الأقل.");
      return;
    }

    // تفريغ حقول التقديم
    setApplyName("");
    setApplyPhone("");
    setApplyExperience("");
    setApplyMessage("");

    alert("تم إرسال طلبك بنجاح وسيتم التواصل معك قريباً ✅");
    setScreen("home");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* شاشة البداية */}
      {screen === "welcome" && (
        <View style={styles.center}>
          <Text style={styles.logo}>💼 فرصتي</Text>
          <Text style={styles.subtitle}>فرص عمل أقرب إلك</Text>

          <Text style={styles.bigIcon}>🔎</Text>

          <Text style={styles.title}>أهلاً بيك بفرصتي</Text>

          <Text style={styles.description}>
            دور على شغل مناسب أو انشر فرصة عمل بسهولة.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreen("roles")}
          >
            <Text style={styles.buttonText}>ابدأ الآن</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* اختيار نوع الحساب */}
      {screen === "roles" && (
        <View style={styles.page}>
          <Text style={styles.title}>شنو تريد تستخدم التطبيق؟</Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setScreen("home")}
          >
            <Text style={styles.bigIcon}>👷</Text>
            <Text style={styles.cardTitle}>أريد أبحث عن عمل</Text>
            <Text style={styles.cardDesc}>تصفح الوظائف وقدم عليها.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.employerCard}
            onPress={() => setScreen("post")}
          >
            <Text style={styles.bigIcon}>🏢</Text>
            <Text style={styles.cardTitle}>أريد أنشر وظيفة</Text>
            <Text style={styles.cardDesc}>أعلن عن وظيفة ووصل للمتقدمين.</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* الرئيسية / قائمة الوظائف */}
      {screen === "home" && (
        <View style={styles.page}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setScreen("roles")}>
              <Text style={styles.backSmall}>← القائمة</Text>
            </TouchableOpacity>
            <Text style={styles.title}>هلا بيك 👋</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="🔎 ابحث عن وظيفة، شركة أو مدينة"
            value={search}
            onChangeText={setSearch}
          />

          <Text style={styles.sectionTitle}>أحدث فرص العمل</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredJobs.length === 0 ? (
              <Text style={styles.noResults}>لا توجد نتائج مطابقة لبحثك</Text>
            ) : (
              filteredJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => openJob(job)}
                >
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.muted}>🏢 {job.company}</Text>
                  <Text style={styles.muted}>📍 {job.city}</Text>
                  <Text style={styles.salary}>💰 {job.salary}</Text>
                  <Text style={styles.tag}>{job.type}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* تفاصيل الوظيفة */}
      {screen === "details" && selectedJob && (
        <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.back}>← رجوع</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{selectedJob.title}</Text>

          <View style={styles.jobCard}>
            <Text style={styles.muted}>🏢 {selectedJob.company}</Text>
            <Text style={styles.muted}>📍 {selectedJob.city}</Text>
            <Text style={styles.salary}>💰 {selectedJob.salary}</Text>
            <Text style={styles.muted}>🕐 {selectedJob.type}</Text>
            {selectedJob.phone ? (
              <Text style={styles.muted}>📞 {selectedJob.phone}</Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>متطلبات وتفاصيل الوظيفة</Text>

          <Text style={styles.detailsBox}>{selectedJob.description}</Text>

          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => setScreen("apply")}
          >
            <Text style={styles.buttonText}>تقديم على الوظيفة</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* نموذج التقديم */}
      {screen === "apply" && (
        <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setScreen("details")}>
            <Text style={styles.back}>← رجوع</Text>
          </TouchableOpacity>

          <Text style={styles.title}>قدّم على الوظيفة</Text>

          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            value={applyName}
            onChangeText={setApplyName}
          />

          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            keyboardType="phone-pad"
            value={applyPhone}
            onChangeText={setApplyPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="عدد سنوات الخبرة"
            keyboardType="numeric"
            value={applyExperience}
            onChangeText={setApplyExperience}
          />

          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder="رسالة لصاحب العمل (اختياري)"
            multiline
            value={applyMessage}
            onChangeText={setApplyMessage}
          />

          <TouchableOpacity style={styles.greenButton} onPress={handleApply}>
            <Text style={styles.buttonText}>إرسال الطلب</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* نشر وظيفة جديدة */}
      {screen === "post" && (
        <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setScreen("roles")}>
            <Text style={styles.back}>← رجوع</Text>
          </TouchableOpacity>

          <Text style={styles.title}>نشر وظيفة جديدة</Text>

          <TextInput
            style={styles.input}
            placeholder="عنوان الوظيفة (مثال: فني صيانة)"
            value={postTitle}
            onChangeText={setPostTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="اسم الشركة أو المؤسسة"
            value={postCompany}
            onChangeText={setPostCompany}
          />

          <TextInput
            style={styles.input}
            placeholder="المحافظة والمدينة (مثال: الحلة - بابل)"
            value={postCity}
            onChangeText={setPostCity}
          />

          <TextInput
            style={styles.input}
            placeholder="الراتب (مثال: 600,000 د.ع)"
            value={postSalary}
            onChangeText={setPostSalary}
          />

          <TextInput
            style={styles.input}
            placeholder="نوع الدوام (مثال: دوام كامل)"
            value={postType}
            onChangeText={setPostType}
          />

          <TextInput
            style={styles.input}
            placeholder="رقم التواصل"
            keyboardType="phone-pad"
            value={postPhone}
            onChangeText={setPostPhone}
          />

          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder="تفاصيل ومتطلبات الوظيفة"
            multiline
            value={postDescription}
            onChangeText={setPostDescription}
          />

          <TouchableOpacity style={styles.button} onPress={handlePostJob}>
            <Text style={styles.buttonText}>نشر الوظيفة</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7FC",
  },
  page: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0878E8",
  },
  subtitle: {
    fontSize: 17,
    color: "#64748B",
    marginTop: 5,
  },
  bigIcon: {
    fontSize: 55,
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#14213D",
    marginBottom: 15,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#14213D",
    textAlign: "right",
  },
  description: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 20,
  },
  cardDesc: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "right",
  },
  detailsBox: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 28,
    textAlign: "right",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1EAF3",
  },
  button: {
    width: "100%",
    backgroundColor: "#0878E8",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  greenButton: {
    width: "100%",
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  roleCard: {
    backgroundColor: "#E8F4FF",
    padding: 20,
    borderRadius: 18,
    marginVertical: 10,
  },
  employerCard: {
    backgroundColor: "#ECFDF5",
    padding: 20,
    borderRadius: 18,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#14213D",
    marginBottom: 5,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D9E4F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    textAlign: "right",
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 17,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1EAF3",
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#14213D",
    textAlign: "right",
  },
  muted: {
    color: "#64748B",
    marginBottom: 7,
    fontSize: 14,
    textAlign: "right",
  },
  salary: {
    color: "#0878E8",
    fontWeight: "bold",
    fontSize: 15,
    marginVertical: 5,
    textAlign: "right",
  },
  tag: {
    alignSelf: "flex-start",
    color: "#079455",
    backgroundColor: "#E9F8EF",
    padding: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  back: {
    color: "#0878E8",
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "bold",
    textAlign: "right",
  },
  backSmall: {
    color: "#0878E8",
    fontSize: 15,
    fontWeight: "bold",
  },
  noResults: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 20,
    fontSize: 15,
  },
});

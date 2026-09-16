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

const jobs = [
  {
    id: 1,
    title: "عامل صيانة",
    company: "شركة الأمل",
    city: "الحلة - بابل",
    salary: "600,000 - 800,000 د.ع",
    type: "دوام كامل",
  },
  {
    id: 2,
    title: "سائق",
    company: "مؤسسة النور",
    city: "الحلة - بابل",
    salary: "700,000 د.ع",
    type: "دوام كامل",
  },
  {
    id: 3,
    title: "كهربائي",
    company: "شركة البناء",
    city: "الحلة - بابل",
    salary: "500,000 - 700,000 د.ع",
    type: "دوام كامل",
  },
];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter((job) =>
    job.title.includes(search)
  );

  const openJob = (job) => {
    setSelectedJob(job);
    setScreen("details");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* البداية */}
      {screen === "welcome" && (
        <View style={styles.center}>
          <Text style={styles.logo}>💼 فرصتي</Text>
          <Text style={styles.subtitle}>
            فرص عمل أقرب إلك
          </Text>

          <Text style={styles.bigIcon}>🔎</Text>

          <Text style={styles.title}>
            أهلاً بيك بفرصتي
          </Text>

          <Text style={styles.description}>
            دور على شغل مناسب أو انشر فرصة عمل بسهولة.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreen("roles")}
          >
            <Text style={styles.buttonText}>
              ابدأ الآن
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* اختيار نوع الحساب */}
      {screen === "roles" && (
        <View style={styles.page}>
          <Text style={styles.title}>
            شنو تريد تستخدم التطبيق؟
          </Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setScreen("home")}
          >
            <Text style={styles.bigIcon}>👷</Text>
            <Text style={styles.cardTitle}>
              أريد أبحث عن عمل
            </Text>
            <Text style={styles.description}>
              تصفح الوظائف وقدم عليها.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.employerCard}
            onPress={() => setScreen("post")}
          >
            <Text style={styles.bigIcon}>🏢</Text>
            <Text style={styles.cardTitle}>
              أريد أنشر وظيفة
            </Text>
            <Text style={styles.description}>
              أعلن عن وظيفة ووصل للمتقدمين.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* الرئيسية */}
      {screen === "home" && (
        <View style={styles.page}>
          <Text style={styles.title}>
            هلا بيك 👋
          </Text>

          <TextInput
            style={styles.input}
            placeholder="🔎 ابحث عن وظيفة"
            value={search}
            onChangeText={setSearch}
          />

          <Text style={styles.sectionTitle}>
            أحدث فرص العمل
          </Text>

          <ScrollView>
            {filteredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => openJob(job)}
              >
                <Text style={styles.jobTitle}>
                  {job.title}
                </Text>

                <Text style={styles.muted}>
                  🏢 {job.company}
                </Text>

                <Text style={styles.muted}>
                  📍 {job.city}
                </Text>

                <Text style={styles.salary}>
                  💰 {job.salary}
                </Text>

                <Text style={styles.tag}>
                  {job.type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* تفاصيل الوظيفة */}
      {screen === "details" && selectedJob && (
        <ScrollView style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.back}>← رجوع</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {selectedJob.title}
          </Text>

          <View style={styles.jobCard}>
            <Text style={styles.muted}>
              🏢 {selectedJob.company}
            </Text>

            <Text style={styles.muted}>
              📍 {selectedJob.city}
            </Text>

            <Text style={styles.salary}>
              💰 {selectedJob.salary}
            </Text>

            <Text style={styles.muted}>
              🕐 {selectedJob.type}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            متطلبات الوظيفة
          </Text>

          <Text style={styles.description}>
            • خبرة في نفس المجال{"\n"}
            • الالتزام بالدوام{"\n"}
            • حسن التعامل{"\n"}
            • القدرة على العمل
          </Text>

          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => setScreen("apply")}
          >
            <Text style={styles.buttonText}>
              تقديم على الوظيفة
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* التقديم */}
      {screen === "apply" && (
        <ScrollView style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("details")}>
            <Text style={styles.back}>← رجوع</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            قدّم على الوظيفة
          </Text>

          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
          />

          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="عدد سنوات الخبرة"
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder="رسالة لصاحب العمل"
            multiline
          />

          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => {
              alert("تم إرسال طلبك بنجاح ✅");
              setScreen("home");
            }}
          >
            <Text style={styles.buttonText}>
              إرسال الطلب
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* نشر وظيفة */}
      {screen === "post" && (
        <ScrollView style={styles.page}>
          <TouchableOpacity onPress={() => setScreen("roles")}>
            <Text style={styles.back}>← رجوع</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            نشر وظيفة
          </Text>

          <TextInput
            style={styles.input}
            placeholder="عنوان الوظيفة"
          />

          <TextInput
            style={styles.input}
            placeholder="المهنة"
          />

          <TextInput
            style={styles.input}
            placeholder="المحافظة"
          />

          <TextInput
            style={styles.input}
            placeholder="المدينة"
          />

          <TextInput
            style={styles.input}
            placeholder="الراتب"
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder="تفاصيل الوظيفة"
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="رقم التواصل"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              alert("تم نشر الوظيفة بنجاح ✅")
            }
          >
            <Text style={styles.buttonText}>
              نشر الوظيفة
            </Text>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#14213D",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#14213D",
  },

  description: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    width: "100%",
    backgroundColor: "#0878E8",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 10,
  },

  greenButton: {
    width: "100%",
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 20,
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
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#14213D",
  },

  muted: {
    color: "#64748B",
    marginBottom: 7,
    fontSize: 14,
  },

  salary: {
    color: "#0878E8",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 5,
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
    fontSize: 17,
    marginBottom: 20,
    fontWeight: "bold",
  },
});

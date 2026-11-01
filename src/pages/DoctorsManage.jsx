import { useEffect, useState } from "react";
import { api, getToken } from "../lib/api";

const emptyForm = {
  id: null,
  name: "",
  title: "",
  initials: "",

  role: "doctor",
  specialty_ids: [],

  gender: "",
  image_url: "",
  bio: "",

  medical_school: "",
  degree: "",
  graduation_year: "",
  postgraduate_qualifications: "",
  residency_fellowship: "",
  board_certifications: "",

  subspecialty: "",
  years_experience: "",
  languages: "",
  clinic_affiliation: "",

  is_active: true,
  sort_order: 0,
};

const DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

const createEmptySchedule = () =>
  DAYS.map((day) => ({
    day_of_week: day,
    enabled: false,
    start_time: "",
    end_time: "",
    note: "",
    sort_order: 0,
  }));

/*
 * Convert:
 * 09:00 -> 9:00 ص
 * 15:30 -> 3:30 م
 */
function formatArabicTime(time) {
  if (!time) return "";

  const parts = time.split(":");

  if (parts.length < 2) return time;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "م" : "ص";

  let hour = hours % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

/*
 * A small time selector.

 * The actual value is stored as HH:mm,
 * but the user sees Arabic ص / م.
 */
function ArabicTimeInput({ value, onChange, required = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          flex: 1,
          direction: "ltr",
        }}
      />

      {value && (
        <span
          style={{
            minWidth: 70,
            fontWeight: 600,
            direction: "rtl",
            whiteSpace: "nowrap",
          }}
        >
          {formatArabicTime(value)}
        </span>
      )}
    </div>
  );
}

/*
 * Schedule editor shown inside the doctor form.
 */
function ScheduleForm({ schedule, setSchedule }) {
  const updateDay = (index, field, value) => {
    setSchedule((current) =>
      current.map((day, i) =>
        i === index
          ? {
              ...day,
              [field]: value,
            }
          : day,
      ),
    );
  };

  const addAnotherPeriod = (index) => {
    setSchedule((current) => {
      const day = current[index];

      return [
        ...current.slice(0, index),
        {
          ...day,
          extraPeriods: [
            ...(day.extraPeriods || []),
            {
              start_time: "",
              end_time: "",
            },
          ],
        },
        ...current.slice(index + 1),
      ];
    });
  };

  const updateExtraPeriod = (dayIndex, periodIndex, field, value) => {
    setSchedule((current) =>
      current.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        const periods = [...(day.extraPeriods || [])];

        periods[periodIndex] = {
          ...periods[periodIndex],
          [field]: value,
        };

        return {
          ...day,
          extraPeriods: periods,
        };
      }),
    );
  };

  const removeExtraPeriod = (dayIndex, periodIndex) => {
    setSchedule((current) =>
      current.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        const periods = [...(day.extraPeriods || [])];

        periods.splice(periodIndex, 1);

        return {
          ...day,
          extraPeriods: periods,
        };
      }),
    );
  };

  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 17,
              margin: 0,
              marginBottom: 5,
            }}
          >
            جدول مواعيد الطبيب
          </h3>

          <div
            style={{
              fontSize: 13,
              opacity: 0.65,
            }}
          >
            اختر أيام العمل وحدد ساعات الدوام
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {schedule.map((day, index) => (
          <div
            key={day.day_of_week}
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 12,
              padding: 14,
              background: day.enabled ? "rgba(0,0,0,0.015)" : "transparent",
            }}
          >
            {/* Day header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: day.enabled ? 14 : 0,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: "pointer",
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(e) =>
                    updateDay(index, "enabled", e.target.checked)
                  }
                />

                <span>{day.day_of_week}</span>
              </label>

              {day.enabled && (
                <span
                  style={{
                    fontSize: 12,
                    opacity: 0.65,
                  }}
                >
                  يوم عمل
                </span>
              )}
            </div>

            {/* Hours */}
            {day.enabled && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  <label>
                    من
                    <ArabicTimeInput
                      value={day.start_time}
                      onChange={(value) =>
                        updateDay(index, "start_time", value)
                      }
                      required={day.enabled}
                    />
                  </label>

                  <label>
                    إلى
                    <ArabicTimeInput
                      value={day.end_time}
                      onChange={(value) => updateDay(index, "end_time", value)}
                      required={day.enabled}
                    />
                  </label>

                  <label>
                    ملاحظة
                    <input
                      type="text"
                      placeholder="اختياري"
                      value={day.note}
                      onChange={(e) => updateDay(index, "note", e.target.value)}
                    />
                  </label>
                </div>

                {/* Extra periods */}
                {day.extraPeriods?.map((period, periodIndex) => (
                  <div
                    key={periodIndex}
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px dashed rgba(0,0,0,0.15)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                        alignItems: "end",
                      }}
                    >
                      <label>
                        من
                        <ArabicTimeInput
                          value={period.start_time}
                          onChange={(value) =>
                            updateExtraPeriod(
                              index,
                              periodIndex,
                              "start_time",
                              value,
                            )
                          }
                          required
                        />
                      </label>

                      <label>
                        إلى
                        <ArabicTimeInput
                          value={period.end_time}
                          onChange={(value) =>
                            updateExtraPeriod(
                              index,
                              periodIndex,
                              "end_time",
                              value,
                            )
                          }
                          required
                        />
                      </label>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => removeExtraPeriod(index, periodIndex)}
                      >
                        حذف الفترة
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => addAnotherPeriod(index)}
                  >
                    + إضافة فترة أخرى
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DoctorsManage() {
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [schedule, setSchedule] = useState(createEmptySchedule());

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL || "")
    .trim()
    .replace(/\/+$/, "");

  const getDoctorImageUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;

    const path = url.startsWith("/") ? url : `/${url}`;
    return `${API_BASE}${path}`;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("يرجى اختيار صورة JPG أو PNG أو WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("يجب ألا يتجاوز حجم الصورة 5 ميجابايت.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = getToken();

      if (!token) {
        throw new Error("انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.");
      }

      const response = await fetch(`${API_BASE}/api/doctors/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "تعذر رفع صورة الطبيب.",
        );
      }

      const imageUrl =
        result.image_url ||
        result.imageUrl ||
        result.url ||
        result.data?.image_url;

      if (!imageUrl) {
        throw new Error("لم يُرجع الخادم رابط الصورة.");
      }

      setForm((current) => ({
        ...current,
        image_url: imageUrl,
      }));
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء رفع الصورة.");
    } finally {
      setUploadingImage(false);
    }
  };

const loadSpecialties = async () => {
  setLoadingSpecialties(true);

  try {
    const data = await api.get("/api/specialties");

    // Only display active specialties when adding/editing doctors
    const activeSpecialties = Array.isArray(data)
      ? data.filter((specialty) => specialty.is_active)
      : [];

    setSpecialties(activeSpecialties);
  } catch (err) {
    console.error("Load specialties error:", err);

    setError(err.message || "تعذر تحميل التخصصات");
    setSpecialties([]);
  } finally {
    setLoadingSpecialties(false);
  }
};

  const getStoredToken = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("tokens") || "{}");
      if (tokens.accessToken) return tokens.accessToken;
    } catch {
      // Try the legacy token keys below.
    }

    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      ""
    );
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.get("/api/doctors/admin");

      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تحميل الأطباء");

      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (specialtyId) => {
    setForm((current) => {
      const exists = current.specialty_ids.includes(specialtyId);

      return {
        ...current,
        specialty_ids: exists
          ? current.specialty_ids.filter((id) => id !== specialtyId)
          : [...current.specialty_ids, specialtyId],
      };
    });
  };

  useEffect(() => {
    load();
    loadSpecialties();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((current) => ({
      ...current,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setSchedule(createEmptySchedule());

    setError("");
  };

  /*
   * Load an existing doctor's schedule
   * when clicking "تعديل".
   */
  const loadDoctorSchedule = async (doctorId) => {
    try {
      const rows = await api.get(`/api/doctors/${doctorId}/schedule`);

      const newSchedule = createEmptySchedule();

      if (Array.isArray(rows)) {
        rows.forEach((row) => {
          const index = newSchedule.findIndex(
            (day) => day.day_of_week === row.day_of_week,
          );

          /*
           * Normal schedule entry
           */
          if (index !== -1) {
            if (!newSchedule[index].enabled) {
              newSchedule[index] = {
                ...newSchedule[index],
                enabled: true,
                start_time: row.start_time || "",
                end_time: row.end_time || "",
                note: row.note || "",
                sort_order: row.sort_order || 0,
              };
            } else {
              /*
               * Same day already has an entry.
               * Add it as another period.
               */
              newSchedule[index].extraPeriods =
                newSchedule[index].extraPeriods || [];

              newSchedule[index].extraPeriods.push({
                start_time: row.start_time || "",
                end_time: row.end_time || "",
              });
            }
          }
        });
      }

      setSchedule(newSchedule);
    } catch (err) {
      console.error("Failed to load doctor schedule:", err);

      setError(err.message || "تعذر تحميل جدول الطبيب");
    }
  };

  const handleEdit = async (doctor) => {
    const selectedSpecialtyIds = (
      doctor.specialties ||
      doctor.specialty_ids ||
      []
    )
      .map((item) =>
        typeof item === "object" ? Number(item.id) : Number(item),
      )
      .filter(Number.isFinite);

    setForm({
      ...emptyForm,
      ...doctor,

      role: doctor.role || "doctor",

      specialty_ids: selectedSpecialtyIds,

      gender: doctor.gender || "",

      image_url: doctor.image_url || doctor.image || "",

      languages: Array.isArray(doctor.languages)
        ? doctor.languages.join(", ")
        : doctor.languages || "",

      graduation_year: doctor.graduation_year ?? "",

      years_experience: doctor.years_experience ?? "",

      sort_order: doctor.sort_order ?? 0,

      is_active: doctor.is_active ?? true,
    });

    setError("");

    await loadDoctorSchedule(doctor.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Save schedule rows after doctor creation/update.
   */
  const saveDoctorSchedule = async (doctorId) => {
    /*
     * First get existing schedule.
     * This is important when editing.
     */
    let existingRows = [];

    try {
      const existing = await api.get(`/api/doctors/${doctorId}/schedule`);

      existingRows = Array.isArray(existing) ? existing : [];
    } catch (err) {
      console.warn("Could not load existing schedule:", err);
    }

    /*
     * Delete existing schedule rows.
     *
     * We do this when editing so that
     * removed days are actually removed.
     */
    for (const row of existingRows) {
      await api.del(`/api/doctors/${doctorId}/schedule/${row.id}`);
    }

    /*
     * Create new schedule rows.
     */
    for (const day of schedule) {
      if (!day.enabled) {
        continue;
      }

      /*
       * Main period
       */
      if (day.start_time && day.end_time) {
        await api.post(`/api/doctors/${doctorId}/schedule`, {
          day_of_week: day.day_of_week,

          start_time: day.start_time,

          end_time: day.end_time,

          note: day.note?.trim() || null,

          sort_order: Number(day.sort_order) || 0,
        });
      }

      /*
       * Additional periods
       */
      if (day.extraPeriods) {
        for (let i = 0; i < day.extraPeriods.length; i++) {
          const period = day.extraPeriods[i];

          if (!period.start_time || !period.end_time) {
            continue;
          }

          await api.post(`/api/doctors/${doctorId}/schedule`, {
            day_of_week: day.day_of_week,

            start_time: period.start_time,

            end_time: period.end_time,

            note: null,

            sort_order: (Number(day.sort_order) || 0) + i + 1,
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialty_ids || form.specialty_ids.length === 0) {
      setError("يرجى اختيار تخصص واحد على الأقل");
      return;
    }
    setSaving(true);
    setError("");

    try {
      /*
       * Validate schedule before saving.
       */
      for (const day of schedule) {
        if (!day.enabled) {
          continue;
        }

        if (!day.start_time || !day.end_time) {
          throw new Error(
            `يرجى تحديد وقت البداية والنهاية ليوم ${day.day_of_week}`,
          );
        }

        if (day.start_time >= day.end_time) {
          throw new Error(
            `وقت النهاية يجب أن يكون بعد وقت البداية في يوم ${day.day_of_week}`,
          );
        }

        if (day.extraPeriods) {
          for (const period of day.extraPeriods) {
            if (!period.start_time || !period.end_time) {
              throw new Error(
                `يرجى إكمال أوقات جميع الفترات في يوم ${day.day_of_week}`,
              );
            }

            if (period.start_time >= period.end_time) {
              throw new Error(
                `وقت النهاية يجب أن يكون بعد وقت البداية في يوم ${day.day_of_week}`,
              );
            }
          }
        }
      }

      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        initials: form.initials.trim(),

        role: form.role,

        specialty_ids: form.specialty_ids,

        gender: form.gender || null,

        image_url: form.image_url || null,

        bio: form.bio || null,

        medical_school: form.medical_school || null,

        degree: form.degree || null,

        graduation_year: form.graduation_year
          ? Number(form.graduation_year)
          : null,

        postgraduate_qualifications: form.postgraduate_qualifications || null,

        residency_fellowship: form.residency_fellowship || null,

        board_certifications: form.board_certifications || null,

        subspecialty: form.subspecialty || null,

        years_experience:
          form.years_experience !== "" ? Number(form.years_experience) : null,

        languages: form.languages
          ? form.languages
              .split(",")
              .map((language) => language.trim())
              .filter(Boolean)
          : [],

        clinic_affiliation: form.clinic_affiliation || null,

        is_active: form.is_active,

        sort_order: Number(form.sort_order) || 0,
      };

      let doctorId;

      /*
       * Create doctor
       */
      if (!form.id) {
        const created = await api.post("/api/doctors", payload);

        /*
         * Different APIs return the ID
         * in slightly different shapes.
         */
        doctorId = created?.id || created?.doctor?.id || created?.data?.id;
      } else {
        /*
         * Update doctor
         */
        await api.put(`/api/doctors/${form.id}`, payload);

        doctorId = form.id;
      }

      if (!doctorId) {
        throw new Error(
          "تم حفظ الطبيب ولكن لم يتم الحصول على رقم الطبيب لحفظ الجدول",
        );
      }

      /*
       * Save schedule
       */
      await saveDoctorSchedule(doctorId);

      /*
       * Reset form
       */
      resetForm();

      /*
       * Reload doctors
       */
      await load();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حفظ الطبيب");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل تريد حذف هذا الطبيب؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    setError("");

    try {
      await api.del(`/api/doctors/${id}`);

      /*
       * Because doctor_schedule has:
       *
       * ON DELETE CASCADE
       *
       * the doctor's schedule will also
       * be deleted automatically.
       */

      if (form.id === id) {
        resetForm();
      }

      await load();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حذف الطبيب");
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-head">
        <h1>إدارة الأطباء</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* =========================
          DOCTOR FORM
      ========================== */}
      <div
        className="admin-card"
        style={{
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            marginBottom: 14,
            fontSize: 16,
          }}
        >
          {form.id ? "تعديل بيانات طبيب" : "إضافة طبيب جديد"}
        </h3>

        <form className="admin-form" onSubmit={handleSubmit}>
          {/* Name */}
          <label>
            الاسم الكامل
            <input value={form.name} onChange={handleChange("name")} required />
          </label>

          {/* Title */}
          <label>
            المسمى الوظيفي
            <input
              value={form.title}
              onChange={handleChange("title")}
              required
            />
          </label>

          {/* Specialty */}
          {/* Role */}
          <label>
            التصنيف المهني
            <select value={form.role} onChange={handleChange("role")} required>
              <option value="doctor">طبيب</option>
              <option value="specialist">أخصائي</option>
            </select>
          </label>

          {/* Multiple Specialties */}
          <div className="admin-form--full">
            <label>التخصصات</label>

            {loadingSpecialties ? (
              <p>جارٍ تحميل التخصصات...</p>
            ) : specialties.length === 0 ? (
              <p>لا توجد تخصصات متاحة. يرجى إضافتها من إدارة التخصصات.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 10,
                  marginTop: 10,
                  padding: 14,
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                }}
              >
                {specialties.map((specialty) => (
                  <label
                    key={specialty.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.specialty_ids.includes(
                        Number(specialty.id),
                      )}
                      onChange={() => toggleSpecialty(Number(specialty.id))}
                    />

                    <span>{specialty.name}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Selected specialties */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
              }}
            >
              {form.specialty_ids.map((id) => {
                const specialty = specialties.find(
                  (item) => Number(item.id) === id,
                );

                if (!specialty) return null;

                return (
                  <span
                    key={id}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: "var(--sage-100)",
                      color: "var(--teal-700)",
                      fontSize: 13,
                    }}
                  >
                    {specialty.name}
                    <button
                      type="button"
                      onClick={() => toggleSpecialty(id)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "inherit",
                        marginInlineStart: 8,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Initials */}
          <label>
            الأحرف الأولى
            <input
              value={form.initials}
              onChange={handleChange("initials")}
              placeholder="مثال: م ش"
              required
            />
          </label>

          {/* Image */}
          <label className="admin-form--full">
            صورة الطبيب
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage || saving}
            />
            <small>JPG أو PNG أو WebP — الحد الأقصى 5 ميجابايت.</small>
            {uploadingImage && <p>جارٍ رفع الصورة...</p>}
            {form.image_url && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={getDoctorImageUrl(form.image_url)}
                  alt="معاينة صورة الطبيب"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                  }}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      image_url: "",
                    }))
                  }
                >
                  إزالة الصورة
                </button>
              </div>
            )}
          </label>

          {/* Bio */}
          <label className="admin-form--full">
            نبذة تعريفية
            <textarea value={form.bio} onChange={handleChange("bio")} />
          </label>

          <label>
            الجنس
            <select value={form.gender} onChange={handleChange("gender")}>
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </label>

          <label>
            كلية الطب
            <input
              value={form.medical_school}
              onChange={handleChange("medical_school")}
            />
          </label>

          <label>
            الدرجة العلمية
            <input
              value={form.degree}
              onChange={handleChange("degree")}
              placeholder="مثال: MBBS, MD"
            />
          </label>

          <label>
            سنة التخرج
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={form.graduation_year}
              onChange={handleChange("graduation_year")}
            />
          </label>

          <label>
            سنوات الخبرة
            <input
              type="number"
              min="0"
              value={form.years_experience}
              onChange={handleChange("years_experience")}
            />
          </label>

          <label>
            التخصص الدقيق
            <input
              value={form.subspecialty}
              onChange={handleChange("subspecialty")}
            />
          </label>

          <label className="admin-form--full">
            مؤهلات الدراسات العليا
            <textarea
              value={form.postgraduate_qualifications}
              onChange={handleChange("postgraduate_qualifications")}
            />
          </label>

          <label className="admin-form--full">
            الإقامة والزمالة
            <textarea
              value={form.residency_fellowship}
              onChange={handleChange("residency_fellowship")}
            />
          </label>

          <label className="admin-form--full">
            الشهادات المهنية والتخصصية
            <textarea
              value={form.board_certifications}
              onChange={handleChange("board_certifications")}
            />
          </label>

          <label>
            اللغات
            <input
              value={form.languages}
              onChange={handleChange("languages")}
              placeholder="العربية، الإنجليزية"
            />
            <small>افصل بين اللغات بفاصلة.</small>
          </label>

          <label>
            المستشفى أو العيادة
            <input
              value={form.clinic_affiliation}
              onChange={handleChange("clinic_affiliation")}
            />
          </label>

          {/* Status */}
          <label>
            الحالة
            <select
              value={form.is_active ? "1" : "0"}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  is_active: e.target.value === "1",
                }))
              }
            >
              <option value="1">ظاهر في الموقع</option>

              <option value="0">مخفي</option>
            </select>
          </label>

          {/* =========================
              SCHEDULE
          ========================== */}
          <div className="admin-form--full">
            <ScheduleForm schedule={schedule} setSchedule={setSchedule} />
          </div>

          {/* Actions */}
          <div className="admin-actions">
            {form.id && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetForm}
                disabled={saving}
              >
                إلغاء
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || uploadingImage}
            >
              {uploadingImage
                ? "جارٍ رفع الصورة..."
                : saving
                  ? "جارٍ الحفظ..."
                  : form.id
                    ? "حفظ التعديلات"
                    : "إضافة الطبيب"}
            </button>
          </div>
        </form>
      </div>

      {/* =========================
          DOCTORS TABLE
      ========================== */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المسمى</th>
              <th>التصنيف</th>
              <th>التخصصات</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className="admin-empty-row">
                <td colSpan={5}>جارٍ التحميل...</td>
              </tr>
            ) : doctors.length === 0 ? (
              <tr className="admin-empty-row">
                <td colSpan={5}>لا يوجد أطباء بعد</td>
              </tr>
            ) : (
              doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>

                  <td>{doctor.title}</td>

                  <td>{doctor.role === "specialist" ? "أخصائي" : "طبيب"}</td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 5,
                      }}
                    >
                      {(doctor.specialties || []).map((specialty) => (
                        <span
                          key={specialty.id || specialty.name}
                          style={{
                            padding: "4px 9px",
                            borderRadius: 20,
                            background: "var(--sage-100)",
                            color: "var(--teal-700)",
                            fontSize: 12,
                          }}
                        >
                          {specialty.name || specialty}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`admin-badge ${
                        doctor.is_active
                          ? "admin-badge--active"
                          : "admin-badge--inactive"
                      }`}
                    >
                      {doctor.is_active ? "ظاهر" : "مخفي"}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleEdit(doctor)}
                      >
                        تعديل
                      </button>

                      <button
                        className="btn btn-ghost"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

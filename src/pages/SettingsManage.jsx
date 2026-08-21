// SettingsManage.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

const fields = [
  ["name", "اسم العيادة الكامل"],
  ["short_name", "الاسم المختصر"],
  ["tagline", "الشعار النصي"],
  ["phone", "الهاتف"],
  ["phone_display", "عرض الهاتف (اختياري)"],
  ["whatsapp", "رقم واتساب (بدون +)"],
  ["email", "البريد الإلكتروني"],
  ["address", "العنوان"],
  ["google_maps_url", "رابط خرائط Google (مشاركة)"],
  ["google_maps_embed_url", "رابط تضمين خرائط Google"],
  ["instagram_url", "انستغرام"],
  ["whatsapp_url", "رابط واتساب"],
  ["twitter_url", "X (تويتر)"],
  ["facebook_url", "فيسبوك"],
  ["tiktok_url", "تيك توك"],
  ["snapchat_url", "سناب شات"],
];

// البيانات الافتراضية الفارغة
const emptyForm = {
  name: "",
  short_name: "",
  tagline: "",
  description: "",
  phone: "",
  phone_display: "",
  whatsapp: "",
  email: "",
  address: "",
  google_maps_url: "",
  google_maps_embed_url: "",
  instagram_url: "",
  whatsapp_url: "",
  twitter_url: "",
  facebook_url: "",
  tiktok_url: "",
  snapchat_url: "",
};

export default function SettingsManage() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    setIsNew(false);
    
    try {
      console.log("📡 Fetching settings from /api/settings");
      const response = await api.get("/api/settings");
      console.log("✅ Settings data received:", response);
      
      const settingsData = Array.isArray(response) ? response[0] : response;
      
      if (settingsData && Object.keys(settingsData).length > 0) {
        setForm(settingsData);
        setIsNew(false);
      } else {
        console.log("ℹ️ No settings found, showing empty form");
        setForm(emptyForm);
        setIsNew(true);
        setError("");
      }
      
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
      
      if (err.response?.status === 404 || err.message.includes("not found")) {
        console.log("ℹ️ No settings found (404), showing empty form");
        setForm(emptyForm);
        setIsNew(true);
        setError("");
      } else {
        setError(`❌ فشل تحميل الإعدادات: ${err.message}`);
        setForm(emptyForm);
        setIsNew(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    
    try {
      // إزالة الحقول التي لا نريد إرسالها
      const { id, created_at, updated_at, ...payload } = form;
      
      console.log(`📤 ${isNew ? 'Creating' : 'Updating'} settings:`, payload);
      
      let response;
      if (isNew) {
        response = await api.post("/api/settings", payload);
      } else {
        response = await api.put("/api/settings", payload);
      }
      
      console.log("✅ Settings saved:", response);
      
      setSaved(true);
      setIsNew(false);
      
      const savedData = Array.isArray(response) ? response[0] : response;
      setForm(savedData || payload);
      
      setTimeout(() => {
        setSaved(false);
      }, 3000);
      
      await fetchSettings();
      
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      setError(`❌ فشل الحفظ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div>
        <div className="admin-page-head">
          <h1>إعدادات العيادة</h1>
        </div>
        <div className="admin-card" style={{ textAlign: "center", padding: "50px" }}>
          <p>⏳ جارٍ تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1>🏥 إعدادات العيادة</h1>
        <p style={{ color: "#666", fontSize: "14px" }}>
          {isNew 
            ? "📝 لم يتم العثور على بيانات. قم بإدخال معلومات العيادة الجديدة." 
            : "✏️ هذه البيانات تظهر في الموقع العام (الرئيسية، الفوتر، وغيرها)"
          }
        </p>
      </div>

      {/* رسائل الخطأ والنجاح */}
      {error && (
        <div className="admin-error" style={{ 
          background: "#fee", 
          color: "#c00", 
          padding: "10px", 
          borderRadius: "5px", 
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>⚠️ {error}</span>
          <button 
            onClick={fetchSettings} 
            style={{ 
              padding: "5px 15px", 
              cursor: "pointer",
              border: "1px solid #c00",
              borderRadius: "4px",
              background: "white",
              color: "#c00"
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      
      {saved && (
        <div className="admin-error" style={{ 
          background: "#d4edda", 
          color: "#155724", 
          padding: "10px", 
          borderRadius: "5px", 
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span>✅</span>
          <span>تم {isNew ? 'إضافة' : 'حفظ'} الإعدادات بنجاح! 🎉</span>
        </div>
      )}

      {/* نموذج الإعدادات */}
      <div className="admin-card">
        <form className="admin-form" onSubmit={handleSubmit}>
          {/* الحقول النصية */}
          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              {key === "name" || key === "short_name" ? <span style={{ color: "red" }}> *</span> : null}
              <input
                type="text"
                value={form?.[key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                dir={key.includes("url") || key.includes("phone") || key.includes("email") || key.includes("whatsapp") ? "ltr" : "rtl"}
                placeholder={`أدخل ${label}`}
                required={key === "name" || key === "short_name"}
              />
            </label>
          ))}
          
          {/* حقل الوصف (textarea) */}
          <label className="admin-form--full">
            الوصف
            <textarea
              rows="4"
              value={form?.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="أدخل وصف العيادة"
            />
          </label>
          
          {/* أزرار التحكم */}
          <div className="admin-actions" style={{ 
            display: "flex", 
            gap: "10px", 
            marginTop: "20px",
            justifyContent: "flex-start",
            flexWrap: "wrap"
          }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ 
                padding: "10px 30px",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                background: isNew ? "#28a745" : "#007bff",
                border: "none",
                borderRadius: "4px",
                color: "white"
              }}
            >
              {saving ? "⏳ جارٍ الحفظ..." : isNew ? "➕ إضافة العيادة" : "💾 حفظ الإعدادات"}
            </button>
            
            <button 
              type="button" 
              onClick={fetchSettings}
              className="btn btn-secondary"
              style={{ 
                padding: "10px 30px",
                cursor: "pointer",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px"
              }}
            >
              🔄 إعادة تحميل
            </button>

            {isNew && (
              <button 
                type="button" 
                onClick={() => {
                  if (window.confirm("هل أنت متأكد من مسح جميع الحقول؟")) {
                    setForm(emptyForm);
                  }
                }}
                style={{ 
                  padding: "10px 30px",
                  cursor: "pointer",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px"
                }}
              >
                🗑️ مسح الحقول
              </button>
            )}
          </div>

          {isNew && (
            <div style={{ 
              marginTop: "15px", 
              padding: "10px", 
              background: "#fff3cd", 
              border: "1px solid #ffc107",
              borderRadius: "4px",
              color: "#856404"
            }}>
              💡 <strong>تنبيه:</strong> الحقول التي تحمل علامة <span style={{ color: "red" }}>*</span> إجبارية (اسم العيادة والاسم المختصر).
            </div>
          )}
        </form>
      </div>

      {/* معاينة البيانات */}
{form &&
  Object.keys(form).some(
    (key) =>
      form[key] !== null &&
      form[key] !== undefined &&
      String(form[key]).trim() !== ""
  ) && (        <div className="admin-card" style={{ marginTop: "20px", background: "#f8f9fa" }}>
          <h3 style={{ marginBottom: "10px" }}>
            📋 معاينة البيانات {isNew ? "(جديدة)" : "(الحالية)"}
          </h3>
          <div style={{ 
            background: "white", 
            padding: "15px", 
            borderRadius: "5px",
            fontSize: "13px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: "400px",
            overflow: "auto"
          }}>
            {JSON.stringify({
              clinicInfo: {
                name: form?.name || "(غير محدد)",
                shortName: form?.short_name || "(غير محدد)",
                tagline: form?.tagline || "(غير محدد)",
                description: form?.description || "(غير محدد)",
                phone: form?.phone || "(غير محدد)",
                phoneDisplay: form?.phone_display || form?.phone || "(غير محدد)",
                whatsapp: form?.whatsapp || form?.phone?.replace(/\D/g, "") || "(غير محدد)",
                email: form?.email || "(غير محدد)",
                address: form?.address || "(غير محدد)",
                googleMapsUrl: form?.google_maps_url || "(غير محدد)",
                googleMapsEmbedUrl: form?.google_maps_embed_url || "(غير محدد)",
              },
              socialLinks: {
                instagram: form?.instagram_url || "(غير محدد)",
                whatsapp: form?.whatsapp_url || "(غير محدد)",
                twitter: form?.twitter_url || "(غير محدد)",
                facebook: form?.facebook_url || "(غير محدد)",
                tiktok: form?.tiktok_url || "(غير محدد)",
                snapchat: form?.snapchat_url || "(غير محدد)",
              }
            }, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
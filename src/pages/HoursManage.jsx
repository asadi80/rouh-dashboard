import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const DAYS_ORDER = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

/* =========================================================
   TIME OPTIONS
========================================================= */

const TIME_OPTIONS = [];

for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const value = `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;

    TIME_OPTIONS.push(value);
  }
}

/* =========================================================
   TIME HELPERS
========================================================= */

function formatArabicTime(time) {
  if (!time) return "";

  const [hourString, minuteString = "00"] = String(time).split(":");

  let hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const period = hour >= 12 ? "م" : "ص";

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function parseTime(time) {
  if (!time) return "";

  const value = String(time).trim();

  /*
   * Supports:
   * 09:00
   * 9:00
   * 09:00 ص
   * 9:00 م
   */

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return "";

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return "";
  }

  return `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`;
}

function parseHoursText(text) {
  if (!text) {
    return {
      start: "",
      end: "",
    };
  }

  const parts = String(text)
    .split(/\s*[-–—]\s*/)
    .map((part) => part.trim());

  if (parts.length < 2) {
    return {
      start: parseTime(parts[0]),
      end: "",
    };
  }

  return {
    start: parseTime(parts[0]),
    end: parseTime(parts[1]),
  };
}

function buildHoursText(start, end) {
  if (!start || !end) return "";

  return `${formatArabicTime(start)} - ${formatArabicTime(end)}`;
}

/* =========================================================
   CREATE EMPTY DAYS
========================================================= */

function createEmptyRows() {
  return DAYS_ORDER.map((day) => ({
    id: null,
    day_of_week: day,
    hours_text: "",
    is_open: true, // All days are open
    _startTime: "",
    _endTime: "",
  }));
}

/* =========================================================
   NORMALIZE API ROW
========================================================= */

function normalizeRow(row) {
  const parsed = parseHoursText(row.hours_text);

  return {
    ...row,

    _startTime: parsed.start,
    _endTime: parsed.end,

    is_open: Boolean(row.is_open),
  };
}

/* =========================================================
   TIME SELECT
========================================================= */

function TimeSelect({ value, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 160,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--muted)",
        }}
      >
        {label}
      </span>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "11px 12px",
          borderRadius: 10,
          border: "1.5px solid var(--line)",
          background: "#fff",
          fontFamily: "inherit",
          fontSize: 14,
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        <option value="">اختر الوقت</option>

        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {formatArabicTime(time)}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================================================
   DAY ROW
========================================================= */

function DayRow({ row, onChange }) {
  const parsed = useMemo(
    () => parseHoursText(row.hours_text),
    [row.hours_text]
  );

  const startTime =
    row._startTime !== undefined
      ? row._startTime
      : parsed.start;

  const endTime =
    row._endTime !== undefined
      ? row._endTime
      : parsed.end;

  const isOpen = Boolean(row.is_open);

  /* -------------------------------------------------------
     UPDATE
  ------------------------------------------------------- */

  const update = (field, value) => {
    onChange(row.id, row.day_of_week, field, value);
  };

  /* -------------------------------------------------------
     START TIME
  ------------------------------------------------------- */

  const updateStart = (value) => {
    update("_startTime", value);

    if (value && endTime) {
      update(
        "hours_text",
        buildHoursText(value, endTime)
      );
    } else {
      update("hours_text", "");
    }
  };

  /* -------------------------------------------------------
     END TIME
  ------------------------------------------------------- */

  const updateEnd = (value) => {
    update("_endTime", value);

    if (startTime && value) {
      update(
        "hours_text",
        buildHoursText(startTime, value)
      );
    } else {
      update("hours_text", "");
    }
  };

  /* -------------------------------------------------------
     OPEN / CLOSED
  ------------------------------------------------------- */

  const toggleOpen = () => {
    const newValue = !isOpen;

    update("is_open", newValue);

    /*
     * If closing the day, remove the times.
     */
    if (!newValue) {
      update("_startTime", "");
      update("_endTime", "");
      update("hours_text", "");
    }
  };

  return (
    <tr>
      {/* ================= DAY ================= */}

      <td
        style={{
          fontWeight: 700,
          whiteSpace: "nowrap",
          verticalAlign: "top",
          paddingTop: 20,
        }}
      >
        {row.day_of_week}
      </td>

      {/* ================= HOURS ================= */}

      <td
        style={{
          verticalAlign: "top",
        }}
      >
        {!isOpen ? (
          <div
            style={{
              color: "var(--muted)",
              padding: "10px 0",
              fontWeight: 600,
            }}
          >
            مغلق طوال اليوم
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <TimeSelect
              label="من"
              value={startTime}
              onChange={updateStart}
            />

            <span
              style={{
                paddingBottom: 12,
                fontWeight: 700,
                color: "var(--muted)",
              }}
            >
              إلى
            </span>

            <TimeSelect
              label="إلى"
              value={endTime}
              onChange={updateEnd}
            />
          </div>
        )}

        {/* Preview */}

        {isOpen && startTime && endTime && (
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            سيظهر للزوار:

            <strong
              style={{
                marginRight: 6,
                color: "var(--primary)",
              }}
            >
              {formatArabicTime(startTime)} -{" "}
              {formatArabicTime(endTime)}
            </strong>
          </div>
        )}

        {/* Missing time warning */}

        {isOpen && (!startTime || !endTime) && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#b7791f",
              fontWeight: 600,
            }}
          >
            ⚠ اختر وقت الفتح والإغلاق
          </div>
        )}
      </td>

      {/* ================= STATUS ================= */}

      <td
        style={{
          verticalAlign: "top",
          paddingTop: 16,
        }}
      >
        <button
          type="button"
          onClick={toggleOpen}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
            background: isOpen
              ? "#e8f7ef"
              : "#f3f4f6",
            color: isOpen
              ? "#16794a"
              : "#6b7280",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isOpen
                ? "#22a06b"
                : "#9ca3af",
              marginLeft: 7,
            }}
          />

          {isOpen ? "مفتوح" : "مغلق"}
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HoursManage() {
  const [rows, setRows] = useState([]);

  const [originalRows, setOriginalRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  const load = async () => {
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const data = await api.get(
        "/api/working-hours"
      );

      /*
       * Make sure API response is an array.
       */

      const apiRows = Array.isArray(data)
        ? data
        : [];

      /*
       * IMPORTANT:
       *
       * If the database is empty, create the
       * seven days locally so the admin can
       * immediately enter the times.
       */

      let finalRows;

      if (apiRows.length === 0) {
        finalRows = createEmptyRows();
      } else {
        /*
         * API already has records.
         *
         * Normalize them so _startTime and
         * _endTime are available.
         */

        finalRows = apiRows.map(normalizeRow);

        /*
         * Make sure all seven days exist.
         *
         * This handles the case where the database
         * contains only some days.
         */

        finalRows = DAYS_ORDER.map(
          (day, index) => {
            const existing = finalRows.find(
              (row) =>
                row.day_of_week === day
            );

            if (existing) {
              return existing;
            }

            return {
              id: null,
              day_of_week: day,
              hours_text: "",
              is_open: index !== 6,
              _startTime: "",
              _endTime: "",
            };
          }
        );
      }

      /*
       * Sort according to Arabic week order.
       */

      finalRows.sort(
        (a, b) =>
          DAYS_ORDER.indexOf(a.day_of_week) -
          DAYS_ORDER.indexOf(b.day_of_week)
      );

      setRows(finalRows);

      setOriginalRows(
        JSON.parse(
          JSON.stringify(finalRows)
        )
      );
    } catch (err) {
      console.error(
        "Working hours load error:",
        err
      );

      setError(
        err?.message ||
          "حدث خطأ أثناء تحميل أوقات العمل"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    load();
  }, []);

  /* =======================================================
     UPDATE ROW
  ======================================================= */

  const updateRow = (
    id,
    dayOfWeek,
    field,
    value
  ) => {
    setSaved(false);

    setRows((currentRows) =>
      currentRows.map((row) => {
        /*
         * Existing database row
         */

        if (
          id !== null &&
          id !== undefined &&
          row.id === id
        ) {
          return {
            ...row,
            [field]: value,
          };
        }

        /*
         * New local row.
         *
         * Since it has no database ID,
         * identify it by day_of_week.
         */

        if (
          (id === null ||
            id === undefined) &&
          row.day_of_week === dayOfWeek
        ) {
          return {
            ...row,
            [field]: value,
          };
        }

        return row;
      })
    );
  };

  /* =======================================================
     CHECK CHANGES
  ======================================================= */

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(rows) !==
      JSON.stringify(originalRows)
    );
  }, [rows, originalRows]);

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateRows = () => {
    for (const row of rows) {
      /*
       * Closed day doesn't need times.
       */

      if (!row.is_open) {
        continue;
      }

      /*
       * Open day MUST have both times.
       */

      if (
        !row._startTime ||
        !row._endTime
      ) {
        return `يرجى اختيار وقت الفتح والإغلاق ليوم ${row.day_of_week}`;
      }

      /*
       * Make sure end is after start.
       */

      if (
        row._startTime >=
        row._endTime
      ) {
        return `وقت الإغلاق يجب أن يكون بعد وقت الفتح ليوم ${row.day_of_week}`;
      }
    }

    return "";
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSaveAll = async () => {
    if (!hasChanges) {
      return;
    }

    /*
     * Validate first.
     */

    const validationError =
      validateRows();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      /*
       * Remove frontend-only fields.
       *
       * IMPORTANT:
       * id is null for newly-created rows.
       */

      const payloadRows = rows.map(
        (row) => ({
          ...(row.id
            ? { id: row.id }
            : {}),

          day_of_week:
            row.day_of_week,

          hours_text:
            row.is_open
              ? buildHoursText(
                  row._startTime,
                  row._endTime
                )
              : "",

          is_open:
            Boolean(row.is_open),
        })
      );

      console.log(
        "Saving working hours:",
        payloadRows
      );

      /*
       * Send to backend.
       */

      const updated = await api.put(
        "/api/working-hours",
        {
          rows: payloadRows,
        }
      );

      /*
       * Backend should return the saved rows.
       */

      const updatedRows =
        Array.isArray(updated)
          ? updated.map(normalizeRow)
          : payloadRows.map((row) => ({
              ...row,
              _startTime:
                row.is_open
                  ? parseHoursText(
                      row.hours_text
                    ).start
                  : "",
              _endTime:
                row.is_open
                  ? parseHoursText(
                      row.hours_text
                    ).end
                  : "",
            }));

      /*
       * Sort days.
       */

      const sorted = [
        ...updatedRows,
      ].sort(
        (a, b) =>
          DAYS_ORDER.indexOf(
            a.day_of_week
          ) -
          DAYS_ORDER.indexOf(
            b.day_of_week
          )
      );

      setRows(sorted);

      setOriginalRows(
        JSON.parse(
          JSON.stringify(sorted)
        )
      );

      setSaved(true);
    } catch (err) {
      console.error(
        "Working hours save error:",
        err
      );

      setError(
        err?.message ||
          "حدث خطأ أثناء حفظ أوقات العمل"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    if (!hasChanges) {
      return;
    }

    setRows(
      JSON.parse(
        JSON.stringify(
          originalRows
        )
      )
    );

    setSaved(false);
    setError("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div dir="rtl">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="admin-page-head"
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>أوقات العمل</h1>

          <p
            style={{
              margin:
                "6px 0 0",
              color:
                "var(--muted)",
              fontSize: 14,
            }}
          >
            حدد أوقات فتح وإغلاق
            العيادة لكل يوم.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems:
              "center",
          }}
        >
          {hasChanges && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={
                handleReset
              }
              disabled={saving}
            >
              تجاهل التغييرات
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={
              handleSaveAll
            }
            disabled={
              saving ||
              loading ||
              !hasChanges
            }
          >
            {saving
              ? "جارٍ الحفظ..."
              : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* ===================================================
          SUCCESS
      =================================================== */}

      {saved && (
        <div
          style={{
            background:
              "#e8f7ef",
            color:
              "#16794a",
            borderRadius: 10,
            padding:
              "11px 14px",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          ✓ تم حفظ أوقات العمل
          بنجاح
        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="admin-error"
          style={{
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="admin-card">
        <div
          style={{
            padding:
              "16px 18px",
            borderBottom:
              "1px solid var(--line)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
            }}
          >
            جدول أوقات العيادة
          </h3>

          <p
            style={{
              margin:
                "5px 0 0",
              color:
                "var(--muted)",
              fontSize: 13,
            }}
          >
            اختر وقت الفتح والإغلاق
            لكل يوم. إذا لم تكن هناك
            بيانات، ستظهر الأيام تلقائيًا
            لإدخالها.
          </p>
        </div>

        <div
          style={{
            overflowX:
              "auto",
          }}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>اليوم</th>
                <th>الأوقات</th>
                <th>الحالة</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="admin-empty-row">
                  <td colSpan={3}>
                    جارٍ تحميل أوقات العمل...
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <DayRow
                    key={
                      row.id ??
                      row.day_of_week
                    }
                    row={row}
                    onChange={
                      updateRow
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          HELP
      =================================================== */}

      <div
        style={{
          marginTop: 14,
          padding:
            "14px 16px",
          borderRadius: 10,
          background:
            "var(--surface, #f8faf9)",
          border:
            "1px solid var(--line)",
          color:
            "var(--muted)",
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <strong
          style={{
            color:
              "var(--text)",
          }}
        >
          💡 ملاحظة:
        </strong>{" "}
        إذا كانت العيادة مغلقة في يوم
        معين، اضغط على حالة{" "}
        <strong>مفتوح</strong>{" "}
        لتحويلها إلى{" "}
        <strong>مغلق</strong>.
      </div>
    </div>
  );
}
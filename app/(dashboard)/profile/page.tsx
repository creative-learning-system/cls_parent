"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { User, Mail, Phone, Edit2, Check, X, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProfile, updateProfile, type ParentProfile } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="surface-card p-6 flex items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="surface-card p-5 flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-48" />
        </div>
      ))}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  editable,
  editing,
  saving,
  editValue,
  onEdit,
  onCancel,
  onSave,
  onChange,
  inputType,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  editable: boolean;
  editing: boolean;
  saving: boolean;
  editValue: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (v: string) => void;
  inputType?: string;
}) {
  return (
    <motion.div variants={fadeUp} className="surface-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)]/10">
          <Icon className="h-4 w-4 text-[oklch(0.55_0.14_168)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type={inputType ?? "text"}
                value={editValue}
                onChange={e => onChange(e.target.value)}
                autoFocus
                className="flex-1 rounded-xl border border-[oklch(0.65_0.15_168)]/50 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[oklch(0.65_0.15_168)] focus:ring-1 focus:ring-[oklch(0.65_0.15_168)]/30 transition"
              />
              <button
                onClick={onSave}
                disabled={saving || !editValue.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.65_0.15_168)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">{value || "—"}</p>
              {editable && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile]     = useState<ParentProfile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [retry, setRetry]         = useState(0);

  const [editingField, setEditingField] = useState<"full_name" | "phone_number" | null>(null);
  const [editValue, setEditValue]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [savedMsg, setSavedMsg]         = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getProfile()
      .then(d  => { if (!cancelled) setProfile(d); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retry]);

  function startEdit(field: "full_name" | "phone_number") {
    setEditingField(field);
    setEditValue(field === "full_name" ? (profile?.full_name ?? "") : (profile?.phone_number ?? ""));
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue("");
  }

  async function saveEdit() {
    if (!editingField || !editValue.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ [editingField]: editValue.trim() });
      setProfile(updated);
      setSavedMsg(editingField === "full_name" ? "Name updated." : "Phone number updated.");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {
      /* silently fail — user can retry */
    }
    setSaving(false);
    setEditingField(null);
  }

  const initials = profile?.full_name
    ? profile.full_name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-28 pb-14 md:px-8">

      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

        {/* Page heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
        </motion.div>

        {loading ? (
          <ProfileSkeleton />
        ) : error || !profile ? (
          <div className="surface-card flex flex-col items-center gap-4 py-14 text-center">
            <User className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Could not load your profile.</p>
            <button
              onClick={() => setRetry(r => r + 1)}
              className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Try again
            </button>
          </div>
        ) : (
          <>
            {/* Avatar + name banner */}
            <motion.div variants={fadeUp} className="surface-card flex items-center gap-5 p-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full gradient-brand text-xl font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {profile.full_name}
                </p>
                <p className="text-sm text-muted-foreground">Parent Account</p>
              </div>
            </motion.div>

            {savedMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-xl border border-[oklch(0.68_0.17_145)]/30 bg-[oklch(0.93_0.06_145)]/30 px-4 py-3"
              >
                <Check className="h-4 w-4 text-[oklch(0.50_0.14_145)]" />
                <p className="text-sm font-medium text-[oklch(0.40_0.14_145)]">{savedMsg}</p>
              </motion.div>
            )}

            <Field
              icon={User}
              label="Full Name"
              value={profile.full_name}
              editable={true}
              editing={editingField === "full_name"}
              saving={saving}
              editValue={editValue}
              onEdit={() => startEdit("full_name")}
              onCancel={cancelEdit}
              onSave={saveEdit}
              onChange={setEditValue}
            />

            <Field
              icon={Mail}
              label="Email Address"
              value={profile.email}
              editable={false}
              editing={false}
              saving={false}
              editValue=""
              onEdit={() => {}}
              onCancel={() => {}}
              onSave={() => {}}
              onChange={() => {}}
              inputType="email"
            />

            <Field
              icon={Phone}
              label="Phone Number"
              value={profile.phone_number}
              editable={true}
              editing={editingField === "phone_number"}
              saving={saving}
              editValue={editValue}
              onEdit={() => startEdit("phone_number")}
              onCancel={cancelEdit}
              onSave={saveEdit}
              onChange={setEditValue}
              inputType="tel"
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

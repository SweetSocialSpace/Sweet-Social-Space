<input type="file" accept="video/*" capture="user" onChange={async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  setIsUploading(true);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("zip", zipCode || "GLOBAL");
  fd.append("type", "golive");
  if(userId) fd.append("userId", userId);
  await fetch("/api/upload", {method:"POST", body:fd});
  location.reload();
}} className="mt-3 text-xs text-white/60" />

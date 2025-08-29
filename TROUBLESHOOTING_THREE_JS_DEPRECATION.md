# 🚨 THREE.JS DEPRECATION WARNINGS - TROUBLESHOOTING GUIDE (29.08.2025)

## Problem: Three.js Deprecation Warnings

### **Fehlermeldung:**
```
Scripts "build/three.js" and "build/three.min.js" are deprecated with r150+, 
and will be removed with r160. Please use ES Modules or alternatives.

THREE.Material: 'emissive' is not a property of THREE.MeshBasicMaterial.
```

### **Root Cause Analysis:**
1. **Three.js Version Problem**: Version 0.158.0 zeigt bereits Deprecation Warnings
2. **Material Property Error**: MeshBasicMaterial unterstützt keine 'emissive' Property
3. **Legacy CDN Usage**: Veraltete build/three.min.js Struktur

## ✅ LÖSUNG IMPLEMENTIERT:

### **1. Three.js Version Downgrade**
```html
<!-- VORHER (Problem): -->
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>

<!-- NACHHER (Lösung): -->
<script src="https://unpkg.com/three@0.149.0/build/three.min.js"></script>
```

### **2. Material Fix**
```javascript
// VORHER (Fehler):
const stripeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00FF00,
    emissive: 0x00FF00  // ❌ MeshBasicMaterial hat keine emissive property
});

// NACHHER (Fix):
const stripeMaterial = new THREE.MeshLambertMaterial({
    color: 0x00FF00,
    emissive: 0x004400  // ✅ MeshLambertMaterial unterstützt emissive
});
```

### **3. Version Recovery Process**
1. **Commit gefunden**: `2472a7e` vom 15. August 2025 - "🎮 Version 4.1-3ROUNDS"
2. **Rollback durchgeführt**: `git checkout 2472a7e -- SubwayRunner/index.html`
3. **Fixes angewendet**: Three.js Downgrade + Material Fix
4. **Version aktualisiert**: V4.1-3ROUNDS-FIXED

## 🔍 DIAGNOSE WORKFLOW:

### **Problem Identifikation:**
```bash
# 1. Git-Historie durchsuchen nach funktionierenden Versionen
git log --oneline -n 20

# 2. Erfolgreiche Commits vom 15-18. August finden
git log --oneline --since="2025-08-15" --until="2025-08-19"

# 3. Commit Details anzeigen
git show --stat [COMMIT_HASH]
```

### **Three.js Kompatibilität checken:**
- **r149**: ✅ Stabil, keine Deprecation Warnings
- **r150+**: ⚠️ Deprecation Warnings für build/three.min.js
- **r160+**: ❌ build/three.min.js wird komplett entfernt

### **Material Properties Übersicht:**
- **MeshBasicMaterial**: color, transparent, opacity (KEINE emissive)
- **MeshLambertMaterial**: color, emissive, emissiveIntensity ✅
- **MeshPhongMaterial**: color, emissive, shininess, specular ✅

## 📋 PREVENTION CHECKLIST:

### **Vor Three.js Updates:**
- [ ] Version < r150 verwenden um Deprecation Warnings zu vermeiden
- [ ] Material Properties Kompatibilität prüfen
- [ ] Lokale Tests vor Deployment
- [ ] Backup der letzten funktionierenden Version

### **Bei Material Errors:**
- [ ] MeshBasicMaterial → MeshLambertMaterial für emissive Properties
- [ ] Console Errors auf Material-Property Konflikte prüfen
- [ ] Beleuchtung für Shading Materials (Lambert/Phong) sicherstellen

## 🎯 LESSONS LEARNED:

1. **Version Pinning**: Nicht automatisch neueste Three.js Version verwenden
2. **Material Selection**: MeshBasicMaterial nur für einfache Farben ohne Lighting
3. **Rollback Strategy**: Funktionierende Commits klar dokumentieren und merken
4. **Testing Priority**: Local Testing vor Production Deployment

## 🚀 SUCCESS METRICS:

- ✅ Keine Console Errors
- ✅ Spiel startet ohne Warnings
- ✅ 3 Durchgänge funktionieren
- ✅ Multi-Jump System aktiv
- ✅ Alle Materialien rendern korrekt

**STATUS**: 🟢 RESOLVED - V4.1-3ROUNDS-FIXED ready for deployment

let dnaMain = JSON.parse(localStorage.getItem("dna_main") || "[]");
let dnaAion = JSON.parse(localStorage.getItem("dna_aion") || "[]");
let trueResults = JSON.parse(localStorage.getItem("true_results") || []);

function updateDNA() {
  document.getElementById("dna-main").textContent = dnaMain.join(" / ");
  document.getElementById("dna-aion").textContent = dnaAion.join(" / ");
}

function getLeastFrequentPosition(arr) {
  let count = { p: 0, b: 0 };
  arr.forEach(c => { if (c === 'p' || c === 'b') count[c]++; });
  let minChar = count.p < count.b ? 'p' : (count.b < count.p ? 'b' : null);
  if (!minChar) return null;
  return arr.indexOf(minChar);
}

function isUniform(arr) {
  return arr.every(c => c === arr[0]);
}

function analyzePattern() {
  const pattern = document.getElementById("pattern").value.trim().toLowerCase();
  if (pattern.length !== 6) return alert("❗ ต้องใส่เค้าไพ่ 6 ตัว");

  const main = pattern.slice(0,3).split('');
  const sub = pattern.slice(3,6).split('');

  if (isUniform(main)) {
    if (isUniform(sub)) return alert("❌ เค้าไพ่และเค้ารองเหมือนกันหมด → ข้าม");
    else {
      let pos = getLeastFrequentPosition(sub);
      if (pos === null) return alert("❌ หาตำแหน่งตัวน้อยสุดไม่ได้");
      const mainVal = main[pos], subVal = sub[pos];
      const prediction = mainVal === subVal ? 'P' : 'B';
      alert(`🧠 สูตรหลักทำนาย (ยึดเค้ารอง): ${prediction === 'P' ? '🔵 P' : '🔴 B'}`);
      return prediction;
    }
  } else {
    let pos = getLeastFrequentPosition(main);
    if (pos === null) return alert("❌ หาตำแหน่งตัวน้อยสุดไม่ได้");
    const mainVal = main[pos], subVal = sub[pos];
    const prediction = mainVal === subVal ? 'P' : 'B';
    alert(`🧠 สูตรหลักทำนาย: ${prediction === 'P' ? '🔵 P' : '🔴 B'}`);
    return prediction;
  }
}

function submitResult(val) {
  if (val === 'T') {
    alert("⏭ เสมอ - ข้ามตานี้");
    document.getElementById("pattern").value = '';
    return;
  }
  const pattern = document.getElementById("pattern").value.trim().toLowerCase();
  if (pattern.length !== 6) return alert("❗ ต้องใส่เค้าไพ่ 6 ตัวก่อน");

  const main = pattern.slice(0,3).split('');
  const sub = pattern.slice(3,6).split('');

  let prediction = null;

  if (isUniform(main)) {
    if (isUniform(sub)) {
      document.getElementById("pattern").value = '';
      return;
    }
    let pos = getLeastFrequentPosition(sub);
    if (pos !== null) {
      prediction = main[pos] === sub[pos] ? 'P' : 'B';
    }
  } else {
    let pos = getLeastFrequentPosition(main);
    if (pos !== null) {
      prediction = main[pos] === sub[pos] ? 'P' : 'B';
    }
  }

  if (!prediction) {
    alert("⛔ ไม่มีการทำนายในรอบนี้");
    document.getElementById("pattern").value = '';
    return;
  }

  dnaMain.push(prediction === val ? "⚪️" : "🔴");
  trueResults.push(val);

  localStorage.setItem("dna_main", JSON.stringify(dnaMain));
  localStorage.setItem("true_results", JSON.stringify(trueResults));
  updateDNA();
  analyzeAion();

  document.getElementById("pattern").value = '';
}


function analyzeAion() {
  const recent = trueResults.slice(-20); // long memory
  if (recent.length < 5) {
    document.getElementById("aion-prediction").textContent = "(ยังไม่ครบ 5 ตา)";
    return;
  }

  const last5 = recent.slice(-5);
  let count = { P: 0, B: 0 };
  last5.forEach(r => { if (r === 'P') count.P++; if (r === 'B') count.B++; });

  // Detect long streaks (mild mgt detection)
  let streak = 1;
  for (let i = recent.length - 1; i > 0; i--) {
    if (recent[i] === recent[i - 1]) streak++;
    else break;
  }

  // Pattern Classification
  const patternName = (() => {
    const seq = recent.join("");
    if (/PBPBPB|BPBPBP/.test(seq.slice(-6))) return "ลูกคู่";
    if (/(.)\1{3,}/.test(seq)) return "มังกร";
    if (/PPBB|BBPP/.test(seq.slice(-4))) return "สองสองตัด";
    if (seq.endsWith("PPB") || seq.endsWith("BBP")) return "ชายโครง";
    return "ไม่ชัดเจน";
  })();

  // Power Scoring
  const power = {
    P: recent.filter(x => x === "P").length,
    B: recent.filter(x => x === "B").length,
  };
  const dominant = power.P > power.B ? "🔵 P" : power.B > power.P ? "🔴 B" : ["🔵 P", "🔴 B"][Math.floor(Math.random() * 2)];
  const diff = Math.abs(power.P - power.B);
  let confidence = 65 + diff * 2;

  // Generate explanation
  let trend = "";
  let style = "";
  if (streak >= 4) {
    trend = `ฝั่ง ${recent[recent.length - 1]} ชนะติดกัน ${streak} ตา`;
    style = "มังกรยาวในห้องนี้ยังไม่หลุด มีแรงลาก";
    confidence += 5;
  } else {
    trend = `แนวโน้มช่วงหลัง ${dominant.includes("P") ? "น้ำเงิน" : "แดง"} ดูเด่น`;
    style = `พบเค้าไพ่: ${patternName}`;
  }

  const msg = `🧠 ทำนาย: ${dominant}\n🎯 เหตุผล: ${trend} → ${style}\n⚠️ ความมั่นใจ: ${confidence > 85 ? 85 : confidence}%`;
  document.getElementById("aion-prediction").textContent = msg;
  dnaAion.push(dominant.includes("P") ? "⚪️" : "🔴");
  localStorage.setItem("dna_aion", JSON.stringify(dnaAion));
  updateDNA();
}

  const recent = trueResults.slice(-5);
  if (recent.length < 5) {
    document.getElementById("aion-prediction").textContent = "(ยังไม่ครบ 5 ตา)";
    return;
  }

  const apiKey = "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";

  document.getElementById("aion-prediction").textContent = "🧠 กำลังวิเคราะห์...";

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "คุณคือเซียนบาคาร่า วิเคราะห์เค้าไพ่แบบ AION Style" },
        { role: "user", content: "ผลจริงย้อนหลัง 5 ตา: " + recent.join(", ") + ". ช่วยวิเคราะห์แนวโน้มว่าฝั่งไหนจะมา พร้อมเหตุผล และความมั่นใจเป็น % ด้วย" }
      ]
    })
  }).then(r => r.json()).then(data => {
    const msg = data.choices?.[0]?.message?.content || "ไม่ได้ผลลัพธ์จาก AI";
    document.getElementById("aion-prediction").textContent = msg;
    dnaAion.push(msg.includes("P") ? "⚪️" : "🔴");
    localStorage.setItem("dna_aion", JSON.stringify(dnaAion));
    updateDNA();
  }).catch(err => {
    document.getElementById("aion-prediction").textContent = "❌ GPT ไม่ตอบกลับ: " + err.message;
  });
}

function clearDNA() {
  localStorage.removeItem("dna_main");
  localStorage.removeItem("dna_aion");
  localStorage.removeItem("true_results");
  dnaMain = []; dnaAion = []; trueResults = [];
  updateDNA();
}

updateDNA();

import { useState, useRef } from "react";

const STYLE_NAMES = {
  A: "暖色行动感（橙红主调，大促/效果营销）",
  B: "欧美Bold（深色撞色，品牌提案）",
  C: "科技感（深蓝青蓝，数字营销）",
  D: "品牌色定制（输入HEX自动适配）",
  E: "专业咨询感（白底麦肯锡风，战略汇报）",
};

const STYLE_COLORS = {
  A: "#FF5722",
  B: "#1A1A2E",
  C: "#00B4D8",
  D: "#cccccc",
  E: "#003366",
};

const STEPS = ["0 智能导入", "A 品牌项目", "B 视觉风格", "C 场景平台", "D 行业竞品", "E 目标预算", "F 大纲结构", "G 隐性背景", "生成指令"];

const SCENES = ["品牌广告（认知/形象）","效果广告（转化/ROI）","社交媒体种草（KOL/KOC/UGC）","搜索营销（SEM/平台搜索拦截）","信息流广告","直播营销","私域运营","电商平台运营","内容营销（官方账号运营）"];

const INDUSTRIES = ["美妆个护","快消食品","3C数码","新能源汽车","服装","金融/保险","医疗健康","母婴","宠物","教育","其他"];

const STAGES = ["新品牌冷启动","成熟品牌维护","品类教育期","大促节点冲刺","品牌年度规划"];

const PPT_TYPES = ["年度营销提案","媒介投放方案","竞品分析报告","大促节点策略","品牌策略提案","项目复盘报告","晋升述职","客户年终汇报"];

export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [briefText, setBriefText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("A");
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [compDepth, setCompDepth] = useState("浅度");
  const [form, setForm] = useState({
    pptType: "年度营销提案", audience: "", brandCn: "", brandEn: "",
    group: "", period: "", goal: "", pages: "",
    color1: "", color1Name: "", color2: "", color2Name: "",
    colorBan: "", toneBan: "",
    platformMain: "", platformSub: "", contentType: "",
    industry: "美妆个护", stage: "新品牌冷启动",
    competitors: "", problem: "", kpi: "", budget: "", budgetNote: "",
    outline: "", decision: "", contact: "", conflict: "",
    history: "", concerns: "", stylePref: "", otherBg: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleScene = (scene) => {
    setSelectedScenes(prev =>
      prev.includes(scene) ? prev.filter(s => s !== scene) : [...prev, scene]
    );
  };

  const runImport = async () => {
    if (!briefText.trim()) { alert("请先粘贴 brief 文字内容"); return; }
    setLoading(true);
    setLoadingText("AI 正在解析，提取关键信息...");
    setImportSuccess(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `你是一位营销策略专家。请从以下客户 brief 或项目背景文字中，提取关键信息并以 JSON 格式返回。只返回 JSON，不要任何解释或 markdown 代码块。

需要提取的字段：
- ppt_type: PPT类型（从以下选择：年度营销提案/媒介投放方案/竞品分析报告/大促节点策略/品牌策略提案/项目复盘报告/晋升述职/客户年终汇报）
- audience: 目标受众
- brand_cn: 品牌中文名
- brand_en: 品牌英文名
- group: 所属集团
- period: 项目周期
- goal: 核心目标
- industry: 所属行业（从以下选择：美妆个护/快消食品/3C数码/新能源汽车/服装/金融保险/医疗健康/母婴/宠物/教育/其他）
- stage: 品牌阶段（从以下选择：新品牌冷启动/成熟品牌维护/品类教育期/大促节点冲刺/品牌年度规划）
- competitors: 竞品列表（字符串，每行一个，格式：品牌名 —— 关注维度）
- problem: 核心要解决的问题
- kpi: 成功衡量标准
- budget: 预算范围
- platform_main: 主平台
- platform_sub: 辅助平台

提取不到的字段留空字符串。

文字内容：
${briefText}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setForm(f => ({
        ...f,
        pptType: parsed.ppt_type || f.pptType,
        audience: parsed.audience || f.audience,
        brandCn: parsed.brand_cn || f.brandCn,
        brandEn: parsed.brand_en || f.brandEn,
        group: parsed.group || f.group,
        period: parsed.period || f.period,
        goal: parsed.goal || f.goal,
        industry: parsed.industry || f.industry,
        stage: parsed.stage || f.stage,
        competitors: parsed.competitors || f.competitors,
        problem: parsed.problem || f.problem,
        kpi: parsed.kpi || f.kpi,
        budget: parsed.budget || f.budget,
        platformMain: parsed.platform_main || f.platformMain,
        platformSub: parsed.platform_sub || f.platformSub,
      }));

      const filled = Object.values(parsed).filter(v => v && v.toString().trim()).length;
      setLoadingText(`✅ 解析完成，已预填 ${filled} 个字段`);
      setImportSuccess(true);
      setTimeout(() => setStep(1), 1500);
    } catch (err) {
      setLoading(false);
      alert("解析失败，请检查网络或手动填写。错误：" + err.message);
      return;
    }
    setLoading(false);
  };

  const generatePrompt = () => {
    const styleColorMap = { A: "主色 #FF5722（橙红）+ 辅色 #FFC107（金黄）+ 底色 #FFFFFF", B: "主色 #1A1A2E（深蓝黑）+ 辅色 #E94560（玫红）+ 深色底 #0F3460", C: "主色 #0D1B2A（深蓝）+ 辅色 #00B4D8（青蓝）+ 深色底 #03045E", E: "主色 #003366（深蓝）+ 辅色 #CC0000（红）+ 底色 #FFFFFF" };
    let colorSection = `视觉风格：${selectedStyle} · ${STYLE_NAMES[selectedStyle]}\n`;
    if (selectedStyle === "D") {
      if (form.color1) colorSection += `品牌主色：${form.color1}${form.color1Name ? " — " + form.color1Name : ""}\n`;
      if (form.color2) colorSection += `品牌辅助色：${form.color2}${form.color2Name ? " — " + form.color2Name : ""}\n`;
    } else {
      colorSection += `配色方案：${styleColorMap[selectedStyle] || ""}\n`;
      if (form.color1) colorSection += `品牌主色参考：${form.color1}${form.color1Name ? " — " + form.color1Name : ""}\n`;
    }
    if (form.colorBan) colorSection += `禁用色：${form.colorBan}\n`;
    if (form.toneBan) colorSection += `调性禁忌：${form.toneBan}\n`;

    const hidden = [
      form.decision && `拍板人：${form.decision}`,
      form.contact && `对接人：${form.contact}`,
      form.conflict && `内部分歧：\n${form.conflict}`,
      form.history && `历史背景：\n${form.history}`,
      form.concerns && `潜在顾虑：\n${form.concerns}`,
      form.stylePref && `客户偏好：\n${form.stylePref}`,
      form.otherBg && `其他情况：\n${form.otherBg}`,
    ].filter(Boolean);

    return `# 角色设定
你是一位拥有15年经验的资深营销策略顾问，同时精通商业PPT设计。你深度理解4A提案逻辑、SCQ结构化表达框架，以及中国数字营销生态。你的提案风格：先结论后支撑、数据驱动、可落地执行，而非概念堆砌。

# 本次任务
制作一份面向【${form.audience}】的【${form.pptType}】${form.pages ? " 共" + form.pages : ""}。

---

## A · 品牌与项目

品牌：${form.brandCn}${form.brandEn ? " / " + form.brandEn : ""}${form.group ? " · " + form.group : ""}
项目周期：${form.period}
核心目标：${form.goal}

---

## B · 视觉风格

${colorSection}
---

## C · 营销场景与平台

${selectedScenes.length ? "细分场景：" + selectedScenes.join("、") + "\n" : ""}${form.platformMain ? "主平台：" + form.platformMain + "\n" : ""}${form.platformSub ? "辅助平台：" + form.platformSub + "\n" : ""}${form.contentType ? "\n内容类型细化：\n" + form.contentType + "\n" : ""}
---

## D · 行业与竞品

行业：${form.industry}
品牌阶段：${form.stage}
${form.competitors ? "\n竞品清单：\n" + form.competitors + "\n" : ""}分析深度：${compDepth}

---

## E · 目标与KPI

${form.problem ? "核心问题：\n" + form.problem + "\n\n" : ""}${form.kpi ? "成功衡量：\n" + form.kpi + "\n\n" : ""}${form.budget ? "预算：" + form.budget + "\n" : ""}${form.budgetNote ? "预算备注：" + form.budgetNote + "\n" : ""}
---

## F · 内容结构大纲

${form.outline}${hidden.length ? "\n\n---\n\n## G · 项目隐性背景（优先理解，指导整体策略取舍）\n\n" + hidden.join("\n\n") : ""}

---

## 固定规范（不可修改）

- 结构逻辑：SCQ框架，每页一个核心观点，先结论后支撑
- 图表优先：结构图 > 文字列表，能图不表，每页至少一个可视化元素
- 量化表达：每页至少一个数据支撑，必须标注来源
- 禁止空话：禁用"全方位""深度赋能""生态化"等无实质内容词汇
- Speaker Notes：每页附说话要点

## 红线约束

1. 数据真实性：无真实来源的数据必须标注「[数据待补充]」，禁止编造
2. 品牌安全：竞品描述客观中立，不得出现法律风险表述
3. 平台合规：不得出现广告法违禁词（最、第一、国家级等）
4. 可执行性：所有策略建议必须在给定预算和时间范围内可落地`;
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(generatePrompt()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const reset = () => {
    setStep(0); setBriefText(""); setSelectedStyle("A");
    setSelectedScenes([]); setCompDepth("浅度"); setImportSuccess(false);
    setForm({ pptType:"年度营销提案",audience:"",brandCn:"",brandEn:"",group:"",period:"",goal:"",pages:"",color1:"",color1Name:"",color2:"",color2Name:"",colorBan:"",toneBan:"",platformMain:"",platformSub:"",contentType:"",industry:"美妆个护",stage:"新品牌冷启动",competitors:"",problem:"",kpi:"",budget:"",budgetNote:"",outline:"",decision:"",contact:"",conflict:"",history:"",concerns:"",stylePref:"",otherBg:"" });
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400";
  const labelCls = "block text-sm font-medium text-gray-800 mb-1";
  const hintCls = "text-xs text-gray-400 mb-1";
  const cardCls = "bg-white border border-gray-200 rounded-xl p-5 mb-3";
  const btnCls = "px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer";
  const btnPrimaryCls = "px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 cursor-pointer";

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: "#f5f5f3", minHeight: "100vh", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>PPT 提案指令生成器</h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: "1.5rem" }}>填写项目信息，自动生成完整 AI 提示词</p>

        {/* Stepper */}
        <div style={{ display: "flex", border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden", background: "#fff", marginBottom: "1.5rem" }}>
          {STEPS.map((s, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ flex: 1, padding: "9px 4px", textAlign: "center", fontSize: 11, cursor: "pointer", background: i === step ? "#f0f0ee" : "#fff", color: i === step ? "#1a1a1a" : i < step ? "#2d7a4f" : "#999", fontWeight: i === step ? 500 : 400, borderRight: i < STEPS.length - 1 ? "1px solid #e0e0e0" : "none" }}>
              {s}
            </div>
          ))}
        </div>

        {/* Step 0: 智能导入 */}
        {step === 0 && (
          <div>
            <div className={cardCls} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ ...{}, fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 4, display: "block" }}>
                  智能导入 Brief <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", marginLeft: 6 }}>AI 自动解析</span>
                </label>
                <p style={{ fontSize: 11, color: "#999", marginBottom: 8, lineHeight: 1.5 }}>粘贴客户 brief、品牌介绍、项目说明等任何文字，AI 自动提取关键信息并预填到 A-G 模块。G 模块（隐性背景）需手动补充。</p>
              </div>
              <textarea
                value={briefText}
                onChange={e => setBriefText(e.target.value)}
                style={{ width: "100%", minHeight: 160, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                placeholder={"将客户 brief、品牌介绍、项目说明等文字粘贴到这里...\n\n例如：\n- 微信群里客户发的项目背景\n- 邮件里的需求描述\n- 自己记录的客户沟通笔记"}
              />
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: importSuccess ? "#e8f5e9" : "#f0f0ee", borderRadius: 8, marginTop: 10, fontSize: 13, color: importSuccess ? "#2e7d32" : "#555" }}>
                  {!importSuccess && <div style={{ width: 16, height: 16, border: "2px solid #ddd", borderTopColor: "#1a1a1a", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />}
                  <span>{loadingText}</span>
                </div>
              )}
              {importSuccess && !loading && (
                <div style={{ padding: "10px 12px", background: "#e8f5e9", borderRadius: 8, marginTop: 10, fontSize: 13, color: "#2e7d32" }}>
                  {loadingText}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>可跳过，直接手动填写</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStep(1)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>跳过，手动填写</button>
                <button onClick={runImport} disabled={loading} style={{ padding: "8px 18px", borderRadius: 8, background: loading ? "#999" : "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "解析中..." : "AI 自动解析 →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: 品牌项目 */}
        {step === 1 && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>PPT 类型</label>
                <select value={form.pptType} onChange={e => set("pptType", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, background: "#fff" }}>
                  {PPT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>目标受众</label>
                <input value={form.audience} onChange={e => set("audience", e.target.value)} placeholder="如：品牌CMO、市场总监、甲方决策层" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>品牌名称（中文）</label>
                  <input value={form.brandCn} onChange={e => set("brandCn", e.target.value)} placeholder="如：某某品牌" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>品牌名称（英文）</label>
                  <input value={form.brandEn} onChange={e => set("brandEn", e.target.value)} placeholder="如：BrandName" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>所属集团（可留空）</label>
                  <input value={form.group} onChange={e => set("group", e.target.value)} placeholder="如：联合利华" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>项目周期</label>
                  <input value={form.period} onChange={e => set("period", e.target.value)} placeholder="如：2026年Q3，7月—9月" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>核心目标</label>
                <textarea value={form.goal} onChange={e => set("goal", e.target.value)} placeholder="如：提升品牌在25-35岁女性中的认知度，同时拉动双十一销售转化" style={{ width: "100%", minHeight: 72, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>PPT 页数</label>
                <input value={form.pages} onChange={e => set("pages", e.target.value)} placeholder="如：25页" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(0)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(2)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>下一步 →</button>
            </div>
          </div>
        )}

        {/* Step 2: 视觉风格 */}
        {step === 2 && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "block" }}>选择视觉风格</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
                  {Object.entries(STYLE_NAMES).map(([code, name]) => (
                    <div key={code} onClick={() => setSelectedStyle(code)} style={{ border: selectedStyle === code ? "2px solid #1a1a1a" : "1px solid #e0e0e0", borderRadius: 10, padding: "10px 12px", cursor: "pointer", background: selectedStyle === code ? "#f5f5f3" : "#fff" }}>
                      <div style={{ width: 28, height: 8, borderRadius: 2, background: STYLE_COLORS[code], marginBottom: 6 }} />
                      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>风格 {code}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{name.split("（")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
              {[["品牌主色 HEX", "color1", "#FF4500", "color1Name", "调性说明，如：热情、行动感"],
                ["辅助色 HEX（可留空）", "color2", "#1A1A2E", "color2Name", "调性说明，如：沉稳、专业"]].map(([label, key, ph, nameKey, namePh]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>{label}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={{ width: 140, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                    <div style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid #e0e0e0", background: /^#[0-9a-fA-F]{3,6}$/.test(form[key]) ? form[key] : "transparent", flexShrink: 0 }} />
                    <input value={form[nameKey]} onChange={e => set(nameKey, e.target.value)} placeholder={namePh} style={{ flex: 1, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>禁用色 / 视觉禁忌</label>
                <input value={form.colorBan} onChange={e => set("colorBan", e.target.value)} placeholder="如：不得使用竞品XX的品牌红 #E60012，或无限制" style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>品牌调性禁忌词</label>
                <input value={form.toneBan} onChange={e => set("toneBan", e.target.value)} placeholder='如：不得出现"最便宜"等低价感词汇，或无' style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(1)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(3)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>下一步 →</button>
            </div>
          </div>
        )}

        {/* Step 3: 场景平台 */}
        {step === 3 && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "block" }}>细分场景（可多选）</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SCENES.map(s => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#444", cursor: "pointer", padding: "4px 8px", border: "1px solid #e0e0e0", borderRadius: 6, background: selectedScenes.includes(s) ? "#f0f0ee" : "#fff" }}>
                      <input type="checkbox" checked={selectedScenes.includes(s)} onChange={() => toggleScene(s)} style={{ accentColor: "#1a1a1a" }} />
                      {s.split("（")[0]}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["主平台", "platformMain", "如：小红书（主）、抖音（主）"], ["辅助平台", "platformSub", "如：微信朋友圈、京东站内"]].map(([label, key, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>内容类型细化</label>
                <p style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>按平台说明具体内容形式</p>
                <textarea value={form.contentType} onChange={e => set("contentType", e.target.value)} placeholder={"小红书：种草笔记 / 搜索拦截 / 品牌号运营\n抖音：信息流 / TopView / 达人合作\n微信：朋友圈广告 / 公众号 / 视频号"} style={{ width: "100%", minHeight: 80, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(2)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(4)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>下一步 →</button>
            </div>
          </div>
        )}

        {/* Step 4: 行业竞品 */}
        {step === 4 && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>所属行业</label>
                  <select value={form.industry} onChange={e => set("industry", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, background: "#fff" }}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>品牌所处阶段</label>
                  <select value={form.stage} onChange={e => set("stage", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, background: "#fff" }}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>竞品清单</label>
                <p style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>每行一个，格式：品牌名 —— 重点关注维度</p>
                <textarea value={form.competitors} onChange={e => set("competitors", e.target.value)} placeholder={"竞品A —— 投放声量、达人矩阵结构\n竞品B —— 创意策略、落地页逻辑\n竞品C —— 转化路径、私域体系"} style={{ width: "100%", minHeight: 80, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "block" }}>竞品分析深度</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["浅度（声量+风格概览）", "深度（全链路拆解）"].map((label, i) => {
                    const val = i === 0 ? "浅度" : "深度";
                    return (
                      <label key={val} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#444", cursor: "pointer", padding: "4px 8px", border: "1px solid #e0e0e0", borderRadius: 6, background: compDepth === val ? "#f0f0ee" : "#fff" }}>
                        <input type="radio" name="depth" checked={compDepth === val} onChange={() => setCompDepth(val)} />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(3)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(5)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>下一步 →</button>
            </div>
          </div>
        )}

        {/* Step 5: 目标预算 */}
        {step === 5 && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              {[["核心要解决的问题", "problem", "如：618大促前品牌在小红书搜索份额被竞品压制，需通过种草+搜索拦截组合策略反超", true],
                ["成功衡量标准 / KPI", "kpi", "品牌声量：小红书品牌词搜索量提升30%\n销售转化：大促期间GMV目标5000万\n内容指标：爆款率≥15%，平均互动率≥3%", true]].map(([label, key, ph, isArea]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>{label}</label>
                  <textarea value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={{ width: "100%", minHeight: 72, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["预算范围", "budget", "如：200-300万RMB，或保密"], ["预算偏好 / 敏感点", "budgetNote", "如：达人费用占比不超过60%"]].map(([label, key, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(4)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(6)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>下一步 →</button>
            </div>
          </div>
        )}

        {/* Step 6: 大纲结构 */}
        {step === 6 && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>PPT 内容结构大纲</label>
              <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>按页面顺序填写，可自由增删调整</p>
              <textarea value={form.outline} onChange={e => set("outline", e.target.value)} placeholder={"P1 封面\nP2 目录\nP3 市场背景与机会\nP4-5 竞品分析\nP6-7 目标人群洞察\nP8-9 策略总纲\nP10-12 平台分策略\nP13-15 创意方向\nP16-18 排期与执行计划\nP19-20 预算分配\nP21-22 预期效果与ROI测算\nP23 风险与应对\nP24 下一步行动\nP25 附录"} style={{ width: "100%", minHeight: 200, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(5)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(7)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>下一步 →</button>
            </div>
          </div>
        )}

        {/* Step 7: 隐性背景 */}
        {step === 7 && (
          <div>
            <div style={{ background: "#fffbea", border: "1px solid #f0d070", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#806000", marginBottom: 12 }}>
              ⚠️ 此模块为项目敏感信息，仅用于生成指令，不会被存储或上传
            </div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["最终拍板人", "decision", "如：CMO王总，注重ROI和数据"], ["直接对接人", "contact", "如：市场总监李总，注重创意感"]].map(([label, key, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} />
                  </div>
                ))}
              </div>
              {[["内部意见分歧", "conflict", "如：市场部希望加大品牌投放，电商部希望全押效果广告"],
                ["历史背景", "history", "如：上次双十一ROI 1:3，甲方认为不达预期；客户对上家供应商不满：执行落地太慢"],
                ["潜在顾虑（说出口的 + 没说出口的）", "concerns", "说出口：担心KOL翻车影响品牌\n没说出口：可能担心我们没有该行业经验\n竞标情况：三家竞标，竞品A是客户老供应商"],
                ["客户偏好与软性信息", "stylePref", "喜欢：数据驱动、逻辑严密\n反感：大量案例堆砌，希望聚焦自身品牌\n软性信息：拍板人最近关注AI营销话题"],
                ["其他特殊情况（可留空）", "otherBg", "任何你觉得AI需要知道的背景信息"]].map(([label, key, ph]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>{label}</label>
                  <textarea value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={{ width: "100%", minHeight: 72, padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, resize: "vertical" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(6)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
              <button onClick={() => setStep(8)} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>生成完整指令 →</button>
            </div>
          </div>
        )}

        {/* Step 8: 生成结果 */}
        {step === 8 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>完整 PPT 提案指令</span>
              <button onClick={copyOutput} style={{ padding: "8px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>
                {copied ? "已复制 ✓" : "复制全部"}
              </button>
            </div>
            <div style={{ background: "#f8f8f6", border: "1px solid #e0e0e0", borderRadius: 10, padding: 20, fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 500, overflowY: "auto", color: "#1a1a1a", fontFamily: "inherit" }}>
              {generatePrompt()}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e8e8e8" }}>
              <button onClick={() => setStep(7)} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>← 返回修改</button>
              <button onClick={reset} style={{ padding: "8px 18px", border: "1px solid #d0d0d0", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>重新填写</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

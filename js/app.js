/**
 * 华夏吉课 · 全场景八字择日前端交互主模块
 * 支持：公历生日输入、农历生日输入、自选八字干支输入三模式自由切换
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 场景元数据定义
  const SCENARIOS = {
    wedding: {
      name: '嫁娶结婚',
      icon: '💍',
      roleLabel: '新郎 & 新娘八字',
      roleBadge: '合婚双柱',
      banner: '【嫁娶结婚择吉】以新娘生肖为根本确定行嫁大利月，避开冲克新郎与新娘生肖、日柱夫妻宫，优选成日、定日与青龙黄道。',
      defaultDate: '1996-08-16',
      defaultHour: 10
    },
    opening: {
      name: '开业开市',
      icon: '🏢',
      roleLabel: '开业福主 / 创办人八字',
      roleBadge: '老板/法人主命',
      banner: '【开业开市择吉】取建除【开日、满日、成日】，纳【金匮黄道】天财，合老板生肖与财星，严避月破大耗与十恶大败。',
      defaultDate: '1988-06-18',
      defaultHour: 10
    },
    breakground: {
      name: '动土起基',
      icon: '🏗️',
      roleLabel: '动土宅主 / 施工主事者八字',
      roleBadge: '宅主主命',
      banner: '【动土起基择吉】取建除【定日、除日、执日】，逢天德月德化解地煞，严密避开土皇用事日与重丧日，保施工安泰。',
      defaultDate: '1982-10-15',
      defaultHour: 8
    },
    relocate: {
      name: '乔迁入宅',
      icon: '🏡',
      roleLabel: '入宅房主 / 宅主八字',
      roleBadge: '宅主主命',
      banner: '【乔迁入宅择吉】取建除【开日、成日、定日】，迎紫气东来；严避【归忌日】与火星克宅煞，合房主八字宅运亨通。',
      defaultDate: '1990-03-26',
      defaultHour: 9
    },
    bed: {
      name: '安床设帐',
      icon: '🛏️',
      roleLabel: '安床福主 / 主人家八字',
      roleBadge: '主事福主',
      banner: '【安床设帐择吉】传统首选建除【危日、定日】（危日安床子孙昌），避冲克主人生肖，催旺睡眠康宁与家庭和睦。',
      defaultDate: '1995-12-08',
      defaultHour: 22
    },
    contract: {
      name: '签约交易',
      icon: '✍️',
      roleLabel: '签约代表 / 投资主事者八字',
      roleBadge: '签约主命',
      banner: '【签约交易择吉】首选建除【成日、满日、定日】，借【天乙贵人】坐镇吉气，条款通达，合作共赢，履约坚实。',
      defaultDate: '1985-05-20',
      defaultHour: 14
    }
  };

  // 全局状态
  const state = {
    currentScenario: 'wedding',
    isSimpleMode: document.body.dataset.mode === 'simple', // 简化版模式 (不显示依据)
    groomMode: 'solar', // 'solar' | 'lunar' | 'bazi'
    brideMode: 'solar',
    singleMode: 'solar',
    groomBazi: null,
    brideBazi: null,
    singleBazi: null,
    rawResults: [],
    filteredResults: []
  };

  // DOM 引用
  const el = {
    // 场景导航
    scenarioTabs: document.querySelectorAll('.scenario-tab'),
    scenarioBanner: document.getElementById('scenarioBanner'),
    scenarioBannerText: document.getElementById('scenarioBannerText'),

    // 表单容器
    weddingBaziGrid: document.getElementById('weddingBaziGrid'),
    singleBaziGrid: document.getElementById('singleBaziGrid'),
    singlePersonRoleLabel: document.getElementById('singlePersonRoleLabel'),
    singlePersonRoleBadge: document.getElementById('singlePersonRoleBadge'),
    optDaLiItem: document.getElementById('optDaLiItem'),

    // 模式切换按钮
    groomModeSolar: document.getElementById('groomModeSolar'),
    groomModeLunar: document.getElementById('groomModeLunar'),
    groomModeBazi: document.getElementById('groomModeBazi'),

    brideModeSolar: document.getElementById('brideModeSolar'),
    brideModeLunar: document.getElementById('brideModeLunar'),
    brideModeBazi: document.getElementById('brideModeBazi'),

    singleModeSolar: document.getElementById('singleModeSolar'),
    singleModeLunar: document.getElementById('singleModeLunar'),
    singleModeBazi: document.getElementById('singleModeBazi'),

    // 表单容器
    groomSolarForm: document.getElementById('groomSolarForm'),
    groomLunarForm: document.getElementById('groomLunarForm'),
    groomBaziForm: document.getElementById('groomBaziForm'),

    brideSolarForm: document.getElementById('brideSolarForm'),
    brideLunarForm: document.getElementById('brideLunarForm'),
    brideBaziForm: document.getElementById('brideBaziForm'),

    singleSolarForm: document.getElementById('singleSolarForm'),
    singleLunarForm: document.getElementById('singleLunarForm'),
    singleBaziForm: document.getElementById('singleBaziForm'),

    // 公历输入
    groomBirthDate: document.getElementById('groomBirthDate'),
    groomBirthHour: document.getElementById('groomBirthHour'),
    brideBirthDate: document.getElementById('brideBirthDate'),
    brideBirthHour: document.getElementById('brideBirthHour'),
    singleBirthDate: document.getElementById('singleBirthDate'),
    singleBirthHour: document.getElementById('singleBirthHour'),

    // 农历输入
    groomLunarYear: document.getElementById('groomLunarYear'),
    groomLunarMonth: document.getElementById('groomLunarMonth'),
    groomLunarLeap: document.getElementById('groomLunarLeap'),
    groomLunarDay: document.getElementById('groomLunarDay'),
    groomLunarHour: document.getElementById('groomLunarHour'),
    groomLunarConverted: document.getElementById('groomLunarConverted'),

    brideLunarYear: document.getElementById('brideLunarYear'),
    brideLunarMonth: document.getElementById('brideLunarMonth'),
    brideLunarLeap: document.getElementById('brideLunarLeap'),
    brideLunarDay: document.getElementById('brideLunarDay'),
    brideLunarHour: document.getElementById('brideLunarHour'),
    brideLunarConverted: document.getElementById('brideLunarConverted'),

    singleLunarYear: document.getElementById('singleLunarYear'),
    singleLunarMonth: document.getElementById('singleLunarMonth'),
    singleLunarLeap: document.getElementById('singleLunarLeap'),
    singleLunarDay: document.getElementById('singleLunarDay'),
    singleLunarHour: document.getElementById('singleLunarHour'),
    singleLunarConverted: document.getElementById('singleLunarConverted'),

    // 干支下拉框
    groomYearGan: document.getElementById('groomYearGan'),
    groomYearZhi: document.getElementById('groomYearZhi'),
    groomMonthGan: document.getElementById('groomMonthGan'),
    groomMonthZhi: document.getElementById('groomMonthZhi'),
    groomDayGan: document.getElementById('groomDayGan'),
    groomDayZhi: document.getElementById('groomDayZhi'),
    groomHourGan: document.getElementById('groomHourGan'),
    groomHourZhi: document.getElementById('groomHourZhi'),

    brideYearGan: document.getElementById('brideYearGan'),
    brideYearZhi: document.getElementById('brideYearZhi'),
    brideMonthGan: document.getElementById('brideMonthGan'),
    brideMonthZhi: document.getElementById('brideMonthZhi'),
    brideDayGan: document.getElementById('brideDayGan'),
    brideDayZhi: document.getElementById('brideDayZhi'),
    brideHourGan: document.getElementById('brideHourGan'),
    brideHourZhi: document.getElementById('brideHourZhi'),

    singleYearGan: document.getElementById('singleYearGan'),
    singleYearZhi: document.getElementById('singleYearZhi'),
    singleMonthGan: document.getElementById('singleMonthGan'),
    singleMonthZhi: document.getElementById('singleMonthZhi'),
    singleDayGan: document.getElementById('singleDayGan'),
    singleDayZhi: document.getElementById('singleDayZhi'),
    singleHourGan: document.getElementById('singleHourGan'),
    singleHourZhi: document.getElementById('singleHourZhi'),

    // 预览卡片
    groomPreviewPillars: document.getElementById('groomPreviewPillars'),
    bridePreviewPillars: document.getElementById('bridePreviewPillars'),
    singlePreviewPillars: document.getElementById('singlePreviewPillars'),

    // 日期范围与筛选
    weddingStartDate: document.getElementById('weddingStartDate'),
    weddingEndDate: document.getElementById('weddingEndDate'),
    optWeekendOnly: document.getElementById('optWeekendOnly'),
    optDaLiOnly: document.getElementById('optDaLiOnly'),
    optMinStar: document.getElementById('optMinStar'),
    sortSelect: document.getElementById('sortSelect'),

    // 按钮
    btnCalculate: document.getElementById('btnCalculate'),
    btnDemoGeneral: document.getElementById('btnDemoGeneral'),
    btnDemoPreset1: document.getElementById('btnDemoPreset1'),
    btnDemoPreset2: document.getElementById('btnDemoPreset2'),
    btnPrintAll: document.getElementById('btnPrintAll'),

    // 结果区
    resultsContainer: document.getElementById('resultsContainer'),
    resultsSummaryText: document.getElementById('resultsSummaryText'),
    datesList: document.getElementById('datesList')
  };

  // 初始化所有天干地支下拉选项
  function initGanZhiSelects() {
    const TIANGAN = window.LunarEngine.TIANGAN;
    const DIZHI = window.LunarEngine.DIZHI;

    function populate(selectEl, list) {
      if (!selectEl) return;
      selectEl.innerHTML = '';
      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        selectEl.appendChild(opt);
      });
    }

    [
      el.groomYearGan, el.groomMonthGan, el.groomDayGan, el.groomHourGan,
      el.brideYearGan, el.brideMonthGan, el.brideDayGan, el.brideHourGan,
      el.singleYearGan, el.singleMonthGan, el.singleDayGan, el.singleHourGan
    ].forEach(s => populate(s, TIANGAN));

    [
      el.groomYearZhi, el.groomMonthZhi, el.groomDayZhi, el.groomHourZhi,
      el.brideYearZhi, el.brideMonthZhi, el.brideDayZhi, el.brideHourZhi,
      el.singleYearZhi, el.singleMonthZhi, el.singleDayZhi, el.singleHourZhi
    ].forEach(s => populate(s, DIZHI));
  }

  // 初始化农历输入下拉框 (年、月、日、时辰)
  function initLunarSelects() {
    const CHINESE_MONTH = window.LunarEngine.CHINESE_MONTH;
    const CHINESE_DAY = window.LunarEngine.CHINESE_DAY;

    const hourOptions = [
      { val: 0, text: '00:00 (子时)' },
      { val: 2, text: '02:00 (丑时)' },
      { val: 4, text: '04:00 (寅时)' },
      { val: 6, text: '06:00 (卯时)' },
      { val: 8, text: '08:00 (辰时)' },
      { val: 10, text: '10:00 (巳时)' },
      { val: 12, text: '12:00 (午时)' },
      { val: 14, text: '14:00 (未时)' },
      { val: 16, text: '16:00 (申时)' },
      { val: 18, text: '18:00 (酉时)' },
      { val: 20, text: '20:00 (戌时)' },
      { val: 22, text: '22:00 (亥时)' }
    ];

    ['groom', 'bride', 'single'].forEach(pfx => {
      const yearEl = el[`${pfx}LunarYear`];
      const monthEl = el[`${pfx}LunarMonth`];
      const dayEl = el[`${pfx}LunarDay`];
      const hourEl = el[`${pfx}LunarHour`];

      if (!yearEl || !monthEl || !dayEl || !hourEl) return;

      // 填充年份 (1930 ~ 2035)
      yearEl.innerHTML = '';
      for (let y = 1930; y <= 2035; y++) {
        const gz = window.LunarEngine.getYearGanZhi(y, 6, 1);
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `${y}年 (${gz.text}·${gz.shengxiao})`;
        yearEl.appendChild(opt);
      }

      // 填充月份 (正月 ~ 腊月)
      monthEl.innerHTML = '';
      CHINESE_MONTH.forEach((mStr, idx) => {
        const opt = document.createElement('option');
        opt.value = idx + 1;
        opt.textContent = `${mStr}月`;
        monthEl.appendChild(opt);
      });

      // 填充日期 (初一 ~ 三十)
      updateLunarDaysForSelect(pfx, 1996, 1, false);

      // 填充时辰
      hourEl.innerHTML = '';
      hourOptions.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h.val;
        opt.textContent = h.text;
        hourEl.appendChild(opt);
      });
    });
  }

  // 动态更新农历日期天数 (29天小月或30天大月)
  function updateLunarDaysForSelect(pfx, year, month, isLeap) {
    const dayEl = el[`${pfx}LunarDay`];
    if (!dayEl) return;

    const CHINESE_DAY = window.LunarEngine.CHINESE_DAY;
    const maxDays = window.LunarEngine.getLunarMonthDays(year, month, isLeap);
    const curVal = parseInt(dayEl.value || 1, 10);

    dayEl.innerHTML = '';
    for (let d = 1; d <= maxDays; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = CHINESE_DAY[d - 1];
      dayEl.appendChild(opt);
    }

    dayEl.value = Math.min(curVal, maxDays);
  }

  // 检查并更新闰月复选框状态
  function checkLeapMonthState(pfx) {
    const year = parseInt(el[`${pfx}LunarYear`].value, 10);
    const month = parseInt(el[`${pfx}LunarMonth`].value, 10);
    const leapEl = el[`${pfx}LunarLeap`];
    if (!leapEl) return;

    const leap = window.LunarEngine.getLeapMonth(year);
    if (leap > 0 && leap === month) {
      leapEl.disabled = false;
      leapEl.parentElement.style.opacity = '1';
      leapEl.parentElement.title = `该年有闰${month}月，若出生于闰月请勾选`;
    } else {
      leapEl.checked = false;
      leapEl.disabled = true;
      leapEl.parentElement.style.opacity = '0.4';
      leapEl.parentElement.title = leap > 0 ? `该年闰${leap}月，当前非闰月` : '该年无闰月';
    }
  }

  // 场景切换逻辑
  function setupScenarioTabs() {
    el.scenarioTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        el.scenarioTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const scenarioKey = this.dataset.scenario;
        switchScenario(scenarioKey);
      });
    });
  }

  function switchScenario(scenarioKey) {
    state.currentScenario = scenarioKey;
    const info = SCENARIOS[scenarioKey];
    if (!info) return;

    el.scenarioBanner.querySelector('.banner-icon').textContent = info.icon;
    el.scenarioBannerText.textContent = info.banner;

    if (scenarioKey === 'wedding') {
      el.weddingBaziGrid.style.display = 'grid';
      el.singleBaziGrid.style.display = 'none';
      if (el.optDaLiItem) el.optDaLiItem.style.display = 'inline-flex';
      refreshPersonBazi('groom');
      refreshPersonBazi('bride');
    } else {
      el.weddingBaziGrid.style.display = 'none';
      el.singleBaziGrid.style.display = 'grid';
      if (el.optDaLiItem) el.optDaLiItem.style.display = 'none';

      el.singlePersonRoleLabel.textContent = `${info.icon} ${info.roleLabel}`;
      el.singlePersonRoleBadge.textContent = info.roleBadge;
      refreshPersonBazi('single');
    }

    // 切换场景时：如果已输入八字则静默重算，未输入则隐藏结果区（不展示默认假测算）
    const hasInput = (scenarioKey === 'wedding') 
      ? (state.groomBazi && state.brideBazi)
      : !!state.singleBazi;

    if (hasInput) {
      executeSelection(false);
    } else {
      el.resultsContainer.style.display = 'none';
    }
  }

  // 模式切换控制 (公历 / 农历 / 八字)
  function setupModeSwitches() {
    ['groom', 'bride', 'single'].forEach(pfx => {
      const btnSolar = el[`${pfx}ModeSolar`];
      const btnLunar = el[`${pfx}ModeLunar`];
      const btnBazi = el[`${pfx}ModeBazi`];

      const formSolar = el[`${pfx}SolarForm`];
      const formLunar = el[`${pfx}LunarForm`];
      const formBazi = el[`${pfx}BaziForm`];

      btnSolar.addEventListener('click', () => {
        state[`${pfx}Mode`] = 'solar';
        btnSolar.classList.add('active');
        btnLunar.classList.remove('active');
        btnBazi.classList.remove('active');

        formSolar.style.display = 'block';
        formLunar.style.display = 'none';
        formBazi.style.display = 'none';
        refreshPersonBazi(pfx);
      });

      btnLunar.addEventListener('click', () => {
        state[`${pfx}Mode`] = 'lunar';
        btnLunar.classList.add('active');
        btnSolar.classList.remove('active');
        btnBazi.classList.remove('active');

        formSolar.style.display = 'none';
        formLunar.style.display = 'block';
        formBazi.style.display = 'none';

        syncSolarToLunarForm(pfx);
        refreshPersonBazi(pfx);
      });

      btnBazi.addEventListener('click', () => {
        state[`${pfx}Mode`] = 'bazi';
        btnBazi.classList.add('active');
        btnSolar.classList.remove('active');
        btnLunar.classList.remove('active');

        formSolar.style.display = 'none';
        formLunar.style.display = 'none';
        formBazi.style.display = 'block';
        refreshPersonBazi(pfx);
      });
    });
  }

  // 将公历日期同步到农历表单
  function syncSolarToLunarForm(pfx) {
    const val = el[`${pfx}BirthDate`].value;
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const hour = parseInt(el[`${pfx}BirthHour`].value || 10, 10);
    const lunar = window.LunarEngine.solarToLunar(y, m, d);

    el[`${pfx}LunarYear`].value = lunar.lunarYear;
    el[`${pfx}LunarMonth`].value = lunar.lunarMonth;
    checkLeapMonthState(pfx);
    el[`${pfx}LunarLeap`].checked = !!lunar.isLeap;

    updateLunarDaysForSelect(pfx, lunar.lunarYear, lunar.lunarMonth, lunar.isLeap);
    el[`${pfx}LunarDay`].value = lunar.lunarDay;
    el[`${pfx}LunarHour`].value = hour;

    updateConvertedTip(pfx, y, m, d);
  }

  // 更新换算公历提示
  function updateConvertedTip(pfx, y, m, d) {
    const tipEl = el[`${pfx}LunarConverted`];
    if (tipEl) {
      tipEl.innerHTML = `<span>🔄 对应公历 (阳历)：<strong>${y}年${String(m).padStart(2, '0')}月${String(d).padStart(2, '0')}日</strong></span>`;
    }
  }

  // 统一更新某个角色（groom, bride, single）的八字
  function refreshPersonBazi(pfx) {
    const mode = state[`${pfx}Mode`];
    let bazi = null;

    if (mode === 'solar') {
      const val = el[`${pfx}BirthDate`].value;
      if (val) {
        const [y, m, d] = val.split('-').map(Number);
        const hour = parseInt(el[`${pfx}BirthHour`].value || 10, 10);
        bazi = window.LunarEngine.calculateBazi(y, m, d, hour);
        updateConvertedTip(pfx, y, m, d);
      }
    } else if (mode === 'lunar') {
      const ly = parseInt(el[`${pfx}LunarYear`].value, 10);
      const lm = parseInt(el[`${pfx}LunarMonth`].value, 10);
      const isLeap = el[`${pfx}LunarLeap`].checked;
      const ld = parseInt(el[`${pfx}LunarDay`].value, 10);
      const hour = parseInt(el[`${pfx}LunarHour`].value || 10, 10);

      bazi = window.LunarEngine.calculateBaziFromLunar(ly, lm, ld, isLeap, hour);
      if (bazi && bazi.solar) {
        updateConvertedTip(pfx, bazi.solar.year, bazi.solar.month, bazi.solar.day);
        // 同步公历表单值
        el[`${pfx}BirthDate`].value = `${bazi.solar.year}-${String(bazi.solar.month).padStart(2, '0')}-${String(bazi.solar.day).padStart(2, '0')}`;
        el[`${pfx}BirthHour`].value = hour;
      }
    } else if (mode === 'bazi') {
      bazi = assembleBaziFromSelects(pfx);
    }

    state[`${pfx}Bazi`] = bazi;

    // 渲染预览卡片
    let label = '福主';
    if (pfx === 'groom') label = '新郎';
    else if (pfx === 'bride') label = '新娘';
    else label = SCENARIOS[state.currentScenario].name + '福主';

    renderPillars(el[`${pfx}PreviewPillars`], bazi, label);

    // 同步到八字下拉框
    if (mode !== 'bazi' && bazi) {
      syncSelects(pfx, bazi);
    }
  }

  function syncSelects(pfx, bazi) {
    if (!bazi || !bazi.year) return;
    el[`${pfx}YearGan`].value = bazi.year.gan;
    el[`${pfx}YearZhi`].value = bazi.year.zhi;
    el[`${pfx}MonthGan`].value = bazi.month.gan;
    el[`${pfx}MonthZhi`].value = bazi.month.zhi;
    el[`${pfx}DayGan`].value = bazi.day.gan;
    el[`${pfx}DayZhi`].value = bazi.day.zhi;
    el[`${pfx}HourGan`].value = bazi.hour.gan || '甲';
    el[`${pfx}HourZhi`].value = bazi.hour.zhi || '子';
  }

  function assembleBaziFromSelects(pfx) {
    const DIZHI = window.LunarEngine.DIZHI;
    const SHENGXIAO = window.LunarEngine.SHENGXIAO;
    const NAYIN = window.LunarEngine.NAYIN;

    const yGan = el[`${pfx}YearGan`].value;
    const yZhi = el[`${pfx}YearZhi`].value;
    const mGan = el[`${pfx}MonthGan`].value;
    const mZhi = el[`${pfx}MonthZhi`].value;
    const dGan = el[`${pfx}DayGan`].value;
    const dZhi = el[`${pfx}DayZhi`].value;
    const hGan = el[`${pfx}HourGan`].value;
    const hZhi = el[`${pfx}HourZhi`].value;

    const zhiIdx = DIZHI.indexOf(yZhi);
    const shengxiao = SHENGXIAO[zhiIdx] || '未知';

    return {
      shengxiao: shengxiao,
      year: { gan: yGan, zhi: yZhi, text: yGan + yZhi, nayin: NAYIN[yGan + yZhi] || '' },
      month: { gan: mGan, zhi: mZhi, text: mGan + mZhi, nayin: NAYIN[mGan + mZhi] || '' },
      day: { gan: dGan, zhi: dZhi, text: dGan + dZhi, nayin: NAYIN[dGan + dZhi] || '' },
      hour: { gan: hGan, zhi: hZhi, text: hGan + hZhi, nayin: NAYIN[hGan + hZhi] || '' }
    };
  }

  function renderPillars(container, bazi, label) {
    if (!container) return;
    if (!bazi) {
      container.innerHTML = `
        <div style="text-align: center; padding: 18px 8px; color: var(--text-light); font-size: 13px; line-height: 1.6;">
          <div style="font-size: 18px; margin-bottom: 4px;">🏮</div>
          <div style="color: var(--text-muted); font-weight: 500;">请选择【${label}】的出生日期</div>
          <div style="font-size: 11px; color: var(--text-light); margin-top: 2px;">支持输入公历、农历或自选八字，将自动排盘</div>
        </div>
      `;
      return;
    }
    container.innerHTML = `
      <div class="pillars-header">
        <span>【${label}】生肖属<strong>${bazi.shengxiao}</strong></span>
        <span>命局四柱排盘</span>
      </div>
      <div class="pillars-grid">
        <div class="pillar-col">
          <div class="pillar-title">年柱(生肖)</div>
          <div class="pillar-gz">${bazi.year.text}</div>
          <div class="pillar-nayin">${bazi.year.nayin || ''}</div>
        </div>
        <div class="pillar-col">
          <div class="pillar-title">月柱(提纲)</div>
          <div class="pillar-gz">${bazi.month.text}</div>
          <div class="pillar-nayin">${bazi.month.nayin || ''}</div>
        </div>
        <div class="pillar-col">
          <div class="pillar-title">日柱(本命日元)</div>
          <div class="pillar-gz">${bazi.day.text}</div>
          <div class="pillar-nayin">${bazi.day.nayin || ''}</div>
        </div>
        <div class="pillar-col">
          <div class="pillar-title">时柱(时辰归宿)</div>
          <div class="pillar-gz">${bazi.hour.text}</div>
          <div class="pillar-nayin">${bazi.hour.nayin || ''}</div>
        </div>
      </div>
    `;
  }

  function initDefaultDateRange() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 7, 0);

    el.weddingStartDate.value = formatDate(start);
    el.weddingEndDate.value = formatDate(end);
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function setupQuickRanges() {
    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');

        const months = parseInt(this.dataset.months, 10);
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1 + months, 0);

        el.weddingStartDate.value = formatDate(start);
        el.weddingEndDate.value = formatDate(end);
        executeSelection();
      });
    });
  }

  function setupDemos() {
    el.btnDemoGeneral.addEventListener('click', () => {
      const cur = state.currentScenario;
      if (cur === 'wedding') {
        el.groomBirthDate.value = '1996-08-16';
        el.groomBirthHour.value = '10';
        refreshPersonBazi('groom');
        syncSolarToLunarForm('groom');

        el.brideBirthDate.value = '1998-03-20';
        el.brideBirthHour.value = '14';
        refreshPersonBazi('bride');
        syncSolarToLunarForm('bride');
      } else {
        const info = SCENARIOS[cur];
        el.singleBirthDate.value = info.defaultDate;
        el.singleBirthHour.value = info.defaultHour;
        refreshPersonBazi('single');
        syncSolarToLunarForm('single');
      }
      initDefaultDateRange();
      executeSelection(true);
    });

    el.btnDemoPreset1.addEventListener('click', () => {
      if (state.currentScenario === 'wedding') {
        el.groomBirthDate.value = '1988-04-12';
        refreshPersonBazi('groom');
        syncSolarToLunarForm('groom');
        el.brideBirthDate.value = '1990-09-18';
        refreshPersonBazi('bride');
        syncSolarToLunarForm('bride');
      } else {
        el.singleBirthDate.value = '1988-04-12';
        el.singleBirthHour.value = '8';
        refreshPersonBazi('single');
        syncSolarToLunarForm('single');
      }
      initDefaultDateRange();
      executeSelection(true);
    });

    el.btnDemoPreset2.addEventListener('click', () => {
      if (state.currentScenario === 'wedding') {
        el.groomBirthDate.value = '1992-07-22';
        refreshPersonBazi('groom');
        syncSolarToLunarForm('groom');
        el.brideBirthDate.value = '1994-11-05';
        refreshPersonBazi('bride');
        syncSolarToLunarForm('bride');
      } else {
        el.singleBirthDate.value = '1992-07-22';
        el.singleBirthHour.value = '14';
        refreshPersonBazi('single');
        syncSolarToLunarForm('single');
      }
      initDefaultDateRange();
      executeSelection(true);
    });
  }

  function executeSelection(isManualTrigger = false) {
    const curScenario = state.currentScenario;
    let primary = null;
    let secondary = null;

    if (curScenario === 'wedding') {
      primary = state.groomBazi;
      secondary = state.brideBazi;
      if (!primary || !secondary) {
        if (isManualTrigger) {
          if (!primary && !secondary) {
            alert('请先输入新郎和新娘的出生日期或自选八字！');
          } else if (!primary) {
            alert('请先输入新郎的出生日期或自选八字！');
          } else {
            alert('请先输入新娘的出生日期或自选八字！');
          }
        }
        return;
      }
    } else {
      primary = state.singleBazi;
      if (!primary) {
        if (isManualTrigger) {
          const roleName = SCENARIOS[curScenario] ? SCENARIOS[curScenario].name : '该场景';
          alert(`请先输入【${roleName}】主事者的出生日期或自选八字！`);
        }
        return;
      }
    }

    const startVal = el.weddingStartDate.value;
    const endVal = el.weddingEndDate.value;
    if (!startVal || !endVal) {
      if (isManualTrigger) alert('请选择想要择日的时间范围！');
      return;
    }

    const startDate = new Date(startVal + 'T00:00:00');
    const endDate = new Date(endVal + 'T00:00:00');
    if (startDate > endDate) {
      if (isManualTrigger) alert('开始日期不能晚于结束日期！');
      return;
    }

    const options = {
      weekendOnly: el.optWeekendOnly.checked,
      daLiOnly: (curScenario === 'wedding' && el.optDaLiOnly.checked),
      minStar: parseInt(el.optMinStar.value, 10) || 0
    };

    const results = window.WeddingRules.findDates(
      curScenario,
      startDate,
      endDate,
      primary,
      secondary,
      options
    );

    state.rawResults = results;
    applySortingAndRender();

    el.resultsContainer.style.display = 'block';
    if (isManualTrigger) {
      el.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function applySortingAndRender() {
    const sortBy = el.sortSelect.value;
    let list = [...state.rawResults];

    if (sortBy === 'dateAsc') {
      list.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      list.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.date.getTime() - b.date.getTime();
      });
    }

    state.filteredResults = list;
    renderResults(list);
  }

  function renderResults(list) {
    const scenarioInfo = SCENARIOS[state.currentScenario];

    if (!list || list.length === 0) {
      el.resultsSummaryText.innerHTML = `在指定时间范围内，未检索到符合条件的【${scenarioInfo.name}】上吉良辰`;
      el.datesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${scenarioInfo.icon}</div>
          <h3 style="font-family: var(--font-serif); color: var(--deep-red); margin-bottom: 8px;">
            暂无完全符合所选条件的吉日
          </h3>
          <p style="color: var(--text-muted); font-size: 14px; max-width: 520px; margin: 0 auto;">
            提示：系统已严格100%剔除了冲克主事人属相、日柱、岁破与月破大耗等凶煞。建议适当放宽筛选条件（如取消周末限制或降低星级筛选）或延长检索时间跨度。
          </p>
        </div>
      `;
      return;
    }

    const fiveStarCount = list.filter(item => item.starLevel === 5).length;
    const weekendCount = list.filter(item => item.isWeekend).length;

    el.resultsSummaryText.innerHTML = `
      为您甄选出 <strong>${list.length}</strong> 个适合【<strong>${scenarioInfo.name}</strong>】的良辰吉日 
      （其中五星上吉 <strong>${fiveStarCount}</strong> 天，周末 <strong>${weekendCount}</strong> 天，均已严查避煞）
    `;

    el.datesList.innerHTML = '';

    list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `date-card rank-${item.starLevel} ${state.isSimpleMode ? 'simple-card' : ''}`;

      const tagsHtml = item.highlightTags.map(tag => {
        return `<span class="hl-tag">✦ ${tag}</span>`;
      }).join('');

      if (state.isSimpleMode) {
        // 极简版紧凑小卡片：不占一行，紧凑网格展示，无冗长命理依据
        card.innerHTML = `
          <div class="simple-card-top">
            <span class="simple-solar-date">${item.year}年${item.month}月${item.day}日</span>
            <span class="simple-weekday ${item.isWeekend ? 'weekend' : ''}">${item.dayOfWeek}</span>
          </div>
          <div class="simple-lunar-text">
            ${item.lunarStr} · ${item.ganZhiDay}日
          </div>
          <div class="simple-tags-area">
            ${tagsHtml}
          </div>
          <div class="simple-card-bottom">
            <div class="simple-score-text">
              <strong>${item.score}分</strong> · ${'★'.repeat(item.starLevel)}
            </div>
            <button class="btn-simple-copy btn-copy-card" data-idx="${index}">
              📋 复制
            </button>
          </div>
        `;
      } else {
        // 专业详解版大卡片：完整大卡片 + 命理依据全维度解析
        const reasonsHtml = item.positiveReasons.map(r => `
          <div class="reason-item">
            <div class="reason-category">❖ ${r.category}</div>
            <div class="reason-title">${r.title}</div>
            <div class="reason-desc">${r.detail}</div>
          </div>
        `).join('');

        const hoursHtml = item.luckyHours.slice(0, 5).map(h => `
          <span class="hour-pill ${h.starName.includes('黄道') ? 'huangdao' : ''}">
            ${h.label}
          </span>
        `).join('');

        card.innerHTML = `
          <div class="card-main">
            <div class="date-info-left">
              <div class="date-row-top">
                <span class="solar-date">${item.year}年${item.month}月${item.day}日</span>
                <span class="weekday-badge ${item.isWeekend ? 'weekend' : ''}">${item.dayOfWeek} ${item.isWeekend ? '【周末好办事】' : ''}</span>
              </div>
              <div class="lunar-row">
                <span>${item.lunarStr}</span>
                <span class="ganzhi-tag">${item.ganZhiYear}年 ${item.ganZhiMonth}月 ${item.ganZhiDay}日</span>
                <span style="font-size: 12px; color: var(--text-light);">纳音：${item.nayinDay}</span>
              </div>
              <div class="highlight-tags">
                ${tagsHtml}
              </div>
            </div>
            <div class="card-score-right">
              <div class="score-badge">
                <div class="score-num">${item.score}<span>分</span></div>
                <div class="rank-text">${item.rankName}</div>
                <div class="stars-view">${'★'.repeat(item.starLevel)}${'☆'.repeat(5 - item.starLevel)}</div>
              </div>
            </div>
          </div>

          <div class="card-details-box">
            <div class="details-title">
              <span>📖 【${scenarioInfo.name}】择日命理依据与适宜维度解析</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">
                依《协纪辨方书》《玉匣记》古法考订
              </span>
            </div>
            <div class="reasons-grid">
              ${reasonsHtml}
            </div>
            
            <div class="hours-preview">
              <div class="hours-header">
                <span>⏰ 当天举行【${scenarioInfo.name}】大吉时辰推荐（黄道与六合时辰）：</span>
              </div>
              <div class="hours-pills">
                ${hoursHtml}
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span>华夏吉课 · 顺天应时 · 诸事大吉</span>
            <div class="footer-actions">
              <button class="btn btn-outline btn-sm btn-copy-card" data-idx="${index}">
                📋 复制本吉日详情
              </button>
            </div>
          </div>
        `;
      }

      el.datesList.appendChild(card);
    });

    document.querySelectorAll('.btn-copy-card').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.dataset.idx, 10);
        copyCardDetails(list[idx]);
      });
    });
  }

  function copyCardDetails(item) {
    const scenarioName = SCENARIOS[state.currentScenario].name;
    const reasonsText = item.positiveReasons.map(r => `• 【${r.category}】${r.title}：${r.detail}`).join('\n');
    const hoursText = item.luckyHours.slice(0, 4).map(h => h.label).join('、');

    let copyContent = '';
    if (state.isSimpleMode) {
      // 简化版纯净文案
      copyContent = `
【${scenarioName}吉日推荐·极简版】
公历日期：${item.year}年${item.month}月${item.day}日 (${item.dayOfWeek})
农历日期：${item.lunarStr} (${item.ganZhiYear}年 ${item.ganZhiMonth}月 ${item.ganZhiDay}日)
适合评分：${item.score}分 · ${item.rankName}
吉祥吉相：${item.highlightTags.join('、')}
`.trim();
    } else {
      copyContent = `
【${scenarioName}大吉良辰推荐】
公历日期：${item.year}年${item.month}月${item.day}日 (${item.dayOfWeek})
农历日期：${item.lunarStr} (${item.ganZhiYear}年 ${item.ganZhiMonth}月 ${item.ganZhiDay}日)
适合度评分：${item.score}分 (${item.rankName})
吉祥吉相：${item.highlightTags.join('、')}

【为什么适合${scenarioName}】：
${reasonsText}

【当天${scenarioName}大吉时辰】：
${hoursText}
`.trim();
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyContent).then(() => {
        alert('吉日详情已复制到剪贴板！');
      }).catch(() => fallbackCopy(copyContent));
    } else {
      fallbackCopy(copyContent);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('吉日详情已复制到剪贴板！');
  }

  function bindEvents() {
    // 公历输入变动
    ['groom', 'bride', 'single'].forEach(pfx => {
      el[`${pfx}BirthDate`].addEventListener('change', () => {
        refreshPersonBazi(pfx);
        syncSolarToLunarForm(pfx);
        executeSelection();
      });
      el[`${pfx}BirthHour`].addEventListener('change', () => {
        refreshPersonBazi(pfx);
        syncSolarToLunarForm(pfx);
        executeSelection();
      });

      // 农历输入变动
      el[`${pfx}LunarYear`].addEventListener('change', () => {
        checkLeapMonthState(pfx);
        const y = parseInt(el[`${pfx}LunarYear`].value, 10);
        const m = parseInt(el[`${pfx}LunarMonth`].value, 10);
        const leap = el[`${pfx}LunarLeap`].checked;
        updateLunarDaysForSelect(pfx, y, m, leap);
        refreshPersonBazi(pfx);
        executeSelection();
      });

      el[`${pfx}LunarMonth`].addEventListener('change', () => {
        checkLeapMonthState(pfx);
        const y = parseInt(el[`${pfx}LunarYear`].value, 10);
        const m = parseInt(el[`${pfx}LunarMonth`].value, 10);
        const leap = el[`${pfx}LunarLeap`].checked;
        updateLunarDaysForSelect(pfx, y, m, leap);
        refreshPersonBazi(pfx);
        executeSelection();
      });

      el[`${pfx}LunarLeap`].addEventListener('change', () => {
        const y = parseInt(el[`${pfx}LunarYear`].value, 10);
        const m = parseInt(el[`${pfx}LunarMonth`].value, 10);
        const leap = el[`${pfx}LunarLeap`].checked;
        updateLunarDaysForSelect(pfx, y, m, leap);
        refreshPersonBazi(pfx);
        executeSelection();
      });

      el[`${pfx}LunarDay`].addEventListener('change', () => {
        refreshPersonBazi(pfx);
        executeSelection();
      });

      el[`${pfx}LunarHour`].addEventListener('change', () => {
        refreshPersonBazi(pfx);
        executeSelection();
      });

      // 干支下拉变动
      [
        el[`${pfx}YearGan`], el[`${pfx}YearZhi`], el[`${pfx}MonthGan`], el[`${pfx}MonthZhi`],
        el[`${pfx}DayGan`], el[`${pfx}DayZhi`], el[`${pfx}HourGan`], el[`${pfx}HourZhi`]
      ].forEach(s => {
        if (s) {
          s.addEventListener('change', () => {
            refreshPersonBazi(pfx);
            executeSelection();
          });
        }
      });
    });

    el.btnCalculate.addEventListener('click', () => executeSelection(true));
    el.optWeekendOnly.addEventListener('change', () => executeSelection(false));
    if (el.optDaLiOnly) el.optDaLiOnly.addEventListener('change', () => executeSelection(false));
    el.optMinStar.addEventListener('change', () => executeSelection(false));
    el.sortSelect.addEventListener('change', applySortingAndRender);

    el.btnPrintAll.addEventListener('click', () => {
      window.print();
    });

    // 复制继承堂风水 鄢先生微信号
    const WECHAT_ID = 'y395922694';
    function copyWechat() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(WECHAT_ID).then(() => {
          alert('继承堂风水 鄢先生微信号【' + WECHAT_ID + '】已成功复制到剪贴板！\n可前往微信搜索添加好友，咨询阳宅阴宅风水、六爻占卜、星宿命理、择吉合婚等事宜。');
        }).catch(() => fallbackCopy(WECHAT_ID));
      } else {
        fallbackCopy(WECHAT_ID);
      }
      const card = document.getElementById('masterConsultCard');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const btnCopyWechat = document.getElementById('btnCopyWechat');
    if (btnCopyWechat) {
      btnCopyWechat.addEventListener('click', copyWechat);
    }

    const floatingConsultPill = document.getElementById('floatingConsultPill');
    if (floatingConsultPill) {
      floatingConsultPill.addEventListener('click', copyWechat);
    }
  }

  function init() {
    initGanZhiSelects();
    initLunarSelects();
    setupScenarioTabs();
    setupModeSwitches();
    initDefaultDateRange();
    setupQuickRanges();
    setupDemos();
    bindEvents();

    // 初始状态：未选择生辰，显示空状态提示，绝不自动跑默认假测算！
    renderPillars(el.groomPreviewPillars, null, '新郎');
    renderPillars(el.bridePreviewPillars, null, '新娘');
    renderPillars(el.singlePreviewPillars, null, '福主');

    el.resultsContainer.style.display = 'none';
  }

  init();
});

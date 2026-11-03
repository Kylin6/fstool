/**
 * Lunar and BaZi Calculation Engine (1900 - 2100)
 * 提供公历、农历转换、节气、干支排盘、五行纳音等完整历法支持
 */

(function (global) {
  'use strict';

  // 1900 - 2100 农历数据 (十六进制编码)
  // 0-3位: 闰月天数 (0=29, 1=30); 4-15位: 1-12月大小 (1=30, 0=29); 16-19位: 闰几月 (0=无)
  const LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
    0x0d520
  ];

  const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']; // 对应天干五行
  const DIZHI_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

  // 节气名称 (从立春开始排)
  const SOLAR_TERMS_NAMES = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
    '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
  ];

  // 24节气D值常数 (21世纪 2000-2099 经验高精度常数)
  const TERM_INFO_21 = [
    5.4055, 20.12, 3.87, 18.73, 5.63, 20.646,
    4.81, 20.1, 5.52, 21.04, 5.678, 21.37,
    7.108, 22.83, 7.5, 23.13, 7.646, 23.042,
    8.318, 23.438, 7.438, 22.36, 7.18, 21.94
  ];

  // 六十甲子纳音五行
  const NAYIN = {
    '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火', '戊辰': '大林木', '己巳': '大林木',
    '庚午': '路旁土', '辛未': '路旁土', '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
    '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土', '庚辰': '白蜡金', '辛巳': '白蜡金',
    '壬午': '杨柳木', '癸未': '杨柳木', '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
    '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木', '壬辰': '长流水', '癸巳': '长流水',
    '甲午': '沙中金', '乙未': '沙中金', '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
    '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金', '甲辰': '覆灯火', '乙巳': '覆灯火',
    '丙午': '天河水', '丁未': '天河水', '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
    '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水', '丙辰': '沙中土', '丁巳': '沙中土',
    '戊午': '天上火', '己未': '天上火', '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
  };

  const CHINESE_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '腊'];
  const CHINESE_DAY = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  // 基础农历辅助函数
  function lunarYearDays(y) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(y);
  }

  function leapMonth(y) {
    return LUNAR_INFO[y - 1900] & 0xf;
  }

  function leapDays(y) {
    if (leapMonth(y)) {
      return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }

  function monthDays(y, m) {
    return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }

  // 节气交节日计算 (以公历年 y 计算指定节气 index 0-23 的大致日期)
  function getSolarTermDay(y, n) {
    // 21世纪公历计算节气日期：[Y*D + C] - L
    const Y = y % 100;
    const D = 0.2422;
    let C = TERM_INFO_21[n];
    let L = Math.floor(Y / 4);
    // 某些年份个别节气修正
    if (y === 2026 && n === 1) C -= 0; // 调整
    const day = Math.floor(Y * D + C) - L;
    return day;
  }

  /**
   * 公历转农历
   * @param {number} y 公历年
   * @param {number} m 公历月 1-12
   * @param {number} d 公历日 1-31
   */
  function solarToLunar(y, m, d) {
    // 基准日：1900-01-31 是农历 1900年正月初一
    const baseDate = new Date(1900, 0, 31);
    const objDate = new Date(y, m - 1, d);
    let offset = Math.floor((objDate - baseDate) / 86400000);

    let iYear, daysOfYear = 0;
    for (iYear = 1900; iYear < 2100 && offset > 0; iYear++) {
      daysOfYear = lunarYearDays(iYear);
      offset -= daysOfYear;
    }
    if (offset < 0) {
      offset += daysOfYear;
      iYear--;
    }

    const lYear = iYear;
    const leap = leapMonth(iYear);
    let isLeap = false;
    let iMonth, daysOfMonth = 0;

    for (iMonth = 1; iMonth < 13 && offset > 0; iMonth++) {
      // 闰月
      if (leap > 0 && iMonth === (leap + 1) && !isLeap) {
        --iMonth;
        isLeap = true;
        daysOfMonth = leapDays(iYear);
      } else {
        daysOfMonth = monthDays(iYear, iMonth);
      }

      if (isLeap && iMonth === (leap + 1)) isLeap = false;
      offset -= daysOfMonth;
    }

    if (offset === 0 && leap > 0 && iMonth === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --iMonth;
      }
    }

    if (offset < 0) {
      offset += daysOfMonth;
      --iMonth;
    }

    const lMonth = iMonth;
    const lDay = offset + 1;

    return {
      lunarYear: lYear,
      lunarMonth: lMonth,
      lunarDay: lDay,
      isLeap: isLeap,
      monthStr: (isLeap ? '闰' : '') + CHINESE_MONTH[lMonth - 1] + '月',
      dayStr: CHINESE_DAY[lDay - 1],
      fullStr: (isLeap ? '闰' : '') + CHINESE_MONTH[lMonth - 1] + '月' + CHINESE_DAY[lDay - 1]
    };
  }

  /**
   * 农历转公历
   * @param {number} ly 农历年
   * @param {number} lm 农历月 1-12
   * @param {number} ld 农历日 1-30
   * @param {boolean} isLeap 是否闰月
   */
  function lunarToSolar(ly, lm, ld, isLeap = false) {
    if (ly < 1900 || ly >= 2100) return null;

    let offset = 0;
    for (let y = 1900; y < ly; y++) {
      offset += lunarYearDays(y);
    }

    const leap = leapMonth(ly);
    for (let m = 1; m < lm; m++) {
      offset += monthDays(ly, m);
      if (leap > 0 && m === leap) {
        offset += leapDays(ly);
      }
    }

    if (isLeap) {
      offset += monthDays(ly, lm);
    }

    offset += (ld - 1);

    // 1900-01-31 基准
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(baseDate.getTime() + offset * 86400000);

    return {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      day: targetDate.getDate(),
      dateStr: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
    };
  }

  function getLeapMonth(y) {
    if (y < 1900 || y >= 2100) return 0;
    return leapMonth(y);
  }

  function getLunarMonthDays(y, m, isLeap = false) {
    if (y < 1900 || y >= 2100) return 30;
    if (isLeap) return leapDays(y);
    return monthDays(y, m);
  }

  /**
   * 精准计算指定日期的日干支
   * 基准：2024-01-01 是甲子日 (Gan 0, Zhi 0)
   */
  function getDayGanZhi(year, month, day) {
    const baseDate = new Date(Date.UTC(2024, 0, 1));
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    const diffDays = Math.floor((targetDate - baseDate) / 86400000);

    let ganIdx = (diffDays % 10 + 10) % 10;
    let zhiIdx = (diffDays % 12 + 12) % 12;

    return {
      gan: TIANGAN[ganIdx],
      zhi: DIZHI[zhiIdx],
      ganIdx: ganIdx,
      zhiIdx: zhiIdx,
      text: TIANGAN[ganIdx] + DIZHI[zhiIdx],
      nayin: NAYIN[TIANGAN[ganIdx] + DIZHI[zhiIdx]] || ''
    };
  }

  /**
   * 推算立春日期，精确判断八字年柱
   */
  function getYearGanZhi(year, month, day) {
    // 立春一般在 2月3日~2月5日
    const liChunDay = getSolarTermDay(year, 2); // 第2号节气：立春 (2月)
    let baziYear = year;
    if (month < 2 || (month === 2 && day < liChunDay)) {
      baziYear = year - 1;
    }

    // 1984年是甲子年 (Gan 0, Zhi 0)
    const offset = baziYear - 1984;
    const ganIdx = (offset % 10 + 10) % 10;
    const zhiIdx = (offset % 12 + 12) % 12;

    return {
      year: baziYear,
      gan: TIANGAN[ganIdx],
      zhi: DIZHI[zhiIdx],
      ganIdx: ganIdx,
      zhiIdx: zhiIdx,
      shengxiao: SHENGXIAO[zhiIdx],
      text: TIANGAN[ganIdx] + DIZHI[zhiIdx],
      nayin: NAYIN[TIANGAN[ganIdx] + DIZHI[zhiIdx]] || ''
    };
  }

  /**
   * 月柱推算 (以24节气交节为界，年上起月五虎遁)
   * 节气交节各月节（寅月:立春, 卯月:惊蛰, 辰月:清明, 巳月:立夏, 午月:芒种, 未月:小暑,
   * 申月:立秋, 酉月:白露, 戌月:寒露, 亥月:立冬, 子月:大雪, 丑月:小寒）
   */
  function getMonthGanZhi(year, month, day, yearGanIdx) {
    // 12节对应的节气编号：
    // 小寒(0, 1月), 立春(2, 2月), 惊蛰(4, 3月), 清明(6, 4月), 立夏(8, 5月), 芒种(10, 6月),
    // 小暑(12, 7月), 立秋(14, 8月), 白露(16, 9月), 寒露(18, 10月), 立冬(20, 11月), 大雪(22, 12月)
    const jieMap = [
      { zhiIdx: 1, termIdx: 0, m: 1 },  // 丑月从 1月小寒开始
      { zhiIdx: 2, termIdx: 2, m: 2 },  // 寅月从 2月立春开始
      { zhiIdx: 3, termIdx: 4, m: 3 },  // 卯月从 3月惊蛰开始
      { zhiIdx: 4, termIdx: 6, m: 4 },  // 辰月从 4月清明开始
      { zhiIdx: 5, termIdx: 8, m: 5 },  // 巳月从 5月立夏开始
      { zhiIdx: 6, termIdx: 10, m: 6 }, // 午月从 6月芒种开始
      { zhiIdx: 7, termIdx: 12, m: 7 }, // 未月从 7月小暑开始
      { zhiIdx: 8, termIdx: 14, m: 8 }, // 申月从 8月立秋开始
      { zhiIdx: 9, termIdx: 16, m: 9 }, // 酉月从 9月白露开始
      { zhiIdx: 10, termIdx: 18, m: 10 },// 戌月从 10月寒露开始
      { zhiIdx: 11, termIdx: 20, m: 11 },// 亥月从 11月立冬开始
      { zhiIdx: 0, termIdx: 22, m: 12 }  // 子月从 12月大雪开始
    ];

    // 判断当前处于哪个月令支
    let zhiIdx = 2; // 默认寅月
    const currentJieDay = getSolarTermDay(year, jieMap[month - 1].termIdx);

    if (day >= currentJieDay) {
      zhiIdx = jieMap[month - 1].zhiIdx;
    } else {
      // 还在上一个节气内
      let prevM = (month - 2 + 12) % 12;
      zhiIdx = jieMap[prevM].zhiIdx;
    }

    // 五虎遁月歌：甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚上，丁壬壬位顺行流，更有戊癸何方觅，甲寅之上好追求
    // 寅月的干：甲/己(0,5)->丙(2); 乙/庚(1,6)->戊(4); 丙/辛(2,7)->庚(6); 丁/壬(3,8)->壬(8); 戊/癸(4,9)->甲(0)
    const tigerStartGan = [2, 4, 6, 8, 0][yearGanIdx % 5];
    // 相对寅月(zhi 2)的偏移
    const offsetFromYin = (zhiIdx - 2 + 12) % 12;
    const monthGanIdx = (tigerStartGan + offsetFromYin) % 10;

    return {
      gan: TIANGAN[monthGanIdx],
      zhi: DIZHI[zhiIdx],
      ganIdx: monthGanIdx,
      zhiIdx: zhiIdx,
      text: TIANGAN[monthGanIdx] + DIZHI[zhiIdx],
      nayin: NAYIN[TIANGAN[monthGanIdx] + DIZHI[zhiIdx]] || ''
    };
  }

  /**
   * 时柱推算 (日上起时五鼠遁)
   * 23:00 - 01:00 为子时
   */
  function getHourGanZhi(dayGanIdx, hour) {
    if (hour === undefined || hour === null || hour === '') {
      return { gan: '', zhi: '', text: '未知', nayin: '' };
    }
    const h = parseInt(hour, 10);
    // 时支：23-1 为子(0), 1-3 为丑(1), 3-5 为寅(2)...
    let zhiIdx = 0;
    if (h >= 23 || h < 1) zhiIdx = 0;
    else zhiIdx = Math.floor((h + 1) / 2) % 12;

    // 五鼠遁：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
    // 甲/己(0,5)->甲(0); 乙/庚(1,6)->丙(2); 丙/辛(2,7)->戊(4); 丁/壬(3,8)->庚(6); 戊/癸(4,9)->壬(8)
    const ratStartGan = [0, 2, 4, 6, 8][dayGanIdx % 5];
    const hourGanIdx = (ratStartGan + zhiIdx) % 10;

    return {
      gan: TIANGAN[hourGanIdx],
      zhi: DIZHI[zhiIdx],
      ganIdx: hourGanIdx,
      zhiIdx: zhiIdx,
      text: TIANGAN[hourGanIdx] + DIZHI[zhiIdx],
      nayin: NAYIN[TIANGAN[hourGanIdx] + DIZHI[zhiIdx]] || ''
    };
  }

  /**
   * 完整生辰八字排盘
   */
  function calculateBazi(year, month, day, hour = 12) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    const yearGZ = getYearGanZhi(y, m, d);
    const monthGZ = getMonthGanZhi(y, m, d, yearGZ.ganIdx);
    const dayGZ = getDayGanZhi(y, m, d);
    const hourGZ = getHourGanZhi(dayGZ.ganIdx, hour);
    const lunar = solarToLunar(y, m, d);

    return {
      solar: { year: y, month: m, day: d, hour: hour },
      lunar: lunar,
      shengxiao: yearGZ.shengxiao,
      year: yearGZ,
      month: monthGZ,
      day: dayGZ,
      hour: hourGZ,
      summary: `${yearGZ.text}年 ${monthGZ.text}月 ${dayGZ.text}日 ${hourGZ.text ? hourGZ.text + '时' : ''}`
    };
  }

  /**
   * 从农历生日直接排盘生辰八字
   */
  function calculateBaziFromLunar(ly, lm, ld, isLeap = false, hour = 12) {
    const solar = lunarToSolar(parseInt(ly, 10), parseInt(lm, 10), parseInt(ld, 10), !!isLeap);
    if (!solar) return null;
    const bazi = calculateBazi(solar.year, solar.month, solar.day, hour);
    bazi.inputLunar = {
      year: parseInt(ly, 10),
      month: parseInt(lm, 10),
      day: parseInt(ld, 10),
      isLeap: !!isLeap,
      monthStr: (isLeap ? '闰' : '') + CHINESE_MONTH[parseInt(lm, 10) - 1] + '月',
      dayStr: CHINESE_DAY[parseInt(ld, 10) - 1]
    };
    return bazi;
  }

  // 暴露给全局
  global.LunarEngine = {
    TIANGAN,
    DIZHI,
    SHENGXIAO,
    WUXING,
    DIZHI_WUXING,
    NAYIN,
    CHINESE_MONTH,
    CHINESE_DAY,
    solarToLunar,
    lunarToSolar,
    getLeapMonth,
    getLunarMonthDays,
    getDayGanZhi,
    getYearGanZhi,
    getMonthGanZhi,
    getHourGanZhi,
    calculateBazi,
    calculateBaziFromLunar
  };

})(typeof window !== 'undefined' ? window : this);
